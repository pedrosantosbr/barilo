CREATE TABLE products (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  price           DECIMAL(10, 2) NOT NULL,
  weight          VARCHAR(255) NOT NULL,
  expiration_date DATE,
  category        VARCHAR(255),
  image_url       VARCHAR(255),
  brand           VARCHAR(255),
  gtin            VARCHAR(13),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  store_id        UUID NOT NULL,
  FOREIGN KEY     (store_id) REFERENCES stores(id)
);

---- create above / drop below ----

DROP TABLE IF EXISTS products;
