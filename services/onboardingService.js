const logger = require('../config/loggerConfig');

const { executeUserSqlOperation } = require('../infra/db/usersRepo.js');
const { executeOtpSqlOperation } = require('../infra/db/otpRepo.js');

const User = require('../models/userModel.js');
const Otp = require('../models/appModels/otpModel.js');

//const sendEmail = require('../external/emailService.js');
const { OtpTypes } = require('../common/enums/appEnums.js');
const { comparePassword, generateToken } = require('../common/helpers/securityHelper.js');

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
      params.password,
      params.email,
      params.phonenumber
    );

    const creationResult = await executeUserSqlOperation('profile', newUser);
    if (creationResult.rowsAffected.length > 0) {
      let otpCode = Math.floor(10000 + Math.random() * 90000).toString();

      // sending email mechanism
      //sendEmail(newUser.email, 'Verify Your Email',`<p>Here is your Otp Code ${otpCode}</p>`);

      const otpRecord = new Otp(otpCode, newUser.email, OtpTypes.ONBOARDING);
      await executeOtpSqlOperation('addOtp', otpRecord);

      return {
        status: 200,
        message: `User account created and OTP has been sent to ${newUser.email}`,
        code: 'S00',
        data: { otpHeader: otpRecord.otpHeader, otp: otpCode, otpType: OtpTypes.ONBOARDING }
      };
    }
  } catch (err) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function verifyProfile(params) {
  try {
    var request = {
      email: params.email,
      otpHeader: params.otpHeader,
      otpType: params.otpType,
      otp: params.otp
    };
    const userRecord = await executeUserSqlOperation('getbyEmail', request)
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
      const creationResult = await executeUserSqlOperation('verify', request);
      if (creationResult.rowsAffected.length > 0) {
        const token = generateToken(userRecord.recordset[0].Id);
        return {
          status: 200,
          message: 'User Account successfully verified',
          code: 'S00',
          data: {token: token}
        };
      }
    }
  } catch (error) {
    logger.error(`Error occured while creating user ${err}`);
    return { status: 500, message: 'Internal server error', code: 'E00', data: null };
  }
}

async function setProfileUserName(params) {
  var request = { userId: params.userId, username: params.username };
  const previousUsernameRecords = await executeUserSqlOperation('getbyUsername', request);
  if(previousUsernameRecords.recordset.length > 0){
    return {status: 400, message:'Username already exists', code: 'E00', data:null}
  }

  const setProfileRecord = await executeUserSqlOperation('setUsername', request);
  if (setProfileRecord.rowsAffected.length > 0) {
    return {
      status: 200,
      message: 'Username has been successfully set',
      code: 'S00',
      data: { token: params.token }
    };
  }
  return { status: 400, message: 'Invalid User details', code: 'S00', data: null };
}

module.exports = {
  createProfile,
  verifyProfile,
  setProfileUserName
};
