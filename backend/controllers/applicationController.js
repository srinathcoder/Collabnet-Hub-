const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const axios = require("axios");

exports.applyToJob = async (req, res) => {
  try {
    console.log("Apply request by user ID:", req.user?._id); // DEBUG

    if (req.user.role !== "candidate") {
      return res.status(403).json({ error: "Only candidates can apply" });
    }

    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.status !== "open") {
      return res.status(400).json({ error: "Job is closed" });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      jobId,
      candidateId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ error: "Already applied to this job" });
    }

    // Get candidate user and their latest resume
    const user = await User.findById(req.user._id);
    const Resume = require('../models/Resume');
    const latestResume = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });

    console.log(
      "Found user:",
      user?._id,
      "Resume exists:",
      !!latestResume,
      "Parsed text length:",
      latestResume?.extractedText?.length || 0,
    ); // DEBUG

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!latestResume || !latestResume.extractedText) {
      return res.status(400).json({ error: "Please upload your resume first" });
    }

    const resumeText = latestResume.extractedText;
    const jobDesc =
      job.description + " " + (job.requiredSkills || []).join(" ");

    let score = 0;
    let matchedSkills = [];
    let missingSkills = [];

    try {
      const aiResponse = await axios.post(
        "http://localhost:8001/analyze",
        {
          resume: resumeText,
          job_description: jobDesc,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        },
      );

      const aiData = aiResponse.data;

      score = aiData.score || 0;
      matchedSkills = aiData.matched_skills || [];
      missingSkills = aiData.missing_skills || [];
    } catch (aiErr) {
      console.error("AI resume analysis failed:", aiErr.message);

      // Fallback keyword matching
      const resumeLower = resumeText.toLowerCase();
      const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());

      matchedSkills = jobSkills.filter((skill) => resumeLower.includes(skill));

      missingSkills = jobSkills.filter((skill) => !resumeLower.includes(skill));

      score = Math.round(
        (matchedSkills.length / (jobSkills.length || 1)) * 100,
      );
    }

    // Create application record
    const application = new Application({
      jobId,
      candidateId: req.user._id,
      resumeScore: score,
      skillMatch: {
        matched: matchedSkills,
        missing: missingSkills,
      },
    });

    await application.save();

    res.status(201).json({
      message: "Applied successfully",
      applicationId: application._id,
      score,
      matchedSkills,
      missingSkills,
      status: application.status,
    });
  } catch (err) {
    console.error("Apply error:", err.message);
    res.status(500).json({ error: "Failed to apply: " + err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res
        .status(403)
        .json({ error: "Only candidates can view their applications" });
    }

    const applications = await Application.find({ candidateId: req.user._id })
      .populate("jobId", "title description requiredSkills postedBy createdAt")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized or job not found" });
    }

    const applications = await Application.find({ jobId })
      .populate("candidateId", "name email")
      .sort({ resumeScore: -1 });

    // Add safe resume preview and file url
    const path = require('path');
    const safeApps = await Promise.all(
      applications.map(async (app) => {
        const Resume = require('../models/Resume');
        const latestResume = await Resume.findOne({ userId: app.candidateId?._id }).sort({ uploadedAt: -1 });
        
        return {
          ...app.toObject(),
          candidateResumePreview: latestResume?.extractedText
            ? latestResume.extractedText.substring(0, 500) + "..."
            : "No resume text available",
          resumeFileUrl: latestResume?.filePath ? `http://localhost:5000/uploads/resumes/${path.basename(latestResume.filePath)}` : null,
          resumeScore: app.resumeScore || 0,
        };
      })
    );

    res.json(safeApps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["shortlisted", "rejected", "hired"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await Application.findById(applicationId);
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const job = await Job.findById(application.jobId);
    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json({
      message: `Application updated to ${status}`,
      application,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
