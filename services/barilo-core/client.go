package main

import (
	logging "barilo/lib/logger"
	"barilo/lib/openai"
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type WSMessage struct {
	Question string `json:"question"`
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	logger *zap.Logger
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		// c.hub.broadcast <- message

		var wsmsg WSMessage

		if err := json.Unmarshal(message, &wsmsg); err != nil {
			c.logger.Error("failed to unmarshal message", zap.Error(err))
			continue
		}

		// Open AI streaming API
		params := &openai.ChatCompletionRequest{
			Model: "gpt-3.5-turbo",
			Messages: []openai.ChatMessage{
				{
					Role:    "system",
					Content: string(wsmsg.Question),
				},
			},
			Stream: true,
		}

		req, err := openai.NewChatCompletionRequest(os.Getenv("OPENAI_API_KEY"), params)
		if err != nil {
			c.logger.Error("failed to create request", zap.Error(err))
			continue
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			c.logger.Error("failed to send request", zap.Error(err))
			continue
		}

		if resp.StatusCode != http.StatusOK {
			c.logger.Error("unexpected status code", zap.Int("status_code", resp.StatusCode))
			continue
		}

		ctx := req.Context()
		ctx = logging.WithLogger(ctx, c.logger)

		chanOut, chanErr := openai.HandleStreamResponse(ctx, resp)

		go func() {
			for out := range chanOut {
				w, err := c.conn.NextWriter(websocket.TextMessage)
				if err != nil {
					return
				}

				w.Write(out)
				if err := w.Close(); err != nil {
					return
				}
			}
		}()

		if err := <-chanErr; err != nil {
			if err.Error() == "EOF" {
				continue
			}
			c.logger.Error("failed to handle stream response", zap.Error(err))
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// get X-ID from header
	id := r.Header.Get("x-request-token")
	if id == "" {
		w.Header().Set("x-ws-error", "x-request-token is required on the header request")
		http.Error(w, "x-request-token is required", http.StatusUnauthorized)
		return
	}

	// TODO: in the future let's decrypt the token and check user identity

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		hub:    hub,
		conn:   conn,
		send:   make(chan []byte, 256),
		logger: logging.FromContext(r.Context()),
	}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
