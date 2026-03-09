const express = require('express');
const router = express.Router();

// Import the controller functions (this was missing!)
const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const { protect } = require('../middleware/auth');

// Candidate applies to a job
router.post('/:jobId/apply', protect, applyToJob);

// Candidate views their own applications
router.get('/my', protect, getMyApplications);

// Recruiter views applicants for a specific job
router.get('/job/:jobId/applicants', protect, getJobApplicants);

// Recruiter updates application status (shortlist/reject/hire)
router.put('/:applicationId/status', protect, updateApplicationStatus);

module.exports = router;