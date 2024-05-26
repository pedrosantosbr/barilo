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
	"github.com/pedrosantosbr/barilo/lib/errors"
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
	Price          uint64  `json:"price"`
	Weight         string  `json:"weight"`
	ExpirationDate string  `json:"expiration_date"`
	Ingredients    string  `json:"ingredients"`
	Brand          *string `json:"brand"`
}

type StoreService interface {
	Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error)
	Find(ctx context.Context, params internal.FindStoreParams) (*internal.Store, error)
	CreateCircularWithDiscounts(ctx context.Context, params internal.CreateCircularParams) (internal.Circular, error)
}

type StoreHandler struct {
	svc StoreService
}

func NewStoreHandler(svc StoreService) *StoreHandler {
	return &StoreHandler{svc: svc}
}

func (sh *StoreHandler) Register(r *chi.Mux) {
	r.Post("/api/v1/admin/stores", sh.create)
	r.Post(fmt.Sprintf("/api/v1/admin/stores/{id:%s}/products/upload", uuidRegEx), sh.uploadProducts)
	r.Post(fmt.Sprintf("/api/v1/admin/stores/{id:%s}/circulars/upload", uuidRegEx), sh.uploadCircular)
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
		renderErrorResponse(w, r, "invalid requests", errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "error decoding request"))
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
		renderErrorResponse(w, r, "svc.Find", errors.WrapErrorf(err, errors.ErrorCodeUnknown, "failed to find store"))
		return
	}

	if exists != nil {
		renderErrorResponse(w, r, "store already exists", errors.NewErrorf(errors.ErrorCodeConflict, "store already exists"))
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
			renderErrorResponse(w, r, "error reading csv file", errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "error reading csv file"))
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

// Uploads a circular for a given store
type Circular struct {
	ID             string `json:"id"`
	StoreID        string `json:"store_id"`
	Name           string `json:"name"`
	ExpirationDate string `json:"expiration_date"`
}

type UploadCircularRequest struct {
	Name           string `json:"name"`
	ExpirationDate string `json:"expiration_date"`
}

type UploadCircularResponse struct {
	Circular *Circular `json:"circular"`
}

func (sh *StoreHandler) uploadCircular(w http.ResponseWriter, r *http.Request) {
	var createCircularParams internal.CreateCircularParams

	logger := logging.FromContext(r.Context())

	// Parse form data
	createCircularParams.StoreID = chi.URLParam(r, "id")
	createCircularParams.Name = r.FormValue("name")
	createCircularParams.ExpirationDate = r.FormValue("expiration_date")

	err := r.ParseMultipartForm(1024 * 1024 * 5) // 5MB
	if err != nil {
		renderErrorResponse(w, r, "error parsing form data", err)
		return
	}
	file, _, err := r.FormFile("circular_csv")
	if err != nil {
		renderErrorResponse(w, r, "error getting products file", err)
		return
	}
	defer file.Close()

	// Read and parse CSV file into products
	reader := csv.NewReader(file)
	reader.Read() // skip header
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			renderErrorResponse(w, r, "error reading csv file", err)
			return
		}

		// Parse products from a circular CSV file with the following columns:
		// GTIN, Name, Category, Price, Weight, ExpirationDate, Ingredients, Brand
		// ps: Price is in cents and receives the discount value by default
		var product internal.Product
		err = product.FromCircularCSV(r.Context(), &product, record)
		if err != nil {
			logger.Info("error parsing csv row", zap.Error(err))
			renderErrorResponse(w, r, "error parsing csv row", err)
			return
		}
		product.StoreID = createCircularParams.StoreID
		createCircularParams.Products = append(createCircularParams.Products, &product)
	}

	logger.Info("products", zap.Any("products", createCircularParams.Products))

	// Execute use case
	circular, err := sh.svc.CreateCircularWithDiscounts(r.Context(), createCircularParams)
	if err != nil {
		renderErrorResponse(w, r, "error creating circular", err)
		return
	}

	renderResponse(w, r, &UploadCircularResponse{
		Circular: &Circular{
			ID:             circular.ID,
			StoreID:        circular.StoreID,
			Name:           circular.Name,
			ExpirationDate: circular.ExpirationDate.Format("2006-01-02"),
		},
	}, http.StatusCreated)
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
