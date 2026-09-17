// This is just an example,
// so you can safely delete all default props below

export default {
  failed: 'Action failed',
  success: 'Action was successful',
  errors: {
    auth: {
      invalid_credentials: 'Invalid credentials. Check your email and password.',
      user_already_registered: 'If the details are correct, you will receive a confirmation email.',
      weak_password: 'Password should be at least 6 characters.',
      email_not_confirmed: 'Your email has not been confirmed yet.',
      jwt_expired: 'Your session has expired. Please log in again.',
      same_password: 'The new password must be different from the old one.',
    },
    database: {
      unique_violation: 'This action was already performed or the record already exists.',
    },
    network: {
      rate_limit: 'Too many requests. Please wait a moment and try again.',
      offline: 'No connection. Please check your internet and try again.',
    },
    generic: 'An unexpected error occurred. Please try again later.',
  },
};
