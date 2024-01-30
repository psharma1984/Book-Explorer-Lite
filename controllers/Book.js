const Book = require('../models/Book')
const User = require('../models/User')
const parseVErr = require("../utils/parseValidationErr");
const generateAPI = require('../utils/externalAPI');

const bookList = async (req, res) => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error('API key is missing');
        }
        const books = await generateAPI(apiKey)
        res.render('bookList', { books });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const bookDetail = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.render('bookDetail', { book });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const addTofavorites = async (req, res) => {
    const bookId = req.params.id;
    try {
        const user = req.user
        if (!user.favorites.includes(bookId)) {
            user.favorites.push(bookId)
            await user.save()
        }
        res.redirect('/books') // Redirect back to the books list page

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    bookDetail,
    bookList,
    addTofavorites
}