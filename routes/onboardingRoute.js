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
const accountv2Controller = require('../controllers/accountv2Controller')

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify/email', onboardingController.verifyEmail);
router.post('/api/onboarding/verify/phone', onboardingController.verifyPhone);
router.post('/api/onboarding/set/username', checkAuthMiddleware, onboardingController.setUserName)

router.post('/api/auth/login', authController.userlogin)

router.post('/api/recommendation/generateplan', checkAuthMiddleware, recommendationController.generatePlan)
router.get('/api/recommendation/plan', checkAuthMiddleware, recommendationController.getAiRecommendation)
router.put('/api/recommendation/plan', checkAuthMiddleware, recommendationController.completePlanItems)

//router.post('/api/subscribe/trial', checkAuthMiddleware, subscriptionController.trialSubscription)
router.get('/api/subscribe/plans', subscriptionController.getSubscriptionPlans)
router.post('/api/subscribe/plan', checkAuthMiddleware, subscriptionController.subcribeToAPlan)
router.delete('/api/subscribe/plan', checkAuthMiddleware, subscriptionController.cancelAPlan)


router.get('/api/profile', checkAuthMiddleware, profileController.getProfile)
router.put('/api/profile', checkAuthMiddleware, profileController.editProfile)
router.put('/api/profile/changePassword', checkAuthMiddleware, profileController.changeProfilePassword)
router.put('/api/profile/updateLanguageAndTimeZone', checkAuthMiddleware, profileController.updateLanguageAndTZ)

router.get('/api/profile/planSettings', checkAuthMiddleware, planController.getSettings)
router.put('/api/profile/planSettings', checkAuthMiddleware, planController.editSettings)

router.post('/api/webhook', webhookController.logWebhookEvent)

router.post('/api/account/check', accountv2Controller.checkIdentifier);
router.post('/api/account/verify/email', accountv2Controller.verifyEmail);
router.post('/api/account/verify/phonenumber', accountv2Controller.verifyPhoneNumber);
router.post('/api/account/profile', accountv2Controller.createProfileEndpoint);
router.post('/api/account/details', checkAuthMiddleware, accountv2Controller.updateDetails);


module.exports = router;
