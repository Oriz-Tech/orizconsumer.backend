const logger = require('../config/loggerConfig');
const { getEditUserDetails, updateEditUserDetails, changePassword } = require('../services/profileService');

const getProfile = async(req, res) => {
    try {
        logger.info(`{getProfile user request: ${req}`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        console.log(req.body)
        const result = await getEditUserDetails(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{getProfile user request: ${req.user.userId}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}

const editProfile = async(req, res) => {
    try {
        logger.info(`{getProfile user request: ${req}`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        console.log(req.body)
        const result = await updateEditUserDetails(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{getProfile user request: ${req.user.userId}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}

const changeProfilePassword = async(req, res) => {
    try {
        logger.info(`{changeProfilePassword user request`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        const result = await changePassword(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{changeProfilePassword user request failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}
module.exports = {
    getProfile,
    editProfile,
    changeProfilePassword
};
