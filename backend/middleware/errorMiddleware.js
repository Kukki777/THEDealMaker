const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const duplicate = error.code === 11000;
  const status =
    error.statusCode || (error.name === "ValidationError" ? 400 : duplicate ? 409 : 500);
  res.status(status).json({
    message: duplicate ? "This email or mobile number is already registered" : error.message || "Server error",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

module.exports = { notFound, errorHandler };
