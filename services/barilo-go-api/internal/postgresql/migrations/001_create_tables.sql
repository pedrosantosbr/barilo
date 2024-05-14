CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE stores (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  phone       VARCHAR(255)
);

---- create above / drop below ----

DROP TABLE stores;

DROP EXTENSION IF EXISTS "uuid-ossp";
