const { createJWT, isValidToken, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');

module.exports = {
  createJWT,
  isValidToken,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
};
