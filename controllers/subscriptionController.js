const logger = require('../config/loggerConfig');
const { subscribe } = require('../services/subscriptionService');

const trialSubscription = async(req, res) => {
    try {
        logger.info(`{trialSubscription user request: ${req.userId}}`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        const result = await subscribe(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{trialSubscription user request: ${req.user}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}
module.exports = {
    trialSubscription
};
