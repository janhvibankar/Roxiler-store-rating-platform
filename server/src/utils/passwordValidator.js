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
      message: 'Password must be between 8 and 16 characters long.',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter.',
    };
  }

  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character.',
    };
  }

  return {
    isValid: true,
    message: null,
  };
};

module.exports = {
  validatePassword,
};
