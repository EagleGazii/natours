// in express everything is middlewares (even routers)
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalHandlerError = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
//const list = require('./utils/ListRoutes/list');

// middlewares

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

// Serving static files
// define path to work for static files
app.use(express.static(path.join(__dirname, 'public')));

// third part middleware

// Global Middlewares

// Set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 100 request per 1 hour from same ip address
const limitler = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'To many request from this IP, please try again in an hour!',
});

app.use('/api', limitler);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);
app.use(cookieParser());

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// prevent parameter pollution
// allowed duplicate string in query string
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middlewares
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
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use('/', viewRouter);
//list(app);
//app._router.stack.forEach(list.bind(null, []));
// if the url is not matching any tour or user routes that means it ais wrong one, will execute this one
app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  }); */
  // if we dont use next in middleware the nodejs code will stop
  // if we use next will go to next middleware
  // in this case if we pass parameter in next func.
  // that means the error middleware will catch
  // that error and display it or what ever you do
  /*  const err = new Error(
    `Can't find ${req.originalUrl} on this server`
  );
  err.statusCode = 404;
  err.status = 'fail'; */

  next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

// error handling middleware
app.use(globalHandlerError);
module.exports = app;
