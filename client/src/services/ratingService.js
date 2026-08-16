import api from './api';

export const ratingService = {
  submitRating: async ({ storeId, rating }) => {
    return api.post('/ratings', { storeId, rating });
  },

  updateRating: async (storeId, rating) => {
    return api.patch(`/ratings/${storeId}`, { rating });
  },
};

export default ratingService;
