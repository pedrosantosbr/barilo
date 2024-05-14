// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: stores.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const SelectStore = `-- name: SelectStore :one
SELECT
  id,
  name,
  address,
  phone
FROM
  stores
WHERE
  id = $1
LIMIT 1
`

func (q *Queries) SelectStore(ctx context.Context, id uuid.UUID) (Stores, error) {
	row := q.db.QueryRow(ctx, SelectStore, id)
	var i Stores
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Address,
		&i.Phone,
	)
	return i, err
}
