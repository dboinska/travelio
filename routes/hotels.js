const express = require("express");
const router = express.Router();

const hotels = require("../controllers/hotels");

const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  validateHotel,
  verifyAuthor,
  verifyPassword,
} = require("../middleware");

const Hotel = require("../models/hotel");

router.get("/premiumHotel", (req, res) => {
  console.log(req);
  console.log(`request date: ${req.requestTime}`);
  res.send("access");
});

router.get("/secret", verifyPassword, (req, res) => {
  res.send("my secret is:secret");
});

router
  .route("/")
  .get(catchAsync(hotels.index))
  .post(isLoggedIn, validateHotel, catchAsync(hotels.createNewHotel));

router.get("/new", isLoggedIn, hotels.newForm);

router
  .route("/:id")
  .get(catchAsync(hotels.showHotel))
  .put(
    isLoggedIn,
    verifyAuthor,
    validateHotel,
    catchAsync(hotels.showEditHotel)
  )
  .delete(isLoggedIn, verifyAuthor, catchAsync(hotels.deleteHotel));

router
  .route("/:id/edit")
  .get(isLoggedIn, verifyAuthor, catchAsync(hotels.editHotel));

module.exports = router;
