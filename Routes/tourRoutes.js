const express = require('express');
const tourController = require('../controllers/tourController');

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

router.route('/stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/top-3-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
