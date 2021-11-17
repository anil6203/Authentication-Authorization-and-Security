const AppError = require('../utils/appError');
/////// GLOBAL ERROR HANDLING MIDDLEWARE

const handleJWTError = () =>
  new AppError('Invalid token!. please login again !', 401);

const handleJWTTokenExpireError = () =>
  new AppError('Expired Token!. please login again!', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400); // 400 for bad request
};

const handleDuplicateFeildsDB = (err) => {
  const message = `Duplicate feild value: ... ${err.message} ...please use another value`;
  return new AppError(message, 400); // duplicate  content
};

const handleValidationErrorDB = (err) => {
  // Object.values is used to select all the properties specifeid into Object.values(<properties_name>)
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack, // place where the error is coming from
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak detail to the client
  } else {
    // 1) Log error
    // eslint-disable-next-line no-console
    console.log('ERROR', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
      error: err,
    });
  }
};

/////// GLOBAL ERROR HANDLING MIDDLEWARE

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFeildsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTTokenExpireError();
    sendErrorProd(error, res);
  }
};
