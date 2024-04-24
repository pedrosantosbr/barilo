package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
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

// ChatServicer...
type ChatServicer interface {
	GetRecipes(ingredients string) (chan string, chan error)
}

type Message struct {
	Data string `json:"data"`
	Key  string `json:"key"`
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	svc ChatServicer
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
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

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			c.logger.Error("failed to unmarshal message", zap.Error(err))
			continue
		}

		switch msg.Key {
		case "prompt.recipes.get":
			chOut, chErr := c.svc.GetRecipes(msg.Data)
			for {
				select {
				case chunk := <-chOut:
					c.send <- []byte(chunk)
				case err := <-chErr:
					break
				}
			}

		case "prompt.cancel":
			//
		}

		// // Open AI streaming API
		// params := &openai.ChatCompletionRequest{
		// 	Model: "gpt-3.5-turbo",
		// 	Messages: []openai.ChatMessage{
		// 		{
		// 			Role:    "system",
		// 			Content: string(wsmsg.Question),
		// 		},
		// 	},
		// 	Stream: true,
		// }

		// req, err := openai.NewChatCompletionRequest(os.Getenv("OPENAI_API_KEY"), params)
		// if err != nil {
		// 	c.logger.Error("failed to create request", zap.Error(err))
		// 	continue
		// }

		// resp, err := http.DefaultClient.Do(req)
		// if err != nil {
		// 	c.logger.Error("failed to send request", zap.Error(err))
		// 	continue
		// }

		// if resp.StatusCode != http.StatusOK {
		// 	c.logger.Error("unexpected status code", zap.Int("status_code", resp.StatusCode))
		// 	continue
		// }

		// ctx := req.Context()
		// ctx = logging.WithLogger(ctx, c.logger)

		// chanOut, chanErr := openai.HandleStreamResponse(ctx, resp)

		// go func() {
		// 	for out := range chanOut {
		// 		w, err := c.conn.NextWriter(websocket.TextMessage)
		// 		if err != nil {
		// 			return
		// 		}

		// 		w.Write(out)
		// 		if err := w.Close(); err != nil {
		// 			return
		// 		}
		// 	}
		// }()
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

// serveWs handles websocket requests from the peer 🖥️ 📲.
func getRecipes(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

}
