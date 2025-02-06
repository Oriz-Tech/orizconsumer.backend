const logger = require('../config/loggerConfig');

const { executeUserSqlOperation } = require('../infra/db/usersRepo.js');
const { executeOtpSqlOperation } = require('../infra/db/otpRepo.js');

const User = require('../models/userModel.js');
const Otp = require('../models/appModels/otpModel.js');

const { sendEmail, sendSMS } = require('../infra/external/email_sms_service.js');
const { OtpTypes } = require('../common/enums/appEnums.js');
const {
  comparePassword,
  generateToken,
  generateReferalLink
} = require('../common/helpers/securityHelper.js');
const { getCurrentDateUtc } = require('../common/helpers/dateTimeHelper');

const { Prisma, PrismaClient } = require('@prisma/client');
const { Console } = require('console');

const prisma = new PrismaClient();
let currentDate = getCurrentDateUtc().toISOString();

async function createProfile(params) {
  try {
    const previousUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: params.email }, { phonenumber: params.phonenumber }]
      }
    });

    logger.info(`previous user details: ${JSON.stringify(previousUser)}`);
    const newUser = new User();
    newUser.profile(params.firstname, params.lastname, params.password, params.email, params.phonenumber);

    if (previousUser) {
      // Check if previousUser is not null
      return {
        status: 400,
        message: 'An account with the email (or phone number) already exists',
        code: 'E00',
        data: null
      };
    }

    const createdUser = await prisma.user.create({
      data: newUser.toJSON()
    });

    logger.info(`User account created: ${createdUser.firstname}`);

    let otpCode = '12345'; // Math.floor(10000 + Math.random() * 90000).toString();

    const otpRecord = new Otp(otpCode, params.phonenumber, OtpTypes.ONBOARDING);
    const otpSentResult = await prisma.otpModel.create({
      data: otpRecord.toJSON()
    });
    if (!otpSentResult) {
      logger.error(`Error sending otp`);
      return { status: 400, message: 'Error sending otp to phone number', code: 'E00', data: null };
    }
    logger.info('sent otp to phone number' + params.phonenumber);
    //const response = await sendSMS(newUser.phonenumber, `otp to for onboarding ${otpCode}`);
    //console.log('response ' + response);
    return {
      status: 200,
      message: `User account created and OTP has been sent to ${params.phonenumber}`,
      code: 'S00',
      data: { otpHeader: otpRecord.otpHeader, otp: otpCode, otpType: OtpTypes.ONBOARDING }
    };
  } catch (err) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function verifyProfileEmail(params) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: params.identifier
      }
    });
    if (!user) {
      return { status: 400, message: 'Invalid user email', code: 'E00', data: null };
    }

    const otpRecord = await prisma.otpModel.findFirst({
      where: {
        AND: [
          { identifier: params.identifier },
          { otpHeader: params.otpHeader },
          { isUsed: false },
          { otpType: params.otpType }
        ]
      }
    });

    if (!otpRecord) {
      return { status: 400, message: 'Invalid OTP', code: 'E00', data: null };
    }

    if (new Date(otpRecord.dateToExpireUtc).getTime() < new Date().getTime()) {
      return { status: 400, message: 'Otp has expired', code: 'E00', data: null };
    }

    if (!comparePassword(params.otp, otpRecord.otp)) {
      return { status: 400, message: 'Invalid OTP', code: 'E00', data: null };
    }

    await prisma.otpModel.update({
      where: {
        id: otpRecord.id
      },
      data: {
        isUsed: true
      }
    });
    const verifyEmailResult = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        isemailverified: true
      }
    });

    if (!verifyEmailResult) {
      return {
        status: 400,
        message: 'Error completing this action. Kindly try again',
        code: 'E00',
        data: null
      };
    }
    const token = generateToken(user.id);
    return {
      status: 200,
      message: 'User Account successfully verified',
      code: 'S00',
      data: { token: token }
    };
  } catch (error) {
    logger.error(`Error occured while creating user ${error}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function verifyProfilePhonenumber(params) {
  try {
    const userRecord = await prisma.user.findFirst({
      where: {
        phonenumber: params.identifier
      }
    });

    if (!userRecord) {
      return { status: 400, message: 'Invalid user phonenumber', code: 'E00', data: null };
    }
    let otpRecord = await prisma.otpModel.findFirst({
      where: {
        AND: [{ identifier: params.identifier }, { otpHeader: params.otpHeader }, { isUsed: false }]
      }
    });
    if (!otpRecord) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    if (new Date(otpRecord.dateToExpireUtc).getTime() < new Date().getTime()) {
      return { status: 400, message: 'Otp has expired', code: 'E00', data: null };
    }

    if (!comparePassword(params.otp, otpRecord.otp)) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    const savedResult = await prisma.otpModel.update({
      where: {
        id: otpRecord.id
      },
      data: {
        isUsed: true
      }
    });
    const verifyPhoneResult = await prisma.user.update({
      where: {
        id: userRecord.id
      },
      data: {
        isPhonenumberVerified: true
      }
    });

    if (!verifyPhoneResult) {
      return {
        status: 400,
        message: 'Error completing this action. Kindly try again',
        code: 'E00',
        data: null
      };
    }

    let otpCode = '12345'; // Math.floor(10000 + Math.random() * 90000).toString();
    const emailotpRecord = new Otp(otpCode, userRecord.email, OtpTypes.ONBOARDING);
    const emailOtpSentResult = await prisma.otpModel.create({
      data: emailotpRecord.toJSON()
    });

    logger.info('sending email');
    // const sendingEmailResponse = await sendEmail(
    //   userEmail,
    //   'Oriz Health - Onboarding Otp',
    //   `Use the Otp ${otpCode}`
    // );

    return {
      status: 200,
      message: `User account created and OTP has been sent to ${userRecord.email}`,
      code: 'S00',
      data: { otpHeader: emailotpRecord.otpHeader, otp: otpCode, otpType: OtpTypes.ONBOARDING }
    };
  } catch (error) {
    logger.error(`Error occured while creating user ${error}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function setProfileUserName(params) {
  user = await prisma.user.findFirst({
    where: {
      username: params.username
    }
  });
  if (!user) {
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId
      },
      data: {
        username: params.username,
        inviteid: generateReferalLink(),
        lastaction: 'SET USERNAME',
        dateupdatedutc: getCurrentDateUtc()
      }
    });
    return {
      status: 200,
      message: 'Username has been successfully set',
      code: 'S00',
      data: { token: params.token }
    };
  }
  return { status: 400, message: 'Username already exists', code: 'E00', data: null };
}

module.exports = {
  createProfile,
  verifyProfilePhonenumber,
  verifyProfileEmail,
  setProfileUserName
};
