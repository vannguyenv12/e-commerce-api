const User = require('./../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('./../errors');
const { attachCookiesToResponse, createTokenUser } = require('./../utils');

const register = async (req, res) => {
  const { email, name, password, role } = req.body;

  const emailAlreadyExits = await User.findOne({ email });
  if (emailAlreadyExits) {
    throw new CustomError.BadRequestError('Email already exits');
  }

  const user = await User.create({ email, name, password });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credential');
  }

  const isCorrectPassord = await user.correctPassword(password);

  if (!isCorrectPassord) {
    throw new CustomError.UnauthenticatedError('Invalid credential');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  console.log(req.signedCookies.jwt);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).send({ msg: 'You are logout' });
};

module.exports = {
  register,
  login,
  logout,
};
