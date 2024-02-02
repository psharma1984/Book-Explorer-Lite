const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

const {
    bookDetail,
    bookList,
    addTofavorites,
    searchBook,
    favoriteList
} = require('../controllers/Book');

router.route('/').get(bookList);
router.route('/favorites/:id').post(addTofavorites)
router.route('/:id').get(bookDetail)
router.route('/search').post(searchBook)
router.route('/favoriteList').get(favoriteList)
// Route to display detailed information about a selected book

module.exports = router;