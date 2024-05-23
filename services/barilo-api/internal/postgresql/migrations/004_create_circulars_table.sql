CREATE TABLE circulars (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  expiration_date DATE NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  store_id        UUID NOT NULL,
  FOREIGN KEY     (store_id) REFERENCES stores(id)
);

---- create above / drop below ----

DROP TABLE IF EXISTS circulars;