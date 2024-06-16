
const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

router.get('/api/onboarding/register', onboardingController.register);

module.exports = router;
