import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(register(formData)).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full card-dark">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
            C
          </div>
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="text-gray-500 mt-1 text-sm">Join CollabNet as a candidate or recruiter</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-6 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
            <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
              className="input-dark" placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange}
              className="input-dark" placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
              className="input-dark" placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1.5">I want to join as</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}
              className="input-dark cursor-pointer"
            >
              <option value="candidate" className="bg-gray-900">Candidate (Job Seeker)</option>
              <option value="recruiter" className="bg-gray-900">Recruiter (Company)</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading}
            className={`w-full btn-primary !py-3.5 text-base ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;