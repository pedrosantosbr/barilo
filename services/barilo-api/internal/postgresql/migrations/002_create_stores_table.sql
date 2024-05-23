CREATE TABLE stores (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  phone       VARCHAR(255)
);

---- create above / drop below ----

DROP TABLE IF EXISTS stores;