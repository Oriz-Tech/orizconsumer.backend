const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

router.post('/api/onboarding/profile', onboardingController.profile);

module.exports = router;
