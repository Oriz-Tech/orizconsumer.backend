const logger = require('../config/loggerConfig');
const { PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const { level } = require('winston');

const prisma = new PrismaClient();

async function getUserPlanSettings(params) {
  try {
    const settingsData = await prisma.userPlanSettings.findFirst({
      where: {
        userId: params.userId
      }
    });
    if (settingsData == null) {
      return {
        status: 200,
        message: 'Plan settings does not exist for this user',
        code: 'S00',
        data: null
      };
    }
    const responseData = {
      id: settingsData.id,
      weightGoal: settingsData.weightGoal,
      weight: settingsData.weight,
      height: settingsData.height,
      typeOfWork: settingsData.typeOfWork,
      dietaryRestriction: settingsData.dietaryRestriction.split('|'),
      neededCalPerday: settingsData.neededCalPerday
    };
    return { status: 200, message: 'Success', code: 'S00', data: responseData };
  } catch (error) {
    logger.log('error', 'getuserPlan failed ' + error);
    return { status: 500, message: 'An Error occured', code: 'E00', data: null };
  }
}

async function editUserPlanSettings(params) {
  try {
    const settingsData = await prisma.userPlanSettings.update({
      where: {
        id: params.id,
        userId:params.userId
      },
      data: {
        weightGoal: params.weightGoal,
        height: params.height,
        weight: params.weight,
        typeOfWork: params.typeOfWork,
        dietaryRestriction: params.dietaryRestriction.join('|'),
        updatedAt: getCurrentDateUtc(),
        neededCalPerday: params.neededCalPerday
      }
    });
    if (settingsData == null) {
      return {
        status: 400,
        message: 'Could not update plan settings. Kindly try again later.',
        code: 'E00',
        data: null
      };
    }
    return {
      status: 200,
      message: 'Plan settings update Success',
      code: 'S00',
      data: null
    };
  } catch (error) {
    logger.log('error', 'editUserPlanSettings failed ' + error);
    return { status: 500, message: 'An Error occured', code: 'E00', data: null };
  }
}

module.exports = {
  getUserPlanSettings,
  editUserPlanSettings
};
