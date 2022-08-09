// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const helmet = require('helmet');

const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/travelio';
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  //   useCreateIndex: true,
  useUnifiedTopology: true,
  // useFIndAndModify: false,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));

// const store = new MongoDBStore({
//   url: dbUrl,

//   secret: 'secret',
//   touchAfter: 24 * 60 * 60,
// });

const secret = process.env.SECRET || 'secret';
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});
store.on('error', function (e) {
  console.log('session store error', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  '*.bootstrapcdn.com',
  '*.mapbox.com',
  '*.fontawesome.com',
  '*.cloudflare.com',
  '*.jsdelivr.net',
];
//This is the array that needs added to
const styleSrcUrls = [
  '*.fontawesome.com/',
  '*.mapbox.com/',
  '*.googleapis.com',
  '*.jsdelivr.net',
  '*.cloudflare.com',
];
const connectSrcUrls = ['*.mapbox.com/', '*.fontawesome.com/'];
const fontSrcUrls = [
  '*.fontawesome.com',
  '*.cloudflare.com',
  '*.googleapis.com',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      connectSrc: ["'self'", ...connectSrcUrls],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'localhost',
        ...scriptSrcUrls,
      ],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        `*.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        // "*.cloudinary.com/dhnjbnqre/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        '*.unsplash.com',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.get('/userTest', async (req, res) => {
  const user = new User({
    email: 'db@gmail.com',
    username: 'xxdbxx',
  });
  const newUser = await User.register(user, 'password');
  res.send(newUser);
});

const useReqTime = (req, res, next) => {
  req.requestTime = new Date();
  next();
};

app.use(useReqTime);

app.use('/', userRoutes);
app.use('/hotels', hotelRoutes);
app.use('/hotels/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no, something went wrong';
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving at http://localhost:${port}`);
});
