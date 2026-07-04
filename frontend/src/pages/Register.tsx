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
    <div className="min-h-screen flex items-center justify-center bg-transparent space-grid-bg px-4 py-12 relative overflow-hidden">
      {/* Sci-Fi Glows */}
      <div className="bg-glow-purple top-[-200px] left-[-200px] pulse-glow"></div>
      <div className="bg-glow-cyan bottom-[-200px] right-[-200px] pulse-glow" style={{ animationDelay: '2.5s' }}></div>

      <div className="w-full max-w-lg glass-vision p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-3xl shadow-xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create an Account</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Join the SRGEC Digital Campus Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
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
                className="w-full glass-input pl-11"
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
                  className="w-full glass-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Campus Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full glass-input focus:bg-[var(--bg-secondary)]"
                >
                  <option value="student" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Student</option>
                  <option value="faculty" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Faculty Mentor</option>
                  <option value="club_coordinator" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Club Coordinator</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-glass)] pt-4 my-2">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Academic Affiliation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Department / Branch
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass-input"
                >
                  <option value="CSE" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Computer Science (CSE)</option>
                  <option value="IT" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Information Technology (IT)</option>
                  <option value="ECE" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Electronics & Comm (ECE)</option>
                  <option value="EEE" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Electrical & Electronics (EEE)</option>
                  <option value="ME" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Mechanical Engineering (ME)</option>
                  <option value="CE" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Civil Engineering (CE)</option>
                  <option value="AIDS" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">AI & Data Science (AI&DS)</option>
                </select>
              </div>

              {role !== 'faculty' ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="22481A0501"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full glass-input pl-10"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Faculty ID / Username
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="e.g. kiran or F102"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="w-full glass-input pl-10"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {role !== 'faculty' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full glass-input"
                  >
                    <option value={1} className="bg-[var(--bg-secondary)]">1st Year</option>
                    <option value={2} className="bg-[var(--bg-secondary)]">2nd Year</option>
                    <option value={3} className="bg-[var(--bg-secondary)]">3rd Year</option>
                    <option value={4} className="bg-[var(--bg-secondary)]">4th Year</option>
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
                    <option value={1} className="bg-[var(--bg-secondary)]">1st Semester</option>
                    <option value={2} className="bg-[var(--bg-secondary)]">2nd Semester</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
          <Link to="/login" className="text-violet-400 font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
