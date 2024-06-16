const { registerUser, createProfile } = require('../services/onboardingService');
const logger = require('../config/loggerConfig');

const profile = async (req, res) => {
  try {
    logger.info(`{profile user request: ${req}}`);
    const result = await createProfile(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{profile user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json(error);
  }
};

module.exports = {
  profile
};
