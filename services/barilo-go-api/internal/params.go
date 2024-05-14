package internal

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type CreateStoreParams struct {
	Name    string
	Address string
	Phone   string
}

func (c CreateStoreParams) Validate() error {
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
