// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0

package db

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CircularImages struct {
	ID         uuid.UUID
	Url        string
	CreatedAt  pgtype.Timestamp
	UpdatedAt  pgtype.Timestamp
	CircularID uuid.UUID
}

type Circulars struct {
	ID             uuid.UUID
	Name           string
	ExpirationDate pgtype.Date
	CreatedAt      pgtype.Timestamp
	UpdatedAt      pgtype.Timestamp
	StoreID        uuid.UUID
}

type Discounts struct {
	ID         uuid.UUID
	Price      int32
	CreatedAt  pgtype.Timestamp
	UpdatedAt  pgtype.Timestamp
	CircularID uuid.UUID
	ProductID  uuid.UUID
}

type Products struct {
	ID             uuid.UUID
	Name           string
	Price          int32
	Weight         string
	ExpirationDate pgtype.Date
	Category       pgtype.Text
	ImageUrl       pgtype.Text
	Brand          pgtype.Text
	Gtin           pgtype.Text
	CreatedAt      pgtype.Timestamp
	UpdatedAt      pgtype.Timestamp
	StoreID        uuid.UUID
}

type Stores struct {
	ID      uuid.UUID
	Name    string
	Address string
	Phone   pgtype.Text
}
