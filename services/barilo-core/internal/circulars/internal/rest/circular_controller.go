package rest

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/pedrosantosbr/barilo/internal"
)

type CircularService interface {
	List(ctx context.Context) ([]*internal.Circular, error)
}

type ProductService interface {
	List(ctx context.Context) ([]*internal.Product, error)
}

type CircularHandler struct {
	circularSvc CircularService
	productSvc  ProductService
}

func NewCircularHandler(circularService CircularService, productService ProductService) *CircularHandler {
	return &CircularHandler{
		circularSvc: circularService,
		productSvc:  productService,
	}
}

func (ch *CircularHandler) Register(r *chi.Mux) {
	r.Get("/api/v1/circulars", ch.listCirculars)
	r.Get("/api/v1/products", ch.listProducts)
}

// -

type Store struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type Product struct {
	ID     string   `json:"id"`
	Name   string   `json:"name"`
	Stores []*Store `json:"stores,omitempty"`
}

type Discount struct {
	ID      string   `json:"id"`
	Price   float64  `json:"price"`
	Product *Product `json:"product"`
}

type Circular struct {
	ID        string      `json:"id"`
	Name      string      `json:"name"`
	Store     *Store      `json:"store"`
	Discounts []*Discount `json:"discounts"`
}

func (ch *CircularHandler) listCirculars(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	circulars, _ := ch.circularSvc.List(ctx)

	render.JSON(w, r, circulars)
}

// -

type ListProducts struct {
	Products []Product `json:"products"`
}

func (ch *CircularHandler) listProducts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	products, _ := ch.productSvc.List(ctx)

	render.JSON(w, r, products)
}
