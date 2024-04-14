package rest

import (
	"api/internal"
	"api/lib/logger"
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

//go:generate counterfeiter -generate

//counterfeiter:generate -o resttesting/cook_service.gen.go . RecipeService

type RecipeService interface {
	SuggestRecipes(ctx context.Context, params internal.SuggestRecipesParams) (string, error)
}

// RecipeHandler ...
type RecipeHandler struct {
	svc RecipeService
}

// NewRecipeHandler ...
func NewRecipeHandler(svc RecipeService) *RecipeHandler {
	return &RecipeHandler{
		svc: svc,
	}
}

// Register connects the handlers to the router
func (c *RecipeHandler) Register(r *chi.Mux) {
	r.Post("/api/recipes/suggestion", c.suggestRecipes)
}

type ListRecipesRequest struct {
	Ingredients string `json:"ingredients"`
}

type ListRecipesResponse struct {
	Recipes string `json:"recipes"`
}

func (c *RecipeHandler) suggestRecipes(w http.ResponseWriter, r *http.Request) {
	var req ListRecipesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	recipes, err := c.svc.SuggestRecipes(r.Context(), internal.SuggestRecipesParams{
		Ingredients: req.Ingredients,
	})
	if err != nil {
		render.Status(r, http.StatusInternalServerError)
		render.JSON(w, r, map[string]string{"error": err.Error()})
		return
	}

	ctx := r.Context()
	log := logger.FromContext(ctx)
	log.Info("Success")

	render.Status(r, http.StatusOK)
	render.JSON(w, r, &ListRecipesResponse{Recipes: recipes})
}
