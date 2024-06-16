const { registerUser } = require('../services/onboardingService')
const { User } = require('../models/userModel')
const logger = require('../config/loggerConfig')

const register = async (req, res) => {
    try {
        const result = await registerUser(null)
        res.status(result.status).json(result)
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
}


// Export of all methods as object 
module.exports = {
    register,
}