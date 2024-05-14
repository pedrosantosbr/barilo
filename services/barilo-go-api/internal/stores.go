package internal

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type Store struct {
	ID      string
	Name    string
	Address string // TODO: turn it into a value object
	Phone   string // TODO: turn it into a value object
}

func (t Store) Validate() error {
	if err := validation.ValidateStruct(&t,
		validation.Field(&t.Name, validation.Required),
		validation.Field(&t.Address, validation.Required),
		validation.Field(&t.Phone), // TODO: add V.O validation
	); err != nil {
		return WrapErrorf(err, ErrorCodeInvalidArgument, "invalid values")
	}

	return nil
}

// -

type Product struct {
	ID          string
	Name        string
	Description string
	Price       float64
	Unit        string
}

type Discount struct {
	ID            string
	StoreID       string
	DiscountPrice float64
}
