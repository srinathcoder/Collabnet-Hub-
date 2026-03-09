const express = require('express');
const router = express.Router();
const { createJob, getJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { getRecommendations } = require('../controllers/recommendationController');

router.post('/', protect, createJob);
router.get('/', getJobs);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;