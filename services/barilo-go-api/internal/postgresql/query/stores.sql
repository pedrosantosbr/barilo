-- name: SelectStore :one
SELECT
  id,
  name,
  address,
  phone
FROM
  stores
WHERE
  id = @id
LIMIT 1;