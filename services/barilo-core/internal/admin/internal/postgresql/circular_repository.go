package postgresql

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/admin/internal/postgresql/db"
	"github.com/pedrosantosbr/barilo/lib/errors"
)

// Circular represents a store in the database.
type Circular struct {
	q *db.Queries
}

// NewCircular creates a new Circular.
func NewCircular(d db.DBTX) *Circular {
	return &Circular{q: db.New(d)}
}

// Create a new store.
func (s *Circular) Create(ctx context.Context, circular *internal.Circular) error {
	storeId := uuid.MustParse(circular.StoreID)

	newID, err := s.q.InsertCircular(ctx, db.InsertCircularParams{
		Name:    circular.Name,
		StoreID: storeId,
		ExpirationDate: pgtype.Date{
			Time:  circular.ExpirationDate,
			Valid: true,
		},
	})
	if err != nil {
		return errors.WrapErrorf(err, errors.ErrorCodeUnknown, "q.InsertCircular")
	}

	circular.ID = newID.String()

	return nil
}

// Find a circular by id
func (s *Circular) Find(ctx context.Context, id string) (internal.Circular, error) {
	uuid := uuid.MustParse(id)
	res, err := s.q.SelectCircular(ctx, uuid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return internal.Circular{}, nil
		}
		return internal.Circular{}, errors.WrapErrorf(err, errors.ErrorCodeUnknown, "q.SelectCircular")
	}

	return internal.Circular{
		ID:             res.ID.String(),
		Name:           res.Name,
		ExpirationDate: res.ExpirationDate.Time,
		StoreID:        res.StoreID.String(),
	}, nil
}
