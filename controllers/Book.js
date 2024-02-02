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
        //pagination feature
        const page = parseInt(req.query.page) || 1
        const maxResults = 20     //number of books to be displayed on a page

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
}