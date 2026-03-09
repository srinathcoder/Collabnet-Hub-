const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getPlatformStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    const stats = {
      totalUsers: await User.countDocuments(),
      totalCandidates: await User.countDocuments({ role: 'candidate' }),
      totalRecruiters: await User.countDocuments({ role: 'recruiter' }),
      totalJobs: await Job.countDocuments(),
      totalApplications: await Application.countDocuments(),
      openJobs: await Job.countDocuments({ status: 'open' }),
      suspiciousCertificates: await User.countDocuments({
        'certificates.verificationStatus': 'suspicious',
      }),
      tamperedCertificates: await User.countDocuments({
        'certificates.verificationStatus': 'tampered',
      }),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const jobs = await Job.find().populate('postedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};