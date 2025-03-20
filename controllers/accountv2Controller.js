const {
  checkUser,
  verifyOtpSendOrLogin,
  createProfile,
  addDetails
} = require('../services/accountv2Service.js');
const logger = require('../config/loggerConfig');

const checkIdentifier = async (req, res) => {
  try {
    const result = await checkUser(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(
      `{checkIdentifier user request: ${req.body.identifier}} failed with error ${error}`
    );
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
    const result = await verifyOtpSendOrLogin(req.body, true);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{verifyEmail user request: ${req.body.identifier}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};
const verifyPhoneNumber = async (req, res) => {
  try {
    const result = await verifyOtpSendOrLogin(req.body, false);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(
      `{verifyPhoneNumber user request: ${req.body.identifier}} failed with error ${error}`
    );
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const accountLogin = async (req, res) => {
  try {
    const result = await verifyOtpSendOrLogin(req.body, false);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(
      `{verifyPhoneNumber user request: ${req.body.identifier}} failed with error ${error}`
    );
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const createProfileEndpoint = async (req, res) => {
  try {
    const result = await createProfile(req.body, false);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(
      `{verifyPhoneNumber user request: ${req.body.identifier}} failed with error ${error}`
    );
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const updateDetails = async (req, res) => {
  try {
    req.body.userId = req.user.userId;
    const result = await addDetails(req.body, false);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(
      `{verifyPhoneNumber user request: ${req.body.identifier}} failed with error ${error}`
    );
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

module.exports = {
  checkIdentifier,
  verifyEmail,
  verifyPhoneNumber,
  createProfileEndpoint,
  updateDetails,
  accountLogin
};
