-- name: SelectCircular :one
SELECT
  id,
  name,
  store_id,
  expiration_date
FROM
  circulars
WHERE
  id = @id
LIMIT 1;

-- name: InsertCircular :one
INSERT INTO circulars (
  name,
  store_id,
  expiration_date
)
VALUES (
  @name,
  @store_id,
  @expiration_date
)
RETURNING id;