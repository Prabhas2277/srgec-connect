import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Cpu,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const PlacementPortal: React.FC = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Eligibility Checker State
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
  const [cgpa, setCgpa] = useState('7.5');
  const [backlogs, setBacklogs] = useState('0');
  const [branch, setBranch] = useState('CSE');
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Resume Analyzer State
  const [resumeText, setResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Placement Drive Creation State
  const [showCreate, setShowCreate] = useState(() => {
    return new URLSearchParams(window.location.search).get('create') === 'true';
  });
  const [company, setCompany] = useState('');
  const [roleName, setRoleName] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [packageVal, setPackageVal] = useState('');
  const [minCgpa, setMinCgpa] = useState('6.0');
  const [maxBacklogsVal, setMaxBacklogsVal] = useState('0');
  const [branchesVal, setBranchesVal] = useState('CSE, IT, ECE');
  const [deadlineVal, setDeadlineVal] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchJobs = async () => {
    try {
      const data = await apiFetch('/placements/jobs');
      setJobs(data);
      if (data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateSuccess('');
    setCreateError('');
    try {
      const branchesList = branchesVal.split(',').map((s) => s.trim().toUpperCase()).filter((s) => s !== '');
      await apiFetch('/placements/create', {
        method: 'POST',
        body: JSON.stringify({
          company,
          role: roleName,
          type: jobType,
          package: packageVal,
          min_cgpa: parseFloat(minCgpa),
          max_backlogs: parseInt(maxBacklogsVal),
          eligible_branches: JSON.stringify(branchesList),
          deadline: deadlineVal
        })
      });
      setCreateSuccess('Placement drive successfully posted! +30 XP Awarded.');
      setCompany('');
      setRoleName('');
      setPackageVal('');
      setDeadlineVal('');
      setShowCreate(false);
      fetchJobs();
      refreshUser();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to publish placement drive');
    } finally {
      setCreating(false);
    }
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingEligibility(true);
    setEligibilityResult(null);
    try {
      const data = await apiFetch('/placements/eligibility', {
        method: 'POST',
        body: JSON.stringify({
          job_id: selectedJobId,
          cgpa,
          backlogs,
          branch
        })
      });
      setEligibilityResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setAnalyzingResume(true);
    setAnalysisResult(null);
    try {
      const data = await apiFetch('/placements/ats-check', {
        method: 'POST',
        body: JSON.stringify({ resume_text: resumeText })
      });
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Placement & Career Portal</h2>
          <p className="text-sm text-[var(--text-secondary)]">Check job eligibility, review active drives, and leverage the AI Career Coach.</p>
        </div>
        {user && (user.role === 'faculty' || user.role === 'admin') && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="glass-button text-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Host Placement Drive
          </button>
        )}
      </div>

      {/* CREATE PLACEMENT FORM PANEL */}
      {showCreate && (
        <div className="glass-vision p-6 border-violet-500/30">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-400" />
            Create Placement Drive listing (Host receives +30 XP)
          </h3>

          {createError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {createError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cognizant / TCS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Job Role / Position</label>
                <input
                  type="text"
                  placeholder="e.g. Programmer Analyst Trainee"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Drive Type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full glass-input">
                  <option value="Full Time" className="bg-[var(--bg-secondary)]">Full Time</option>
                  <option value="Internship" className="bg-[var(--bg-secondary)]">Internship</option>
                  <option value="Contract" className="bg-[var(--bg-secondary)]">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Package Details</label>
                <input
                  type="text"
                  placeholder="e.g. 4.5 LPA / 80,000 pm"
                  value={packageVal}
                  onChange={(e) => setPackageVal(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Deadline Date</label>
                <input
                  type="date"
                  value={deadlineVal}
                  onChange={(e) => setDeadlineVal(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Min CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6.0"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Max Backlogs Allowed</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={maxBacklogsVal}
                  onChange={(e) => setMaxBacklogsVal(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Eligible Branches (comma list)</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, IT, ECE"
                  value={branchesVal}
                  onChange={(e) => setBranchesVal(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" disabled={creating} className="glass-button text-xs">
                {creating ? 'Publishing...' : 'Publish Placement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {createSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" />
          {createSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ACTIVE PLACEMENTS LIST */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-violet-400" />
            Active Campus Drives
          </h3>
          
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass-vision p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{job.company}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {job.package}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold">{job.role}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">{job.type}</p>
                </div>
                <div className="border-t border-[var(--border-glass)] pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Min CGPA:</span>
                    <span className="font-semibold">{job.min_cgpa}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Max Backlogs:</span>
                    <span className="font-semibold">{job.max_backlogs}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Deadline:</span>
                    <span className="font-semibold text-red-400">{job.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE COLUMN: ELIGIBILITY CHECKER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-vision p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Company Eligibility Checker
            </h3>

            <form onSubmit={handleCheckEligibility} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Select Placement Drive</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                  className="w-full glass-input"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id} className="bg-[var(--bg-secondary)]">
                      {job.company} - {job.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Your CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 7.8"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Active Backlogs</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Your Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full glass-input">
                  <option value="CSE" className="bg-[var(--bg-secondary)]">CSE</option>
                  <option value="IT" className="bg-[var(--bg-secondary)]">IT</option>
                  <option value="ECE" className="bg-[var(--bg-secondary)]">ECE</option>
                  <option value="EEE" className="bg-[var(--bg-secondary)]">EEE</option>
                  <option value="ME" className="bg-[var(--bg-secondary)]">ME</option>
                  <option value="CE" className="bg-[var(--bg-secondary)]">CE</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={checkingEligibility}
                  className="w-full glass-button flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkingEligibility ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Evaluate Eligibility'}
                </button>
              </div>
            </form>

            {/* RESULTS VIEW */}
            {eligibilityResult && (
              <div className="mt-5 border-t border-[var(--border-glass)] pt-5">
                {eligibilityResult.eligible ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Congratulations! You are eligible.</h4>
                      <p className="text-xs text-emerald-300/80 mt-1">You meet all academic criteria. Go ahead and submit your application!</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">You are currently ineligible.</h4>
                      <ul className="list-disc list-inside text-xs text-red-300/80 mt-1.5 space-y-0.5">
                        {eligibilityResult.reasons.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI ATS RESUME REVIEWER */}
          <div className="glass-vision p-6 border-cyan-500/20">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400" />
              AI Career Coach & ATS Analyzer
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Paste your resume details (education, skills, projects, experience) below to analyze your ATS match score and construct a learning roadmap.
            </p>

            <form onSubmit={handleAnalyzeResume} className="space-y-4">
              <textarea
                placeholder="Paste resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full glass-input min-h-40 resize-none text-xs"
                required
              />

              <button
                type="submit"
                disabled={analyzingResume || !resumeText.trim()}
                className="glass-button w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                {analyzingResume ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running ATS Analysis...
                  </>
                ) : (
                  'Scan Resume & Generate Career Roadmap'
                )}
              </button>
            </form>

            {analysisResult && (
              <div className="mt-6 border-t border-[var(--border-glass)] pt-6 space-y-6">
                {/* Score Widget */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-white/2 border border-[var(--border-glass)] rounded-2xl">
                  {/* Score circle */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="url(#gradient)" strokeWidth="8" fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * analysisResult.ats_score) / 100}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-xl font-extrabold">{analysisResult.ats_score}%</span>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-base">ATS Compatibility Score</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Your resume has a strong alignment score. Complete the actionable advice points to push the score above 85% for tier-1 companies.
                    </p>
                  </div>
                </div>

                {/* Details strengths/weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Strengths</h4>
                    <ul className="space-y-1.5">
                      {analysisResult.strengths.map((str: string, i: number) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1.5">
                      {analysisResult.improvements.map((imp: string, i: number) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                          <span className="text-amber-400">•</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Roadmap Widget */}
                <div className="glass-vision p-5 bg-gradient-to-tr from-violet-950/20 to-slate-900/10">
                  <h4 className="text-sm font-bold text-violet-400 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-violet-400" />
                    AI Career Roadmap
                  </h4>
                  
                  <div className="relative pl-6 border-l-2 border-violet-500/20 space-y-6">
                    {analysisResult.roadmap.map((step: string, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute left-[-31px] top-0 w-4 h-4 rounded-full bg-violet-600 border-2 border-[var(--bg-primary)] flex items-center justify-center text-[8px] text-white font-bold">
                          {idx + 1}
                        </div>
                        <h5 className="text-xs font-bold text-[var(--text-primary)]">Phase {idx + 1}</h5>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
