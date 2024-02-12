const Book = require('../models/Book');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const parseValidationErrors = require('../utils/parseValidationErr');
const errorHandlerMiddleware = require('../middlewares/errorHandlerMiddleware');

const bookList = async (req, res) => {
  try {
    // pagination feature
    const page = parseInt(req.query.page, 10) || 1;
    const maxResults = 24; // number of books to be displayed on a page
    const startIndex = (page - 1) * maxResults;

    // Fetch user's favorites
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: req.user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }
    const books = await Book.find().skip(startIndex).limit(maxResults);
    const totalItems = await Book.countDocuments();

    const totalPages = Math.ceil(totalItems / maxResults);

    res.render('bookList', {
      books, currentPage: page, totalPages, favorites,
    });
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

// eslint-disable-next-line consistent-return
const bookDetail = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { user } = req;
    const book = await Book.findById(bookId);
    // console.log(book)
    if (!book) {
      return res.status(404).send('Book not found');
    }

    const reviews = await Review.find({ bookId }).populate('user');
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }
    res.render('bookDetail', { book, reviews, favorites });
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const addTofavorites = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { user } = req;

    // Try to find an existing favorite document for the user
    // eslint-disable-next-line no-underscore-dangle
    let favorites = await Favorite.findOne({ user: user._id });

    // If no favorite document found, create a new one
    if (!favorites) {
      // eslint-disable-next-line no-underscore-dangle
      favorites = await Favorite.create({ user: user._id });
    }

    // Check if the bookId is already in the favorites
    if (!favorites.favorites.includes(bookId)) {
      favorites.favorites.push(bookId);
      await favorites.save();
      req.flash('success', 'Book added to Favorites');
    }
    // Store the referring URL in the session
    req.session.referringUrl = req.headers.referer || '/books';
    res.redirect(req.session.referringUrl); // Redirect back to the referring url
  } catch (error) {
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { user } = req;
    const bookId = req.params.id;

    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id })

    const indexToRemove = favoritesRecord.favorites.indexOf(bookId);
    if (indexToRemove !== -1) {
      // Remove the element at the specified index
      favoritesRecord.favorites.splice(indexToRemove, 1);
      await favoritesRecord.save();
    }
    // Store the referring URL in the session
    req.flash('success', 'Book deleted from Favorites');
    req.session.referringUrl = req.headers.referer || '/books/favoriteList';
    res.redirect(req.session.referringUrl); // Redirect back to the referring url
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const searchBook = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
    const { user } = req;
    let query = req.body.search || req.query.search;
    if (page > 1) {
      query = req.query.search;
    }
    // spliting the query into individual words
    const words = query.split(/\s+/);
    // regular expression to match any word in the title
    const regex = new RegExp(words.map((word) => `(?=.*\\b${word}\\b)`).join('|'), 'i');

    const limit = 24; // Number of results per page
    const totalItems = await Book.countDocuments({ title: regex });
    const skip = (page - 1) * limit;
    const searchResults = await Book.find({ title: regex }).skip(skip).limit(limit);
    // total number of pages
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch user's favorites
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }

    res.render('searchResults', {
      results: searchResults,
      query,
      currentPage: page,
      totalPages,
      favorites,
    });
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const favoriteList = async (req, res) => {
  try {
    const { user } = req;
    // eslint-disable-next-line no-underscore-dangle
    const favoriteUserId = await Favorite.findOne({ user: user._id });
    let favoriteBooks = [];
    let results = [];
    if (favoriteUserId && favoriteUserId.favorites.length > 0) {
      favoriteBooks = favoriteUserId.favorites;
      results = await Book.find({ _id: { $in: favoriteBooks } });
    }
    res.render('favoriteList', { results });
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const featuredBooks = async (req, res) => {
  try {
    const books = await Book.aggregate([{ $sample: { size: 12 } }]);
    res.render('index', { books });
  } catch (error) {
    // Handle validation errors if they occur
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

module.exports = {
  bookDetail,
  bookList,
  addTofavorites,
  searchBook,
  favoriteList,
  featuredBooks,
  deleteFavorite,
};
