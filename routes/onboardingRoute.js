const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

router.post('/api/onboarding/profile', onboardingController.profile);
router.post('/api/onboarding/verify', onboardingController.verify);

module.exports = router;
