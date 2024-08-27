const logger = require('../config/loggerConfig');
const { Prisma, PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const axios = require('axios');

const prisma = new PrismaClient();
const paystack_baseurl = process.env.PAYSTACK_BASE_URL;
const paystack_secretKey = process.env.PAYSTACK_SECRET_KEY;

async function subscribeTrial(params) {
  let nextBillingDate = new Date(getCurrentDateUtc().setDate(getCurrentDateUtc().getDate() + 7));
  try {
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: params.userId,
        subscriptionType: -1,
        lastAction: 'TRIAL SUBSCRIPTION',
        nextBillingDate: nextBillingDate,
        isActive: true
      }
    });
  } catch (error) {
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
    message: `Subscription sucessful. \n Next billing date is ${nextBillingDate}`,
    code: 'S00',
    data: null
  };
}

async function getPlans() {
  try {
    const plans = await prisma.appSubscription.findMany();
    return {
      status: 200,
      data: plans,
      code: 'S00'
    };
  } catch (error) {
    throw error;
  }
}

async function subscribeToPlan(params) {
  try {
    const plan = await prisma.appSubscription.findFirst({
      where: {
        id: params.id
      }
    });
    if (plan == null) {
      return {
        status: 400,
        data: null,
        message: 'Plan does not exist',
        code: 'E00'
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: params.userId
      }
    });
    
    if (user == null) {
      return {
        status: 400,
        data: null,
        message: 'User does not exist',
        code: 'E00'
      };
    }

    let paystackPaymentRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${paystack_baseurl}transaction/initialize`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer: ${paystack_secretKey}`
      },
      data: JSON.stringify({
        email: user.email,
        plan: plan.code
      })
    };

    axios
      .request(paystackPaymentRequestConfig)
      .then((response) => {
        const res = JSON.stringify(response.data);
        console.log(res);
        const userSubscription = prisma.userSubscription.update({
          where: {
            userId: params.userId
          },
          data: {
            subscriptionType: plan.id, 
            paymentStage: 'INITIATED',
            updatedAt: new Date(getCurrentDateUtc()), 
            lastAction: 'PAYMENT INITIATED FOR SUBSCRIPTION',
            paymentReference: res['reference']
          }
        });
        return {
          status: 200,
          data: JSON.stringify(response.data),
          message: 'Success',
          code: 'S00'
        };
      })
      .catch((error) => {
        console.log(error);
        return {
          status: 400,
          data: null,
          message: 'An error occured while trying to initiate payment. Kindly check again',
          code: 'E00'
        };
      });
  } catch (error) {
    throw error;
  }
}
module.exports = {
  subscribeTrial,
  getPlans,
  subscribeToPlan
};
