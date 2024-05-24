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

func (s *Store) CreateProduct(ctx context.Context, params internal.CreateProductParams) (internal.Product, error) {
	if err := params.Validate(); err != nil {
		return internal.Product{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "params.Validate")
	}

	return s.productRepo.Create(ctx, internal.CreateProductParams{
		Name:           params.Name,
		StoreID:        params.StoreID,
		Price:          params.Price,
		Weight:         params.Weight,
		ExpirationDate: params.ExpirationDate,
		Category:       params.Category,
		ImageURL:       params.ImageURL,
		Brand:          params.Brand,
		GTIN:           params.GTIN,
	})
}

func (s *Store) FindProduct(ctx context.Context, params internal.FindProductParams) (*internal.Product, error) {
	// if err := params.Validate(); err != nil {
	// 	return &internal.Product{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "params.Validate")
	// }

	product, err := s.productRepo.Find(ctx, internal.FindProductParams{
		ID:       params.ID,
		Name:     params.Name,
		StoreID:  params.StoreID,
		GTIN:     params.GTIN,
		Weight:   params.Weight,
		Brand:    params.Brand,
		Category: params.Category,
		Price:    params.Price,
	})
	if err != nil {
		return &internal.Product{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "productRepo.Find")
	}

	if product.ID == "" {
		return nil, nil
	}
	return &product, nil
}
