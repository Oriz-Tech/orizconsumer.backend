const logger = require('../config/loggerConfig');
const { log_webhookevent } = require('../services/webhookService');

const logWebhookEvent = async (req, res) => {
  const result = await log_webhookevent(req.body);
  res.status(200).json(result);
};
//

module.exports = {
  logWebhookEvent
};
