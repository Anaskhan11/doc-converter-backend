const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong while converting your document.';

  console.error('[Error Handler]:', err.message);

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  errorHandler
};
