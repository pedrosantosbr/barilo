// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: circulars.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const InsertCircular = `-- name: InsertCircular :one
INSERT INTO circulars (
  name,
  store_id,
  expiration_date
)
VALUES (
  $1,
  $2,
  $3
)
RETURNING id
`

type InsertCircularParams struct {
	Name           string
	StoreID        uuid.UUID
	ExpirationDate pgtype.Date
}

func (q *Queries) InsertCircular(ctx context.Context, arg InsertCircularParams) (uuid.UUID, error) {
	row := q.db.QueryRow(ctx, InsertCircular, arg.Name, arg.StoreID, arg.ExpirationDate)
	var id uuid.UUID
	err := row.Scan(&id)
	return id, err
}

const SelectCircular = `-- name: SelectCircular :one
SELECT
  id,
  name,
  store_id,
  expiration_date
FROM
  circulars
WHERE
  id = $1
LIMIT 1
`

type SelectCircularRow struct {
	ID             uuid.UUID
	Name           string
	StoreID        uuid.UUID
	ExpirationDate pgtype.Date
}

func (q *Queries) SelectCircular(ctx context.Context, id uuid.UUID) (SelectCircularRow, error) {
	row := q.db.QueryRow(ctx, SelectCircular, id)
	var i SelectCircularRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.StoreID,
		&i.ExpirationDate,
	)
	return i, err
}
