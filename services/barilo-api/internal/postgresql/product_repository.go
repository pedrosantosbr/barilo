package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/postgresql/db"
)

// Product represents a store in the database.
type Product struct {
	q *db.Queries
}

// NewProduct creates a new Product.
func NewProduct(d db.DBTX) *Product {
	return &Product{q: db.New(d)}
}

func (s *Product) Create(ctx context.Context, product *internal.Product) error {
	var gtin string
	if product.GTIN != nil {
		gtin = *product.GTIN
	}

	var brand string
	if product.Brand != nil {
		brand = *product.Brand
	}

	var category string
	if product.Category != nil {
		category = *product.Category
	}

	var imageUrl string
	if product.ImageURL != nil {
		imageUrl = *product.ImageURL
	}

	var expirationDate time.Time
	if product.ExpirationDate != nil {
		expirationDate = *product.ExpirationDate
	}

	storeId, err := uuid.Parse(product.StoreID)
	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeUnknown, "invalid store id")
	}

	newID, err := s.q.InsertProduct(ctx, db.InsertProductParams{
		Name:    product.Name,
		StoreID: storeId,
		Price:   int32(product.Price),
		Weight:  product.Weight,
		Gtin: pgtype.Text{
			String: gtin,
			Valid:  product.GTIN != nil,
		},
		Brand: pgtype.Text{
			String: brand,
			Valid:  product.Brand != nil,
		},
		Category: pgtype.Text{
			String: category,
			Valid:  product.Category != nil,
		},
		ImageUrl: pgtype.Text{
			String: imageUrl,
			Valid:  product.ImageURL != nil,
		},
		ExpirationDate: pgtype.Date{
			Time:  expirationDate,
			Valid: product.ExpirationDate != nil,
		},
	})

	if err != nil {
		return internal.WrapErrorf(err, internal.ErrorCodeUnknown, "q.InsertProduct")
	}

	product.ID = newID.String()

	return nil

}

func (s *Product) Find(ctx context.Context, params internal.FindProductParams) (internal.Product, error) {
	var query db.SelectProductParams

	if params.Name != nil {
		query.Name = params.Name
	}
	if params.Weight != nil {
		query.Weight = params.Weight
	}
	if params.Price != nil {
		pr := int32(*params.Price)
		query.Price = &pr
	}
	if params.StoreID != nil {
		storeID := uuid.MustParse(*params.StoreID)
		query.StoreID = &storeID
	}

	resp, err := s.q.SelectProduct(ctx, query)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return internal.Product{}, nil
		}
		return internal.Product{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "q.SelectStore")
	}

	return internal.Product{
		ID:             resp.ID.String(),
		Name:           resp.Name,
		StoreID:        resp.StoreID.String(),
		Price:          uint64(resp.Price),
		Weight:         resp.Weight,
		ExpirationDate: &resp.ExpirationDate.Time,
		Category:       &resp.Category.String,
		ImageURL:       &resp.ImageURL.String,
		Brand:          &resp.Brand.String,
		GTIN:           &resp.GTIN.String,
	}, nil
}
