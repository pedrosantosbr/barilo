package internal

import (
	"regexp"
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/google/uuid"
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
				"phone": NewErrorf(ErrorCodeInvalidArgument, "invalid phone number"),
			}
		}
	}

	store := Store{
		Name:    c.Name,
		Address: c.Address,
		Phone:   c.Phone,
	}

	if err := validation.Validate(&store); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "validation.Validate")
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
				"id": NewErrorf(ErrorCodeInvalidArgument, "invalid uuid"),
			}
		}
	}
	return nil
}

// -

type CreateProductParams struct {
	StoreID        string
	Name           string
	Price          float64
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
				"expiration_date": NewErrorf(ErrorCodeInvalidArgument, "invalid expiration date"),
			}
		}
		expirationDatePointer := &expirationDate
		product.ExpirationDate = expirationDatePointer
	}

	if err := validation.Validate(&product); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "validation.Validate")
	}

	return nil
}

type FindProductParams struct {
	ID       *string
	GTIN     *string
	StoreID  *string
	Name     *string
	Weight   *string
	Price    *float64
	Brand    *string
	Category *string
}
