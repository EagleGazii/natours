const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
//const list = require('../utils/ListRoutes/list');

const router = express.Router();
// we can use this as blocking code, it will execute one time but inside routes will block the code

// This middleware is working just for tour routers that has id params
// Middlewares ordering matters
// router.param('id', tourController.checkID);

/* 
app.get('/api/v1/tours', getAllTours);

app.post('/api/v1/tours', createTour);

// regex :id([0-9])
app.get('/api/v1/tours/:id', getTour);

// patch update a few property
// put update all object
app.patch('/api/v1/tours/:id', updateTour);

app.delete('/api/v1/tours/:id', deleteTour); 
*/

// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// GET /tour/:tourId/reviews/:reviewsId

/* router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  ); */

router.use('/:tourId/reviews', reviewRouter);
router.route('/stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide '),
    tourController.getMonthlyPlan
  );

router
  .route('/top-3-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/200/center/30,-40/unit/mil
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithIn);

router
  .route('/distance/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//list(router);
module.exports = router;
