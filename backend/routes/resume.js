const express = require('express');
const router = express.Router();
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const axios = require('axios');
const pdf = require('pdf-parse');
const multer = require('multer');

const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', protect, uploadResume);

// Domain-specific resume review
router.post('/domain-review', protect, memUpload.single('resume'), async (req, res) => {
  try {
    const { domain } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    if (!domain) return res.status(400).json({ error: 'Domain is required' });

    // Parse PDF text
    const data = await pdf(req.file.buffer);
    const resumeText = data.text.trim();

    if (!resumeText || resumeText.length < 10) {
      return res.status(400).json({ error: 'Could not extract text from the PDF' });
    }

    // Call AI Service
    const aiServiceUrl = process.env.RESUME_SERVICE_URL || 'http://localhost:8001';
    const aiResponse = await axios.post(`${aiServiceUrl}/domain-review`, {
      resume_text: resumeText,
      domain: domain,
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

    res.json(aiResponse.data);
  } catch (err) {
    console.error('[DOMAIN REVIEW ERROR]', err.message);
    res.status(500).json({ error: 'Failed to review resume: ' + (err.response?.data?.detail || err.message) });
  }
});

module.exports = router;