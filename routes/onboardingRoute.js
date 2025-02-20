const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const checkAuthMiddleware = require('../middleware/checkAuthMiddleware');
const authController = require('../controllers/authController')
const recommendationController = require("../controllers/recommendationController");
const subscriptionController = require("../controllers/subscriptionController");
const profileController = require('../controllers/profileController')
const planController = require('../controllers/planController')
const webhookController = require('../controllers/webhookController')

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify/email', onboardingController.verifyEmail);
router.post('/api/onboarding/verify/phone', onboardingController.verifyPhone);
router.post('/api/onboarding/set/username', checkAuthMiddleware, onboardingController.setUserName)

router.post('/api/auth/login', authController.userlogin)

router.post('/api/recommendation/generateplan', checkAuthMiddleware, recommendationController.generatePlan)
router.get('/api/recommendation/plan', checkAuthMiddleware, recommendationController.getAiRecommendation)
router.put('/api/recommendation/plan', checkAuthMiddleware, recommendationController.completePlanItems)

//router.post('/api/subscribe/trial', checkAuthMiddleware, subscriptionController.trialSubscription)
router.get('/api/subscribe/plans', checkAuthMiddleware, subscriptionController.getSubscriptionPlans)
router.post('/api/subscribe/plan', checkAuthMiddleware, subscriptionController.subcribeToAPlan)


router.get('/api/profile', checkAuthMiddleware, profileController.getProfile)
router.put('/api/profile', checkAuthMiddleware, profileController.editProfile)
router.put('/api/profile/changePassword', checkAuthMiddleware, profileController.changeProfilePassword)
router.put('/api/profile/updateLanguageAndTimeZone', checkAuthMiddleware, profileController.updateLanguageAndTZ)

router.get('/api/profile/planSettings', checkAuthMiddleware, planController.getSettings)
router.put('/api/profile/planSettings', checkAuthMiddleware, planController.editSettings)

router.post('/api/webhook', webhookController.logWebhookEvent)



module.exports = router;
