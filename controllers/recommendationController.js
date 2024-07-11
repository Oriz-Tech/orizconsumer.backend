const logger = require('../config/loggerConfig');
const { generate_plan } = require('../services/recommendationService');

const generatePlan = async(req, res) => {
    try {
        logger.info(`{generatePlan user request: ${req.body}}`);
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
module.exports = {
    generatePlan
};
