const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const {
  validateReview,
  isLoggedIn,
  verifyReviewAuthor,
} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  '/:reviewId',
  isLoggedIn,
  verifyReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
