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

async function createProfile(params) {
  try {
    let previousUser = await executeUserSqlOperation('getbyEmailOrPhonenumber', {
      email: params.email,
      phonenumber: params.phonenumber
    });
    logger.info(`previoususer details ${previousUser}`);

    if (previousUser.recordset.length > 0) {
      return {
        status: 400,
        message: 'An account with the email (or phonenumber) already exists',
        code: 'E00',
        data: null
      };
    }
    const newUser = new User();
    newUser.profile(
      params.firstname,
      params.lastname,
      params.password.trim(),
      params.email.trim(),
      params.phonenumber.trim()
    );

    const creationResult = await executeUserSqlOperation('profile', newUser);
    if (creationResult.rowsAffected.length > 0) {
      let otpCode ='12345'// Math.floor(10000 + Math.random() * 90000).toString();
      const otpRecord = new Otp(otpCode, newUser.phonenumber, OtpTypes.ONBOARDING);
      await executeOtpSqlOperation('addOtp', otpRecord);
      console.log('sending otp to phonenumber')
      const response = await sendSMS(newUser.phonenumber, `otp to for onboarding ${otpCode}`)
      console.log('response '+ response)
      return {
        status: 200,
        message: `User account created and OTP has been sent to ${newUser.phonenumber}`,
        code: 'S00',
        data: { otpHeader: otpRecord.otpHeader, otp: otpCode, otpType: OtpTypes.ONBOARDING }
      };
    }
  } catch (err) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function verifyProfileEmail(params) {
  try {
    var request = {
      identifier: params.identifier,
      otpHeader: params.otpHeader,
      otpType: params.otpType,
      otp: params.otp
    };
    const userRecord = await executeUserSqlOperation('getbyEmail', { email: params.identifier });
    if (userRecord.recordset.length == 0) {
      return { status: 400, message: 'Invalid user email', code: 'E00', data: null };
    }
    let otpRecords = await executeOtpSqlOperation('getOtp', request);

    if (otpRecords.recordset.length == 0) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    var otpRecord = otpRecords.recordset[0];
    let otpHash = otpRecord.Otp;

    if (!comparePassword(request.otp, otpHash)) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    const updateRequest = await executeOtpSqlOperation('setToUsed', request);
    if (updateRequest.rowsAffected > 0) {
      const creationResult = await executeUserSqlOperation('verifyEmail', {
        email: params.identifier
      });
      if (creationResult.rowsAffected.length > 0) {
        const token = generateToken(userRecord.recordset[0].Id);
        return {
          status: 200,
          message: 'User Account successfully verified',
          code: 'S00',
          data: { token: token }
        };
      }
    }
  } catch (error) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function verifyProfilePhonenumber(params) {
  try {
    var request = {
      identifier: params.identifier,
      otpHeader: params.otpHeader,
      otpType: params.otpType,
      otp: params.otp
    };
    const userRecord = await executeUserSqlOperation('getbyPhone', {
      phonenumber: params.identifier
    });
    if (userRecord.recordset.length == 0) {
      return { status: 400, message: 'Invalid user phonenumber', code: 'E00', data: null };
    }
    const userEmail = userRecord.recordset[0].Email;
    let otpRecords = await executeOtpSqlOperation('getOtp', request);

    if (otpRecords.recordset.length == 0) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    var otpRecord = otpRecords.recordset[0];
    let otpHash = otpRecord.Otp;

    if (!comparePassword(request.otp, otpHash)) {
      return { status: 400, message: 'Invalid Otp', code: 'E00', data: null };
    }

    const updateRequest = await executeOtpSqlOperation('setToUsed', request);
    if (updateRequest.rowsAffected > 0) {
      const creationResult = await executeUserSqlOperation('verifyPhone', {
        phonenumber: params.identifier
      });
      if (creationResult.rowsAffected.length > 0) {
        let otpCode ='12345'// Math.floor(10000 + Math.random() * 90000).toString();
        const otpRecord = new Otp(otpCode, userEmail, OtpTypes.ONBOARDING);
        await executeOtpSqlOperation('addOtp', otpRecord);
        
        console.log('sending email')
        const sendingEmailResponse = await sendEmail(userEmail, 'Oriz Health - Onboarding Otp', 
          `Use the Otp ${otpCode}`)
        
        console.log(sendingEmailResponse);

        return {
          status: 200,
          message: `User account created and OTP has been sent to ${userEmail}`,
          code: 'S00',
          data: { otpHeader: otpRecord.otpHeader, otp: otpCode, otpType: OtpTypes.ONBOARDING }
        };
      }
    }
  } catch (error) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function setProfileUserName(params) {
  user = await prisma.user.findFirst({
    where: {
      username: params.username
    }
  });
  if (user == null) {
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
