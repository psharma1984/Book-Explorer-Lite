const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

const { createReview, deleteReview, editReview, updateReview } = require('../controllers/Review')
const {
    bookDetail,
    bookList,
    addTofavorites,
    searchBook,
    favoriteList,
    deleteFavorite,
} = require('../controllers/Book');

router.route('/favoriteList').get(favoriteList)
router.route('/search').post(searchBook).get(searchBook)
router.route('/').get(bookList);
router.route('/deleteFavorite/:id').post(deleteFavorite)
router.route('/favorites/:id').post(addTofavorites)
router.route('/:id').get(bookDetail)
router.route('/review/:id').post(createReview);
router.route('/review/:id/delete').post(deleteReview)
router.route('/review/:id/edit').post(editReview)
router.route('/review/:id/update').post(updateReview)



module.exports = router;