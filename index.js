const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config()
const {pool} = require('./database-postgres')

const app = express()

app.use(express.json());;

app.use(cors({origin:'http://localhost:3000'}))


app.get('/reviews', async (req, res) => {
  const sort = req.query.sort === 'newest' ? 'date' : 'helpfulness';
  const count = parseInt(req.query.count) || 5;
  const page = parseInt(req.query.page) || 0;
  const product_id = req.query.product_id;

  try {
    const client = await pool.connect();
    const dbResponse = await client.query(
      `SELECT
        reviews.id,
        reviews.rating,
        reviews.summary,
        reviews.recommend,
        reviews.response,
        reviews.body,
        reviews.date,
        reviews.reviewer_name,
        reviews.helpfulness
      FROM reviews
      WHERE reviews.product_id = $1
      AND reviews.reported = false
      ORDER BY ${sort} DESC
      LIMIT $2
      OFFSET $3`,
      [product_id, count, page]
    );

    const reviewIDs = dbResponse.rows.map((review) => review.id);
    
    const photosResponse = await client.query(
      `SELECT review_id, url, id
      FROM reviews_photos
      WHERE review_id = ANY ($1);`,
      [reviewIDs]
    );
    const photosByReviewId = {};

    photosResponse.rows.forEach((photo) => {
      if (!photosByReviewId[photo.review_id]) {
        photosByReviewId[photo.review_id] = [];
      }
      photosByReviewId[photo.review_id].push({id: photo.id, url:photo.url});
    });

    const cleanData = dbResponse.rows.map((review) => ({
      id: review.id,
      rating: review.rating,
      summary: review.summary,
      recommend: review.recommend,
      response: review.response,
      body: review.body,
      date: (new Date(parseInt(review.date))).toISOString(),
      reviewer_name: review.reviewer_name,
      helpfulness: review.helpfulness,
      photos: photosByReviewId[review.id] || [],
    }));

    res.json({
      product: product_id,
      page: page,
      count: count,
      results: cleanData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/reviews/meta', async (req, res) => {
  const result = {
    product_id: req.query.product_id,
    ratings: {},
    recommended: {},
    characteristics: {}
  };

  try {
    const client = await pool.connect();

    // Retrieve ratings count
    const ratingsQuery = `
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE product_id = ${req.query.product_id}
      AND reviews.reported = false
      GROUP BY rating;
    `;
    const ratingsResult = await client.query(ratingsQuery);

    // Populate ratings count in the result
    ratingsResult.rows.forEach(row => {
      result.ratings[row.rating.toString()] = row.count;
    });

    // Retrieve recommended count
    const recommendedQuery = `
      SELECT recommend, COUNT(*) as count
      FROM reviews
      WHERE product_id = ${req.query.product_id}
      AND reviews.reported = false
      GROUP BY recommend;
    `;
    const recommendedResult = await client.query(recommendedQuery);

    // Populate recommended count in the result
    recommendedResult.rows.forEach(row => {
      result.recommended[row.recommend.toString()] = row.count;
    });

    // Retrieve characteristics
    const characteristicsQuery = `
      SELECT c.id, c.name, AVG(cr.value) as value
      FROM characteristics c
      JOIN characteristic_reviews cr ON c.id = cr.characteristic_id
      WHERE c.product_id = ${req.query.product_id}
      GROUP BY c.id, c.name;
    `;
    const characteristicsResult = await client.query(characteristicsQuery);

  characteristicsResult.rows.forEach(row => {
      result.characteristics[row.name] = {
        id: row.id,
        value: row.value.toString()
      };
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: 'Internal server error' });
  }
});

app.post('/reviews', async (req, res) => {
  try {
    const client = await pool.connect();
    const rightNow = new Date
    const rightNowInMs = rightNow.valueOf()
    // Insert the review into the "reviews" table
    const reviewQuery = `
      INSERT INTO reviews (product_id, rating, summary, body, recommend, reported, reviewer_name, reviewer_email, helpfulness, date)
      VALUES ($1, $2, $3, $4, $5, false, $6, $7, 0, $8)
      RETURNING id;
    `;
    const reviewValues = [
      req.body.product_id,
      req.body.rating,
      req.body.summary,
      req.body.body,
      req.body.recommend,
      req.body.name,
      req.body.email,
      rightNowInMs
    ];
    const reviewResult = await client.query(reviewQuery, reviewValues);

    const reviewId = reviewResult.rows[0].id; // Get the ID of the inserted review
    // Insert the characteristics reviews
    const characteristicsObj = req.body.characteristics;

    if (characteristicsObj) {
      const characteristicsQuery = `
        INSERT INTO characteristic_reviews (characteristic_id, value, review_id)
        VALUES ($1, $2, $3);
      `;

      const characteristicsValues = Object.entries(characteristicsObj).map(([characteristicId, value]) => [
        characteristicId,
        value,
        reviewId
      ]);

      await Promise.all(
        characteristicsValues.map(values => client.query(characteristicsQuery, values))
      );
    }


    // Insert the review photos
    if (req.body.photos) {
      const photosQuery = `
        INSERT INTO reviews_photos (review_id, url)
        VALUES ($1, $2);
      `;
      const photosValues = req.body.photos.map(photo => [reviewId, photo]);

      await Promise.all(
        photosValues.map(values => client.query(photosQuery, values))
      );
    }

    res.status(201).json('CREATED');
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: 'Internal server error' });
  }
});

app.put('/reviews/:review_id/helpful', async (req, res) => {
  try {
    const client = await pool.connect();
    const reviewId = req.params.review_id;
    await client.query(`
      UPDATE reviews
      SET helpfulness = helpfulness + 1
      WHERE id = ${reviewId};
    `);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/reviews/:review_id/report', async (req, res) => {
  try {
    const client = await pool.connect();
    const reviewId = req.params.review_id;
    await client.query(`
      UPDATE reviews
      SET reported = true
      WHERE id = ${reviewId};
    `);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
