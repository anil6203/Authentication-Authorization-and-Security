/* eslint-disable no-console */
////////////////////////////////////////
///////////// GETTING MODULE.

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const userRouter = require('./routes/userRoutes');

//////////////////////////////////////////////////
//////////// CREATING A SERVER USING EXPRESS

const app = express();

/////////////////////////////////////////////////
/////////////// USING GLOBAL MIDDLE WARE

// 1). Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2). RATE-LIMIT : Rate Limiting will prevent the making too many request from same IP address to our ApI
const limiter = rateLimit({
  max: 100, // 100 request
  windowMs: 60 * 60 * 1000, // In 1 Hour
  message: 'Too many requests from this IP, please try again in an hour',
});

// 3). Limit reqeust from same IP to the API
app.use('/api', limiter);

// 4). Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // setting data limit to 10KB in req.body

// 5). Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 6). Data sanitization against against cross-side-scripting(XSS) attack
app.use(xss()); // clean any user input from malacious html code

// 7). prevent parameter pollution using hpp middleware
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 8). Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/////////////////////////////////////////
////////////// ROUTES

app.use('/api/v1/users', userRouter);

/////////////////////////////////////////////////////////////////////
//////////// HANDLING UNDEFINED ROUTES using user defined middleware

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server! `, 404));
});

//////////////////////////////////////////////////////////////////////
////////////// GLOBAL ERROR HANDLING MIDDLEWARE

app.use(globalErrorHandler);

module.exports = app;

// Data Sanitization: it basically means to clean all the data that comes into the application from the malacious soures.
