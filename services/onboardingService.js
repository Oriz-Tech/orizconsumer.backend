const { executeUserSqlOperation } = require('../db/usersRepo.js');
const User = require('../models/userModel.js');
const logger = require('../config/loggerConfig');

async function createProfile(params) {
  try {
    let previousUser = await executeUserSqlOperation('getbyEmailOrPhonenumber', {
      email: params.email,
      phonenumber: params.phonenumber
    });
    logger.info(`previoususer details ${previousUser}`);

    if (previousUser.recordset.length > 0) {
      return {
        status: 400,
        message: 'An account with the email (or phonenumber) already exists',
        code: 'E00',
        data: null
      };
    }
    const newUser = new User();
    newUser.profile(
      params.firstname,
      params.lastname,
      params.password,
      params.email,
      params.phonenumber
    );

    const creationResult = await executeUserSqlOperation('profile', newUser);
    return { status: 200, message: 'User created', code: 'S00', data: creationResult };
  } catch (err) {
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

module.exports = {
  createProfile
};
