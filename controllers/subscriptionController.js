const logger = require('../config/loggerConfig');
const { subscribeTrial, getPlans, subscribeToPlan } = require('../services/subscriptionService');

const trialSubscription = async(req, res) => {
    try {
        logger.info(`{trialSubscription user request: ${req.userId}}`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        const result = await subscribeTrial(req.body);
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


const getSubscriptionPlans = async(req, res) => {
  try {
      req.body.userId = req.user.userId;
      req.body.token = req.token;
      logger.info(`{getPlans user request: ${req.user.userId}}`);
      const result = await getPlans();
      res.status(result.status).json(result);
    } catch (error) {
      logger.error(`{getPlans user request: ${req.body}} failed with error ${error}`);
      res.status(error.status || 500).json({
        status: 500,
        message: 'Sorry, an error occured',
        code: 'E00',
        data: null
      });
    }
}

const subcribeToAPlan = async(req, res) => {
  try {
      const payload = {id: req.params.planId, userId: req.user.userId}
      logger.info(`{subcriptToAPlan user request: ${req.user.userId}}`);
      const result = await subscribeToPlan(payload);
      res.status(result.status).json(result);
    } catch (error) {
      logger.error(`{subcriptToAPlan user request: ${req.body}} failed with error ${error}`);
      res.status(error.status || 500).json({
        status: 500,
        message: 'Sorry, an error occured',
        code: 'E00',
        data: null
      });
    }
}

module.exports = {
    trialSubscription,
    getSubscriptionPlans,
    subcribeToAPlan
};
