import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  FileText,
  CheckCircle,
  ShieldCheck,
  Edit2,
  Trophy,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Profile: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  
  // Forms States
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [rollNumber, setRollNumber] = useState(user?.roll_number || '');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [year, setYear] = useState(user?.year || 3);
  const [semester, setSemester] = useState(user?.semester || 1);
  const [skillsStr, setSkillsStr] = useState(() => {
    try {
      const arr = JSON.parse(user?.skills || '[]');
      return arr.join(', ');
    } catch {
      return '';
    }
  });

  const [projectsStr, setProjectsStr] = useState(() => {
    try {
      const arr = JSON.parse(user?.projects_info || '[]');
      return JSON.stringify(arr, null, 2);
    } catch {
      return '[]';
    }
  });

  const [certsStr, setCertsStr] = useState(() => {
    try {
      const arr = JSON.parse(user?.certifications || '[]');
      return JSON.stringify(arr, null, 2);
    } catch {
      return '[]';
    }
  });

  const [socialsStr, setSocialsStr] = useState(() => {
    try {
      const obj = JSON.parse(user?.social_links || '{}');
      return JSON.stringify(obj, null, 2);
    } catch {
      return '{}';
    }
  });

  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url || '');
  const [resumeUrl, setResumeUrl] = useState(user?.resume_url || '');

  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = skillsStr.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      
      let parsedProjects = [];
      try { parsedProjects = JSON.parse(projectsStr); } catch { parsedProjects = []; }
      
      let parsedCerts = [];
      try { parsedCerts = JSON.parse(certsStr); } catch { parsedCerts = []; }

      let parsedSocials = {};
      try { parsedSocials = JSON.parse(socialsStr); } catch { parsedSocials = {}; }

      await updateProfile({
        full_name: fullName,
        roll_number: rollNumber || undefined,
        department,
        year,
        semester,
        skills: JSON.stringify(skillsArray),
        projects_info: JSON.stringify(parsedProjects),
        certifications: JSON.stringify(parsedCerts),
        social_links: JSON.stringify(parsedSocials),
        profile_photo_url: photoUrl || undefined,
        resume_url: resumeUrl || undefined
      });

      setSuccess('Profile updated successfully! XP points awarded.');
      setEditing(false);
      refreshUser();
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const currentLevelXP = user.xp % 200;
  const xpPercent = Math.min((currentLevelXP / 200) * 100, 100);

  // Parse arrays for rendering
  let parsedSkills: string[] = [];
  try { parsedSkills = JSON.parse(user.skills || '[]'); } catch {}

  let parsedProjects: any[] = [];
  try { parsedProjects = JSON.parse(user.projects_info || '[]'); } catch {}

  let parsedCerts: string[] = [];
  try { parsedCerts = JSON.parse(user.certifications || '[]'); } catch {}

  let parsedSocials: Record<string, string> = {};
  try { parsedSocials = JSON.parse(user.social_links || '{}'); } catch {}

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER HERO WIDGET */}
      <div className="glass-vision p-6 bg-gradient-to-tr from-violet-950/20 to-slate-900/10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Photo */}
        <div className="relative">
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              className="w-24 h-24 rounded-full object-cover border-4 border-violet-500/30 shadow-xl"
              alt=""
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-violet-500/30 shadow-xl">
              <User className="w-12 h-12 text-violet-400" />
            </div>
          )}
          
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs border-2 border-[var(--bg-primary)]">
            {user.level}
          </div>
        </div>

        {/* Profile Meta Info */}
        <div className="text-center md:text-left flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)] m-0 leading-none">
              {user.full_name}
            </h2>
            <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full self-center">
              {user.role.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            {user.roll_number ? `${user.roll_number} • ` : ''} Department of {user.department || 'SRGEC'}
            {user.year ? ` • Year ${user.year} (Sem ${user.semester})` : ''}
          </p>

          {/* Social Links */}
          <div className="flex gap-3 justify-center md:justify-start pt-1.5">
            <a href={`mailto:${user.email}`} className="text-[var(--text-secondary)] hover:text-violet-400 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            {parsedSocials.github && (
              <a href={parsedSocials.github} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            )}
            {parsedSocials.linkedin && (
              <a href={parsedSocials.linkedin} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {user.resume_url && (
              <a href={user.resume_url} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-violet-400 transition-colors">
                <FileText className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Level metrics summary */}
        <div className="w-full md:w-56 p-4 bg-slate-950/20 border border-[var(--border-glass)] rounded-2xl">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              XP Meter
            </span>
            <span className="font-bold text-violet-400">{user.xp} XP</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${xpPercent}%` }}></div>
          </div>
          <span className="text-[9px] text-[var(--text-secondary)] mt-2 block text-center">
            {200 - currentLevelXP} XP to Level {user.level + 1}
          </span>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="absolute right-4 top-4 p-2 bg-white/5 border border-[var(--border-glass)] rounded-lg hover:bg-white/10 transition-all text-[var(--text-primary)] cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* EDIT FORM DRAWER */}
      {editing ? (
        <div className="glass-vision p-6">
          <h3 className="text-base font-bold mb-4">Edit Profile Fields</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              {user.role !== 'faculty' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full glass-input"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full glass-input">
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              {user.role !== 'faculty' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Year</label>
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full glass-input">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Semester</label>
                    <select value={semester} onChange={(e) => setSemester(parseInt(e.target.value))} className="w-full glass-input">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Skills (Comma-separated)</label>
              <input
                type="text"
                placeholder="Python, React, TypeScript, Git"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                className="w-full glass-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Profile Photo URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Resume Drive URL</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/resume"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-violet-400 uppercase mb-1.5">Projects JSON Array</label>
                <textarea
                  value={projectsStr}
                  onChange={(e) => setProjectsStr(e.target.value)}
                  className="w-full glass-input font-mono text-[10px] min-h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1.5">Certifications JSON Array</label>
                <textarea
                  value={certsStr}
                  onChange={(e) => setCertsStr(e.target.value)}
                  className="w-full glass-input font-mono text-[10px] min-h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1.5">Social Links JSON Object</label>
                <textarea
                  value={socialsStr}
                  onChange={(e) => setSocialsStr(e.target.value)}
                  className="w-full glass-input font-mono text-[10px] min-h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="glass-button text-xs">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Skills and credentials */}
          <div className="md:col-span-1 space-y-6">
            {/* Skills */}
            <div className="glass-vision p-5">
              <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsedSkills.map((sk) => (
                  <span key={sk} className="text-[10px] font-semibold text-[var(--text-primary)] bg-white/5 border border-white/10 py-1 px-2.5 rounded-full">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-vision p-5">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Certifications
              </h3>
              <div className="space-y-2">
                {parsedCerts.map((c, i) => (
                  <div key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Projects portfolio */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-vision p-5">
              <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Project Portfolio
              </h3>

              <div className="space-y-4">
                {parsedProjects.map((p, i) => (
                  <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2 text-left">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{p.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{p.description}</p>
                    <div className="text-[10px] text-cyan-400 font-semibold pt-1">
                      Tech Stack: {p.tech}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
