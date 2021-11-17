class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // message is only parameter that build in error method accept;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // In this way a new object is created and consturctor function gets called is not gonna appear in stacktrace and will not pollute it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
