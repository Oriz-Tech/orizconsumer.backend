const {
  verifyProfile,
  createProfile,
  setProfileUserName
} = require('../services/onboardingService');
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
    logger.info(`{profile user request: ${req.body.email}}`);
    const result = await createProfile(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{profile user request: ${req.body.email}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
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
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

const setUserName = async (req, res) => {
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
    logger.info(`{setUserName user request: ${req}}`);
    req.body.userId = req.user.userId;
    req.body.token = req.token;
    const result = await setProfileUserName(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    logger.error(`{setUserName user request: ${req}} failed with error ${error}`);
    res.status(error.status || 500).json({
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data: null
    });
  }
};

module.exports = {
  profile,
  verify,
  setUserName
};
