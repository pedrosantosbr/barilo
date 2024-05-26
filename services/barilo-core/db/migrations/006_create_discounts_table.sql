CREATE TABLE discounts (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  price           INTEGER NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  circular_id         UUID NOT NULL,
  FOREIGN KEY         (circular_id) REFERENCES circulars(id),

  product_id         UUID NOT NULL,
  FOREIGN KEY         (product_id) REFERENCES products(id)
);

---- create above / drop below ----

DROP TABLE IF EXISTS discounts;