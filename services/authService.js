const { comparePassword, generateToken } = require('../common/helpers/securityHelper.js');
const logger = require('../config/loggerConfig');
const { executeloginhistorySqlOperation } = require('../infra/db/loginHistoryRepo.js');
const { executeUserSqlOperation } = require('../infra/db/usersRepo.js');

const LoginHistory = require('../models/appModels/logingHistoryModel.js');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function login(params) {
  await executeloginhistorySqlOperation(
    'addloginHistory',
    new LoginHistory(params.email, 'LOGIN ATTEMPTED')
  );

  const currentUser = await prisma.user.findUnique({
    where: {
      email:params.email
    }
  })

  if (currentUser != null) {
    if (comparePassword(params.password, currentUser.password)) {
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
          token: token, 
          inviteid: currentUser.inviteid,
          language: currentUser.language, 
          timezone: currentUser.timeZone
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
