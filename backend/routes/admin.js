const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlatformStats,
  getAllUsers,
  getAllJobs,
} = require('../controllers/adminController');

router.get('/stats', protect, getPlatformStats);
router.get('/users', protect, getAllUsers);
router.get('/jobs', protect, getAllJobs);

module.exports = router;