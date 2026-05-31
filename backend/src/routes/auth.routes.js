const express = require('express');
const { googleLogin, getProfile } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/google', googleLogin);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
