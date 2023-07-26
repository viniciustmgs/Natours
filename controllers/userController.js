const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (allowedFields.includes(element)) newObj[element] = obj[element];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();
  response.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.updateMe = catchAsync(async (request, response, next) => {
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        'This rout is not for password updates. Please user /updateMyPassword',
        400
      )
    );
  }
  const filteredBody = filterObj(request.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    request.body.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });
  response.status(204).json({
    status: 'success',
    data: null,
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
