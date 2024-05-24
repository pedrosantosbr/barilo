-- name: InsertProduct :one
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
  @store_id,
  @name,
  @price,
  @weight,
  @expiration_date,
  @category,
  @image_url,
  @brand,
  @gtin
)
RETURNING id;

-- name: CountProducts :many
SELECT COUNT(*) 
FROM
  products
WHERE
  id          = @id AND
  gtin        = @gtin AND
  store_id    = @store_id AND
  name        = @name AND
  weight      = @weight AND
  price       = @price AND
  brand       = @brand AND
  category    = @category
LIMIT 1;
