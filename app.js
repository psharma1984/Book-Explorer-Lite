const express = require('express');
const path = require('path');

require('dotenv').config();

require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');

const app = express();

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https://ka-f.fontawesome.com'],
        imgSrc: ["'self'", 'http://books.google.com'],
        scriptSrc: [
          "'self'",
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js', 'https://kit.fontawesome.com/d38377c6d2.js',
          "'unsafe-inline'",
        ],
        objectSrc: ["'none'"],
        styleSrc: [
          "'self'",
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', 'https://kit.fontawesome.com/d38377c6d2.js',
          "'unsafe-inline'",
        ],
        scriptSrcAttr: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: null,
      },
    },
  }),
);
app.use(xss());

// cookie-parser
const cookieParser = require('cookie-parser');

app.use(cookieParser(process.env.SESSION_SECRET));

app.set('view engine', 'ejs');

// session configuration
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
// to store session data in mongoDb
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: url,
  collection: 'sessions',
});
store.on('error', (error) => {
  console.log(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store,
  cookie: { secure: false, sameSite: 'strict' },
};
require('./backgroundTasks/backgroundTask');

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionParams));

// passport configuration
const passport = require('passport');
const passportInit = require('./passport/passportInit');

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Configure CSRF middleware
// eslint-disable-next-line import/order
const hostCsrf = require('host-csrf');

// eslint-disable-next-line camelcase
const csrf_development_mode = true;
if (app.get('env') === 'production') {
  // eslint-disable-next-line no-const-assign, camelcase
  csrf_development_mode = false;
  app.set('trust proxy', 1);
}
// eslint-disable-next-line camelcase
const csrf_options = {
  protected_operations: ['PATCH'],
  protected_content_types: ['application/json'],
  // eslint-disable-next-line camelcase
  development_mode: csrf_development_mode,
};
app.use(hostCsrf(csrf_options));

// middlewares

app.use(require('connect-flash')()); // flash-messages configuration
app.use(require('./middlewares/storeLocals'));

app.use(express.static(path.join(__dirname, 'public')));
const auth = require('./middlewares/auth');

// routes
const { featuredBooks } = require('./controllers/Book');

app.get('/', featuredBooks);
app.use('/sessions', require('./routes/sessionRoutes'));

// eslint-disable-next-line consistent-return
app.get('/featuredbooks/:id', async (req, res) => {
  try {
    // eslint-disable-next-line global-require
    const Book = require('./models/Book');
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('featuredBooks', { book });
  } catch (error) {
    req.flash('error', 'Internal Server Error');
    res.redirect('back');
  }
});

const bookRouter = require('./routes/Book');
// bookRouter
app.use('/books', auth, bookRouter);

// error handling middleware
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res) => {
  res.status(500).send(err.message);
});

// Start the server
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    // eslint-disable-next-line global-require
    await require('./db/connect')(process.env.MONGO_URI);
    // eslint-disable-next-line no-console
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
