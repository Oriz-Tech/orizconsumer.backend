const jwt = require('jsonwebtoken');
const { verifyToken } = require('../common/helpers/securityHelper');

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .send({
          status: 401,
          message: 'No token provided. Access Denied',
          code: 'E01',
          data: null
        });
    }

    const tokenDecoded = verifyToken(token);
    if (tokenDecoded == null) {
      return res
        .status(401)
        .send({ status: 401, message: 'Invalid Access Token', code: 'E01', data: null });
    }

    req.user = tokenDecoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).send({ status: 401, message: 'Invalid Access Token', code: 'E01', data: null });
  }
};
