-- name: SelectCirculars :many
SELECT
  c.id as circular_id,
  c.name as circular_name,
  c.store_id as circular_store_id,
  c.expiration_date as circular_expiration_date,
  c.created_at as circular_created_at,
  c.updated_at as circular_updated_at,
  s.id as store_id,
  s.name as store_name,
  s.address as store_address
FROM
  circulars as c
INNER JOIN 
  stores as s ON stores.id = circulars.store_id
WHERE
  expiration_date >= NOW();
