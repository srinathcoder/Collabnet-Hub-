import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CandidateDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeStatus, setResumeStatus] = useState({ loading: false, success: false, error: null, parsedPreview: '', fileName: '' });
  const [certFile, setCertFile] = useState(null);
  const [certStatus, setCertStatus] = useState({ loading: false, success: false, error: null, status: null, reason: '', fileName: '' });
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState({});

  useEffect(() => { api.get('/jobs').then(r => setJobs(r.data || [])).catch(console.error).finally(() => setJobsLoading(false)); }, []);
  useEffect(() => { api.get('/applications/my').then(r => setApplications(r.data || [])).catch(console.error).finally(() => setAppsLoading(false)); }, []);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setResumeFile(file);
      setResumeStatus({ loading: false, success: false, error: null, parsedPreview: '', fileName: file.name });
    } else {
      setResumeStatus({ ...resumeStatus, error: 'Please select a valid PDF file only', fileName: '' });
      setResumeFile(null);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) { setResumeStatus({ ...resumeStatus, error: 'Please select a PDF file first' }); return; }
    setResumeStatus({ ...resumeStatus, loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const response = await api.post('/resume/upload', formData);
      setResumeStatus({ loading: false, success: true, error: null, parsedPreview: response.data.parsedTextPreview || 'Resume parsed successfully', fileName: resumeFile.name });
    } catch (err) {
      setResumeStatus({ loading: false, success: false, error: err.response?.data?.error || 'Upload failed', parsedPreview: '', fileName: resumeFile.name });
    }
  };

  const handleCertChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)) {
      setCertFile(file);
      setCertStatus({ loading: false, success: false, error: null, status: null, reason: '', fileName: file.name });
    } else {
      setCertStatus({ ...certStatus, error: 'Only PDF, JPG, or PNG files allowed', fileName: '' });
      setCertFile(null);
    }
  };

  const handleCertUpload = async () => {
    if (!certFile) { setCertStatus({ ...certStatus, error: 'Please select a file first' }); return; }
    setCertStatus({ ...certStatus, loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('certificate', certFile);
      const response = await api.post('/certificate/upload', formData);
      setCertStatus({ loading: false, success: true, error: null, status: response.data.status, reason: response.data.reason, fileName: certFile.name });
    } catch (err) {
      setCertStatus({ loading: false, success: false, error: err.response?.data?.error || 'Certificate upload failed', status: null, reason: '', fileName: certFile.name });
    }
  };

  const handleApply = async (jobId, title) => {
    setApplyLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      await api.post(`/applications/${jobId}/apply`, { jobId });
      alert(`Successfully applied for ${title}!`);
      const res = await api.get('/applications/my');
      setApplications(res.data || []);
    } catch (err) {
      alert(err.response?.data?.error || `Failed to apply for ${title}`);
    } finally {
      setApplyLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back, <span className="text-gradient">{user?.name || 'Candidate'}</span></h1>
            <p className="text-gray-500 mt-1">Manage your career from one place</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/candidate/resume-builder')} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Build Resume
            </button>
            <button onClick={() => navigate('/candidate/community')} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Community
            </button>
            <button onClick={() => navigate('/candidate/career-guidance')} className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Career Guide
            </button>
          </div>
        </div>

        {/* Career Domains */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Explore Career Domains</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'frontend', name: 'Frontend', icon: '💻' }, { id: 'backend', name: 'Backend', icon: '⚙️' },
              { id: 'fullstack', name: 'Full Stack', icon: '🚀' }, { id: 'data-science', name: 'Data', icon: '📊' },
              { id: 'ml-ai', name: 'AI / ML', icon: '🧠' }, { id: 'devops', name: 'DevOps', icon: '☁️' },
            ].map((d) => (
              <button key={d.id} onClick={() => navigate(`/candidate/career-guidance/${d.id}`)}
                className="glass-light flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/5">
                <span className="text-2xl mb-2">{d.icon}</span>
                <span className="font-semibold text-xs text-gray-300">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div className="card-dark mb-8">
          <h2 className="text-xl font-bold text-white mb-6">📄 Upload Resume</h2>
          <div className="space-y-5">
            <input type="file" accept="application/pdf" onChange={handleResumeChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer" />
            {resumeStatus.fileName && <p className="text-sm text-gray-500">Selected: <strong className="text-gray-300">{resumeStatus.fileName}</strong></p>}
            <button onClick={handleResumeUpload} disabled={resumeStatus.loading || !resumeFile}
              className={`btn-primary ${(resumeStatus.loading || !resumeFile) ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {resumeStatus.loading ? 'Uploading...' : 'Upload Resume'}
            </button>
            {resumeStatus.error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{resumeStatus.error}</div>}
            {resumeStatus.success && (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 font-semibold mb-2">✅ Upload successful!</p>
                <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono border border-white/5">
                  {resumeStatus.parsedPreview || 'No preview available'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Upload */}
        <div className="card-dark mb-8">
          <h2 className="text-xl font-bold text-white mb-6">🏆 Upload Certificate</h2>
          <div className="space-y-5">
            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleCertChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20 cursor-pointer" />
            {certStatus.fileName && <p className="text-sm text-gray-500">Selected: <strong className="text-gray-300">{certStatus.fileName}</strong></p>}
            <button onClick={handleCertUpload} disabled={certStatus.loading || !certFile}
              className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all ${(certStatus.loading || !certFile) ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {certStatus.loading ? 'Uploading...' : 'Upload Certificate'}
            </button>
            {certStatus.error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{certStatus.error}</div>}
            {certStatus.success && (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-400 font-semibold mb-2">✅ Certificate uploaded!</p>
                <p className="text-gray-400 text-sm">Status: <span className="capitalize font-semibold text-gray-200">{certStatus.status}</span></p>
                <p className="text-gray-500 text-sm mt-1">Reason: {certStatus.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Jobs */}
        <div className="card-dark mb-8">
          <h2 className="text-xl font-bold text-white mb-6">💼 Available Jobs</h2>
          {jobsLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div></div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No open jobs right now.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="p-5 glass-light rounded-2xl hover:bg-white/5 transition-all">
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{job.postedBy?.name || "Company"} • {new Date(job.createdAt).toLocaleDateString()}</p>
                  <p className="mt-3 text-gray-400 text-sm">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.requiredSkills?.map((s) => <span key={s} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/20">{s}</span>)}
                  </div>
                  <button onClick={() => handleApply(job._id, job.title)} disabled={applyLoading[job._id]}
                    className={`mt-4 btn-success text-sm ${applyLoading[job._id] ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    {applyLoading[job._id] ? "Applying..." : "Apply Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Applications */}
        <div className="card-dark">
          <h2 className="text-xl font-bold text-white mb-6">📋 My Applications</h2>
          {appsLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div></div>
          ) : applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't applied to any jobs yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app._id} className="p-5 glass-light rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{app.jobId?.title || "Job"}</h3>
                      <p className="text-xs text-gray-500 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                      app.status === "applied" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      app.status === "shortlisted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      app.status === "rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>{app.status}</span>
                  </div>
                  {app.resumeScore !== undefined && (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-sm text-gray-300">Match: <span className="text-gradient font-bold">{app.resumeScore}%</span></p>
                      <p className="text-xs text-gray-500 mt-1">Matched: {app.skillMatch?.matched?.join(", ") || "None"} | Missing: {app.skillMatch?.missing?.join(", ") || "None"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
