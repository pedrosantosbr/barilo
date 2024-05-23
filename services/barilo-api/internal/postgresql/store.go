package postgresql

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
	var phoneVal string
	if params.Phone != nil {
		phoneVal = *params.Phone
	}

	newID, err := s.q.InsertStore(ctx, db.InsertStoreParams{
		Name:    params.Name,
		Address: params.Address,
		Phone: pgtype.Text{
			String: phoneVal,
			Valid:  params.Phone != nil,
		},
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

func (s *Store) Find(ctx context.Context, params internal.FindStoreParams) (internal.Store, error) {
	var query db.SelectStoreParams

	if params.ID != nil {
		query.ID = uuid.MustParse(*params.ID)
	}
	if params.Name != nil {
		query.Name = *params.Name
	}
	if params.Address != nil {
		query.Address = *params.Address
	}

	res, err := s.q.SelectStore(ctx, query)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return internal.Store{}, nil
		}
		return internal.Store{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "q.SelectStore")
	}

	return internal.Store{
		ID:      res.ID.String(),
		Name:    res.Name,
		Address: res.Address,
		Phone:   &res.Phone.String,
	}, nil
}
