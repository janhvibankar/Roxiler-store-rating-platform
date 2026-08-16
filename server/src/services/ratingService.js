const ratingRepository = require('../repositories/ratingRepository');
const storeRepository = require('../repositories/storeRepository');

class RatingService {
  async submitRating({ user_id, store_id, rating }) {
    if (!user_id || !store_id || rating === undefined || rating === null) {
      const err = new Error('storeId and rating are required.');
      err.statusCode = 400;
      throw err;
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      const err = new Error('Rating must be an integer between 1 and 5.');
      err.statusCode = 400;
      throw err;
    }

    const store = await storeRepository.findStoreById(store_id);
    if (!store) {
      const err = new Error(`Store with ID ${store_id} not found.`);
      err.statusCode = 404;
      throw err;
    }

    return ratingRepository.upsertRating({ user_id, store_id, rating: numericRating });
  }

  async updateRating({ user_id, store_id, rating }) {
    if (!user_id || !store_id || rating === undefined || rating === null) {
      const err = new Error('storeId and rating are required.');
      err.statusCode = 400;
      throw err;
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      const err = new Error('Rating must be an integer between 1 and 5.');
      err.statusCode = 400;
      throw err;
    }

    const store = await storeRepository.findStoreById(store_id);
    if (!store) {
      const err = new Error(`Store with ID ${store_id} not found.`);
      err.statusCode = 404;
      throw err;
    }

    const existingRating = await ratingRepository.findRatingByUserAndStore(user_id, store_id);
    if (!existingRating) {
      return ratingRepository.upsertRating({ user_id, store_id, rating: numericRating });
    }

    return ratingRepository.updateRating(user_id, store_id, numericRating);
  }

  async getRatingsForStore(store_id) {
    return ratingRepository.getRatingsForStore(store_id);
  }

  async getAllRatings() {
    return ratingRepository.getRatings();
  }
}

module.exports = new RatingService();
