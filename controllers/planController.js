const logger = require('../config/loggerConfig');
const { getUserPlanSettings, editUserPlanSettings } = require('../services/userplansettingsService');

const getSettings = async(req, res) => {
    try {
        req.body.userId = req.user.userId;
        logger.info(`{getPlan user request: ${JSON.stringify(req.body)}`);
        const result = await getUserPlanSettings(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{getPlan user request: ${req.user}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}

const editSettings = async(req, res) => {
    try {
        req.body.userId = req.user.userId;
        logger.info(`{editUserPlanSettings user request: ${req.body}}`);
        const result = await editUserPlanSettings(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{editUserPlanSettings user request: ${JSON.stringify(req.user)}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}
module.exports = {
    getSettings, 
    editSettings
};
