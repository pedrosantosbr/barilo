CREATE TABLE circular_images (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url             TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  circular_id         UUID NOT NULL,
  FOREIGN KEY         (circular_id) REFERENCES circulars(id)
);

---- create above / drop below ----

DROP TABLE IF EXISTS circular_images;