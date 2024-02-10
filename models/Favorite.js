const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  favorites: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    }],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
