const pgp = require('pg-promise')();
const connectionString = 'postgres://username:password@localhost:5432/mydatabase';
const db = pgp(connectionString);

await db.none('CREATE SCHEMA IF NOT EXISTS prodReview');

await db.none(`
  CREATE TABLE IF NOT EXISTS prodReview.products (
    product_id SERIAL PRIMARY KEY,
  )
`)
await db.none(`
CREATE TABLE IF NOT EXISTS prodReview.photos (
  photo_id SERIAL PRIMARY KEY,
  review_id INT,
  thumbnail_url TEXT,
  url TEXT
  FOREIGN KEY (review_id) REFERENCES reviews (review_id)
  )
`)
await db.none(`
  CREATE TABLE IF NOT EXISTS prodReview.reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    summary TEXT,
    recommend BOOLEAN,
    response TEXT,
    body TEXT,
    date DATE,
    reviewer_name TEXT,
    helpfulness INT,
    photos_id INT,
    FOREIGN KEY (product_id) REFERENCES product (product_id),
    FOREIGN KEY (photos_id) REFERENCES photos (photos_id)
  )
`)
module.exports = db;