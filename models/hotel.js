const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//  "https://res.cloudinary.com/dhnjbnqre/image/upload/w_300/v1658357341/Travelio/d765cvnbm20ebmjfwpbw.jpg";

const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const HotelSchema = new Schema(
  {
    title: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

HotelSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/hotels/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

HotelSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Hotel", HotelSchema);
