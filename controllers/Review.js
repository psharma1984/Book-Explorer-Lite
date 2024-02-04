const Review = require('../models/Review');
const User = require('../models/User');
const Book = require('../models/Book');

const createReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user; // Retrieve user ID from the form
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

        // recalculate and update the rating
        const reviews = await Review.find({ bookId: bookId });
        const maxValueRating = 10; //no. of comments that give rating 5.
        const totalComments = reviews.reduce((total, review) => total + review.comment.length, 0);

        const newRating = Math.min((totalComments / maxValueRating) * 5, 5);   //keeps rating between 0-5

        // Update the rating field in the Book model
        await Book.findOneAndUpdate(
            { _id: bookId },
            { $set: { rating: newRating } }
        );

        req.flash('success', 'Review submitted successfully');
        res.redirect(`/books/${bookId}?success=Review submitted successfully`);
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
}

module.exports = { createReview };