const User = require('./../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('./../errors');
const { createTokenUser, checkPermissions } = require('./../utils');

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: 'user' }).select('-password');

  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new CustomError.BadRequestError('Please provide name and email');
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = email;

  const tokenUser = createTokenUser(user);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'Please enter old password and new password'
    );
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isCorrectPassword = await user.correctPassword(oldPassword);
  if (!isCorrectPassword) {
    throw new CustomError.UnauthenticatedError('Invalid Credential');
  }

  user.password = newPassword;
  user.save();

  res.status(StatusCodes.OK).json({ msg: 'Success! Password is updated' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
