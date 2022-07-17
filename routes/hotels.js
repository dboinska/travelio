const express = require("express");
const router = express.Router();

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
router.get(
  "/",
  catchAsync(async (req, res) => {
    const hotels = await Hotel.find({});
    res.render("hotels/index", { hotels });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("hotels/new");
});

router.post(
  "/",
  isLoggedIn,
  validateHotel,
  catchAsync(async (req, res, next) => {
    const hotel = new Hotel(req.body.hotel);
    hotel.author = req.user._id;
    await hotel.save();
    req.flash("success", "Successfully made a new hotel");
    res.redirect(`/hotels/${hotel._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    console.log(hotel);
    if (!hotel) {
      req.flash("error", "Cannot find that hotel");
      return res.redirect("/hotels");
    }
    res.render("hotels/show", { hotel });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  verifyAuthor,
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      req.flash("error", "Cannot find that hotel");
      return res.redirect("/hotels");
    }
    res.render("hotels/edit", { hotel });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  verifyAuthor,
  validateHotel,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // const updatedHotel = await Hotel.findByIdAndUpdate(id, {
    //   ...req.body.hotel,
    // });
    req.flash("success", "Successfully updated hotel");
    res.redirect(`/hotels/${hotel._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  verifyAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted hotel");
    res.redirect("/hotels");
  })
);

module.exports = router;
