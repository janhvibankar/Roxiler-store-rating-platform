const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { validatePassword } = require('../utils/passwordValidator');

class AuthService {
  async registerUser({ name, email, address, password }) {
    if (!name || !email || !address || !password) {
      const err = new Error('All fields (name, email, address, password) are required.');
      err.statusCode = 400;
      throw err;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const err = new Error(passwordValidation.message);
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      const err = new Error('Email address is already registered.');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public signup strictly creates role = USER
    const createdUser = await userRepository.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      password: hashedPassword,
      role: 'USER',
    });

    return createdUser;
  }

  async loginUser({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await userRepository.findUserWithPasswordByEmail(email.trim().toLowerCase());
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_jwt_key_store_rating_platform_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async changePassword(userId, { currentPassword, oldPassword, newPassword }) {
    const activeCurrentPassword = currentPassword || oldPassword;
    if (!activeCurrentPassword || !newPassword) {
      const err = new Error('Current password and new password are required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await userRepository.findUserWithPasswordById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(activeCurrentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password is incorrect.');
      err.statusCode = 400;
      throw err;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      const err = new Error(passwordValidation.message);
      err.statusCode = 400;
      throw err;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, newHashedPassword);

    return { message: 'Password changed successfully.' };
  }
}

module.exports = new AuthService();
