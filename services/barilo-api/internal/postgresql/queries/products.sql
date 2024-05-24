CREATE OR REPLACE FUNCTION find_product(
    _id UUID,
    _gtin VARCHAR(13),
    _store_id UUID,
    _name VARCHAR(255),
    _weight VARCHAR(255),
    _price INTEGER,
    _brand VARCHAR(255),
    _category VARCHAR(255)
)
RETURNS TABLE (
    id UUID,
    store_id UUID,
    name VARCHAR(255),
    price INTEGER,
    weight VARCHAR(255),
    expiration_date DATE,
    category VARCHAR(255),
    image_url VARCHAR(255),
    brand VARCHAR(255),
    gtin VARCHAR(13)
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, store_id, name, price, weight, expiration_date, category, image_url, brand, gtin
    FROM products
    WHERE 
        (_id IS NULL OR id = _id) AND
        (_gtin IS NULL OR gtin = _gtin) AND
        (_store_id IS NULL OR store_id = _store_id) AND
        (_name IS NULL OR name = _name) AND
        (_weight IS NULL OR weight = _weight) AND
        (_price IS NULL OR price = _price) AND
        (_brand IS NULL OR brand = _brand) AND
        (_category IS NULL OR category = _category)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- name: SelectProduct :one
SELECT * FROM find_product(
    $1::uuid, $2::varchar, $3::uuid, $4::varchar, $5::varchar, $6::integer, $7::varchar, $8::varchar
);

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
