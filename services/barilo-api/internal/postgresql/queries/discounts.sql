-- name: InsertDiscount :one
INSERT INTO discounts (
  circular_id,
  product_id,
  price
)
VALUES (
  @circular_id,
  @product_id,
  @price
)
RETURNING id;

-- name: SelectDiscount :one
SELECT
  discounts.id,
  discounts.circular_id,
  discounts.product_id,
  discounts.price
FROM
  discounts
INNER JOIN
  circulars ON discounts.circular_id = circulars.id
WHERE
  discounts.product_id = @product_id
AND
  circulars.expiration_date > @expiration_date
LIMIT 1;
