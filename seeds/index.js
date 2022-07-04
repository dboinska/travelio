const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Hotel = require("../models/hotels");

mongoose.connect("mongodb://127.0.0.1:27017/travelio", {
  useNewUrlParser: true,
  // useCreateIndex: true, // mongod --port 27017 --dbpath C:\mongodb\data\db
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Hotel.deleteMany({});
  for (let i = 0; i < 74; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Hotel({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/4977823/hotel",
      description:
        "Aliquam faucibus sit amet eros eget sagittis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ultricies suscipit magna eu imperdiet. Proin blandit luctus nibh.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
