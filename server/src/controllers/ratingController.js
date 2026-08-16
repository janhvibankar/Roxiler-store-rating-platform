const ratingService = require('../services/ratingService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllRatings = async (req, res, next) => {
  try {
    const ratings = await ratingService.getAllRatings();
    return sendSuccess(res, 200, 'Ratings retrieved successfully', ratings);
  } catch (error) {
    next(error);
  }
};

const submitRating = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.userId : req.body.user_id;
    const store_id = req.body.storeId || req.body.store_id;
    const ratingValue = req.body.rating;

    const rating = await ratingService.submitRating({
      user_id,
      store_id,
      rating: ratingValue,
    });
    return sendSuccess(res, 200, 'Rating submitted successfully', rating);
  } catch (error) {
    next(error);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const user_id = req.user ? req.user.userId : req.body.user_id;
    const store_id = parseInt(req.params.storeId, 10);
    const ratingValue = req.body.rating;

    const rating = await ratingService.updateRating({
      user_id,
      store_id,
      rating: ratingValue,
    });
    return sendSuccess(res, 200, 'Rating updated successfully', rating);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRatings,
  submitRating,
  updateRating,
};
