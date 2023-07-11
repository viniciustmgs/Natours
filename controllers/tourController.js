const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (request, response, next) => {
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .fields()
    .paginate();
  const tours = await features.query;
  response
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

exports.createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);
  response.status(201).json({ status: 'success', data: { tour: newTour } });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const { id } = request.params;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(200).json({ status: 'success', data: { tour } });
});

exports.updateTour = catchAsync(async (request, response, next) => {
  const { id } = request.params;
  const tour = await Tour.findByIdAndUpdate(id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(200).json({ status: 'success', data: { tour } });
});

exports.deleteTour = catchAsync(async (request, response, next) => {
  const { id } = request.params;
  const data = await Tour.findByIdAndDelete(id);
  if (!data) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(204).json({ status: 'success', data: { data } });
});

exports.getTourStats = catchAsync(async (request, response, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
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
});
