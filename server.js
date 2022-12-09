const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception --- Shutting down...');
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// if we do not define PORT in config.env file the port will be 5000
const port = process.env.PORT || 8000;
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}...`);
});

// catch unhandledRejection globally

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection --- Shutting down...');
  console.log(err);
  // we give the server, basically time to finish all the request after that the server killed
  server.close(() => {
    process.exit(1);
  });
});

// sigterm is a event, that is send from heroku every 24 hours to shut down the application
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
