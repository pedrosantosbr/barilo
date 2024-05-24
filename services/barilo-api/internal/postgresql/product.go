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

func (s *Product) Create(ctx context.Context, params internal.CreateProductParams) (internal.Product, error) {
	var gtin string
	if params.GTIN != nil {
		gtin = *params.GTIN
	}

	var brand string
	if params.Brand != nil {
		brand = *params.Brand
	}

	var category string
	if params.Category != nil {
		category = *params.Category
	}

	var imageUrl string
	if params.ImageURL != nil {
		imageUrl = *params.ImageURL
	}

	var expirationDate time.Time
	if params.ExpirationDate != nil {
		expirationDate, _ = time.Parse(time.DateOnly, *params.ExpirationDate)
	}

	newID, err := s.q.InsertProduct(ctx, db.InsertProductParams{
		Name:    params.Name,
		StoreID: uuid.MustParse(params.StoreID),
		Price:   int32(params.Price),
		Weight:  params.Weight,
		Gtin: pgtype.Text{
			String: gtin,
			Valid:  params.GTIN != nil,
		},
		Brand: pgtype.Text{
			String: brand,
			Valid:  params.Brand != nil,
		},
		Category: pgtype.Text{
			String: category,
			Valid:  params.Category != nil,
		},
		ImageUrl: pgtype.Text{
			String: imageUrl,
			Valid:  params.ImageURL != nil,
		},
		ExpirationDate: pgtype.Date{
			Time:  expirationDate,
			Valid: params.ExpirationDate != nil,
		},
	})

	if err != nil {
		return internal.Product{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "q.InsertProduct")
	}

	return internal.Product{
		ID:             newID.String(),
		Name:           params.Name,
		StoreID:        params.StoreID,
		Price:          params.Price,
		Weight:         params.Weight,
		ExpirationDate: &expirationDate,
		Category:       params.Category,
		ImageURL:       params.ImageURL,
		Brand:          params.Brand,
		GTIN:           params.GTIN,
	}, nil

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
