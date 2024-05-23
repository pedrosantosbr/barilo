package services

import (
	"context"

	"github.com/pedrosantosbr/barilo/internal"
)

type StoreRepository interface {
	Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error)
	Find(ctx context.Context, params internal.FindStoreParams) (internal.Store, error)
}

type ProductRepository interface {
	Create(ctx context.Context, params internal.CreateProductParams) (internal.Product, error)
	Find(ctx context.Context, params internal.FindProductParams) (internal.Product, error)
}

type Store struct {
	repo        StoreRepository
	productRepo ProductRepository
}

func NewStore(repo StoreRepository, productRepo ProductRepository) *Store {
	return &Store{repo: repo, productRepo: productRepo}
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

func (s *Store) Find(ctx context.Context, params internal.FindStoreParams) (*internal.Store, error) {
	if err := params.Validate(); err != nil {
		return &internal.Store{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "params.Validate")
	}

	store, err := s.repo.Find(ctx, internal.FindStoreParams{
		ID:      params.ID,
		Name:    params.Name,
		Address: params.Address,
	})
	if err != nil {
		return &internal.Store{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "repo.Find")
	}

	if store.ID == "" {
		return nil, nil
	}
	return &store, nil
}
