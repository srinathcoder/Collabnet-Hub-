const axios = require('axios');
const ChatbotLog = require('../models/ChatbotLog');

exports.askChatbot = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Save user message to log
    await ChatbotLog.create({
      userId: req.user._id,
      message,
      sender: 'user'
    });

    // Call AI Service (Python)
    const aiServiceUrl = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8003';
    const aiResponse = await axios.post(`${aiServiceUrl}/chatbot/ask`, {
      message
    });

    const botMessage = aiResponse.data.reply;

    // Save bot response to log
    await ChatbotLog.create({
      userId: req.user._id,
      message: botMessage,
      sender: 'bot'
    });

    res.json({ success: true, reply: botMessage });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI Chatbot' });
  }
};
