const { registerUser } = require('../services/onboardingService')
const { User } = require('../models/userModel')

const register = async (req, res) => {
    try {
        const result = await registerUser(null)
        console.log('controller', result)
        res.status(result.status).json(result)
    } catch (error) {
        console.error('controller error:', error);
        res.status(error.status || 500).json(error);
    }
}


// Export of all methods as object 
module.exports = {
    register,
}