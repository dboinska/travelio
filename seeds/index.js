const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Hotel = require("../models/hotel");

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
    const hotel = new Hotel({
      author: "62cf47c9a8dd4d997c7b2813",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Aliquam faucibus sit amet eros eget sagittis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ultricies suscipit magna eu imperdiet. Proin blandit luctus nibh.",
      price,
      geometry: {
        type: "Point",
        coordinates: [21.027737, 52.186722],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dhnjbnqre/image/upload/v1658357337/Travelio/afjsrhc6yk6kwtiac8nt.jpg",
          filename: "Travelio/afjsrhc6yk6kwtiac8nt",
        },
        {
          url: "https://res.cloudinary.com/dhnjbnqre/image/upload/v1658357341/Travelio/d765cvnbm20ebmjfwpbw.jpg",
          filename: "Travelio/d765cvnbm20ebmjfwpbw",
        },
        {
          url: "https://res.cloudinary.com/dhnjbnqre/image/upload/v1658357345/Travelio/t6ryhturpyh7nj9ca7oz.jpg",
          filename: "Travelio/t6ryhturpyh7nj9ca7oz",
        },
      ],
    });
    await hotel.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
