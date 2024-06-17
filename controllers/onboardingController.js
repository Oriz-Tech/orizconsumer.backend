const { verifyProfile, createProfile } = require('../services/onboardingService');
const logger = require('../config/loggerConfig');

const profile = async (req, res) => {
  /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/profileSchema"
                    }  
                }
            }
        } 
    */
   /* #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/responseSchema' }
    } */
  try {
    logger.info(`{profile user request: ${req}}`);
    const result = await createProfile(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{profile user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json(error);
  }
};

const verify = async (req, res) => {
  /*  #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/profileSchema"
                    }  
                }
            }
        } 
    */
   /* #swagger.responses[200] = {
            schema: { $ref: '#/components/schemas/responseSchema' }
    } */
  try {
    logger.info(`{verify user request: ${req}}`);
    const result = await verifyProfile(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{verify user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json(error);
  }
};

module.exports = {
  profile,
  verify
};
