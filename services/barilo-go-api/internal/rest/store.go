package rest

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/pedrosantosbr/barilo/internal"
)

const uuidRegEx string = `[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`

type Store struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type StoreService interface {
	Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error)
	Find(ctx context.Context, params internal.FindStoreParams) (internal.Store, error)
}

type StoreHandler struct {
	svc StoreService
}

func NewStoreHandler(svc StoreService) *StoreHandler {
	return &StoreHandler{svc: svc}
}

func (sh *StoreHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/stores", sh.create)
	r.Post(fmt.Sprintf("/api/v1/stores/{id:%s}/products/upload", uuidRegEx), sh.uploadProducts)
}

// -

type CreateStoreRequest struct {
	Name    string  `json:"name"`
	Address string  `json:"address"`
	Phone   *string `json:"phone"`
}

type CreateStoreResponse struct {
	Store Store `json:"store"`
}

// Controllers

// Creates a new store
func (sh *StoreHandler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req CreateStoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// -

	toPointer := func(s string) *string {
		return &s
	}

	exists, err := sh.svc.Find(ctx, internal.FindStoreParams{
		Name:    toPointer(req.Name),
		Address: toPointer(req.Address),
	})
	if err != nil {
		renderErrorResponse(w, r, "error to create store", err)
	}

	if exists.ID != "" {
		renderErrorResponse(w, r, "store already exists", internal.NewErrorf(internal.ErrorCodeConflict, "store already exists"))
		return
	}

	// -

	store, err := sh.svc.Create(ctx, internal.CreateStoreParams{
		Name:    req.Name,
		Address: req.Address,
		Phone:   *req.Phone,
	})
	if err != nil {
		http.Error(w, "failed to create store", http.StatusInternalServerError)
		return
	}

	renderResponse(w, r, &CreateStoreResponse{
		Store: Store{
			ID:      store.ID,
			Name:    store.Name,
			Address: store.Address,
		},
	}, http.StatusCreated)
}

// Uploads products for a given store
func (sh *StoreHandler) uploadProducts(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(MaxInMemorySize)
	if err != nil {
		renderErrorResponse(w, r, "error parsing form data", err)
		return
	}

	file, _, err := r.FormFile("products")
	if err != nil {
		renderErrorResponse(w, r, "error getting products file", err)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			renderErrorResponse(w, r, "error reading csv file", err)
			return
		}

		rowLenght := len(record)
		if rowLenght != 3 {
			renderErrorResponse(w, r, "invalid csv file", internal.NewErrorf(internal.ErrorCodeInvalidArgument, "invalid csv file"))
			continue
		}

		// need to check the record length
		var product internal.Product
		product.Name = record[0]

		price, err := strconv.ParseFloat(record[0], 64)
		if err != nil {
			price = 0
		}

		product.Price = price
		product.Unit = record[2]

		fmt.Printf("Product: %v\n", product)
	}

	printMemoryStats()
	renderResponse(w, r, nil, http.StatusOK)
}

func printMemoryStats() {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	fmt.Printf("\n")
	fmt.Printf("\n")
	fmt.Printf("\n")
	fmt.Printf("Total allocated memory: %d bytes\n", mem.TotalAlloc)
	fmt.Printf("Number of memory allocations: %d\n", mem.Mallocs)
}
