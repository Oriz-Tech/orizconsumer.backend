const { executeUserSqlOperation } = require('../db/usersRepo.js')

async function registerUser(user) {
    try {
        const newUserParams = {
            username: 'john_doe',
            firstname: 'John',
            lastname: 'Doe',
            password: 'hashedPassword123',
            email: 'john.doe@example.com',
            datecreatedutc: new Date(),
            lastaction: new Date(),
            dateupdatedutc: new Date()
        };
        const insertResult = await executeUserSqlOperation('insert', newUserParams);
        console.log('User inserted:', insertResult);
        return {status:200, message: 'User created', code: 'S00'}
    } catch (error) {
        console.error('Error:', error.message);
        return {status:500, message: 'Internal server error', code: 'E00'}
    }
}

module.exports = {
    registerUser, 
}