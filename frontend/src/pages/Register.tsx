import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, RefreshCw, User, Lock, GraduationCap } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'club_coordinator'>('student');
  const [rollNumber, setRollNumber] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const derivedEmail = role === 'faculty'
      ? `${facultyId.trim().toLowerCase()}@srgec.edu.in`
      : `${rollNumber.trim().toLowerCase()}@srgec.edu.in`;

    try {
      const data = {
        email: derivedEmail,
        password,
        full_name: fullName,
        role,
        department,
        ...(role !== 'faculty' ? { roll_number: rollNumber, year, semester } : {})
      };
      
      const success = await registerUser(data);
      if (success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-lg bg-white border border-[var(--border-glass)] p-8 rounded-xl shadow-sm relative z-10">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="SRGEC Emblem"
            className="w-14 h-14 mx-auto object-contain bg-white border border-[#E5E7EB] p-1 rounded-2xl shadow-sm mb-4"
          />
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create an Account</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Join the SRGEC Digital Campus Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full glass-input glass-input-icon"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
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

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Role / Type
              </label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full glass-input"
              >
                <option value="student" className="bg-white">Student</option>
                <option value="faculty" className="bg-white">Faculty Mentor</option>
                <option value="club_coordinator" className="bg-white">Club Coordinator</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role === 'faculty' ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Faculty ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kiran"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 22481A0502"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass-input"
                >
                  <option value="CSE" className="bg-white">CSE</option>
                  <option value="IT" className="bg-white">IT</option>
                  <option value="ECE" className="bg-white">ECE</option>
                  <option value="EEE" className="bg-white">EEE</option>
                  <option value="ME" className="bg-white">ME</option>
                  <option value="CE" className="bg-white">CE</option>
                </select>
              </div>
            </div>

            {role !== 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full glass-input"
                  >
                    <option value={1} className="bg-white">1st Year</option>
                    <option value={2} className="bg-white">2nd Year</option>
                    <option value={3} className="bg-white">3rd Year</option>
                    <option value={4} className="bg-white">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value))}
                    className="w-full glass-input"
                  >
                    <option value={1} className="bg-white">1st Semester</option>
                    <option value={2} className="bg-white">2nd Semester</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F2937] hover:bg-black text-white rounded-lg font-bold text-sm py-3 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer border-none shadow-sm mt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              'Register & Log In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-glass)] text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
