const { PrismaClient } = require('@prisma/client');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');
const prisma = new PrismaClient();

async function log_webhookevent(params) {
  let request = {
    "payload": JSON.stringify(params.data),
    "event": params.event, 
    "createdAt": getCurrentDateUtc()
  };
  
  const response = await prisma.webhookLog.create({
    data: request
  });
  console.log(response);
}

module.exports = {
  log_webhookevent
};
