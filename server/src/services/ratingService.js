const ratingRepository = require('../repositories/ratingRepository');
const storeRepository = require('../repositories/storeRepository');
const { validateRating } = require('../utils/validators');

class RatingService {
  async submitRating({ user_id, store_id, rating }) {
    if (!user_id || !store_id) {
      const err = new Error('storeId and rating are required.');
      err.statusCode = 400;
      throw err;
    }

    const ratingVal = validateRating(rating);
    if (!ratingVal.isValid) {
      const err = new Error(ratingVal.message);
      err.statusCode = 400;
      err.errors = { rating: ratingVal.message };
      throw err;
    }

    const store = await storeRepository.findStoreById(store_id);
    if (!store) {
      const err = new Error(`Store with ID ${store_id} not found.`);
      err.statusCode = 404;
      throw err;
    }

    return ratingRepository.upsertRating({ user_id, store_id, rating: ratingVal.value });
  }

  async updateRating({ user_id, store_id, rating }) {
    if (!user_id || !store_id) {
      const err = new Error('storeId and rating are required.');
      err.statusCode = 400;
      throw err;
    }

    const ratingVal = validateRating(rating);
    if (!ratingVal.isValid) {
      const err = new Error(ratingVal.message);
      err.statusCode = 400;
      err.errors = { rating: ratingVal.message };
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
      return ratingRepository.upsertRating({ user_id, store_id, rating: ratingVal.value });
    }

    return ratingRepository.updateRating(user_id, store_id, ratingVal.value);
  }

  async getRatingsForStore(store_id) {
    return ratingRepository.getRatingsForStore(store_id);
  }

  async getAllRatings() {
    return ratingRepository.getRatings();
  }
}

module.exports = new RatingService();
