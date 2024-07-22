const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const checkAuthMiddleware = require('../middleware/checkAuthMiddleware');
const authController = require('../controllers/authController')
const recommendationController = require("../controllers/recommendationController");
const subscriptionController = require("../controllers/subscriptionController");
const profileController = require('../controllers/profileController')

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify/email', onboardingController.verifyEmail);
router.post('/api/onboarding/verify/phone', onboardingController.verifyPhone);
router.post('/api/onboarding/set/username', checkAuthMiddleware, onboardingController.setUserName)

router.post('/api/auth/login', authController.userlogin)

router.post('/api/recommendation/generateplan', checkAuthMiddleware, recommendationController.generatePlan)

router.post('/api/subscribe/trial', checkAuthMiddleware, subscriptionController.trialSubscription)

router.get('/api/profile', checkAuthMiddleware, profileController.getProfile)
router.put('/api/profile', checkAuthMiddleware, profileController.editProfile)
router.post('/api/profile/changePassword', checkAuthMiddleware, profileController.changeProfilePassword)

module.exports = router;
