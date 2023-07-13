const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    role: request.body.role,
  });
  const token = signToken(newUser._id);
  response.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  const token = signToken(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (request, response, next) => {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer ')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Please Log in to get access', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  if (currentUser.changedPassword(decoded.iat))
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );
  request.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };

exports.forgotPassword = catchAsync(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email });
  if (!user) return next(new AppError('There is no user with that email', 404));
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
    response.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later.',
        500
      )
    );
  }
});
exports.resetPassword = (request, response, next) => {};
