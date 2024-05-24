package services

import (
	"context"
	"fmt"
	"time"

	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/lib/logging"
	"go.uber.org/zap"
)

// Usually, the write operations in our repositories will receive the context and the domain object to be created or updated.
// The read operations will receive the context and a set of parameters to filter the results.

// StoreRepository is the interface that wraps the basic store methods for a sql store.
type StoreRepository interface {
	Create(ctx context.Context, params internal.CreateStoreParams) (internal.Store, error)
	Find(ctx context.Context, params internal.FindStoreParams) (internal.Store, error)
}

// ProductRepository is the interface that wraps the basic product methods for a sql store.
type ProductRepository interface {
	Create(ctx context.Context, product *internal.Product) error
	Find(ctx context.Context, params internal.FindProductParams) (internal.Product, error)
}

// CircularRepository is the interface that wraps the basic circular methods for a sql store.
type CircularRepository interface {
	Create(ctx context.Context, circular *internal.Circular) error
}

// DiscountRepository is the interface that wraps the basic discount methods for a sql store.
type DiscountRepository interface {
	Create(ctx context.Context, discount *internal.Discount) error
	Search(ctx context.Context, params internal.DiscountSearchParams) (internal.Discount, error)
}

// -

type Store struct {
	repo         StoreRepository
	productRepo  ProductRepository
	circularRepo CircularRepository
	discountRepo DiscountRepository
}

func NewStore(repo StoreRepository, productRepo ProductRepository, circularRepo CircularRepository, discountRepo DiscountRepository) *Store {
	return &Store{
		repo:         repo,
		productRepo:  productRepo,
		circularRepo: circularRepo,
		discountRepo: discountRepo,
	}
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

func (s *Store) CreateCircularWithDiscounts(ctx context.Context, params internal.CreateCircularParams) (internal.Circular, error) {
	logger := logging.FromContext(ctx)

	if err := params.Validate(); err != nil {
		return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "params.Validate")
	}

	// Find store
	store, err := s.Find(ctx, internal.FindStoreParams{ID: &params.StoreID})
	if err != nil {
		return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "s.Find")
	}
	if store == nil {
		return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeNotFound, "store not found")
	}

	// Create circular
	var circular internal.Circular
	circular.Name = params.Name
	circular.StoreID = store.ID
	expirationDate, err := time.Parse(time.DateOnly, params.ExpirationDate)
	if err != nil {
		return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeInvalidArgument, "time.Parse")
	}
	circular.ExpirationDate = expirationDate
	if err := s.circularRepo.Create(ctx, &circular); err != nil {
		return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "repo.CreateCircular")
	}

	// Create products if they don't exist
	// The products created in the circular are the ones that don't exist in the store and hence, receives a discount as defined in the circular
	var circularProducts []internal.Product

	for _, p := range params.Products {
		p := p

		exists, err := s.productRepo.Find(ctx, internal.FindProductParams{
			Name:    &p.Name,
			StoreID: &store.ID,
			Weight:  &p.Weight,
			Brand:   p.Brand,
		})
		if err != nil {
			return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "s.FindProduct")
		}
		if exists.ID != "" {
			p.ID = exists.ID
			circularProducts = append(circularProducts, *p)
			continue
		}
		if err := s.productRepo.Create(ctx, p); err != nil {
			return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "s.CreateProduct")
		}
		circularProducts = append(circularProducts, *p)
		logger.Info(fmt.Sprintf("new product %s created", p.Name))
	}

	// Create discounts
	for _, p := range circularProducts {
		fmt.Println(p.ID)
		discount := internal.Discount{
			ProductID:  p.ID,
			CircularID: circular.ID,
			Price:      p.Price, // Discounted price
		}

		// check for valid discounts
		now := time.Now().Format(time.DateOnly)
		exists, err := s.discountRepo.Search(ctx, internal.DiscountSearchParams{
			ExpirationDate: now,
			ProductID:      p.ID,
		})
		if err != nil {
			logger.Error(fmt.Sprintf("error searching for discount for product %s", p.Name), zap.Error(err))
			return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "s.FindByProductID")
		}
		if exists.ID != "" {
			logger.Info(fmt.Sprintf("discount for product %s already exists", p.Name))
			continue
		}
		if err := s.discountRepo.Create(ctx, &discount); err != nil {
			logger.Error(fmt.Sprintf("error creating discount for product %s", p.Name), zap.Error(err))
			return internal.Circular{}, internal.WrapErrorf(err, internal.ErrorCodeUnknown, "s.CreateDiscount")
		}
	}

	return circular, nil
}
