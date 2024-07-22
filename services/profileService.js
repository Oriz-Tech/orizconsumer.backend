const logger = require('../config/loggerConfig');
const { Prisma, PrismaClient } = require('@prisma/client');
const {
  comparePassword,
  generateToken,
  hashPassword
} = require('../common/helpers/securityHelper.js');
const { password } = require('../infra/db/dbConfig.js');

const prisma = new PrismaClient();

async function getEditUserDetails(params) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.userId
      }
    });
    const response = {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender
    };

    return {
      data: response,
      status: 200,
      message: 'Success',
      code: 'S00'
    };
  } catch (error) {
    logger.info('getEditUserDetails', error);
    return {
      data: null,
      status: 500,
      message: 'Internal Server Error',
      code: 'S00'
    };
  }
}

async function updateEditUserDetails(params) {
  try {
    const previousUserName = await prisma.user.findMany({
      where: {
        username: params.username,
        id: {
          not: params.userId
        }
      }
    });
    if (previousUserName.length > 0) {
      return {
        data: null,
        status: 400,
        message: 'Username already exists',
        code: 'E00'
      };
    }
    const user = await prisma.user.update({
      where: {
        id: params.userId
      },
      data: {
        username: params.username,
        firstname: params.firstname,
        lastname: params.lastname,
        dateOfBirth: new Date(params.dateOfBirth).toISOString(),
        gender: params.gender
      }
    });

    return {
      data: null,
      status: 200,
      message: 'Update successful',
      code: 'S00'
    };
  } catch (error) {
    logger.info('getEditUserDetails', error);
    return {
      data: null,
      status: 500,
      message: 'Internal Server Error',
      code: 'S00'
    };
  }
}

async function changePassword(params) {
  try {
    if (params.currentPassword.trim() == params.newPassword.trim()) {
      return {
        data: null,
        status: 400,
        message: 'New Password cannot be equal to current password',
        code: 'E00'
      };
    }
    const currentUser = await prisma.user.findUnique({
      where: {
        id: params.userId
      }
    });
    if (currentUser == null) {
      return {
        data: null,
        status: 400,
        message: 'User does not exist',
        code: 'S00'
      };
    }

    if (comparePassword(params.currentPassword, currentUser.password)) {
      let newPassword = hashPassword(params.newPassword.trim());
      const user = await prisma.user.update({
        where: {
          id: params.userId
        },
        data: {
          password: newPassword
        }
      });

      return {
        data: null,
        status: 200,
        message: 'Password changed successful',
        code: 'S00'
      };
    } else {
      return {
        data: null,
        status: 400,
        message: 'Wrong password',
        code: 'E00'
      };
    }
  } catch (error) {
    logger.info('changePassword', error);
    return {
      data: null,
      status: 500,
      message: 'Internal Server Error',
      code: 'S00'
    };
  }
}

module.exports = {
  getEditUserDetails,
  updateEditUserDetails,
  changePassword
};
