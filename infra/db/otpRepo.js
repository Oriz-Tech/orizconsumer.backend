var config = require('./dbConfig');
const sql = require('mssql');
const {getCurrentDateUtc}  = require('../../common/helpers/dateTimeHelper')

async function executeOtpSqlOperation(operation, params) {
  let result = null;
  try {
    let pool = await sql.connect(config);
    let currentDate = getCurrentDateUtc().toISOString().slice(0, 19).replace('T', ' ');

    switch (operation) {
      case 'addOtp':
        const addOtpQuery = `
            INSERT INTO Otps (otp, email, isUsed, dateCreatedUtc, otpHeader, dateToExpireUtc, otpType)
            VALUES (@otp, @email, @isUsed, @dateCreatedUtc, @otpHeader, @dateToExpireUtc, @otpType);
          `;
        result = await pool
          .request()
          .input('otp', sql.VarChar, params.otp)
          .input('email', sql.VarChar, params.email)
          .input('isUsed', sql.Bit, params.isUsed)
          .input('dateCreatedUtc', sql.DateTime, params.dateCreatedUtc)
          .input('otpHeader', sql.VarChar, params.otpHeader)
          .input('dateToExpireUtc', sql.DateTime, params.dateToExpireUtc)
          .input('otpType', sql.Int, params.otpType)
          .query(addOtpQuery);
        break;

      case 'setToUsed':
        const setToUsedQuery = `
              UPDATE Otps
              SET 
                isUsed = @isUsed,
                dateupdatedutc = @dateupdatedutc
              WHERE email = @email AND otpHeader= @otpHeader AND otpType=@otpType;
            `;
        result = await pool
          .request()
          .input('email', sql.VarChar, params.email)
          .input('otpHeader', sql.VarChar, params.otpHeader)
          .input('otpType', sql.Int, params.otpType)
          .input('isUsed', sql.Bit, 1)
          .input('dateupdatedutc', sql.DateTime, currentDate)
          .query(setToUsedQuery);
        break;

      case 'getOtp':
        const getOtpQuery = `SELECT * FROM Otps WHERE 
          email = @email AND 
          otpHeader= @otpHeader AND 
          otpType=@otpType AND 
          isUsed = 0 AND 
          dateToExpireUtc >= '${currentDate}';`;

        result = await pool
          .request()
          .input('email', sql.VarChar, params.email)
          .input('otpHeader', sql.VarChar, params.otpHeader)
          .input('otpType', sql.Int, params.otpType)
          .query(getOtpQuery);
        break;
    }
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  executeOtpSqlOperation
};
