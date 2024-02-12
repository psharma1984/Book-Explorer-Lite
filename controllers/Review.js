const Review = require('../models/Review');
const Book = require('../models/Book');
const Favorite = require('../models/Favorite');
const parseValidationErrors = require('../utils/parseValidationErr');
const errorHandlerMiddleware = require('../middlewares/errorHandlerMiddleware');

const createReview = async (req, res) => {
  try {
    const bookId = req.params.id;
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.user._id; // Retrieve user ID from the form
    const { comment } = req.body;
    const existingReview = await Review.findOne({ user: userId, bookId });

    if (existingReview) {
      // If a review exists, add the new comment to the existing comments array
      existingReview.comment = existingReview.comment + '\n' + new Date().toLocaleString() + ':' + comment;
      await existingReview.save();
    } else {
      const newReview = new Review({
        user: userId,
        bookId,
        comment,
      });
      await newReview.save();
    }

    // recalculate and update the rating
    const reviews = await Review.find({ bookId });
    const maxValueRating = 10; // no. of comments that give rating 5.
    const totalComments = reviews.reduce((total, review) => total + review.comment.length, 0);

    const newRating = Math.min((totalComments / maxValueRating) * 5, 5); // keeps rating between 0-5

    // Update the rating field in the Book model
    await Book.findOneAndUpdate(
      { _id: bookId },
      { $set: { rating: newRating } },
    );

    req.flash('success', 'Review submitted successfully');
    res.redirect(`/books/${bookId}?success=Review submitted successfully`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      parseValidationErrors(error, req);
    } else {
      errorHandlerMiddleware(error, req, res);
    }
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const existingReview = await Review.findById(reviewId);
    const { user } = req;

    if (!existingReview) {
      throw new Error('Review not found');
    }
    // Check if the user making the request is the owner of the review
    // eslint-disable-next-line no-underscore-dangle
    if (existingReview.user.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized: You are not the owner of this review');
    }
    await Review.findByIdAndDelete(reviewId);

    const { bookId } = existingReview;
    let book = await Book.findById(bookId);
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }

    // After deletion, recalculate and update the rating
    const reviews = await Review.find({ bookId });
    const maxValueRating = 10;
    const totalComments = reviews.reduce((total, review) => total + review.comment.length, 0);

    const newRating = Math.min((totalComments / maxValueRating) * 5, 5);

    // Update the rating field in the Book model
    book = await Book.findOneAndUpdate(
      { _id: bookId },
      { $set: { rating: newRating } },
    );
    req.flash('success', 'Review deleted successfully');
    res.render('bookDetail', {
      book, success: req.flash('success'), reviews, favorites,
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

const editReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const existingReview = await Review.findById(reviewId);
    const { user } = req;

    if (!existingReview) {
      throw new Error('Review not found');
    }
    // Check if the user making the request is the owner of the review
    // eslint-disable-next-line no-underscore-dangle
    if (existingReview.user.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized: You are not the owner of this review');
    }
    // fetching all models data needed to populate bookDetail
    const { bookId } = existingReview;
    const book = await Book.findById(bookId);
    const reviews = await Review.find({ bookId }).populate('user');
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }
    req.flash('info', 'Update review below...');
    res.render('bookDetail', {
      isEditing: true, book, info: req.flash('info'), reviews, existingReview, favorites,
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

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const newComment = req.body.editComment;
    const existingReview = await Review.findById(reviewId);
    const { user } = req;

    // Check if the user making the request is the owner of the review
    // eslint-disable-next-line no-underscore-dangle
    if (existingReview.user.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized: You are not the owner of this review');
    }
    existingReview.comment = newComment;
    await existingReview.save();
    // fetching all models data needed to populate bookDetail
    const { bookId } = existingReview;
    const book = await Book.findById(bookId);
    const reviews = await Review.find({ bookId }).populate('user');
    let favorites = [];
    // eslint-disable-next-line no-underscore-dangle
    const favoritesRecord = await Favorite.findOne({ user: user._id });
    if (favoritesRecord) {
      favorites = favoritesRecord.favorites;
    }
    req.flash('success', 'Review Updated successfully!');
    res.render('bookDetail', {
      book, success: req.flash('success'), reviews, favorites,
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

module.exports = {
  createReview, deleteReview, editReview, updateReview,
};
