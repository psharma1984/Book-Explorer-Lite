const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({

    title: { type: String, required: [true, 'Please provide a book title'] },

    author: { type: String, required: [true, 'Please provide an author name'] },

    genres: [{ type: String }],

    synopsis: { type: String },

    publicationDate: { type: Date },

    coverImage: { type: String },
    rating: {
        type: Number,
        default: 0, // Default to 0 if no reviews are available yet
    },

}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema)