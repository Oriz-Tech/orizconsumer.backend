var  config = require('./dbConfig');
const  sql = require('mssql');

async function executeUserSqlOperation(operation, params){
  let result = null
  try {
    let  pool = await  sql.connect(config);
    switch (operation) {
      case 'insert':
        const insertQuery = `
            INSERT INTO Users (username, firstname, lastname, password, email, datecreatedutc, lastaction, dateupdatedutc)
            VALUES (@username, @firstname, @lastname, @password, @email,
                   @datecreatedutc, @lastaction, @dateupdatedutc);
          `;
          result = await pool.request()
            .input('username', sql.VarChar, params.username)
            .input('firstname', sql.VarChar, params.firstname)
            .input('lastname', sql.VarChar, params.lastname)
            .input('password', sql.VarChar, params.password)
            .input('email', sql.VarChar, params.email)
            .input('datecreatedutc', sql.DateTime, params.datecreatedutc)
            .input('lastaction', sql.DateTime, params.lastaction)
            .input('dateupdatedutc', sql.DateTime, params.dateupdatedutc)
            .query(insertQuery);
          break;
    }
  } catch (error) {
    console.log(error);
    return result;
  }
}

module.exports = {
  executeUserSqlOperation
}

// const { sql} = require('./indexDb.js');
// const {pool} = require('../app.js')
// const User = require('../models/userModel.js');

// async function executeUserSqlOperation(operation, params) {
//     let result;
//     try {
//       switch (operation) {
//         case 'insert':
//           // Example params: { username, firstname, lastname, password, email, datecreatedutc, lastaction, dateupdatedutc }
//           const insertQuery = `
//             INSERT INTO Users (username, firstname, lastname, password, email, datecreatedutc, lastaction, dateupdatedutc)
//             VALUES (@username, @firstname, @lastname, @password, @email,
//                    @datecreatedutc, @lastaction, @dateupdatedutc);
//           `;
//           result = await pool.request()
//             .input('username', sql.VarChar, params.username)
//             .input('firstname', sql.VarChar, params.firstname)
//             .input('lastname', sql.VarChar, params.lastname)
//             .input('password', sql.VarChar, params.password)
//             .input('email', sql.VarChar, params.email)
//             .input('datecreatedutc', sql.DateTime, params.datecreatedutc)
//             .input('lastaction', sql.DateTime, params.lastaction)
//             .input('dateupdatedutc', sql.DateTime, params.dateupdatedutc)
//             .query(insertQuery);
//           break;
  
//         case 'update':
//           // Example params: { username, firstname, lastname, password, email, lastaction, dateupdatedutc }
//           const updateQuery = `
//             UPDATE Users
//             SET firstname = @firstname,
//                 lastname = @lastname,
//                 password = @password,
//                 email = @email,
//                 lastaction = @lastaction,
//                 dateupdatedutc = @dateupdatedutc
//             WHERE username = @username;
//           `;
//           result = await pool.request()
//             .input('username', sql.VarChar, params.username)
//             .input('firstname', sql.VarChar, params.firstname)
//             .input('lastname', sql.VarChar, params.lastname)
//             .input('password', sql.VarChar, params.password)
//             .input('email', sql.VarChar, params.email)
//             .input('lastaction', sql.DateTime, params.lastaction)
//             .input('dateupdatedutc', sql.DateTime, params.dateupdatedutc)
//             .query(updateQuery);
//           break;
  
//         case 'select':
//           // Example params: { username }
//           const selectQuery = `
//             SELECT * FROM Users
//             WHERE username = @username;
//           `;
//           result = await pool.request()
//             .input('username', sql.VarChar, params.username)
//             .query(selectQuery);
//           break;
  
//         case 'delete':
//           // Example params: { username }
//           const deleteQuery = `
//             DELETE FROM Users
//             WHERE username = @username;
//           `;
//           result = await pool.request()
//             .input('username', sql.VarChar, params.username)
//             .query(deleteQuery);
//           break;
  
//         default:
//           throw new Error('Unsupported operation');
//       }
  
//       return result;
  
//     } catch (error) {
//       throw new Error(`Error executing SQL operation (${operation}): ${error.message}`);
//     }
//   }

// module.exports={
//     executeUserSqlOperation
// }

// Example usage:

// async function exampleUsage() {
//   try {
//     // Initialize the database connection pool
//     await initDatabasePool();

//     // Example 1: Insert a user
//     const newUserParams = {
//       username: 'john_doe',
//       firstname: 'John',
//       lastname: 'Doe',
//       password: 'hashedPassword123',
//       email: 'john.doe@example.com',
//       datecreatedutc: new Date(),
//       lastaction: new Date(),
//       dateupdatedutc: new Date()
//     };
//     const insertResult = await executeSqlOperation('insert', newUserParams);
//     console.log('User inserted:', insertResult);

//     // Example 2: Select a user
//     const selectUserParams = {
//       username: 'john_doe'
//     };
//     const selectResult = await executeSqlOperation('select', selectUserParams);
//     console.log('Selected user:', selectResult.recordset);

//     // Example 3: Update a user
//     const updateUserParams = {
//       username: 'john_doe',
//       firstname: 'UpdatedJohn',
//       lastname: 'UpdatedDoe',
//       password: 'updatedHashedPassword123',
//       email: 'john.doe.updated@example.com',
//       lastaction: new Date(),
//       dateupdatedutc: new Date()
//     };
//     const updateResult = await executeSqlOperation('update', updateUserParams);
//     console.log('User updated:', updateResult);

//     // Example 4: Delete a user
//     const deleteUserParams = {
//       username: 'john_doe'
//     };
//     const deleteResult = await executeSqlOperation('delete', deleteUserParams);
//     console.log('User deleted:', deleteResult);

//     // Close the database connection pool
//     await closeDatabasePool();

//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }