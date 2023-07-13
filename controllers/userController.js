const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();
  response.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.createUser = (request, response) => {
  response.status(201).json({ status: 'success', data: null });
};

exports.getUser = (request, response) => {
  response.status(200).json({ status: 'success', data: null });
};

exports.updateUser = (request, response) => {
  response.status(200).json({ status: 'success', data: null });
};

exports.deleteUser = (request, response) => {
  response.status(204).json({ status: 'success', data: null });
};
