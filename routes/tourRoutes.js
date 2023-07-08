const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

/*
router.param('/id', (request, response, next, value) => {
  console.log(`Tour id is ${value}`);
  next();
});
*/

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

module.exports = router;
