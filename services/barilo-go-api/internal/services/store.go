package services

import (
	"context"

	"github.com/pedrosantosbr/barilo/internal"
)

type StoreRepository interface {
	Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error)
}

type Store struct {
	repo StoreRepository
}

func NewStore(repo StoreRepository) *Store {
	return &Store{repo: repo}
}

func (s *Store) Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error) {
	if err := params.Validate(); err != nil {
		return internal.Store{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "params.Validate")
	}

	return s.repo.Create(ctx, internal.CreateStoreParams{
		Name:    params.Name,
		Address: params.Address,
		Phone:   params.Phone,
	})
}
