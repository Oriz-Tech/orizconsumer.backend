const logger = require('../config/loggerConfig');
const { Prisma, PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const axios = require('axios');

const prisma = new PrismaClient();
const paystack_baseurl = process.env.PAYSTACK_BASE_URL;
const paystack_secretKey = process.env.PAYSTACK_SECRET_KEY;


async function getPlans() {
  try {
    const plans = await prisma.appSubscription.findMany();
    return {
      status: 200,
      data: plans,
      code: 'S00'
    };
  } catch (error) {
    logger.error(`{getPlans user request: ${params}} failed with error ${error}`);
    return {
      status: 400,
      data: null,
      message: `Getting subscriptions failed with an error. Kindly try again later`,
      code: 'E00'
    };
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

    if(user.isSubscriptionActive){
      //logic to check active subscription. 
      return {
        status: 400,
        data: null,
        message: `User already has a subscription ${user.subscriptionType}`,
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
        "amount":plan.amount*100,
        email: user.email,
        plan: plan.code
      })
    };

    let res = null
    const response = await axios.request(paystackPaymentRequestConfig);
    if(response.status == 200){
      res = response.data;
      await prisma.userSubscription.create({
          data: {
            userId: params.userId,
            subscriptionType: plan.id, 
            paymentStage: 'INITIATED',
            updatedAt: new Date(getCurrentDateUtc()), 
            lastAction: 'PAYMENT INITIATED FOR SUBSCRIPTION',
            paymentReference: res['data']['reference'],
            nextBillingDate: new Date(getCurrentDateUtc().setDate(getCurrentDateUtc().getDate() + 30)),
            isActive: false
          }
        });

        return {
          status: 200,
          data: res,
          message: 'Success data',
          code: 'E00'
        };
    }
    else{
      logger.error(`{subcriptToAPlan user request: ${params}} failed with error ${response.data} and status ${response.status}`);
      return {
        status: 400,
        data: null,
        message: `{subcriptToAPlan user request: ${params}} failed with error ${response} and status ${response}`,
        code: 'E00'
      };
    }


  } catch (error) {
    logger.error(`{subcriptToAPlan user request: ${params}} failed with error ${error}`);
    return {
      status: 400,
      data: null,
      message: `{subcriptToAPlan user request: ${params}} failed with error ${error}`,
      code: 'E00'
    };
  }
}

async function cancelSubscription(params) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: params.userId
      }
    });

    if(!user.isSubscriptionActive || user.subscriptionType == -1){
      return {
        status: 400,
        data: null,
        message: 'No active subscription',
        code: 'E00'
      };
    }
    
    if(user.isTrialSubscription || user.subscriptionType == 0){
      return {
        status: 400,
        data: null,
        message: 'Trial subscription cannot be cancelled',
        code: 'E00'
      };  
    }

    

    const plan = await prisma.appSubscription.findFirst({
      where:{
        id: user.subscriptionType
      }
    });
    if(plan == null){
      return {
        status: 400,
        data: null,
        message: 'Subscription plan not found',
        code: 'E00'
      };
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: params.userId,
        isActive: true,
        id: user.activeUserSubscriptionId, 
        subscriptionType: user.subscriptionType
      }
    });
    if (subscription == null) {
      return {
        status: 400,
        data: null,
        message: 'No active subscription',
        code: 'E00'
      };
    }


    const getCancelSubRequestConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystack_secretKey}`
      }
    };
    
    const url = `${paystack_baseurl}subscription?customer=${subscription.paystackCustomerId}&plan=${subscription.paystackPlanId}`;
    
    let res = null;
    const response = await fetch(url, getCancelSubRequestConfig);
    res = await response.json();
    //console.log(res);
    if(res.status ==true ){

      
      email_token = res.data[0].email_token;
      subscription_code = res.data[0].subscription_code;
      console.log(`Email code ${email_token} and subscription code ${subscription_code}`);

      const cancelSubRequestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${paystack_secretKey}`
        },
        data: JSON.stringify({
          "token": email_token,
          "code": subscription_code 
         })
      };
      const cancelUrl = `${paystack_baseurl}subscription?customer=${subscription.paystackCustomerId}&plan=${subscription.paystackPlanId}`;
    
      const response = await fetch(cancelUrl, cancelSubRequestConfig);
      res = await response.json();
      console.log(res);
      if(res.status == true){

        await prisma.user.update({
          where:{
            id: user.id
          },
          data:{
            isSubscriptionActive: false,
            lastaction: "SUBSCRIPTION CANCELED BY USER",
            activeUserSubscriptionId: null, 
            dateupdatedutc: getCurrentDateUtc(), 
            subscriptionType: 0, 
            isTrialSubscription: false
          }
        });

        await prisma.userSubscription.update({
          where:{
            id: subscription.id
          }, 
          data:{
            isActive: false, 
            updatedAt: getCurrentDateUtc(),
            lastAction: 'SUBSCRIPTION CANCELED BY USER', 
            nextBillingDate: null,
            paymentStage: 'CANCELED'
          }
        })
        return {
          status: 200,
          data: null,
          message: 'Subscription canceled successfully',
          code: 'E00'
        };
      }
      else{
        return {
          status: 400,
          data: null,
          message: 'Error while trying to cancel subscription',
          code: 'E00'
        };
      }
      //cancel subscription




       
    }
    else{
      logger.error(`{cancelSubscription user request: ${params}} failed with error ${res} and status ${response.status}`);
      return {
        status: 400,
        data: null,
        message: `Canceling subscription failed with an error. Kindly try again later`,
        code: 'E00'
      };
    }

    // await prisma.userSubscription.update({
    //   where: {
    //     id: subscription.id
    //   },
    //   data: {
    //     isActive: false
    //   }
    // });
    
  } catch (error) {
    logger.error(`{cancelSubscription user request: ${params}} failed-01 with error ${JSON.stringify(error)}`);
    return {
      status: 400,
      data: null,
      message: `Canceling subscription failed with an error. Kindly try again later`,
      code: 'E00'
    };
  }
}

module.exports = {
  getPlans,
  subscribeToPlan,
  cancelSubscription
};
