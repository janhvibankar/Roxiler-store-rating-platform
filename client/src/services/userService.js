import api from './api';

export const userService = {
  updatePassword: async (userId, passwordData) => {
    return api.put(`/users/${userId}/password`, passwordData);
  },
};

export default userService;
