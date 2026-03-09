import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";

function AdminDashboard() {
  const auth = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, jobsRes] = await Promise.all([
          api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/jobs"),
        ]);
        setStats(statsRes.data); setUsers(usersRes.data); setJobs(jobsRes.data);
      } catch (err) { setError(err.response?.data?.error || "Failed to load admin data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <h2 className="text-xl font-bold text-red-400">Error</h2>
          <p className="mt-2 text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">
          Admin <span className="text-gradient">Dashboard</span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers || 0, sub: `Candidates: ${stats.totalCandidates || 0} | Recruiters: ${stats.totalRecruiters || 0}`, color: 'from-indigo-500 to-purple-500' },
            { label: 'Total Jobs', value: stats.totalJobs || 0, sub: `Open: ${stats.openJobs || 0}`, color: 'from-emerald-500 to-green-500' },
            { label: 'Applications', value: stats.totalApplications || 0, sub: '', color: 'from-cyan-500 to-blue-500' },
            { label: 'Suspicious Certs', value: `${stats.suspiciousCertificates || 0} / ${stats.tamperedCertificates || 0}`, sub: 'suspicious / tampered', color: 'from-red-500 to-rose-500' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
              <p className="text-sm text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>{s.value}</p>
              {s.sub && <p className="text-xs text-gray-500 mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="card-dark mb-8 overflow-hidden !p-0">
          <h2 className="text-lg font-bold text-white p-6 border-b border-white/5">👥 All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[.03] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20 uppercase">{u.role}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="card-dark overflow-hidden !p-0">
          <h2 className="text-lg font-bold text-white p-6 border-b border-white/5">💼 All Jobs ({jobs.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Posted By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b border-white/5 hover:bg-white/[.03] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{job.postedBy?.name || "Unknown"}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/20 uppercase">{job.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
