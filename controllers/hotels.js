const Hotel = require("../models/hotel");

module.exports.index = async (req, res) => {
  const hotels = await Hotel.find({});
  res.render("hotels/index", { hotels });
};

module.exports.newForm = (req, res) => {
  res.render("hotels/new");
};

module.exports.createNewHotel = async (req, res, next) => {
  const hotel = new Hotel(req.body.hotel);
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
  req.flash("success", "Successfully updated hotel");
  res.redirect(`/hotels/${hotel._id}`);
};

module.exports.deleteHotel = async (req, res) => {
  const { id } = req.params;
  await Hotel.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted hotel");
  res.redirect("/hotels");
};
