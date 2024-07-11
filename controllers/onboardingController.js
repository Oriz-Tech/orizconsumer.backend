const {
  createProfile,
  setProfileUserName,
  verifyProfilePhonenumber,
  verifyProfileEmail
} = require('../services/onboardingService');
const logger = require('../config/loggerConfig');

const profile = async (req, res) => {
  try {
    logger.info(`{profile user request: ${req.body.email}}`);
    const result = await createProfile(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{profile user request: ${req.body.email}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    logger.info(`{verify user request: ${req}}`);
    const result = await verifyProfileEmail(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{verify user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const verifyPhone = async (req, res) => {
  try {
    logger.info(`{verify user request: ${req}}`);
    const result = await verifyProfilePhonenumber(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{verify user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const setUserName = async (req, res) => {
  try {
    logger.info(`{setUserName user request: ${req}}`);
    req.body.userId = req.user.userId;
    req.body.token = req.token;
    const result = await setProfileUserName(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{setUserName user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

module.exports = {
  profile,
  verifyPhone,
  setUserName,
  verifyEmail
};
