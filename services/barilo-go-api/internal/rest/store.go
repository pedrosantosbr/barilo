package rest

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/pedrosantosbr/barilo/internal"
)

type Store struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type StoreService interface {
	Create(ctx context.Context, storeName, storeAddress, storePhone string) (internal.Store, error)
	Search(ctx context.Context, storeName, storeAddress string) (internal.Store, error)
}

type StoreHandler struct {
	svc StoreService
}

func NewStoreHandler(svc StoreService) *StoreHandler {
	return &StoreHandler{svc: svc}
}

func (sh *StoreHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/stores/create", sh.create)
}

// -

type CreateStoreRequest struct {
	StoreName    string  `json:"store_name"`
	StoreAddress string  `json:"store_address"`
	StorePhone   *string `json:"store_phone"`
}

type CreateStoreResponse struct {
	Store Store `json:"store"`
}

func (sh *StoreHandler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req CreateStoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// -

	exists, err := sh.svc.Search(ctx, req.StoreName, req.StoreAddress)
	if err != nil {
		renderErrorResponse(w, r, "search failed", err)
	}
	if exists.ID != "" {
		renderErrorResponse(w, r, "store already exists", internal.WrapErrorf(nil, internal.ErrorCodeConflict, ""))
		return
	}

	// -

	store, err := sh.svc.Create(ctx, req.StoreName, req.StoreAddress, *req.StorePhone)
	if err != nil {
		http.Error(w, "failed to create store", http.StatusInternalServerError)
		return
	}

	renderResponse(w, r, &CreateStoreResponse{
		Store: Store{
			Name:    store.Name,
			Address: store.Address,
		},
	}, http.StatusCreated)
}
