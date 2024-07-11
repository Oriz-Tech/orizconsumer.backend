const logger = require('../config/loggerConfig');
const { login } = require('../services/authService');

const userlogin = async (req, res) => {
  try {
    logger.info(`{userlogin user request: ${req.body.email}}`);
    const result = await login(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{userlogin user request: ${req.body.email}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

module.exports = {
  userlogin
};
