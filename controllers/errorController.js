const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); // 400 - bad request
};

const handleDublicateFieldsDB = (err) => {
  const value = JSON.stringify(err.keyValue);
  //const value = Object.values(err.keyValue);
  //const value = err.message.match(/\{(.*?)\}/);
  //console.log(value);
  const message = `Dublicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Inavild token. Please login again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // for Api
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    //console.error('Error : ', err);

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });

    // Operational, trusted error: send message to client
  }
  // rendering website
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  }
  // 1) Log error
  //console.error('Error : ', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDublicateFieldsDB(error);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError')
      error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
