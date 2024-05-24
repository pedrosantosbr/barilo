package db

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

const SelectProduct = `-- name: SelectProduct :one
SELECT * FROM find_product(
    $1::uuid, $2::varchar, $3::uuid, $4::varchar, $5::varchar, $6::integer, $7::varchar, $8::varchar
)
`

type SelectProductParams struct {
	ID       *uuid.UUID
	GTIN     *string
	StoreID  *uuid.UUID
	Name     *string
	Weight   *string
	Price    *int32
	Brand    *string
	Category *string
}

type SelectProductRow struct {
	ID             uuid.UUID
	StoreID        uuid.UUID
	Name           string
	Price          int32
	Weight         string
	ExpirationDate sql.NullTime
	Category       sql.NullString
	ImageURL       sql.NullString
	Brand          sql.NullString
	GTIN           sql.NullString
}

func (q *Queries) SelectProduct(ctx context.Context, arg SelectProductParams) (SelectProductRow, error) {
	row := q.db.QueryRow(ctx, SelectProduct,
		arg.ID,
		arg.GTIN,
		arg.StoreID,
		arg.Name,
		arg.Weight,
		arg.Price,
		arg.Brand,
		arg.Category,
	)
	var i SelectProductRow
	err := row.Scan(
		&i.ID,
		&i.StoreID,
		&i.Name,
		&i.Price,
		&i.Weight,
		&i.ExpirationDate,
		&i.Category,
		&i.ImageURL,
		&i.Brand,
		&i.GTIN,
	)
	return i, err
}
