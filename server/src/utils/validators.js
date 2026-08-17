/**
 * Centralized Form and Data Validation Utilities for Store Rating Platform
 */

const validateName = (name, fieldName = 'Name') => {
  if (name === undefined || name === null || typeof name !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
      value: '',
    };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return {
      isValid: false,
      message: `${fieldName} must be between 20 and 60 characters.`,
      value: trimmed,
    };
  }
  return {
    isValid: true,
    message: null,
    value: trimmed,
  };
};

const validateAddress = (address, fieldName = 'Address') => {
  if (address === undefined || address === null || typeof address !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
      value: '',
    };
  }
  const trimmed = address.trim();
  if (trimmed.length > 400) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed 400 characters.`,
      value: trimmed,
    };
  }
  return {
    isValid: true,
    message: null,
    value: trimmed,
  };
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Please enter a valid email address.',
      value: '',
    };
  }
  const trimmed = email.trim().toLowerCase();
  // Standard email pattern matching user.name@domain.tld, user+tag@domain.tld, etc.
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address.',
      value: trimmed,
    };
  }
  return {
    isValid: true,
    message: null,
    value: trimmed,
  };
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required.',
    };
  }
  if (password.length < 8 || password.length > 16) {
    return {
      isValid: false,
      message: 'Password must be 8–16 characters and contain at least one uppercase letter and one special character.',
    };
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return {
      isValid: false,
      message: 'Password must be 8–16 characters and contain at least one uppercase letter and one special character.',
    };
  }
  // Special character definition: /[^A-Za-z0-9]/
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must be 8–16 characters and contain at least one uppercase letter and one special character.',
    };
  }
  return {
    isValid: true,
    message: null,
  };
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') {
    return {
      isValid: false,
      message: 'Rating must be an integer between 1 and 5.',
      value: null,
    };
  }
  if (typeof rating === 'boolean') {
    return {
      isValid: false,
      message: 'Rating must be an integer between 1 and 5.',
      value: null,
    };
  }
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return {
      isValid: false,
      message: 'Rating must be an integer between 1 and 5.',
      value: null,
    };
  }
  return {
    isValid: true,
    message: null,
    value: numericRating,
  };
};

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
};
