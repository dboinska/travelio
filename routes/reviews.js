const express = require("express");
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../validationSchemas.js");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Hotel = require("../models/hotels");
const Review = require("../models/review");

const validateReview = (req, res, next) => {
  console.log(req.body);
  const { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    hotel.reviews.push(review);
    await review.save();
    await hotel.save();
    req.flash("success", "Created new review");
    res.redirect(`/hotels/${hotel._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/hotels/${id}`);
  })
);

module.exports = router;
