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
    <div className="min-h-screen flex items-center justify-center bg-transparent space-grid-bg px-4 relative overflow-hidden">
      {/* Sci-Fi Glows */}
      <div className="bg-glow-purple top-[-200px] left-[-200px] pulse-glow"></div>
      <div className="bg-glow-cyan bottom-[-200px] right-[-200px] pulse-glow" style={{ animationDelay: '2.5s' }}></div>

      <div className="w-full max-w-md glass-vision p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-3xl shadow-xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to SRGEC Connect</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">AI-Powered Digital Campus Ecosystem</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
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
                className="w-full glass-input pl-11"
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
                className="w-full glass-input pl-11"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded accent-violet-500" />
              Remember me
            </label>
            <a href="#forgot" className="hover:text-violet-400 transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
          <Link to="/register" className="text-violet-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
