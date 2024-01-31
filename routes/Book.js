const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

const {
    bookDetail,
    bookList,
    addTofavorites,
    searchBook
} = require('../controllers/Book');

router.route('/').get(bookList);
router.route('/favorites/:id').post(addTofavorites)
router.route('/:id').get(bookDetail)
router.route('/search').get(searchBook)
// Route to display detailed information about a selected book

module.exports = router;