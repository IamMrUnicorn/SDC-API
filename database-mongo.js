const mongoose = require('mongoose');

// Define the Review schema
const reviewsSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    recommend: {
      type: Boolean,
      required: true,
    },
    response: {
      type: String,
      default: null,
    },
    body: {
      type: String,
    default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    reviewer_name: {
      type: String,
      required: true,
    },
    helpfulness: {
      type: Number,
      required: true,
    },
    photos: {
      type: [String],
      default: [],
    },
  },
});

// Create the Review model
const Reviews = mongoose.model('Reviews', reviewsSchema);

module.exports = Reviews;


