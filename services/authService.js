const { comparePassword, generateToken } = require('../common/helpers/securityHelper.js');
const logger = require('../config/loggerConfig');
const { executeloginhistorySqlOperation } = require('../infra/db/loginHistoryRepo.js');

const { executeUserSqlOperation } = require('../infra/db/usersRepo.js');
const LoginHistory = require('../models/appModels/logingHistoryModel.js');

async function login(params) {
  await executeloginhistorySqlOperation(
    'addloginHistory',
    new LoginHistory(params.email, 'LOGIN ATTEMPTED')
  );

  const userRecord = await executeUserSqlOperation('getbyEmail', { email: params.email });

  if (userRecord.recordset.length > 0) {
    const currentUser = userRecord.recordset[0];
    if (comparePassword(params.password, currentUser.Password)) {
      await executeloginhistorySqlOperation(
        'addloginHistory',
        new LoginHistory(params.email, 'LOGIN SUCCESSFULLY')
      );
      const token = generateToken(currentUser.Id);
      return {
        status: 200,
        message: 'Login Successful',
        code: 'S00',
        data: {
          firstname: currentUser.FirstName,
          lastname: currentUser.LastName,
          email: currentUser.Email,
          phonenumber: currentUser.Phonenumber,
          token: token
        }
      };
    } else {
      await executeloginhistorySqlOperation(
        'addloginHistory',
        new LoginHistory(params.email, 'LOGIN FAILED: WRONG PASSWORD')
      );
      return {
        status: 400,
        message: 'Invalid Login Credentials',
        code: 'S00',
        data: null
      };
    }
  }
  await executeloginhistorySqlOperation(
    'addloginHistory',
    new LoginHistory(params.email, 'LOGIN FAILED: USER NOT FOUND')
  );
  return {
    status: 400,
    message: 'Invalid User details',
    code: 'S00',
    data: null
  };
}

module.exports = {
  login
};
