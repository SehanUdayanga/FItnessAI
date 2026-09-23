import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMsg('Password reset functionality will be available in future updates.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 selection:bg-green-100 selection:text-green-900">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-lg border border-line p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-green-700 text-white shadow-md shadow-green-700/20 mb-2 hover:bg-green-600 transition-colors">
            <Activity className="w-6 h-6" />
          </Link>
          <h1 className="font-sora text-2xl font-bold text-navy-900 tracking-tight">Welcome to FitTrack</h1>
          <p className="text-sm text-slate-500">Sign in to your account to monitor your daily goals</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Notice */}
        {forgotMsg && (
          <div className="bg-green-050 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm text-center">
            {forgotMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@fittrack.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm bg-[#FAFAF8] text-navy-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-green-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm bg-[#FAFAF8] text-navy-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-600 text-white font-sora font-semibold rounded-xl shadow-[0_8px_20px_rgba(31,111,79,0.25)] hover:shadow-[0_12px_26px_rgba(31,111,79,0.32)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Hint */}
        <div className="bg-green-050 p-4 rounded-[14px] border border-green-100 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-navy-900">💡 Demo Account Credentials:</p>
          <p>Email: <span className="font-mono font-bold text-green-700">demo@fittrack.com</span></p>
          <p>Password: <span className="font-mono font-bold text-green-700">Demo123</span></p>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm text-slate-500 pt-2 border-t border-line">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-bold text-green-700 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

