package postgresql

import (
	"context"

	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/circulars/internal/postgresql/db"
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

// Find a circular by id
func (s *Circular) Search(ctx context.Context) ([]internal.Circular, error) {
	results, err := s.q.SelectCirculars(ctx)
	if err != nil {
		return nil, errors.WrapErrorf(err, errors.ErrorCodeUnknown, "circulars.List")
	}

	var circulars []internal.Circular
	for _, r := range results {
		circulars = append(circulars, internal.Circular{
			ID:             r.CircularID.String(),
			Name:           r.CircularName,
			ExpirationDate: r.CircularExpirationDate.Time,
			StoreID:        r.CircularStoreID.String(),
			Store: &internal.Store{
				ID:      r.StoreID.String(),
				Name:    r.StoreName,
				Address: r.StoreAddress,
			},
		})
	}

	return circulars, nil
}
