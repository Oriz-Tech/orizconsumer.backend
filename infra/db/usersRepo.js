var config = require('./dbConfig');
const sql = require('mssql');
const { getCurrentDateUtc } = require('../../common/helpers/dateTimeHelper');

async function executeUserSqlOperation(operation, params) {
  let result = null;
  try {
    let pool = await sql.connect(config);
    let currentDate = getCurrentDateUtc().toISOString().slice(0, 19).replace('T', ' ');

    switch (operation) {
      case 'profile':
        const profileQuery = `
            INSERT INTO Users (firstname, lastname, password, email, datecreatedutc, lastaction, dateupdatedutc, phonenumber)
            VALUES (@firstname, @lastname, @password, @email,
                   @datecreatedutc, @lastaction, @dateupdatedutc, @phonenumber);
          `;
        result = await pool
          .request()
          .input('firstname', sql.VarChar, params.firstname)
          .input('lastname', sql.VarChar, params.lastname)
          .input('password', sql.VarChar, params.password)
          .input('email', sql.VarChar, params.email)
          .input('datecreatedutc', sql.DateTime, params.datecreatedutc)
          .input('lastaction', sql.VarChar, params.lastaction)
          .input('dateupdatedutc', sql.DateTime, params.dateupdatedutc)
          .input('phonenumber', sql.VarChar, params.phonenumber)
          .query(profileQuery);
        break;

      case 'verify':
        const verifyQuery = `
              UPDATE Users
              SET isverified = @isverified, 
                  dateupdatedutc = @dateupdatedutc, 
                  lastaction = @lastaction
              WHERE email = @email;
            `;
        result = await pool
          .request()
          .input('email', sql.VarChar, params.email)
          .input('isverified', sql.Bit, 1)
          .input('dateupdatedutc', currentDate)
          .input('lastaction', sql.VarChar, 'VERIFY ACCOUNT')
          .query(verifyQuery);
        break;

      case 'setUsername':
        const setUsernameQuery = `
              UPDATE Users
              SET username = @username, 
                  dateupdatedutc = @dateupdatedutc, 
                  lastaction = @lastaction
              WHERE Id = @id;
            `;
        result = await pool
          .request()
          .input('username', sql.VarChar, params.username)
          .input('dateupdatedutc', currentDate)
          .input('id', sql.Int, params.userId)
          .input('lastaction', sql.VarChar, 'USER SET USERNAME')
          .query(setUsernameQuery);
        break;

      case 'getbyEmail':
        const getbyEmailQuery = `SELECT * FROM Users NOLOCK WHERE email = @email;`;
        result = await pool
          .request()
          .input('email', sql.VarChar, params.email)
          .query(getbyEmailQuery);
        break;

      case 'getbyEmailOrPhonenumber':
        const getbyEmailOrPhonenumberQuery = `SELECT * FROM Users WHERE email = @email OR phonenumber = @phonenumber;`;
        result = await pool
          .request()
          .input('email', sql.VarChar, params.email)
          .input('phonenumber', sql.VarChar, params.phonenumber)
          .query(getbyEmailOrPhonenumberQuery);
        break;

      case 'getbyId':
        const getbyIdQuery = `SELECT * FROM Users NOLOCK WHERE id = @id;`;
        result = await pool.request().input('id', sql.Int, params.userId).query(getbyIdQuery);
        break;

      case 'getbyUsername':
        const getbyUsernameQuery = `SELECT * FROM Users NOLOCK WHERE username = @username;`;
        result = await pool
          .request()
          .input('username', sql.VarChar, params.username)
          .query(getbyUsernameQuery);
        break;
    }
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  executeUserSqlOperation
};
