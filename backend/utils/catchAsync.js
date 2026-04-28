/**
 * Utility function to wrap async route handlers
 * Automatically catches errors and passes them to Express error handler
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

module.exports = catchAsync;
