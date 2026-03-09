import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

function RecruiterDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', requiredSkills: '', experienceRequired: '' });
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(null);
  const [applicantsLoading, setApplicantsLoading] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});

  useEffect(() => { api.get('/jobs').then(r => setJobs(r.data || [])).catch(console.error).finally(() => setLoadingJobs(false)); }, []);
  useEffect(() => { if (jobs.length) jobs.forEach((j) => fetchApplicants(j._id)); }, [jobs]);

  const fetchApplicants = async (jobId) => {
    try {
      setApplicantsLoading((p) => ({ ...p, [jobId]: true }));
      const res = await api.get(`/applications/job/${jobId}/applicants`);
      setJobs((p) => p.map((j) => (j._id === jobId ? { ...j, applicants: res.data || [] } : j)));
    } catch (err) { console.error(err); }
    finally { setApplicantsLoading((p) => ({ ...p, [jobId]: false })); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostLoading(true); setPostError(null); setPostSuccess(null);
    try {
      const skillsArray = formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
      const response = await api.post('/jobs', { ...formData, requiredSkills: skillsArray });
      setJobs([response.data, ...jobs]);
      setPostSuccess('Job posted successfully!');
      setFormData({ title: '', description: '', requiredSkills: '', experienceRequired: '' });
    } catch (err) { setPostError(err.response?.data?.error || 'Failed to post job'); }
    finally { setPostLoading(false); }
  };

  const handleStatusUpdate = async (applicationId, newStatus, jobId) => {
    if (!window.confirm(`Set status to "${newStatus}"?`)) return;
    setUpdateLoading((p) => ({ ...p, [applicationId]: true }));
    try { await api.put(`/applications/${applicationId}/status`, { status: newStatus }); fetchApplicants(jobId); }
    catch (err) { alert('Status update failed: ' + (err.response?.data?.error || 'Error')); }
    finally { setUpdateLoading((p) => ({ ...p, [applicationId]: false })); }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">
          Recruiter Dashboard – <span className="text-gradient">{user?.name || 'Recruiter'}</span>
        </h1>

        {/* Post New Job */}
        <div className="card-dark mb-8">
          <h2 className="text-xl font-bold text-white mb-6">📝 Post New Job</h2>
          {postError && <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{postError}</div>}
          {postSuccess && <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">{postSuccess}</div>}
          <form onSubmit={handlePostJob} className="space-y-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" required className="input-dark" />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required rows="4" className="input-dark resize-none" />
            <input name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="Skills (comma separated)" className="input-dark" />
            <input name="experienceRequired" value={formData.experienceRequired} onChange={handleChange} placeholder="Experience Required" className="input-dark" />
            <button type="submit" disabled={postLoading} className={`btn-primary ${postLoading ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {postLoading ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>

        {/* Posted Jobs */}
        <div className="card-dark">
          <h2 className="text-xl font-bold text-white mb-6">📋 Your Posted Jobs ({jobs.length})</h2>
          {loadingJobs ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div></div>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No jobs posted yet.</p>
          ) : (
            <div className="space-y-8">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 glass-light rounded-2xl">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20 uppercase">{job.status}</span>
                  </div>
                  <p className="mt-2 text-gray-400 text-sm">{job.description}</p>
                  {job.requiredSkills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requiredSkills.map((s) => <span key={s} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/20">{s}</span>)}
                    </div>
                  )}

                  {/* Applicants */}
                  <div className="mt-6">
                    <h4 className="text-base font-semibold text-gray-300 mb-3 flex items-center justify-between">
                      Applicants ({job.applicants?.length || 0})
                      {applicantsLoading[job._id] && <span className="text-xs text-gray-500 animate-pulse">Loading...</span>}
                    </h4>
                    {!job.applicants || job.applicants.length === 0 ? (
                      <p className="text-gray-500 text-sm">No applications yet</p>
                    ) : (
                      <div className="space-y-3">
                        {job.applicants.map((app, index) => (
                          <div key={app._id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[.07] transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-lg text-xs">#{index + 1}</span>
                                  <p className="font-semibold text-white">{app.candidateId?.name || 'Candidate'}</p>
                                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                    app.resumeScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    app.resumeScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}>{app.resumeScore || 0}% Match</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <p>{app.candidateId?.email}</p>
                                  {app.resumeFileUrl && (
                                    <a href={app.resumeFileUrl} target="_blank" rel="noopener noreferrer"
                                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg text-xs border border-indigo-500/20">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                      Resume
                                    </a>
                                  )}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                app.status === 'applied' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                                app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>{app.status}</span>
                            </div>

                            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-500 max-h-32 overflow-y-auto whitespace-pre-wrap">
                              <p className="font-semibold text-gray-400 mb-1">Resume Preview:</p>
                              {app.candidateResumePreview || 'No resume text available'}
                            </div>

                            {app.status === 'applied' && (
                              <div className="mt-3 flex gap-2">
                                <button onClick={() => handleStatusUpdate(app._id, 'shortlisted', job._id)} disabled={updateLoading[app._id]}
                                  className="btn-success text-xs !px-4 !py-1.5">
                                  {updateLoading[app._id] ? '...' : 'Shortlist'}
                                </button>
                                <button onClick={() => handleStatusUpdate(app._id, 'rejected', job._id)} disabled={updateLoading[app._id]}
                                  className="btn-danger text-xs !px-4 !py-1.5">
                                  {updateLoading[app._id] ? '...' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;