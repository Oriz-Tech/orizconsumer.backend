const logger = require('../config/loggerConfig');
const { getPlans, subscribeToPlan, cancelSubscription } = require('../services/subscriptionService');


const getSubscriptionPlans = async(req, res) => {
  try {
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
      const payload = {id: req.body.planId, userId: req.user.userId}
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

const cancelAPlan = async(req, res) => {
  try {
      req.body.userId = req.user.userId;
      logger.info(`{cancelSubscription user request: ${req.user.userId}}`);
      const result = await cancelSubscription(req.body);
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
    getSubscriptionPlans,
    subcribeToAPlan,
    cancelAPlan
};
