// const path = require('path');
// const fs = require('fs');
const { Pool } = require('pg')

const pool = new Pool({
  host:process.env.host,
  user:process.env.user,
  password:process.env.password
})

const initalizeDB = async() => {
  client = await pool.connect()
  await client.query('CREATE SCHEMA IF NOT EXISTS prodReview;');
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY ,
      product_id INT,
      rating INT,
      date TEXT,
      summary TEXT,
      body TEXT,
      recommend BOOLEAN,
      reported BOOLEAN,
      reviewer_name TEXT,
      reviewer_email TEXT,
      response TEXT,
      helpfulness INT
    );
  `)  
  await client.query(`
    CREATE TABLE IF NOT EXISTS characteristics (
      id SERIAL PRIMARY KEY ,
      product_id INT,
      name TEXT
    );
  `)
  await client.query(`
    CREATE TABLE IF NOT EXISTS characteristic_reviews (
      id SERIAL PRIMARY KEY ,
      characteristic_id INT,
      review_id INT,
      value INT,
      FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
      FOREIGN KEY (review_id) REFERENCES reviews (id)
    );
  `)
  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews_photos (
      id SERIAL PRIMARY KEY ,
      review_id INT,
      url TEXT,
      FOREIGN KEY (review_id) REFERENCES reviews (id)
    );
  `)
  await client.query(`CREATE INDEX idx_reviews_product_id ON reviews (product_id);`)
  await client.query(`CREATE INDEX idx_reviews_rating ON reviews (rating);`)
  await client.query(`CREATE INDEX idx_reviews_recommend ON reviews (recommend);`)
  await client.query(`CREATE INDEX idx_reviews_reported ON reviews (reported);`)
  await client.query(`CREATE INDEX idx_reviews_photos_review_id ON reviews_photos (review_id);`)
  await client.query(`CREATE INDEX idx_characteristic_reviews_characteristic_id ON characteristic_reviews (characteristic_id);`)
  await client.query(`CREATE INDEX idx_characteristics_product_id ON characteristics (product_id);`)
}
// initalizeDB();
  
// const insertToTable = async(filePath, tablename) => {
//   const query = `COPY ${tablename} FROM '${filePath}' DELIMITER ',' CSV HEADER;`;
//   await client.query(query)
//   console.log(`Data from "${filePath}" inserted into ${tablename} successfully!`);
// }

// const seedDB = async() => {
//   await insertToTable(path.join(__dirname, 'SDC-DATA/reviews.csv'), "reviews");
//   await insertToTable(path.join(__dirname, 'SDC-DATA/characteristics.csv'), "characteristics");
//   await insertToTable(path.join(__dirname, 'SDC-DATA/reviews_photos.csv'), "reviews_photos");
//   await insertToTable(path.join(__dirname, 'SDC-DATA/characteristic_reviews.csv'), "characteristic_reviews");


// COPY reviews FROM '/home/jason/Hackreactor/SDC-API-Reviews/SDC-DATA/reviews.csv' DELIMITER ',' CSV HEADER;

// COPY characteristics FROM '/home/jason/Hackreactor/SDC-API-Reviews/SDC-DATA/characteristics.csv' DELIMITER ',' CSV HEADER;

// COPY reviews_photos FROM '/home/jason/Hackreactor/SDC-API-Reviews/SDC-DATA/reviews_photos.csv' DELIMITER ',' CSV HEADER;

// COPY characteristic_reviews FROM '/home/jason/Hackreactor/SDC-API-Reviews/SDC-DATA/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;
// }


// const absoPath = path.join(__dirname, 'SDC-DATA')
// fs.promises.readdir(absoPath)
// .then((files) => {
//   console.log('FILES => ', files)
//   for (const file of files) {
//     insertToTable(path.join(absoPath, file), file.split(".csv")[0])
//     }
// })
// .catch((err) => {
//   console.log('ERROR => ', err)
// })

module.exports = pool;