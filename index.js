const express = require("express");
const dotenv = require('dotenv')
dotenv.config()
const pool = require('./database-postgres')

const app = express()

app.use(express.json());

app.get('/reviews', async(req, res) => {
  console.log('incoming request => ', req.query)
  let sort;
  if (req.query.sort === 'helpful') {
    sort = 'helpfulness'
  } else if (req.query.sort === 'newest') {
    sort = 'date'
  } else if (req.query.sort === 'relevant') {
    // reviews.toSorted((a, b) => {
    //const bMonthsAgo =(Date.now() - Date.parse(b.date)) / msInAMonth;
    //const aMonthsAgo =(Date.now() - Date.parse(a.date)) / msInAMonth;
    //const bRelevance = b.helpfulness + (1 / bMonthsAgo) * ageFactor;
    //const aRelevance = a.helpfulness + (1 / aMonthsAgo) * ageFactor;
    //return bRelevance - aRelevance;  // sort descending by calculated relevance score
    sort = 'helpfulness'
  } else { 
    sort='helpfulness'
  }
  
  try {
    const client = await pool.connect()
    const dbResponse = await client.query(`SELECT * 
    FROM reviews 
    LEFT JOIN characteristic_reviews ON reviews.id = characteristic_reviews.review_id
    WHERE product_id = ${req.query.product_id}
    ORDER BY ${sort} DESC
    LIMIT ${req.query.count ? req.query.count : 5} 
    OFFSET ${req.query.page ? req.query.page : 0};
    `);
    const photos = await client.query(`SELECT * 
    FROM reviews_photos
    WHERE review_id = ${dbResponse.rows.review_id};
    `);
    const cleanData = dbResponse.rows.map(
      (review) => (
      {
        review_id: review.id,
        rating: review.rating,
        summary: review.summary,
        recommend: review.recommend,
        response: review.response,
        body: review.body,
        date: review.date,
        reviewer_name: review.reviewer_name,
        helpfulness:review.helpfulness,
        photos: photos.rows
      }
    ))
    res.json({
      product: `${req.query.product_id}`, 
      page: 0,
      count: 5,
      results : cleanData,
      original : dbResponse.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/reviews', async(req, res) => {
  console.log(req.body)
  try {
    // insert into database here
  } catch (error) {
    console.log(error)
    res.status(500).json({err: 'Internal server error'})
  }
})
// POST /reviews
// GET /reviews/meta
// PUT /reviews/:review_id/helpful
// PUT /reviews/:review_id/report
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// const msInAMonth = 2.628 * 10**9;
//   const ageFactor = 50;  // i.e., a 1-month-old review has weight of 50 (+ its helpfulness)

//   switch (criteria) {
//       case 'relevant':
//           return 
//           });



// Helpful - This sort order will prioritize reviews that have been found helpful. The order can be found by subtracting “No” responses from “Yes” responses and sorting such that the highest score appears at the top.
// Newest - This is a straightforward sort based on the date the review was submitted. The most recent reviews should appear first.
// Relevant - Relevance will be determined by a combination of both the date that the review was submitted as well as ‘helpfulness’ feedback received. This combination should weigh the two characteristics such that recent reviews appear near the top, but do not outweigh reviews that have been found helpful. Similarly, reviews that have been helpful should appear near the top, but should yield to more recent reviews if they are older.