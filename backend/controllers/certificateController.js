const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

// Multer setup for certificates
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/certificates");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadCertificate = [
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No certificate file uploaded" });
      }

      const filePath = req.file.path;

      const Certificate = require('../models/Certificate');
      const axios = require('axios');
      const FormData = require('form-data');
      
      const user = await User.findById(req.user._id);
      if (!user) {
        fs.unlinkSync(filePath);
        return res.status(404).json({ error: "User not found" });
      }

      // Call Python AI service for certificate validation
      let verificationStatus = "pending";
      let reason = "Analysis failed";
      let ocrText = "";

      try {
        const formData = new FormData();
        formData.append('certificate', fs.createReadStream(filePath));

        const aiServiceUrl = process.env.CERTIFICATE_SERVICE_URL || 'http://localhost:8002';
        const aiResponse = await axios.post(`${aiServiceUrl}/verify`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });

        verificationStatus = aiResponse.data.status;
        reason = aiResponse.data.reason;
        ocrText = aiResponse.data.ocr_text || '';
      } catch (aiError) {
        console.error("AI Service Error:", aiError.message);
        verificationStatus = "suspicious";
        reason = "AI Verification Service Unavailable";
      }

      // Create new Certificate document
      const newCertificate = await Certificate.create({
        userId: user._id,
        filePath,
        fileName: req.file.originalname,
        verificationStatus,
        reason,
        ocrText,
        uploadedAt: new Date(),
      });

      user.certificates = user.certificates || [];
      user.certificates.push(newCertificate._id);

      await user.save();

      res.json({
        message: "Certificate uploaded and analyzed",
        status: verificationStatus,
        reason,
        fileName: req.file.originalname,
      });
    } catch (err) {
      console.error("Certificate upload error:", err);
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Failed to process certificate" });
    }
  },
];
