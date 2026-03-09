const multer = require('multer');
const pdf = require("pdf-parse");
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadResume = [
  upload.single('resume'),
  async (req, res) => {
    try {
      console.log('[UPLOAD] Request user ID:', req.user?._id?.toString());

      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const filePath = req.file.path;
      const dataBuffer = fs.readFileSync(filePath);

      const data = await pdf(dataBuffer);   // ✅ correct

      const parsedText = data.text.trim();

      console.log('[UPLOAD] Parsed text length:', parsedText.length);

      const user = await User.findById(req.user._id);
      if (!user) {
        fs.unlinkSync(filePath);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('[UPLOAD] User found:', user._id.toString());

      const Resume = require('../models/Resume');
      const newResume = new Resume({
        userId: user._id,
        filePath,
        fileName: req.file.originalname,
        extractedText: parsedText,
      });
      await newResume.save();

      user.resumes.push(newResume._id);
      await user.save();

      console.log('[UPLOAD] Resume saved for user:', user._id.toString());

      res.json({
        message: 'Resume uploaded and parsed successfully',
        parsedTextPreview: parsedText.substring(0, 500) + '...',
        fileName: req.file.originalname,
      });

    } catch (err) {
      console.error('[UPLOAD ERROR]', err.message, err.stack);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ error: 'Failed to process resume: ' + err.message });
    }
  },
];