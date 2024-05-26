package internal

import (
	"regexp"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/google/uuid"
	"github.com/pedrosantosbr/barilo/lib/errors"
)

const phoneRegEx = `^\d{11}$`

type CreateStoreParams struct {
	Name    string
	Address string
	Phone   *string
}

func (c CreateStoreParams) Validate() error {
	if c.Phone != nil {
		err := validation.Validate(c.Phone, validation.Match(regexp.MustCompile(phoneRegEx)))
		if err != nil {
			return validation.Errors{
				"phone": errors.NewErrorf(errors.ErrorCodeInvalidArgument, "invalid phone number"),
			}
		}
	}

	store := Store{
		Name:    c.Name,
		Address: c.Address,
		Phone:   c.Phone,
	}

	if err := validation.Validate(&store); err != nil {
		return errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "validation.Validate")
	}

	return nil
}

type FindStoreParams struct {
	ID      *string
	Name    *string
	Address *string
}

func (f FindStoreParams) Validate() error {
	if f.ID != nil {
		if _, err := uuid.Parse(*f.ID); err != nil {
			return validation.Errors{
				"id": errors.NewErrorf(errors.ErrorCodeInvalidArgument, "invalid uuid"),
			}
		}
	}
	return nil
}

// -

type CreateProductParams struct {
	StoreID        string
	Name           string
	Price          uint64
	Weight         string
	ExpirationDate *string
	Category       *string
	ImageURL       *string
	Brand          *string
	GTIN           *string
}

func (c CreateProductParams) Validate() error {
	product := Product{
		Name:     c.Name,
		Price:    c.Price,
		Weight:   c.Weight,
		Category: c.Category,
		ImageURL: c.ImageURL,
		Brand:    c.Brand,
		GTIN:     c.GTIN,
	}

	if c.ExpirationDate != nil {
		expirationDate, err := time.Parse("2006-01-02", *c.ExpirationDate)
		if err != nil {
			return validation.Errors{
				"expiration_date": errors.NewErrorf(errors.ErrorCodeInvalidArgument, "invalid expiration date"),
			}
		}
		expirationDatePointer := &expirationDate
		product.ExpirationDate = expirationDatePointer
	}

	if err := validation.Validate(&product); err != nil {
		return errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "validation.Validate")
	}

	return nil
}

type FindProductParams struct {
	ID       *string
	GTIN     *string
	StoreID  *string
	Name     *string
	Weight   *string
	Price    *uint64
	Brand    *string
	Category *string
}

// -

type CreateCircularParams struct {
	StoreID        string     `json:"store_id"`
	Name           string     `json:"name"`
	ExpirationDate string     `json:"expiration_date"`
	Products       []*Product `json:"products"`
}

func (c CreateCircularParams) Validate() error {
	// validate time.Time date only
	expirationDate, err := time.Parse("2006-01-02", c.ExpirationDate)
	if err != nil {
		return validation.Errors{
			"expiration_date": errors.NewErrorf(errors.ErrorCodeInvalidArgument, "invalid date"),
		}
	}

	circular := Circular{
		Name:           c.Name,
		StoreID:        c.StoreID,
		ExpirationDate: expirationDate,
	}

	if err := validation.Validate(&circular); err != nil {
		return errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "validation.Validate")
	}

	// validate products
	for _, product := range c.Products {
		if err := product.Validate(); err != nil {
			return errors.WrapErrorf(err, errors.ErrorCodeInvalidArgument, "product.Validate")
		}
	}

	return nil
}

// -

// DiscountSearchParams is only used to search valid discounts for a given product
type DiscountSearchParams struct {
	ExpirationDate string // used to get the circulars that are still valid
	ProductID      string // used to get the discounts of a specific product
}
