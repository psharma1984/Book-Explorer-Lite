const Book = require('../models/Book')
const User = require('../models/User')
const Review = require('../models/Review')
const parseVErr = require("../utils/parseValidationErr");
const generateAPI = require('../utils/externalAPI');

const bookList = async (req, res) => {
    try {

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error('API key is missing');
        }
        //pagination feature
        const page = parseInt(req.query.page) || 1
        const maxResults = 24     //number of books to be displayed on a page

        // Perform pagination to get a subset of books for the requested page
        const startIndex = (page - 1) * maxResults;

        const response = await generateAPI(apiKey, startIndex, maxResults)
        const totalItems = response.data.totalItems;

        const externalBooks = response.data.items.map((item) => {
            return {
                title: item.volumeInfo.title,
                author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
                genres: item.volumeInfo.categories || [],
                synopsis: item.volumeInfo.description || 'No synopsis available',
                publicationDate: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate) : null,
                coverImage: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null,
            };
        });

        //await Book.deleteMany({});
        await Book.create(externalBooks);

        // Fetch only the currently inserted books from the database
        const books = await Book.find().skip(startIndex).limit(maxResults);

        const totalPages = Math.ceil(totalItems / maxResults)

        res.render('bookList', { books, currentPage: page, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const bookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        const reviews = await Review.find({ bookId: bookId }).populate('user');
        res.render('bookDetail', { book, reviews });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const addTofavorites = async (req, res) => {
    try {
        const user = req.user
        const bookId = req.params.id;

        if (!user.favorites.includes(bookId)) {
            user.favorites.push(bookId)
            await user.save()
        }
        // Store the referring URL in the session
        req.session.referringUrl = req.headers.referer || '/books';
        res.redirect(req.session.referringUrl) // Redirect back to the referring url

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const deleteFavorite = async (req, res) => {
    try {
        const user = req.user
        const bookId = req.params.id;

        const indexToRemove = user.favorites.indexOf(bookId);
        if (indexToRemove !== -1) {
            // Remove the element at the specified index
            user.favorites.splice(indexToRemove, 1);
            await user.save();
        }
        // Store the referring URL in the session
        req.session.referringUrl = req.headers.referer || '/books';
        res.redirect(req.session.referringUrl) // Redirect back to the referring url

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const searchBook = async (req, res) => {
    try {
        const query = req.body.search;
        const searchResults = await Book.find({ title: { $regex: new RegExp(query, 'i') } });
        res.render('searchResults', { results: searchResults, query });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const favoriteList = async (req, res) => {
    try {
        const user = req.user
        const favoriteBooks = user.favorites
        const results = await Book.find({ _id: { $in: favoriteBooks } })
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