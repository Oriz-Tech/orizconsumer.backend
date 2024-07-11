var config = require('./dbConfig');
const sql = require('mssql');

async function executeloginhistorySqlOperation(operation, params) {
 let tablename = 'LoginHistory'
  let result = null;
  try {
    let pool = await sql.connect(config);

    switch (operation) {
      case 'addloginHistory':
        const addOtpQuery = `
            INSERT INTO ${tablename} (userEmail, LoginAction, dateCreatedUtc)
            VALUES (@userEmail, @LoginAction, @dateCreatedUtc);
          `;
        result = await pool
          .request()
          .input('userEmail', sql.VarChar, params.userEmail)
          .input('LoginAction', sql.VarChar, params.loginAction)
          .input('dateCreatedUtc', sql.DateTime, params.dateCreatedUtc)
          .query(addOtpQuery);
        break;

    }
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
    executeloginhistorySqlOperation
};
