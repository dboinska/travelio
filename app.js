const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const { hotelSchema } = require.resolve("./validationSchemas");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Hotel = require("./models/hotels");

mongoose.connect("mongodb://127.0.0.1:27017/travelio", {
  useNewUrlParser: true,
  //   useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateHotel = (rq, res, next) => {
  const { error } = hotelSchema(req.body);
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

const useReqTime = (req, res, next) => {
  req.requestTime = new Date();
  next();
};

app.use(useReqTime);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/premiumHotel", (req, res) => {
  console.log(req);
  console.log(`request date: ${req.requestTime}`);
  res.send("access");
});

app.get("/secret", verifyPassword, (req, res) => {
  res.send("my secret is:secret");
});
app.get(
  "/hotels",
  catchAsync(async (req, res) => {
    const hotels = await Hotel.find({});
    res.render("hotels/index", { hotels });
  })
);

app.get("/hotels/new", (req, res) => {
  res.render("hotels/new");
});

app.post(
  "/hotels",
  validateHotel,
  catchAsync(async (req, res, next) => {
    const hotel = new Hotel(req.body.hotel);
    await hotel.save();
    res.redirect(`/hotels/${hotel._id}`);
  })
);

app.get(
  "/hotels/:id",
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    res.render("hotels/show", { hotel });
  })
);

app.get(
  "/hotels/:id/edit",
  catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    res.render("hotels/edit", { hotel });
  })
);

app.put(
  "/hotels/:id",
  validateHotel,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      const hotel = await Hotel.findByIdAndUpdate(id, {
        ...req.body.hotel,
      });
      res.redirect(`/hotels/${hotel._id}`);
    }
  })
);

app.delete(
  "/hotels/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    res.redirect("/hotels");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh no, something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
