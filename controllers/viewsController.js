const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Tour data from collection
  const tours = await Tour.find();
  // 2) Build Template

  // 3) Render that template using tour data from 1)
  return res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get  all data, from the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate(
    { path: 'reviews', select: 'review rating user' }
  );

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  // 2) Build template

  // 3) Render template using data from 1)
  return res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  return res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  return res.status(200).render('signup', {
    title: 'Register',
  });
};
exports.getAccount = (req, res) => {
  return res.status(200).render('account', {
    title: `${res.locals.user.name}`,
    user: res.locals.user,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
/* exports.logout = (req, res) => {
  return res.status(200).render('overview', {
    title: 'All Tours',
  });
};
 */
