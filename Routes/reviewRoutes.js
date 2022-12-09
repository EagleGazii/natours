const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
//const list = require('../utils/ListRoutes/list');

const router = express.Router({ mergeParams: true });

// POST /tour/:tourId/reviews/
// GET /tour/:tourId/reviews/
// POST reviews/
// will work as well, one of them comes from app.js router.use and other from tourRoute.js
// get All reviews here

// protect all review endpoints
router.use(authController.protect);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

//list(router);
module.exports = router;
