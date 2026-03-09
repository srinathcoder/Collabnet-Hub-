const mongoose = require('mongoose');

const chatbotLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatbotLog', chatbotLogSchema);
