package postgresql

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/internal/postgresql/db"
)

// Store represents a store in the database.
type Store struct {
	q *db.Queries
}

// NewStore creates a new Store.
func NewStore(d db.DBTX) *Store {
	return &Store{q: db.New(d)}
}

func (s *Store) Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error) {
	newID, err := s.q.InsertStore(ctx, db.InsertStoreParams{
		Name:    params.Name,
		Address: params.Address,
		Phone:   pgtype.Text{String: params.Phone, Valid: params.Phone != ""},
	})
	if err != nil {
		return internal.Store{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "q.InsertStore")
	}

	return internal.Store{
		ID:      newID.String(),
		Name:    params.Name,
		Address: params.Address,
		Phone:   params.Phone,
	}, nil
}
