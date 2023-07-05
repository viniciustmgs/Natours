const Tour = require('../models/tourModel');

exports.getAllTours = async (request, response) => {
  try {
    const queryObj = { ...request.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    const queryStr = JSON.stringify(queryObj);
    const newQueryString = queryStr.replace(
      /\b(g|l)te?\b/g,
      (match) => `$${match}`
    );
    const query = await Tour.find(JSON.parse(newQueryString));
    const tours = await query;
    response
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);
    response.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    response.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const { id } = request.params;
    const tour = await Tour.findById(id);
    response.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const { id } = request.params;
    const tour = await Tour.findByIdAndUpdate(id, request.body, {
      new: true,
      runValidators: true,
    });
    response.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    const { id } = request.params;
    const data = await Tour.findByIdAndDelete(id);
    response.status(204).json({ status: 'success', data: { data } });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
