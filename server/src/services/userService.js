const userRepository = require('../repositories/userRepository');

class UserService {
  async createUser(userData) {
    return userRepository.createUser(userData);
  }

  async getUserById(id) {
    return userRepository.findUserById(id);
  }

  async getUserByEmail(email) {
    return userRepository.findUserByEmail(email);
  }

  async getAllUsers() {
    return userRepository.getUsers();
  }
}

module.exports = new UserService();
