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
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
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
  .post(
    isLoggedIn,
    upload.array("image"),
    validateHotel,
    catchAsync(hotels.createNewHotel)
  );
// .post(upload.array("image"), (req, res) => {
//   // res.send(req.body, req.file);

//   console.log(req.body);
//   console.log(req.files);
//   res.status(200).send(req.files);
//   // res.send("it worked");
// });

router.get("/new", isLoggedIn, hotels.newForm);

router
  .route("/:id")
  .get(catchAsync(hotels.showHotel))
  .put(
    isLoggedIn,
    verifyAuthor,
    upload.array("image"),
    validateHotel,
    catchAsync(hotels.showEditHotel)
  )
  .delete(isLoggedIn, verifyAuthor, catchAsync(hotels.deleteHotel));

router
  .route("/:id/edit")
  .get(isLoggedIn, verifyAuthor, catchAsync(hotels.editHotel));

module.exports = router;
