const logger = require('../config/loggerConfig');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail, sendSMSVonage } = require('../infra/external/email_sms_service.js');
const Otp = require('../models/appModels/otpModel.js');
const { OtpTypes } = require('../common/enums/appEnums.js');
const { comparePassword, generateToken } = require('../common/helpers/securityHelper.js');
const User = require('../models/userModel.js');

async function checkUser(params) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: params.identifier }, { phonenumber: params.identifier }]
      }
    });

    if (user) {
      return sendOtpEmail(user.email, user.id);
    }
    return {
      status: 200,
      message: 'New user detected',
      code: 'S01',
      data: null
    };
  } catch (error) {
    logger.error(`Error checking user: ${error}`);
    return {
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data
    };
  }
}

async function sendOtpEmail(email, userId) {
  let otpCode = '12345'; // Math.floor(10000 + Math.random() * 90000).toString();
  const emailotpRecord = new Otp(otpCode, email, userId, OtpTypes.ONBOARDING);
  await prisma.otpModel.create({
    data: emailotpRecord.toJSON()
  });

  logger.info('sending email');
  //await sendEmail(email, 'Oriz Health - Otp', `Use the Otp ${otpCode} for Oriz App`);

  return {
    status: 200,
    message: `OTP has been sent to ${email}`,
    code: 'S00',
    data: { otpHeader: emailotpRecord.otpHeader, otp: otpCode }
  };
}

async function verifyOtpSendOrLogin(params, isSend) {
  try {
    const otpRecord = await prisma.otpModel.findFirst({
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

    await prisma.otpModel.update({
      where: {
        id: otpRecord.id
      },
      data: {
        isUsed: true
      }
    });

    const user = await prisma.user.findUnique({
      where: {
        id: otpRecord.userId
      }
    });

    if (isSend) {
      return sendOtpPhonenumber(user.phonenumber, otpRecord.userId);
    } else {
      //login
      const currentUser = await prisma.user.update({
        where: {
          id: otpRecord.userId
        },
        data: {
          point: user.point + 50
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
          hasActiveMealPlan: currentUser.hasActiveMealPlan
        }
      };
    }
  } catch (error) {
    logger.error(`Error checking user: ${error}`);
    return {
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data
    };
  }
}

async function sendOtpPhonenumber(phonenumber, userId) {
  let otpCode = '12345'; // Math.floor(10000 + Math.random() * 90000).toString();
  const emailotpRecord = new Otp(otpCode, phonenumber, userId, OtpTypes.ONBOARDING);
  await prisma.otpModel.create({
    data: emailotpRecord.toJSON()
  });

  logger.info('sending phonenumber');
  //const response = await sendSMSVonage(phonenumber, `Use OTP for Oriz App ${otpCode}`);

  return {
    status: 200,
    message: `OTP has been sent to ${phonenumber}`,
    code: 'S00',
    data: { otpHeader: emailotpRecord.otpHeader, otp: otpCode }
  };
}

async function createProfile(params) {
  try {
    if (
      params.firstname == '' ||
      params.lastname == '' ||
      params.email == '' ||
      params.phonenumber == ''
    ) {
      return {
        status: 400,
        message: 'Invalid request, check your input',
        code: 'E00',
        data: null
      };
    }

    const contact = await prisma.user.findFirst({
      where: {
        OR: [{ email: params.email }, { phonenumber: params.phonenumber }]
      }
    });

    if (contact) {
      return {
        status: 400,
        message: 'User already with email (or phonenumber) already exist',
        code: 'E00',
        data: null
      };
    }

    const newUser = new User();
    newUser.profile(params.firstname, params.lastname, '', params.email, params.phonenumber);

    const createdUser = await prisma.user.create({
      data: newUser.toJSON()
    });

    logger.info(`User account created: ${createdUser.firstname}`);

    return sendOtpEmail(createdUser.email, createdUser.id);
  } catch (error) {
    logger.error(`Error checking user: ${error}`);
    return {
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data
    };
  }
}

async function addDetails(params) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.userId
      }
    });

    if (!user) {
      return {
        status: 400,
        message: 'User not found',
        code: 'E00',
        data: null
      };
    }

    const currentUser = await prisma.user.update({
      where: {
        id: params.userId
      },
      data: {
        dateOfBirth: new Date(params.dateOfBirth).toISOString(),
        gender: params.gender,
        weight: params.weight, 
        height: params.height,
        ethnicity: params.ethnicity,
        point: user.point + 100
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
          hasActiveMealPlan: currentUser.hasActiveMealPlan
        }
      };
    }
  catch (error) {
    logger.error(`Error checking user: ${error}`);
    return {
      status: 500,
      message: 'Sorry, an error occured',
      code: 'E00',
      data
    };
  }
}
module.exports = {
  checkUser,
  verifyOtpSendOrLogin,
  createProfile,
  addDetails
};
