const logger = require('../config/loggerConfig');
const { Prisma, PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');

const prisma = new PrismaClient();

async function subscribe(params) {
  let nextBillingDate = new Date(getCurrentDateUtc().setDate(getCurrentDateUtc().getDate() + 7));
  try {
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: params.userId,
        subscriptionType: params.subscriptionType,
        lastAction: 'TRIAL SUBSCRIPTION',
        nextBillingDate: nextBillingDate,
        isActive: true
      }
    });
  } catch (error) {
    console.log(error.message)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        status: 400,
        message: `Subscription already exists.`,
        code: 'E00',
        data: null
      };
    } else {
      throw error;
    }
  } 
  return {
    status: 200,
    message: `Subscripition sucessful. \n Next billing date is ${nextBillingDate}`,
    code: 'S00',
    data: null
  };
}

module.exports = {
  subscribe
};
