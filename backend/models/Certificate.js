const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  verificationStatus: {
    type: String,
    enum: ['verified', 'suspicious', 'tampered', 'pending'],
    default: 'pending'
  },
  ocrText: { type: String },
  reason: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
