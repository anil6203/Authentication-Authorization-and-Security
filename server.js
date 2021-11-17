/* eslint-disable no-console */
////////////////////////////////////////
////////////// STARTING A SERVER

///// Handling the uncaugth exception i.e (synchronous)

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTIONS!');
  console.log(err.name, err.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // eslint-disable-next-line no-unused-vars
  .then((_con) => console.log('DB connection Successful'));

const app = require('./app');

// console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

////////  Handling Unhandled Rejection outside of express and mongoose (Asynchronous)

// 'on' listener is going to listen for the event name as unhandledRejection

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!');
  server.close(() => {
    process.exit(1);
  });
});
