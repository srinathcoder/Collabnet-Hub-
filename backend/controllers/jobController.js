const Job = require('../models/Job');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can post jobs' });
    }

    const job = new Job({
      ...req.body,
      postedBy: req.user._id,
      companyId: req.user._id,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('postedBy', 'name company');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};