package rest

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/lib/logging"
	"go.uber.org/zap"
)

const uuidRegEx string = `[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`

type Store struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type Product struct {
	ID   string  `json:"id"`
	GTIN *string `json:"gtin"`
	// StoreID        string  `json:"store_id"`
	Name           string  `json:"name"`
	Category       string  `json:"category"`
	Price          float64 `json:"price"`
	Weight         string  `json:"weight"`
	ExpirationDate string  `json:"expiration_date"`
	Ingredients    string  `json:"ingredients"`
	Brand          *string `json:"brand"`
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

// Controllers

type CreateStoreRequest struct {
	Name    string  `json:"name"`
	Address string  `json:"address"`
	Phone   *string `json:"phone"`
}

type CreateStoreResponse struct {
	Store Store `json:"store"`
}

func (sh *StoreHandler) create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req CreateStoreRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		renderErrorResponse(w, r, "invalid requests", internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "error decoding request"))
		return
	}
	defer r.Body.Close()

	logger := logging.FromContext(ctx)
	logger.Info("creating store", zap.String("name", req.Name), zap.String("address", req.Address))

	// -

	toPointer := func(s string) *string {
		return &s
	}

	exists, err := sh.svc.Find(ctx, internal.FindStoreParams{
		Name:    toPointer(req.Name),
		Address: toPointer(req.Address),
	})
	if err != nil {
		renderErrorResponse(w, r, "svc.Find", internal.WrapErrorf(err, internal.ErrorCodeUnknown, "failed to find store"))
		return
	}

	if exists.ID != "" {
		renderErrorResponse(w, r, "store already exists", internal.NewErrorf(internal.ErrorCodeConflict, "store already exists"))
		return
	}

	// -

	store, err := sh.svc.Create(ctx, internal.CreateStoreParams{
		Name:    req.Name,
		Address: req.Address,
		Phone:   req.Phone,
	})
	if err != nil {
		logger.Error("failed to create store", zap.Error(err))
		renderErrorResponse(w, r, "failed to create store", err)
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
	var products []internal.Product

	logger, _ := zap.NewProduction()
	ctx := r.Context()
	ctx = logging.WithLogger(ctx, logger)

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
	reader.Read() // skip header
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			logger.Info("error reading csv file", zap.Error(err))
			renderErrorResponse(w, r, "error reading csv file", internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "error reading csv file"))
			return
		}

		// -
		product := internal.Product{}
		err = product.FromCSV(ctx, record)
		if err != nil {
			// renderErrorResponse(w, r, "error parsing csv row", err)
			render.Status(r, http.StatusBadRequest)
			render.JSON(w, r, map[string]string{"error": err.Error()})
			return
		}
		products = append(products, product)
	}

	printMemoryStats()
	renderResponse(w, r, &products, http.StatusOK)
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
