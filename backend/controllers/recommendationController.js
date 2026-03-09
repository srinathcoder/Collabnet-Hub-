const Job = require('../models/Job');
const User = require('../models/User');

exports.getRecommendations = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Candidates only' });
    }

    const user = await User.findById(req.user._id);
    if (!user?.resume?.parsedText) {
      return res.status(400).json({ error: 'Upload resume for recommendations' });
    }

    const resumeText = user.resume.parsedText.toLowerCase();

    // Get all open jobs
    const jobs = await Job.find({ status: 'open' });

    // Simple score: count how many required skills appear in resume
    const recommended = jobs
      .map((job) => {
        const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
        const matchedCount = jobSkills.filter(skill => resumeText.includes(skill)).length;
        const score = Math.round((matchedCount / (jobSkills.length || 1)) * 100);

        return {
          ...job.toObject(),
          recommendationScore: score,
          matchedSkillsCount: matchedCount,
        };
      })
      .filter(job => job.recommendationScore > 30) // threshold
      .sort((a, b) => b.recommendationScore - a.recommendationScore) // best first
      .slice(0, 5); // top 5

    res.json(recommended);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};