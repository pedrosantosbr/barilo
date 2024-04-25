package rest

import (
	"barilo/internal"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

// RecipeService interface defines all methods a RecipeService should implement
type RecipeService interface {
	GetRecipes(ctx context.Context, ingredients string) (<-chan []byte, <-chan error)
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
	r.Get("/api/recipes/suggestions", h.suggest)
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

	ctxTimeout, cancel := context.WithTimeout(r.Context(), 20*time.Second)
	defer cancel()

	outc, errc := h.svc.GetRecipes(ctxTimeout, "chicken")

	for {
		select {
		case <-ctxTimeout.Done():
			fmt.Println("Timedout")
			return

		case err, ok := <-errc:
			if !ok {
				// No more errors
				return
			}
			fmt.Println("Error: ", err)
			return

		case out, ok := <-outc:
			if !ok {
				// No more output
				return
			}

			e := internal.Event{
				ID:    fmt.Sprintf("%d", eventID),
				Event: "message",
				Data:  string(out),
			}

			fmt.Fprintf(w, "id: %s\ndata: %s\n\n", e.ID, e.Data)
			time.Sleep(1 * time.Second)
			flush(w)

		}
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
