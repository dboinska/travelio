const express = require("express");
const router = express.Router();
const { hotelSchema } = require("../validationSchemas.js");

const catchAsync = require("../utils/catchAsync");
const flash = require("connect-flash");
const ExpressError = require("../utils/ExpressError");
const Hotel = require("../models/hotels");
const Review = require("../models/review");

const validateHotel = (req, res, next) => {
  console.log(req.body);
  const { error } = hotelSchema.validate(req.body.hotel);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === "premiumHotel") {
    next();
  }
  res.send("you need a password");
};

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

router.get("/new", (req, res) => {
  res.render("hotels/new");
});

router.post(
  "/",
  validateHotel,
  catchAsync(async (req, res, next) => {
    const hotel = new Hotel(req.body.hotel);
    await hotel.save();
    req.flash("success", "Successfully made a new hotel");
    res.redirect(`/hotels/${hotel._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id).populate("reviews");
    if (!hotel) {
      req.flash("error", "Cannot find that hotel");
      return res.redirect("/hotels");
    }
    res.render("hotels/show", { hotel });
  })
);

router.get(
  "/:id/edit",
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
  validateHotel,
  catchAsync(async (req, res) => {
    console.log(req, res);
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, {
      ...req.body.hotel,
    });
    req.flash("success", "Successfully updated hotel");
    res.redirect(`/hotels/${hotel._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted hotel");
    res.redirect("/hotels");
  })
);

module.exports = router;
