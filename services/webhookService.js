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
}

module.exports = {
  log_webhookevent
};
//
