import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const guidanceData = [
  {
    id: 'frontend', title: 'Frontend Development', icon: '💻',
    gradient: 'from-blue-500 to-cyan-400',
    description: 'Crafting beautiful, interactive user interfaces and experiences for the web.',
    skills: ['HTML/CSS/JS', 'React/Vue/Angular', 'State Management', 'Vite/Webpack', 'Tailwind CSS'],
    certifications: ['Meta Front-End Developer', 'FreeCodeCamp Responsive Web Design'],
    tips: ['Master the fundamentals: HTML semantics, CSS Flexbox/Grid, and JS ES6+.', 'Build a strong portfolio of 3-5 high-quality, responsive web apps.', 'Focus on web aesthetics, accessibility (a11y), and performance optimization.'],
    roadmap: [
      { step: 1, title: 'The Basics', desc: 'HTML5, CSS3 (Flex/Grid), and Modern JavaScript (ES6+)' },
      { step: 2, title: 'Version Control', desc: 'Git & GitHub/GitLab for code management' },
      { step: 3, title: 'CSS Frameworks', desc: 'Tailwind CSS, Sass, or Bootstrap' },
      { step: 4, title: 'JavaScript Frameworks', desc: 'React.js (Recommended), Vue, or Angular' },
      { step: 5, title: 'Tools & Build Systems', desc: 'NPM/Yarn, Vite, and Chrome DevTools' },
      { step: 6, title: 'Testing & Deployment', desc: 'Jest, React Testing Library, and Vercel Deployment' }
    ]
  },
  {
    id: 'backend', title: 'Backend Development', icon: '⚙️',
    gradient: 'from-emerald-500 to-green-400',
    description: 'Building robust server-side logic, databases, and APIs that power applications.',
    skills: ['Node.js/Python/Java', 'SQL/NoSQL', 'REST/GraphQL APIs', 'Docker', 'Authentication'],
    certifications: ['AWS Certified Developer', 'MongoDB Node.js Developer Path'],
    tips: ['Understand how the web works (HTTP, DNS, Caching, Load Balancing).', 'Learn relational (PostgreSQL) and NoSQL (MongoDB) databases deeply.', 'Always prioritize database security and efficient API design.'],
    roadmap: [
      { step: 1, title: 'General Setup', desc: 'Learn a language (Node.js/Python) and terminal basics' },
      { step: 2, title: 'Relational Databases', desc: 'PostgreSQL or MySQL - Schema design & SQL' },
      { step: 3, title: 'API Design', desc: 'RESTful principles, Express.js (Node) or FastAPI (Python)' },
      { step: 4, title: 'Authentication', desc: 'JWT, OAuth2, and Middleware patterns' },
      { step: 5, title: 'NoSQL & Caching', desc: 'MongoDB and Redis for performance' },
      { step: 6, title: 'DevOps Basics', desc: 'Docker, CI/CD, and Cloud Deployment (AWS/GCP)' }
    ]
  },
  {
    id: 'fullstack', title: 'Full-Stack Development', icon: '🚀',
    gradient: 'from-purple-500 to-indigo-500',
    description: 'Mastering both frontend and backend to build end-to-end scalable applications.',
    skills: ['MERN/PERN Stack', 'System Design', 'Deployment CI/CD', 'API Integration', 'Cloud Basics'],
    certifications: ['IBM Full Stack Software Developer', 'Udacity Full Stack Developer'],
    tips: ['Don\'t stretch yourself too thin; be strong in one area while competent in the other.', 'Build end-to-end monolithic and microservice apps.', 'Learn deployment on platforms like Vercel, Heroku, or AWS.'],
    roadmap: [
      { step: 1, title: 'Frontend Core', desc: 'HTML, CSS, JS, and a framework (React)' },
      { step: 2, title: 'Backend Core', desc: 'Server logic (Node/Express) and Databases (Mongo)' },
      { step: 3, title: 'Integration', desc: 'Connecting Frontend to Backend via Axios/Fetch' },
      { step: 4, title: 'Infrastructure', desc: 'Authentication, File Storage (S3), and Environments' },
      { step: 5, title: 'Advanced Topics', desc: 'Real-time (Socket.io), System Design, and Scalability' },
      { step: 6, title: 'Full Deployment', desc: 'CI/CD Pipelines and Production Monitoring' }
    ]
  },
  {
    id: 'data-science', title: 'Data Science & Analytics', icon: '📊',
    gradient: 'from-orange-500 to-amber-400',
    description: 'Extracting insights from data using statistics, machine learning, and visualization.',
    skills: ['Python/R', 'Pandas/NumPy', 'SQL', 'Data Visualization (Tableau)', 'Machine Learning Basics'],
    certifications: ['Google Data Analytics', 'IBM Data Science Professional'],
    tips: ['Master SQL; it is the most important skill for extracting raw data.', 'Learn to tell a story with data using Matplotlib, Seaborn, or Tableau.', 'Understand the mathematics behind algorithms before using libraries.'],
    roadmap: [
      { step: 1, title: 'Math & Stats', desc: 'Linear Algebra, Probability, and Statistics foundations' },
      { step: 2, title: 'Python Programming', desc: 'Pandas, NumPy, and Data Wrangling' },
      { step: 3, title: 'Data Extraction', desc: 'SQL (Advanced) and Web Scraping' },
      { step: 4, title: 'Visualization', desc: 'Matplotlib, Seaborn, and Tableau/PowerBI' },
      { step: 5, title: 'ML Foundations', desc: 'Supervised vs Unsupervised learning basics' },
      { step: 6, title: 'Applied Data Science', desc: 'Kaggle projects and Business Communication' }
    ]
  },
  {
    id: 'ml-ai', title: 'AI & Machine Learning', icon: '🧠',
    gradient: 'from-red-500 to-rose-400',
    description: 'Designing and deploying intelligent systems, neural networks, and LLMs.',
    skills: ['PyTorch/TensorFlow', 'NLP/Computer Vision', 'Generative AI', 'Math/Stats', 'MLOps'],
    certifications: ['DeepLearning.AI TensorFlow Developer', 'AWS Certified Machine Learning'],
    tips: ['Build projects using pre-trained models (Hugging Face).', 'Learn to move models from Jupyter notebooks into production via APIs.', 'Stay updated with the latest research papers and open-source models.'],
    roadmap: [
      { step: 1, title: 'AI Mathematics', desc: 'Calculus, Statistics, and Matrix Operations' },
      { step: 2, title: 'Python for AI', desc: 'Advanced NumPy and Scikit-Learn' },
      { step: 3, title: 'Deep Learning', desc: 'Neural Networks, PyTorch, and TensorFlow' },
      { step: 4, title: 'Specializations', desc: 'NLP (LLMs) or Computer Vision' },
      { step: 5, title: 'MLOps', desc: 'Deployment, Monitoring, and Model Versioning' },
      { step: 6, title: 'Cutting Edge', desc: 'Reinforcement Learning and AI Ethics' }
    ]
  },
  {
    id: 'devops', title: 'DevOps & Cloud', icon: '☁️',
    gradient: 'from-sky-500 to-blue-600',
    description: 'Automating software delivery, managing infrastructure, and ensuring uptime.',
    skills: ['Linux/Bash', 'Docker & Kubernetes', 'CI/CD Pipelines', 'AWS/GCP/Azure', 'Terraform (IaC)'],
    certifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Administrator (CKA)'],
    tips: ['Start by containerizing a simple app with Docker.', 'Learn Linux administration and bash scripting inside out.', 'Focus on Infrastructure as Code (IaC) to automate server creations.'],
    roadmap: [
      { step: 1, title: 'Operating Systems', desc: 'Linux (Ubuntu/CentOS) and command line mastery' },
      { step: 2, title: 'Networking & Security', desc: 'SSH, HTTPS, IP protocols, and Firewalls' },
      { step: 3, title: 'Containers', desc: 'Docker (images, compose) and Kubernetes basics' },
      { step: 4, title: 'Infrastructure as Code', desc: 'Terraform, Ansible, or CloudFormation' },
      { step: 5, title: 'CI/CD', desc: 'Jenkins, GitHub Actions, or GitLab CI' },
      { step: 6, title: 'Cloud Mastery', desc: 'AWS/GCP Professional architectural patterns' }
    ]
  }
];

function CareerGuidance() {
  const { domainId } = useParams();
  const navigate = useNavigate();

  // Resume review state
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const handleReviewUpload = async (domain) => {
    if (!reviewFile) return;
    setReviewLoading(true);
    setReviewError(null);
    setReviewResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', reviewFile);
      formData.append('domain', domain);
      const response = await api.post('/resume/domain-review', formData);
      setReviewResult(response.data);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to review resume');
    } finally {
      setReviewLoading(false);
    }
  };

  // Discovery Landing Page
  if (!domainId) {
    return (
      <div className="min-h-screen pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto pt-8">
          <button onClick={() => navigate('/candidate/dashboard')}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </button>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Choose Your <span className="text-gradient">Career Path</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Select a domain to view detailed roadmaps, required skills, and expert tips.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidanceData.map((domain) => (
              <button key={domain.id} onClick={() => navigate(`/candidate/career-guidance/${domain.id}`)}
                className="group glass rounded-3xl p-8 text-left overflow-hidden hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${domain.gradient} shadow-lg`}>{domain.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{domain.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm mb-6">{domain.description}</p>
                <div className="flex items-center text-indigo-400 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                  Get Roadmap
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Domain Specific Page
  const activeData = guidanceData.find(d => d.id === domainId) || guidanceData[0];

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/candidate/career-guidance')}
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          All Domains
        </button>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
          {activeData.title} <span className="text-gradient">Roadmap</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 bg-gradient-to-br ${activeData.gradient} shadow-lg`}>{activeData.icon}</div>
              <p className="text-gray-400 mb-6 italic text-sm leading-relaxed">"{activeData.description}"</p>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Must-Have Skills</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {activeData.skills.map((s, i) => <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20">{s}</span>)}
              </div>
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Top Certifications</h4>
              <div className="space-y-2">
                {activeData.certifications.map((c, i) => <div key={i} className="flex items-start text-sm text-gray-400 bg-white/5 rounded-xl p-3 border border-white/5"><span className="mr-2">✅</span>{c}</div>)}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 glass rounded-2xl p-6">
              <h4 className="text-base font-bold text-indigo-300 mb-5">💡 Expert Tips</h4>
              <div className="space-y-4">
                {activeData.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-indigo-300">{i + 1}</div>
                    <p className="text-sm text-gray-400 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roadmap + Resume Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roadmap */}
            <div className="glass rounded-2xl p-6 md:p-10 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                Step-by-Step Learning Path
                <div className={`h-px flex-1 bg-gradient-to-r ${activeData.gradient} opacity-20`}></div>
              </h3>
              <div className="relative space-y-10">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/5 rounded-full"></div>
                {activeData.roadmap.map((step) => (
                  <div key={step.step} className="relative flex gap-6 group">
                    <div className={`z-10 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br ${activeData.gradient}`}>{step.step}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{step.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Review Section */}
            <div className="glass rounded-2xl p-6 md:p-8 border border-white/5 glow-indigo">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                🔍 AI Resume Review for {activeData.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6">Upload your resume and get personalized feedback on how well it matches this career path.</p>

              <div className="space-y-4">
                <input type="file" accept="application/pdf"
                  onChange={(e) => { setReviewFile(e.target.files[0] || null); setReviewResult(null); setReviewError(null); }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer" />

                <button onClick={() => handleReviewUpload(activeData.id)} disabled={reviewLoading || !reviewFile}
                  className={`btn-primary flex items-center gap-2 ${(reviewLoading || !reviewFile) ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {reviewLoading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Analyzing...</>
                  ) : (
                    <>Review My Resume</>
                  )}
                </button>

                {reviewError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{reviewError}</div>}

                {/* Review Results */}
                {reviewResult && (
                  <div className="space-y-4 mt-4">
                    {/* Score Header */}
                    <div className={`p-5 rounded-2xl border ${
                      reviewResult.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' :
                      reviewResult.score >= 60 ? 'bg-blue-500/10 border-blue-500/20' :
                      reviewResult.score >= 40 ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-white">{reviewResult.domain} Fit</h4>
                          <p className="text-gray-400 text-sm">{reviewResult.summary}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-4xl font-black ${
                            reviewResult.score >= 80 ? 'text-emerald-400' :
                            reviewResult.score >= 60 ? 'text-blue-400' :
                            reviewResult.score >= 40 ? 'text-amber-400' : 'text-red-400'
                          }`}>{reviewResult.score}%</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{reviewResult.rating}</p>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-700 ${
                          reviewResult.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                          reviewResult.score >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                          reviewResult.score >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-rose-400'
                        }`} style={{ width: `${reviewResult.score}%` }}></div>
                      </div>
                    </div>

                    {/* Skills Found */}
                    {reviewResult.found_core_skills?.length > 0 && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <h5 className="text-sm font-bold text-emerald-400 mb-2">✅ Skills Found in Resume</h5>
                        <div className="flex flex-wrap gap-2">
                          {reviewResult.found_core_skills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/20">{s}</span>)}
                          {reviewResult.found_bonus_skills?.map((s, i) => <span key={`b-${i}`} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/20">{s} ⭐</span>)}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {reviewResult.missing_core_skills?.length > 0 && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <h5 className="text-sm font-bold text-amber-400 mb-2">⚠️ Missing Core Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {reviewResult.missing_core_skills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/20">{s}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {reviewResult.strengths?.length > 0 && (
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h5 className="text-sm font-bold text-emerald-400 mb-3">💪 Strengths</h5>
                        <ul className="space-y-2">
                          {reviewResult.strengths.map((s, i) => <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">●</span>{s}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {reviewResult.improvements?.length > 0 && (
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h5 className="text-sm font-bold text-amber-400 mb-3">📈 How to Improve</h5>
                        <ul className="space-y-2">
                          {reviewResult.improvements.map((s, i) => <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><span className="text-amber-400 mt-0.5">→</span>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerGuidance;
