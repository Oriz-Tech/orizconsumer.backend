const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const checkAuthMiddleware = require('../middleware/checkAuthMiddleware');
const authController = require('../controllers/authController')

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify', onboardingController.verify);
router.post('/api/onboarding/setusername', checkAuthMiddleware, onboardingController.setUserName)

router.post('/api/auth/login', authController.userlogin)


module.exports = router;
