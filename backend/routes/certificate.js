const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadCertificate } = require('../controllers/certificateController');

router.post('/upload', protect, uploadCertificate);

module.exports = router;