/**
 * CollabNet Hub - MongoDB Seed Script
 * Run: node seed.js
 *
 * Creates:
 *  - 1 Admin account
 *  - 3 Recruiters with job posts (3 jobs each)
 *  - 3 Candidate accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');

const MONGO_URI = process.env.MONGO_URI;

// ─── User Accounts ──────────────────────────────────────────────────────────
const usersData = [
  // Admin
  {
    name: 'Admin User',
    email: 'admin@collabnet.com',
    password: 'Admin@123',
    role: 'admin',
  },

  // Recruiters
  {
    name: 'Priya Sharma',
    email: 'priya.recruiter@collabnet.com',
    password: 'Recruiter@123',
    role: 'recruiter',
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.recruiter@collabnet.com',
    password: 'Recruiter@123',
    role: 'recruiter',
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.recruiter@collabnet.com',
    password: 'Recruiter@123',
    role: 'recruiter',
  },

  // Candidates
  {
    name: 'Kiran Patel',
    email: 'kiran.candidate@collabnet.com',
    password: 'Candidate@123',
    role: 'candidate',
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.candidate@collabnet.com',
    password: 'Candidate@123',
    role: 'candidate',
  },
  {
    name: 'Arjun Nair',
    email: 'arjun.candidate@collabnet.com',
    password: 'Candidate@123',
    role: 'candidate',
  },
];

// ─── Job Posts (per recruiter index: 1=Priya, 2=Rohan, 3=Ananya) ────────────
const jobsTemplate = [
  // Priya's jobs
  [
    {
      title: 'Senior React Developer',
      description: 'We are looking for an experienced React developer to join our product team. You will build scalable frontend applications with modern React patterns, work closely with designers and backend engineers, and help shape our UI architecture.',
      requiredSkills: ['React', 'TypeScript', 'Redux', 'REST APIs', 'Git'],
      experienceRequired: '3-5 years',
      status: 'open',
    },
    {
      title: 'Full Stack Engineer – Node.js & React',
      description: 'Join our growing startup to build end-to-end features. You will design RESTful APIs with Node.js/Express, build React UIs, and deploy services on AWS. Startup experience and a passion for shipping fast is a must.',
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
      experienceRequired: '2-4 years',
      status: 'open',
    },
    {
      title: 'UI/UX Designer',
      description: 'We need a creative UI/UX designer to craft beautiful, user-centric interfaces. You will conduct user research, create wireframes and prototypes in Figma, and collaborate with developers to ensure pixel-perfect implementation.',
      requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'CSS'],
      experienceRequired: '2-3 years',
      status: 'open',
    },
  ],
  // Rohan's jobs
  [
    {
      title: 'Data Scientist – ML & Analytics',
      description: 'Looking for a data scientist to build and deploy machine learning models that power our recommendation engine and analytics dashboards. You will work with large datasets, run experiments, and communicate insights to stakeholders.',
      requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'SQL'],
      experienceRequired: '2-5 years',
      status: 'open',
    },
    {
      title: 'DevOps / Cloud Engineer',
      description: 'Own our cloud infrastructure on GCP and automate CI/CD pipelines. You will work with Kubernetes, Terraform, and GitHub Actions to ensure our platform scales reliably and securely.',
      requiredSkills: ['GCP', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
      experienceRequired: '3-6 years',
      status: 'open',
    },
    {
      title: 'Backend Engineer – Python & FastAPI',
      description: 'Build high-performance APIs and microservices using Python and FastAPI. Experience with async programming, PostgreSQL, and Redis is expected. You will design systems that handle millions of requests per day.',
      requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
      experienceRequired: '2-4 years',
      status: 'open',
    },
  ],
  // Ananya's jobs
  [
    {
      title: 'Android Developer – Kotlin',
      description: 'We are building our next-generation mobile app and need an Android developer with deep Kotlin expertise. You will architect features, work with Jetpack Compose, and integrate REST APIs in a collaborative agile environment.',
      requiredSkills: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'REST APIs', 'Git'],
      experienceRequired: '2-4 years',
      status: 'open',
    },
    {
      title: 'Cybersecurity Analyst',
      description: 'Protect our platform and customers by identifying vulnerabilities, conducting penetration tests, and building security tooling. You will work cross-functionally to ensure compliance and incident response readiness.',
      requiredSkills: ['Penetration Testing', 'SIEM', 'Network Security', 'Python', 'Linux'],
      experienceRequired: '3-5 years',
      status: 'open',
    },
    {
      title: 'Product Manager – SaaS',
      description: 'Drive product strategy and roadmap for our SaaS platform. You will work with engineering, design, and sales to define features, prioritize the backlog, and measure success through key metrics. Strong analytical skills required.',
      requiredSkills: ['Product Roadmap', 'Agile', 'JIRA', 'User Stories', 'Data Analysis'],
      experienceRequired: '3-6 years',
      status: 'open',
    },
  ],
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing seeded data (by email)
    const seedEmails = usersData.map((u) => u.email);
    await User.deleteMany({ email: { $in: seedEmails } });
    console.log('🗑  Cleared old seeded users');

    // Create users (pre-save hook will hash passwords)
    const createdUsers = [];
    for (const ud of usersData) {
      const user = await User.create(ud);
      createdUsers.push({ ...ud, _id: user._id });
      console.log(`👤 Created ${ud.role}: ${ud.email}`);
    }

    // Recruiters are indices 1, 2, 3 in createdUsers
    const recruiters = createdUsers.filter((u) => u.role === 'recruiter');

    // Delete existing jobs posted by these recruiters
    const recruiterIds = recruiters.map((r) => r._id);
    await Job.deleteMany({ postedBy: { $in: recruiterIds } });
    console.log('🗑  Cleared old seeded jobs');

    // Create jobs for each recruiter
    for (let i = 0; i < recruiters.length; i++) {
      const recruiter = recruiters[i];
      for (const jobData of jobsTemplate[i]) {
        await Job.create({
          ...jobData,
          postedBy: recruiter._id,
          companyId: recruiter._id,
        });
        console.log(`💼 Created job "${jobData.title}" for ${recruiter.name}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉  SEED COMPLETE – Login Credentials');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👑 ADMIN');
    console.log('   Email   : admin@collabnet.com');
    console.log('   Password: Admin@123');
    console.log('\n🏢 RECRUITERS (each have 3 job posts)');
    console.log('   1. Email   : priya.recruiter@collabnet.com');
    console.log('      Password: Recruiter@123');
    console.log('   2. Email   : rohan.recruiter@collabnet.com');
    console.log('      Password: Recruiter@123');
    console.log('   3. Email   : ananya.recruiter@collabnet.com');
    console.log('      Password: Recruiter@123');
    console.log('\n🎓 CANDIDATES');
    console.log('   1. Email   : kiran.candidate@collabnet.com');
    console.log('      Password: Candidate@123');
    console.log('   2. Email   : sneha.candidate@collabnet.com');
    console.log('      Password: Candidate@123');
    console.log('   3. Email   : arjun.candidate@collabnet.com');
    console.log('      Password: Candidate@123');
    console.log('\n═══════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
