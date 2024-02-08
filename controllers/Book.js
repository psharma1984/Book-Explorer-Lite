const Book = require('../models/Book')
const Favorite = require('../models/Favorite')
const Review = require('../models/Review')
const parseVErr = require("../utils/parseValidationErr");

const bookList = async (req, res) => {
    try {

        //pagination feature
        const page = parseInt(req.query.page) || 1
        const maxResults = 24     //number of books to be displayed on a page
        const startIndex = (page - 1) * maxResults;

        // Fetch user's favorites
        let favorites = [];
        const favoritesRecord = await Favorite.findOne({ user: req.user._id })
        if (favoritesRecord) {
            favorites = favoritesRecord.favorites;
        }
        const books = await Book.find().skip(startIndex).limit(maxResults);
        const totalItems = await Book.countDocuments();

        const totalPages = Math.ceil(totalItems / maxResults);

        res.render('bookList', { books, currentPage: page, totalPages, favorites });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const bookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const user = req.user
        const book = await Book.findById(bookId);
        //console.log(book)
        if (!book) {
            return res.status(404).send('Book not found');
        }
        const reviews = await Review.find({ bookId: bookId }).populate('user');

        // Fetch user's favorites
        let favorites = [];
        const favoritesRecord = await Favorite.findOne({ user: user._id });
        if (favoritesRecord) {
            favorites = favoritesRecord.favorites;
        }
        res.render('bookDetail', { book, reviews, favorites });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const addTofavorites = async (req, res) => {
    try {
        const bookId = req.params.id;
        const user = req.user
        // Try to find an existing favorite document for the user
        let favorites = await Favorite.findOne({ user: user._id })

        // If no favorite document found, create a new one
        if (!favorites) {
            favorites = await Favorite.create({ user: user._id })
        }

        // Check if the bookId is already in the favorites
        if (!favorites.favorites.includes(bookId)) {
            favorites.favorites.push(bookId);
            await favorites.save();
            req.flash('success', 'Book added to Favorites');
        }
        // Store the referring URL in the session
        //req.session.referringUrl = req.headers.referer || '/books';
        res.redirect('back') // Redirect back to the referring url

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error adding to favorites:Server Error');
        res.redirect('back');
    }
}

const deleteFavorite = async (req, res) => {
    try {
        const user = req.user
        const bookId = req.params.id;

        let favoritesRecord = await Favorite.findOne({ user: user._id })

        const indexToRemove = favoritesRecord.favorites.indexOf(bookId);
        if (indexToRemove !== -1) {
            // Remove the element at the specified index
            favoritesRecord.favorites.splice(indexToRemove, 1);
            await favoritesRecord.save();
        }
        // Store the referring URL in the session
        req.flash('success', 'Book deleted from Favorites');
        //req.session.referringUrl = req.headers.referer || '/books';
        res.redirect('back') // Redirect back to the referring url

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const searchBook = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        console.log(page)
        let query = req.body.search || req.query.search;
        if (page > 1) {
            query = req.query.search
        }
        // spliting the query into individual words
        const words = query.split(/\s+/);
        // regular expression to match any word in the title
        const regex = new RegExp(words.map(word => `(?=.*\\b${word}\\b)`).join('|'), 'i');

        const limit = 24; // Number of results per page
        const totalItems = await Book.countDocuments({ title: regex });
        const skip = (page - 1) * limit;
        const searchResults = await Book.find({ title: regex }).skip(skip).limit(limit);
        // total number of pages
        const totalPages = Math.ceil(totalItems / limit);

        res.render('searchResults', {
            results: searchResults, query, currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const favoriteList = async (req, res) => {
    try {
        const user = req.user
        const favoriteUserId = await Favorite.findOne({ user: user._id })
        let favoriteBooks = [];
        let results = []
        if (favoriteUserId && favoriteUserId.favorites.length > 0) {
            favoriteBooks = favoriteUserId.favorites;
            results = await Book.find({ _id: { $in: favoriteBooks } })
        }
        res.render('favoriteList', { results })
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
}

const featuredBooks = async (req, res) => {
    try {
        const books = await Book.aggregate([{ $sample: { size: 12 } }]);
        const authors = await Book.distinct('author')
        res.render('index', { books });
    } catch (error) {
        console.error('Error fetching random books:', error);
    }
}

module.exports = {
    bookDetail,
    bookList,
    addTofavorites,
    searchBook,
    favoriteList,
    featuredBooks,
    deleteFavorite,
}