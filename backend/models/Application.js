const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'hired'],
    default: 'applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  resumeScore: Number, // placeholder for AI score later
  skillMatch: {
    matched: [String],
    missing: [String],
  },
});

// Prevent duplicate applications for same job/candidate
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);