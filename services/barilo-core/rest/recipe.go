package rest

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

// RecipeHandler
type RecipeHandler struct {
}

// NewRecipeHandler...
func NewRecipeHandler() *RecipeHandler {
	return &RecipeHandler{}
}

func (h *RecipeHandler) Register(r *chi.Mux) {
	r.Get("/api/recipes/suggestions", h.suggest)
}

// Event structure to define an SSE event
type Event struct {
	ID    string
	Event string
	Data  string
}

func (h *RecipeHandler) suggest(w http.ResponseWriter, r *http.Request) {
	// Set the Content-Type header to indicate Server-Sent Events

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Type")
	w.Header().Set("Content-Type", "text/event-stream")
	// To ensure a constant stream, prevent HTTP request caching and keep the connection alive
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	eventID := 1

	for i := 0; i < 10; i++ {
		// Generate a new event with a message
		event := Event{
			ID:    fmt.Sprintf("%d", eventID),
			Event: "message",
			Data:  fmt.Sprintf("this is event number %d", eventID),
		}

		fmt.Printf("id: %s\nevent: %s\ndata: %s\n\n", event.ID, event.Event, event.Data)
		// Format the event to be sent as a Server-Sent Event
		fmt.Fprintf(w, "id: %s\nevent: %s\ndata: %s\n\n", event.ID, event.Event, event.Data)

		flusher, ok := w.(http.Flusher)
		// Flush the data to ensure it's sent immediately
		if !ok {
			http.Error(w, "Streaming not supported", http.StatusInternalServerError)
			return
		}
		flusher.Flush()

		// Increment the event ID for the next event
		eventID++

		// Wait for a short duration before sending the next event
		time.Sleep(1 * time.Second)
	}

	event := Event{
		ID:    fmt.Sprintf("%d", eventID),
		Event: "message",
		Data:  "[DONE]",
	}
	fmt.Fprintf(w, "id: %s\nevent: %s\ndata: %s\n\n", event.ID, event.Event, event.Data)
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}
	flusher.Flush()

	fmt.Println("Finished HTTP request at ", time.Now())
}
