package internal

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/google/uuid"
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
