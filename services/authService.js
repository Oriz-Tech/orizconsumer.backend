const { comparePassword, generateToken } = require('../common/helpers/securityHelper.js');
const { executeloginhistorySqlOperation } = require('../infra/db/loginHistoryRepo.js');
const { executeUserSqlOperation } = require('../infra/db/usersRepo.js');

const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function login(params) {
  await prisma.loginHistory.create({
    data: {
      userEmail: params.email,
      loginAction: 'LOGIN ATTEMPTED'
    }
  });

  const currentUser = await prisma.user.findUnique({
    where: {
      email: params.email
    }
  });

  if (currentUser != null) {
    if (comparePassword(params.password, currentUser.password)) {
      await prisma.loginHistory.create({
        data: {
          userEmail: params.email,
          loginAction: 'LOGIN SUCCESSFUL'
        }
      });
      const token = generateToken(currentUser.id);
      return {
        status: 200,
        message: 'successfully logged in',
        code: 'S00',
        data: {
          firstname: currentUser.FirstName,
          lastname: currentUser.LastName,
          email: currentUser.Email,
          phonenumber: currentUser.Phonenumber,
          token: token,
          inviteid: currentUser.inviteid,
          language: currentUser.language,
          subscriptionType: currentUser.subscriptionType,
          isSubscriptionActive: currentUser.isSubscriptionActive,
          isTrialSubscription: currentUser.isTrialSubscription,
          points: currentUser.point,
          hasActiveWellnessPlan: currentUser.hasActiveWellnessPlan,
          hasActiveFitnessPlan: currentUser.hasActiveFitnessPlan,
          hasActiveMealPlan: currentUser.hasActiveMealPlan,
        }
      };
    } else {
      await prisma.loginHistory.create({
        data: {
          userEmail: params.email,
          loginAction: 'LOGIN FAILED: WRONG PASSWORD'
        }
      });
      return {
        status: 400,
        message: 'Invalid Login Credentials',
        code: 'S00',
        data: null
      };
    }
  }
  await prisma.loginHistory.create({
    data: {
      userEmail: params.email,
      loginAction: 'LOGIN FAILED: USER NOT FOUND'
    }
  });
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
