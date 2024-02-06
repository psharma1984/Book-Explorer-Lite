const Review = require('../models/Review');
const Book = require('../models/Book');
const Favorite = require('../models/Favorite')

const createReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user._id; // Retrieve user ID from the form
        const comment = req.body.comment;
        //const user = await User.findById(userId);
        // const book = await Book.findById(bookId);


        // if (!user || !book) {
        //     throw new Error('User or book not found');
        // }
        // Check if a review already exists for the user and book
        const existingReview = await Review.findOne({ user: userId, bookId: bookId });

        if (existingReview) {
            // If a review exists, add the new comment to the existing comments array
            existingReview.comment = existingReview.comment + '\n' + new Date().toLocaleString() + ':' + comment;
            await existingReview.save();
        } else {
            const newReview = new Review({
                user: userId,
                bookId: bookId,
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
        req.flash('error', 'Error creating/updating review');
        res.redirect('back');
    }
}

const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id
        const existingReview = await Review.findById(reviewId)
        const user = req.user

        if (!existingReview) {
            throw new Error('Review not found');
        }
        // Check if the user making the request is the owner of the review
        if (existingReview.user.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized: You are not the owner of this review');
        }
        await Review.findByIdAndDelete(reviewId);

        const bookId = existingReview.bookId;
        const book = await Book.findById(bookId);
        let favorites = [];
        const favoritesRecord = await Favorite.findOne({ user: user._id });
        if (favoritesRecord) {
            favorites = favoritesRecord.favorites;
        }

        // After deletion, recalculate and update the rating
        const reviews = await Review.find({ bookId: bookId });
        const maxValueRating = 10;
        const totalComments = reviews.reduce((total, review) => total + review.comment.length, 0);

        const newRating = Math.min((totalComments / maxValueRating) * 5, 5);

        // Update the rating field in the Book model
        await Book.findOneAndUpdate(
            { _id: bookId },
            { $set: { rating: newRating } }
        );
        req.flash('success', 'Review deleted successfully');
        res.render('bookDetail', { book, success: req.flash('success'), reviews, favorites })

    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'Error deleting review');
        res.redirect('back'); // Redirect back to the referring URL
    }
}


const editReview = async (req, res) => {
    try {
        const reviewId = req.params.id
        const existingReview = await Review.findById(reviewId)
        const user = req.user

        if (!existingReview) {
            throw new Error('Review not found');
        }
        // Check if the user making the request is the owner of the review
        if (existingReview.user.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized: You are not the owner of this review');
        }
        //fetching all models data needed to populate bookDetail
        const bookId = existingReview.bookId;
        const book = await Book.findById(bookId)
        const reviews = await Review.find({ bookId: bookId }).populate('user');
        let favorites = [];
        const favoritesRecord = await Favorite.findOne({ user: user._id });
        if (favoritesRecord) {
            favorites = favoritesRecord.favorites;
        }
        req.flash('info', 'Update review below...')
        res.render('bookDetail', { isEditing: true, book, info: req.flash('info'), reviews, existingReview, favorites })

    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'Error deleting review');
        res.redirect('back'); // Redirect back to the referring URL
    }
}


const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id
        const newComment = req.body.comment
        const existingReview = await Review.findById(reviewId)
        const user = req.user

        // Check if the user making the request is the owner of the review
        if (existingReview.user.toString() !== req.user._id.toString()) {
            throw new Error('Unauthorized: You are not the owner of this review');
        }
        existingReview.comment = newComment
        await existingReview.save()
        //fetching all models data needed to populate bookDetail
        const bookId = existingReview.bookId;
        const book = await Book.findById(bookId)
        const reviews = await Review.find({ bookId: bookId }).populate('user');
        let favorites = [];
        const favoritesRecord = await Favorite.findOne({ user: user._id });
        if (favoritesRecord) {
            favorites = favoritesRecord.favorites;
        }
        req.flash('success', 'Review Updated successfully!')
        res.render('bookDetail', { book, success: req.flash('success'), reviews, favorites })

    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'Error deleting review');
        res.redirect('back'); // Redirect back to the referring URL
    }
}
module.exports = { createReview, deleteReview, editReview, updateReview };