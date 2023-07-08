const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    const features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    const tours = await features.query;
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

exports.getTourStats = async (request, response) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    response.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (request, response) => {
  try {
    const year = request.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
    ]);
    response.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
