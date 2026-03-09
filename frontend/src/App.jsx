import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CareerGuidance from "./pages/CareerGuidance";
import Community from "./pages/Community";
import ResumeBuilder from "./pages/ResumeBuilder";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a1a] font-sans relative overflow-hidden">
        {/* Ambient Background Orbs */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]"></div>
          <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <Navbar />
          <ChatbotWidget />
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
                  <div className="animate-float mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-500/30">
                      C
                    </div>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                    <span className="text-white">Collab</span>
                    <span className="text-gradient">Net Hub</span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                    AI-powered recruitment & career guidance platform built for the modern workforce
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="/login"
                      className="btn-primary text-lg !px-10 !py-4"
                    >
                      Login
                    </a>
                    <a
                      href="/signup"
                      className="text-lg px-10 py-4 rounded-xl font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-lg"
                    >
                      Sign Up
                    </a>
                  </div>
                  <div className="mt-16 flex items-center gap-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      AI Resume Screening
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      Certificate Verification
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      Career Guidance
                    </div>
                  </div>
                </div>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
              <Route
                path="/candidate/dashboard"
                element={<CandidateDashboard />}
              />
              <Route
                path="/candidate/career-guidance"
                element={<CareerGuidance />}
              />
              <Route
                path="/candidate/career-guidance/:domainId"
                element={<CareerGuidance />}
              />
              <Route
                path="/candidate/community"
                element={<Community />}
              />
              <Route
                path="/candidate/resume-builder"
                element={<ResumeBuilder />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
              <Route
                path="/recruiter/dashboard"
                element={<RecruiterDashboard />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
