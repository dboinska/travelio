const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const Hotel = require("../models/hotel");

const ITEMS_PER_PAGE = 12;

module.exports.index = async (req, res) => {
  const PAGE_NUMBER = parseInt(req.query.page || 1);

  console.log({ PAGE_NUMBER });

  const allHotels = await Hotel.find({});

  const hotels = await Hotel.find({})
    .skip(ITEMS_PER_PAGE * PAGE_NUMBER - ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .exec(function (err, hotels) {
      Hotel.count().exec(function (err, count) {
        if (err) {
          console.log(err);
        } else {
          res.render("hotels/index", {
            hotels: hotels,
            allHotels: allHotels,
            current: PAGE_NUMBER,
            pages: Math.ceil(count / ITEMS_PER_PAGE),
          });
        }
      });
    });
};

module.exports.newForm = (req, res) => {
  res.render("hotels/new");
};

module.exports.createNewHotel = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.hotel.location,
      limit: 1,
    })
    .send();
  const hotel = new Hotel(req.body.hotel);
  hotel.geometry = geoData.body.features[0].geometry;
  hotel.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  hotel.author = req.user._id;
  await hotel.save();
  console.log(hotel);
  req.flash("success", "Successfully made a new hotel");
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.showHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  console.log(hotel);
  if (!hotel) {
    req.flash("error", "Cannot find that hotel");
    return res.redirect("/hotels");
  }
  res.render("hotels/show", { hotel });
};

module.exports.editHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    req.flash("error", "Cannot find that hotel");
    return res.redirect("/hotels");
  }
  res.render("hotels/edit", { hotel });
};

module.exports.showEditHotel = async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findByIdAndUpdate(id, {
    ...req.body.hotel,
  });

  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  hotel.images.push(...imgs);
  await hotel.save();

  if (req.body.deleteImgs) {
    for (let filename of req.body.deleteImgs) {
      cloudinary.uploader.destroy(filename);
    }
    await hotel.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImgs } } },
    });
    console.log(hotel);
  }

  req.flash("success", "Successfully updated hotel");
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.deleteHotel = async (req, res) => {
  const { id } = req.params;
  await Hotel.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted hotel");
  res.redirect("/hotels");
};
