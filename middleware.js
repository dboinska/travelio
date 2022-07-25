const ExpressError = require("./utils/ExpressError");
const { hotelSchema, reviewSchema } = require("./validationSchemas.js");
const Review = require("./models/review");
const Hotel = require("./models/hotel");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateHotel = (req, res, next) => {
  console.log(req.body);
  const { error } = hotelSchema.validate(req.body.hotel);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === "premiumHotel") {
    next();
  }
  res.send("you need a password");
};

module.exports.verifyAuthor = async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findById(id);
  if (!hotel.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/hotels/${id}`);
  }
  next();
};

module.exports.verifyReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/hotels/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
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
