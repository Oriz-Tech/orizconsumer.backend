const logger = require('../config/loggerConfig');
const { generate_plan, get_ai_recommendation, complete_plan_items, generate_plan_openai } = require('../services/recommendationService');

const generatePlan = async(req, res) => {
    try {
        logger.info(`{generatePlan user request: ${req.body}}`);
        req.body.userId = req.user.userId;
        req.body.token = req.token;
        const result = await generate_plan(req.body);
        res.status(result.status).json(result);
      } catch (error) {
        logger.error(`{generatePlan user request: ${req.body}} failed with error ${error}`);
        res.status(error.status || 500).json({
          status: 500,
          message: 'Sorry, an error occured',
          code: 'E00',
          data: null
        });
      }
}

const getAiRecommendation = async(req, res) => {
  try {
      logger.info(`{getAiRecommendation user request: ${req.body}}`);
      req.body.userId = req.user.userId;
      req.body.token = req.token;
      const result = await get_ai_recommendation(req.body);
      res.status(result.status).json(result);
    } catch (error) {
      logger.error(`{generatePlan user request: ${req.body}} failed with error ${error}`);
      res.status(error.status || 500).json({
        status: 500,
        message: 'Sorry, an error occured',
        code: 'E00',
        data: null
      });
    }
}

const completePlanItems = async(req, res) => {
  try {
      logger.info(`{completePlanItems user request: ${JSON.stringify(req.body)}}`);
      req.body.userId = req.user.userId;
      req.body.token = req.token;
      const result = await complete_plan_items(req.body);
      res.status(result.status).json(result);
    } catch (error) {
      logger.error(`{completePlanItems user request: ${req.body}} failed with error ${error}`);
      res.status(error.status || 500).json({
        status: 500,
        message: 'Sorry, an error occured',
        code: 'E00',
        data: null
      });
    }
}
module.exports = {
    generatePlan,
    getAiRecommendation, 
    completePlanItems
};
