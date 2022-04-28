const CustomError = require('./../errors');
const { StatusCodes } = require('http-status-codes');
const { isValidToken } = require('./../utils');

const authenticateUser = (req, res, next) => {
  const token = req.signedCookies.jwt;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authenticate Invalid');
  }

  try {
    const { name, userId, role } = isValidToken({ token });
    req.user = {
      name,
      userId,
      role,
    };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authenticate Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthenticatedError('You do not have permission');
    }

    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
