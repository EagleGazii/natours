// in express everything is middlewares (even routers)
const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

// third part middleware

// 1 Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// define path to work for static files
app.use(express.static(`${__dirname}/public`));
// this middleware is applies for all routers in app
// and if this middleware is after routers that will not applies to that routers
// we defined global middlware on top
/* app.use((req, res, next) => {
  console.log('My middleware');
  next();
}); */
/* app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
}); */

// this two routes actually are middlewares too
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// if the url is not matching any tour or user routes that means it ais wrong one, will execute this one
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });
});
module.exports = app;
