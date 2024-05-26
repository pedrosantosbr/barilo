package services

import (
	"context"
	"time"

	"github.com/pedrosantosbr/barilo/internal"
	"github.com/pedrosantosbr/barilo/lib/errors"
)

// CircularSearchRepository...
// Searches for circulars near the user and return them
// to be displayed in the app along with the stores
type CircularSearchRepository interface {
	SearchWithStore(ctx context.Context, address string) ([]internal.Circular, error)
}

// DiscountSearchRepository...
// Searches for discounts in a circular that are still valid
// and return the products with the discounts
type DiscountSearchRepository interface {
	SearchWithProduct(ctx context.Context, circulars []string, expirationDate time.Time) ([]internal.Discount, error)
}

type Circular struct {
	repo     CircularSearchRepository
	discount DiscountSearchRepository
}

func NewCircular(repo CircularSearchRepository, discount DiscountSearchRepository) *Circular {
	return &Circular{
		repo:     repo,
		discount: discount,
	}
}

func (c *Circular) List(ctx context.Context) ([]internal.Circular, error) {
	// Search for circulars near the user
	circulars, err := c.repo.SearchWithStore(ctx, "rua 1, 123")
	if err != nil {
		return nil, errors.WrapErrorf(err, errors.ErrorCodeUnknown, "circulars.Search")
	}

	//-

	// circularsIds := []string{}
	// for _, c := range circulars {
	// 	circularsIds = append(circularsIds, c.ID)
	// }

	// discounts, _ := c.discount.SearchWithProduct(ctx, circularsIds, time.Now())

	// for _, c := range circulars {
	// 	for _, d := range discounts {
	// 		if c.ID == d.CircularID {
	// 			c.Discounts = append(c.Discounts, &d)
	// 		}
	// 	}
	// }

	return circulars, nil
}
