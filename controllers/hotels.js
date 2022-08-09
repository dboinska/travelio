const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const Hotel = require('../models/hotel');
const { format } = require('date-fns');
const getMeanRate = require('../utils/getMeanRate');

const ITEMS_PER_PAGE = 12;

module.exports.index = async (req, res) => {
  const PAGE_NUMBER = parseInt(req.query.page || 1);

  const allHotels = await Hotel.find({});

  const hotels = await Hotel.find({})
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('author')
    .skip(ITEMS_PER_PAGE * PAGE_NUMBER - ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .sort({ date: -1 })
    .exec(function (err, hotels) {
      Hotel.count().exec(function (err, count) {
        if (err) {
          console.log(err);
        } else {
          hotels.forEach(hotel => {
            hotel.meanRate = getMeanRate(hotel);
          });
          res.render('hotels/index', {
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
  res.render('hotels/new');
};

module.exports.createNewHotel = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.hotel.location,
      limit: 1,
    })
    .send();
  const hotel = new Hotel(req.body.hotel);
  hotel.geometry = geoData.body.features[0].geometry;
  hotel.images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
  }));
  hotel.author = req.user._id;
  hotel.date = new Date();
  await hotel.save();
  req.flash('success', 'Successfully made a new hotel');
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.showHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('author');
  if (!hotel) {
    req.flash('error', 'Cannot find that hotel');
    return res.redirect('/hotels');
  }

  hotel.formattedDate = format(hotel.date, 'MM/dd/yyyy h:mmaaa');
  hotel.reviews.forEach(review => {
    if (review.date) {
      review.formattedDate = format(review.date, 'MM/dd/yyyy h:mmaaa');
    }
  });

  hotel.meanRate = getMeanRate(hotel);
  res.render('hotels/show', { hotel });
};

module.exports.editHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    req.flash('error', 'Cannot find that hotel');
    return res.redirect('/hotels');
  }
  res.render('hotels/edit', { hotel });
};

module.exports.showEditHotel = async (req, res) => {
  const { id } = req.params;
  const hotel = await Hotel.findByIdAndUpdate(id, {
    ...req.body.hotel,
  });

  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.hotel.location,
      limit: 1,
    })
    .send();
  hotel.geometry = geoData.body.features[0].geometry;

  const imgs = req.files.map(file => ({
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
  }

  req.flash('success', 'Successfully updated hotel');
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.deleteHotel = async (req, res) => {
  const { id } = req.params;
  await Hotel.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted hotel');
  res.redirect('/hotels');
};
