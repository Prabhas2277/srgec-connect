import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Lock, AlertCircle, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const username = identifier.includes('@') ? identifier : `${identifier.trim().toLowerCase()}@srgec.edu.in`;
      const success = await login(username, password);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white border border-[var(--border-glass)] p-8 rounded-xl shadow-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="SRGEC Emblem"
            className="w-14 h-14 mx-auto object-contain bg-white border border-[#E5E7EB] p-1 rounded-2xl shadow-sm mb-4"
          />
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to SRGEC Connect</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Roll Number / Faculty ID
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="e.g. 22481A0502 or kiran"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-slate-600" />
              Remember me
            </label>
            <a href="#forgot" className="hover:text-slate-800 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F2937] hover:bg-black text-white rounded-lg font-bold text-sm py-3 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm mt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-glass)] text-center text-sm text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
