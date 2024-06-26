const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const checkAuthMiddleware = require('../middleware/checkAuthMiddleware');
const authController = require('../controllers/authController')

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify/email', onboardingController.verifyEmail);
router.post('/api/onboarding/verify/phone', onboardingController.verifyPhone);
router.post('/api/onboarding/set/username', checkAuthMiddleware, onboardingController.setUserName)

router.post('/api/auth/login', authController.userlogin)


module.exports = router;
