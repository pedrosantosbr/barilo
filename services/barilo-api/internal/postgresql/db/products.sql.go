package db

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const CountProducts = `-- name: CountProducts :many
SELECT COUNT(*) 
FROM
  products
WHERE
  id          = $1 AND
  gtin        = $2 AND
  store_id    = $3 AND
  name        = $4 AND
  weight      = $5 AND
  price       = $6 AND
  brand       = $7 AND
  category    = $8
LIMIT 1
`

type CountProductsParams struct {
	ID       uuid.UUID
	Gtin     pgtype.Text
	StoreID  uuid.UUID
	Name     string
	Weight   string
	Price    int32
	Brand    pgtype.Text
	Category pgtype.Text
}

func (q *Queries) CountProducts(ctx context.Context, arg CountProductsParams) ([]int64, error) {
	rows, err := q.db.Query(ctx, CountProducts,
		arg.ID,
		arg.Gtin,
		arg.StoreID,
		arg.Name,
		arg.Weight,
		arg.Price,
		arg.Brand,
		arg.Category,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []int64{}
	for rows.Next() {
		var count int64
		if err := rows.Scan(&count); err != nil {
			return nil, err
		}
		items = append(items, count)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const InsertProduct = `-- name: InsertProduct :one
INSERT INTO products (
  store_id,
  name,
  price,
  weight,
  expiration_date,
  category,
  image_url,
  brand,
  gtin
)
VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9
)
RETURNING id
`

type InsertProductParams struct {
	StoreID        uuid.UUID
	Name           string
	Price          int32
	Weight         string
	ExpirationDate pgtype.Date
	Category       pgtype.Text
	ImageUrl       pgtype.Text
	Brand          pgtype.Text
	Gtin           pgtype.Text
}

func (q *Queries) InsertProduct(ctx context.Context, arg InsertProductParams) (uuid.UUID, error) {
	row := q.db.QueryRow(ctx, InsertProduct,
		arg.StoreID,
		arg.Name,
		arg.Price,
		arg.Weight,
		arg.ExpirationDate,
		arg.Category,
		arg.ImageUrl,
		arg.Brand,
		arg.Gtin,
	)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

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
