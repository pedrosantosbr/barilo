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
  OR
  ( 
    name = @name 
    AND
    address = @address 
  )
LIMIT 1;

-- name: InsertStore :one
INSERT INTO stores (
  name,
  address,
  phone
)
VALUES (
  @name,
  @address,
  @phone
)
RETURNING id;