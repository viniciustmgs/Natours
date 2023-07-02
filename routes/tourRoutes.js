const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

router.param('/id', (request, response, next, value) => {
  console.log(`Tour id is ${value}`);
  next();
});

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkPostBody, tourController.createTour);

module.exports = router;
