package rest

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

//go:generate counterfeiter -generate

//counterfeiter:generate -o resttesting/recipe_service.go . RecipeService

// RecipeService interface defines all methods a RecipeService should implement
type RecipeService interface {
	GetRecipes(ctx context.Context, ingredients string) (<-chan []byte, <-chan error, error)
}

// RecipeHandler
type RecipeHandler struct {
	svc RecipeService
}

// NewRecipeHandler...
func NewRecipeHandler(svc RecipeService) *RecipeHandler {
	return &RecipeHandler{
		svc: svc,
	}
}

func (h *RecipeHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/recipes/suggestions", h.suggest)
	r.Post("/api/v1/recipes", h.create)
	r.Get("/webhook/whatsapp", h.whatsappCallback)
	r.Post("/webhook/whatsapp", h.whatsappConversation)
}

func (h *RecipeHandler) suggest(w http.ResponseWriter, r *http.Request) {
	// Set the Content-Type header to indicate Server-Sent Events
	logger, err := zap.NewProduction()
	if err != nil {
		http.Error(w, fmt.Sprintf("error: %s\n", err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Type")
	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	// To ensure a constant stream, prevent HTTP request caching and keep the connection alive
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	ctxTimeout, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	outc, errc, err := h.svc.GetRecipes(ctxTimeout, "What is the recipe for a cake?")
	if err != nil {
		logger.Error("error: ", zap.Error(err))

		// TODO: create a new function to handle errors: renderError(w, err)
		http.Error(w, fmt.Sprintf("error: %s\n", err.Error()), http.StatusInternalServerError)
		return
	}

	for {
		select {
		case <-ctxTimeout.Done():
			// TODO: create a new function to handle errors: renderError(w, err)
			http.Error(w, "error: ERR_TIMEOUT\n", http.StatusRequestTimeout)
			return

		case err, ok := <-errc:
			if !ok {
				// No more errors
				fmt.Println("err channel closed")
				return
			}

			// TODO: create a new function to handle errors: renderError(w, err)
			http.Error(w, fmt.Sprintf("error: %s\n", err.Error()), http.StatusInternalServerError)
			return

		case out, ok := <-outc:
			if !ok {
				logger.Info("out channel closed")
				return
			}

			w.Write(out)
			flush(w)
		}
	}
}

// -

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 8192

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Time to wait before force close on connection.
	closeGracePeriod = 10 * time.Second
)

func internalError(ws *websocket.Conn, msg string, err error) {
	log.Println(msg, err)
	ws.WriteMessage(websocket.TextMessage, []byte("Internal server error."))
}

var upgrader = websocket.Upgrader{}

func (h *RecipeHandler) create(w http.ResponseWriter, r *http.Request) {
	// Upgrade the connection to a WebSocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}

	defer ws.Close()
	ws.SetReadLimit(maxMessageSize)
	ws.SetReadDeadline(time.Now().Add(pongWait))
	ws.SetPongHandler(func(string) error { ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	outc, errc, _ := h.svc.GetRecipes(r.Context(), "What is the recipe for a cake?")

	done := make(chan struct{})

	go func() {
		defer close(done)

		for {
			select {
			case <-errc:
				internalError(ws, "error: ", err)
				return
			case out, ok := <-outc:
				if !ok {
					return
				}

				ws.SetWriteDeadline(time.Now().Add(writeWait))
				if err := ws.WriteMessage(websocket.TextMessage, out); err != nil {
					internalError(ws, "error: ", err)
					return
				}
			}
		}
	}()

	select {
	case <-done:
	case <-r.Context().Done():
		ws.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	}
}

func flush(w http.ResponseWriter) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}
	flusher.Flush()
}

// Whatsapp

type message struct {
	Field string `json:"field"`
	Value struct {
		MessagingProduct string `json:"messaging_product"`
		Metadata         struct {
			DisplayPhoneNumber string `json:"display_phone_number"`
			PhoneNumberID      string `json:"phone_number_id"`
		} `json:"metadata"`
		Contacts []struct {
			Profile struct {
				Name string `json:"name"`
			} `json:"profile"`
			WaID string `json:"wa_id"`
		} `json:"contacts"`
		Messages []struct {
			From      string `json:"from"`
			ID        string `json:"id"`
			Timestamp string `json:"timestamp"`
			Type      string `json:"type"`
			Text      struct {
				Body string `json:"body"`
			} `json:"text"`
		} `json:"messages"`
	} `json:"value"`
}

func (h *RecipeHandler) whatsappCallback(w http.ResponseWriter, r *http.Request) {
	// return 200
	w.WriteHeader(http.StatusOK)

	params := r.URL.Query()

	hubChallenge := params.Get("hub.challenge")

	if hubChallenge != "" {
		w.Write([]byte(hubChallenge))
		return
	}
}

func (h *RecipeHandler) whatsappConversation(w http.ResponseWriter, r *http.Request) {
	// Read the body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body",
			http.StatusInternalServerError)
		return
	}

	// Unmarshal into a map
	var bodyMap map[string]interface{}
	err = json.Unmarshal(body, &bodyMap)
	if err != nil {
		http.Error(w, "Error unmarshalling request body",
			http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	// Print the map
	for key, value := range bodyMap {
		fmt.Printf("Key: %s, Value: %v\n", key, value)
	}

	w.WriteHeader(http.StatusOK)
}
