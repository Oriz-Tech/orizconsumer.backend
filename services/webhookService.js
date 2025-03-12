const { PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const prisma = new PrismaClient();

async function log_webhookevent(params) {
  console.log(params);
  let request = {
    "payload": params.data,
    "event": params.event, 
    "createdAt": getCurrentDateUtc()
  };
  
  const response = await prisma.webhookLog.create({
    data: request
  });

  //extract reference from data 
  const transaction_ref =  params.data.reference;
  const subscriptionRecord = await prisma.userSubscription.findFirst({
    where: {
      paymentReference: transaction_ref, 
      paymentStage: 'INITIATED'
    }
  });

  if(subscriptionRecord){
    if(params.event == 'charge.success' || params.event == 'subscription.create'){
      await prisma.user.update({
        where: {
          id: subscriptionRecord.userId
        },
          data: {
            isTrialSubscription: false, 
            subscriptionType: subscriptionRecord.subscriptionType,
            lastSubscriptionDate: getCurrentDateUtc(),
            isSubscriptionActive: true,
            dateupdatedutc: getCurrentDateUtc(), 
            lastaction: `SUBSCRIBED TO PLAN ${subscriptionRecord.subscriptionType}`,
            activeUserSubscriptionId: subscriptionRecord.id,
            point: {increment: 1}
          }
      });
      await prisma.userSubscription.update({
        where: {
          id: subscriptionRecord.id
        },
        data: {
          isActive: true, 
          updatedAt: getCurrentDateUtc(), 
          nextBillingDate: new Date(getCurrentDateUtc().setDate(getCurrentDateUtc().getDate() + 30)),
          paymentStage: params.event.toUpperCase(),
          lastAction: `Subscription event completed with ${params.event}`,
          paystackCustomerId: params.data.customer.id,
          paystackPlanId: params.data.plan.id
        }
      })
    }
    else{
      //sent email on failed subscription 
      //
      await prisma.user.update({
        where: {
          id: subscriptionRecord.userId
        },
        data: {
          dateupdatedutc: getCurrentDateUtc(), 
          lastaction: `SUBSCRIPTION FAILED ${params.event}`
        }
      });
      await prisma.userSubscription.update({
        where: {
          id: subscriptionRecord.id
        },
        data: {
          updatedAt: getCurrentDateUtc(), 
          paymentStage: params.event,
          lastAction: `Subscription event completed with ${params.event}`
        }
      })
    }
  }  
}

module.exports = {
  log_webhookevent
};
//
