const Review = require('../models/Review');
const User = require('../models/User');
const Book = require('../models/Book');

const createReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        console.log(bookId)
        const userId = req.user; // Retrieve user ID from the form
        console.log(userId)
        const comment = req.body.comment;
        const user = await User.findById(userId);
        const book = await Book.findById(bookId);

        if (!user || !book) {
            throw new Error('User or book not found');
        }
        // Check if a review already exists for the user and book
        const existingReview = await Review.findOne({ user: user._id, bookId: book._id });

        if (existingReview) {
            // If a review exists, add the new comment to the existing comments array
            existingReview.comment.push(comment);
            await existingReview.save();
        } else {
            const newReview = new Review({
                user: user._id,
                bookId: book._id,
                comment: comment,
            });
            await newReview.save();
        }
        req.flash('info', 'Review submitted successfully');
        res.redirect(`/books/${bookId}`);
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
}

module.exports = { createReview };