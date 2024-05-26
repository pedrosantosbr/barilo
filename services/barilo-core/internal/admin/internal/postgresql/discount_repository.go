package postgresql

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/admin/internal/postgresql/db"
	"github.com/pedrosantosbr/barilo/lib/errors"
)

// Circular represents a store in the database.
type Discount struct {
	q *db.Queries
}

// NewDiscount creates a new Discount.
func NewDiscount(d db.DBTX) *Discount {
	return &Discount{q: db.New(d)}
}

// Create a new store.
func (s *Discount) Create(ctx context.Context, discount *internal.Discount) error {
	circularId := uuid.MustParse(discount.CircularID)
	productId := uuid.MustParse(discount.ProductID)

	newID, err := s.q.InsertDiscount(ctx, db.InsertDiscountParams{
		CircularID: circularId,
		ProductID:  productId,
		Price:      int32(discount.Price),
	})
	if err != nil {
		return errors.WrapErrorf(err, errors.ErrorCodeUnknown, "q.InsertDiscount")
	}

	discount.ID = newID.String()

	return nil
}

// Search a discount by product id, circular id and expiration date
func (s *Discount) Search(ctx context.Context, params internal.DiscountSearchParams) (internal.Discount, error) {
	productId, err := uuid.Parse(params.ProductID)
	if err != nil {
		return internal.Discount{}, errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "uuid.Parse(params.ProductID)")
	}

	expirationDate, err := time.Parse(time.DateOnly, params.ExpirationDate)
	if err != nil {
		return internal.Discount{}, errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "time.Parse(time.DateOnly, params.ExpirationDate)")
	}

	res, err := s.q.SelectDiscount(ctx, db.SelectDiscountParams{
		ProductID:      productId,
		ExpirationDate: pgtype.Date{Time: expirationDate, Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return internal.Discount{}, nil
		}
		return internal.Discount{}, errors.WrapErrorf(err, errors.ErrorCodeUnknown, "q.SelectDiscount")
	}

	return internal.Discount{
		ID:         res.ID.String(),
		ProductID:  res.ProductID.String(),
		CircularID: res.CircularID.String(),
	}, nil
}
