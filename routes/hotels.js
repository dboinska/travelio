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
const flash = require("connect-flash");
const Hotel = require("../models/hotel");
const Review = require("../models/review");

router.get("/premiumHotel", (req, res) => {
  console.log(req);
  console.log(`request date: ${req.requestTime}`);
  res.send("access");
});

router.get("/secret", verifyPassword, (req, res) => {
  res.send("my secret is:secret");
});
router.get("/", catchAsync(hotels.index));

router.get("/new", isLoggedIn, hotels.newForm);

router.post("/", isLoggedIn, validateHotel, catchAsync(hotels.createNewHotel));

router.get("/:id", catchAsync(hotels.showHotel));

router.get("/:id/edit", isLoggedIn, verifyAuthor, catchAsync(hotels.editHotel));

router.put(
  "/:id",
  isLoggedIn,
  verifyAuthor,
  validateHotel,
  catchAsync(hotels.showEditHotel)
);

router.delete("/:id", isLoggedIn, verifyAuthor, catchAsync(hotels.deleteHotel));

module.exports = router;
