const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../utils/Factory/handlerFactory');

/**
 * @description - Is a middleware that use for create Review method
 * @route POST/ api/v1/reviews
 * @access Private, only roles:['user']
 */
exports.setTourUserIds = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  if ((await Tour.countDocuments({ _id: req.body.tour })) === 0) {
    return next(new AppError('Any tour not found with this id', 404));
  }
  return next();
});

exports.getAllReviews = factory.getAll(Review, [
  { path: 'tour' },
  { path: 'user' },
]);

exports.getReview = factory.getOne(Review, [
  { path: 'tour' },
  { path: 'user' },
]);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
