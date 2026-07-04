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
  Plus,
  Calendar,
  DollarSign,
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PlacementPortal: React.FC = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Student Profile State (Editable dynamically via checker form)
  const [studentCgpa, setStudentCgpa] = useState('7.8');
  const [studentBranch, setStudentBranch] = useState('CSE');
  const [studentBacklogs, setStudentBacklogs] = useState('0');

  // Eligibility Checker State
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
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
    if (user) {
      const anyUser = user as any;
      setStudentCgpa(String(anyUser.cgpa || '7.8'));
      setStudentBranch(anyUser.department || 'CSE');
      setStudentBacklogs(String(anyUser.backlogs || '0'));
    }
  }, [user]);

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
          cgpa: studentCgpa,
          backlogs: studentBacklogs,
          branch: studentBranch
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

  // Client-side dynamic eligibility evaluation for individual cards
  const evaluateCardEligibility = (job: any) => {
    const cgpaNum = parseFloat(studentCgpa) || 0;
    const backlogsNum = parseInt(studentBacklogs) || 0;
    const reasons: string[] = [];

    if (cgpaNum < job.min_cgpa) {
      reasons.push(`Requires ${job.min_cgpa} CGPA (You: ${cgpaNum})`);
    }

    if (backlogsNum > job.max_backlogs) {
      reasons.push(`Allows max ${job.max_backlogs} backlogs (You: ${backlogsNum})`);
    }

    let branchesList: string[] = [];
    try {
      branchesList = typeof job.eligible_branches === 'string'
        ? JSON.parse(job.eligible_branches)
        : job.eligible_branches || [];
    } catch (e) {
      if (typeof job.eligible_branches === 'string') {
        branchesList = job.eligible_branches.split(',').map((s: string) => s.trim().toUpperCase());
      }
    }

    const currentBranchUpper = studentBranch.trim().toUpperCase();
    const cleanBranchesList = branchesList.map(b => b.trim().toUpperCase());

    if (cleanBranchesList.length > 0 && !cleanBranchesList.includes(currentBranchUpper)) {
      reasons.push(`Requires ${cleanBranchesList.join('/')} (You: ${studentBranch})`);
    }

    return {
      eligible: reasons.length === 0,
      reason: reasons[0] || ''
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="uiverse-loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* INSTITUTIONAL BRANDING HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-900/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* SRGEC Crest Emblem Placeholder */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-950 to-blue-900 border border-[#F59E0B] flex flex-col items-center justify-center text-[#F59E0B] shadow-inner relative flex-shrink-0">
              <span className="text-xs font-black tracking-widest text-[#F59E0B]">SRGEC</span>
              <span className="text-[7px] font-bold text-slate-300">ESTD 1998</span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-[#F59E0B]"></div>
            </div>
            <div>
              <span className="text-[9px] text-[#F59E0B] font-extrabold tracking-widest uppercase">Placement Cell</span>
              <h2 className="text-2xl font-black tracking-tight text-[#F3F4F6] mt-0.5">Seshadri Rao Gudlavalleru Engineering College</h2>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xl">
                SRGEC Campus Recruitment ecosystem. Real-time criteria matching, ATS audit scanner, and vendor listings.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {user && (user.role === 'faculty' || user.role === 'admin') && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="uiverse-btn-slide text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Host Placement Drive
                <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CREATE PLACEMENT FORM PANEL */}
      {showCreate && (
        <div className="glass-vision p-6 border-blue-500/20">
          <h3 className="text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#3B82F6]" />
            Host Placement Drive listing (Faculty receives +30 XP)
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
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cognizant / TCS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Job Role / Position</label>
                <input
                  type="text"
                  placeholder="e.g. Programmer Analyst Trainee"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Drive Type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full glass-input px-3 py-2.5 text-sm">
                  <option value="Full Time" className="bg-[#0F172A]">Full Time</option>
                  <option value="Internship" className="bg-[#0F172A]">Internship</option>
                  <option value="Contract" className="bg-[#0F172A]">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Package Details</label>
                <input
                  type="text"
                  placeholder="e.g. 4.5 LPA / 80,000 pm"
                  value={packageVal}
                  onChange={(e) => setPackageVal(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Deadline Date</label>
                <input
                  type="date"
                  value={deadlineVal}
                  onChange={(e) => setDeadlineVal(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Min CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6.0"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Max Backlogs Allowed</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={maxBacklogsVal}
                  onChange={(e) => setMaxBacklogsVal(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1.5">Eligible Branches (comma list)</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, IT, ECE"
                  value={branchesVal}
                  onChange={(e) => setBranchesVal(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 text-sm"
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

      {/* PLACEMENT CARDS GRID (MULTI-COLUMN GRID LAYOUT) */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-[#F3F4F6] flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#3B82F6]" />
          Active Placement Drives
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const eligibility = evaluateCardEligibility(job);
            
            return (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-xl border border-[#1E293B] bg-[#0F172A] p-5 shadow-lg transition-all duration-300 hover:border-slate-700 hover:translate-y-[-2px] relative overflow-hidden"
              >
                {/* Eligibility Tag Pill in Top-Right */}
                <div className="absolute top-4 right-4">
                  {eligibility.eligible ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Eligible
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      title={eligibility.reason}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      Ineligible
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">{job.type}</span>
                    <h4 className="text-lg font-black text-[#F3F4F6] mt-0.5 leading-snug">{job.company}</h4>
                    <p className="text-xs text-[#9CA3AF] font-medium mt-0.5">{job.role}</p>
                  </div>

                  {/* Salary Centerpiece Badge */}
                  <div className="bg-[#020617] border border-[#1E293B] rounded-lg p-2.5 text-center mt-2">
                    <span className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">Offered Package</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono tracking-wide">{job.package}</span>
                  </div>

                  <div className="border-t border-[#1E293B] pt-3 mt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#9CA3AF]">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Min CGPA:</span>
                      <span className="font-bold text-[#F3F4F6]">{job.min_cgpa}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#9CA3AF]">
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-purple-400" /> Max Backlogs:</span>
                      <span className="font-bold text-[#F3F4F6]">{job.max_backlogs}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-[#9CA3AF] pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Eligible Departments:</span>
                      <span className="font-semibold text-xs text-slate-300 bg-[#020617] px-2 py-1 rounded border border-[#1E293B] truncate">
                        {(() => {
                          try {
                            const arr = typeof job.eligible_branches === 'string' ? JSON.parse(job.eligible_branches) : job.eligible_branches;
                            return Array.isArray(arr) ? arr.join(', ') : String(job.eligible_branches);
                          } catch (e) {
                            return String(job.eligible_branches);
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ineligibility Reason Callout */}
                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Urgency Signal Capsule */}
                    <div className="bg-red-950/20 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-400" />
                      Apply By: {job.deadline}
                    </div>
                  </div>

                  {!eligibility.eligible && (
                    <span className="text-[9px] text-rose-400/80 font-bold max-w-32 truncate text-right">
                      {eligibility.reason}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* ELIGIBILITY CHECKER FORM */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-[#F3F4F6] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
            Company Eligibility Checker
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Adjust your academic specifications below to dynamically evaluate your eligibility status against all active drives above.
          </p>

          <form onSubmit={handleCheckEligibility} className="space-y-4 pt-2">
            {/* Dropdown with Horizontal Alignment */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider min-w-28 whitespace-nowrap">
                Selected Drive:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                className="w-full glass-input px-3 py-2.5 text-sm"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id} className="bg-[#0F172A]">
                    {job.company} - {job.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs with Horizontal Vectors & Proportional Padding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider min-w-28 whitespace-nowrap">
                Your CGPA:
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 7.8"
                value={studentCgpa}
                onChange={(e) => setStudentCgpa(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-sm"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider min-w-28 whitespace-nowrap">
                Active Backlogs:
              </label>
              <input
                type="number"
                placeholder="e.g. 0"
                value={studentBacklogs}
                onChange={(e) => setStudentBacklogs(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-sm"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider min-w-28 whitespace-nowrap">
                Your Branch:
              </label>
              <select
                value={studentBranch}
                onChange={(e) => setStudentBranch(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-sm"
              >
                <option value="CSE" className="bg-[#0F172A]">CSE</option>
                <option value="IT" className="bg-[#0F172A]">IT</option>
                <option value="ECE" className="bg-[#0F172A]">ECE</option>
                <option value="EEE" className="bg-[#0F172A]">EEE</option>
                <option value="ME" className="bg-[#0F172A]">ME</option>
                <option value="CE" className="bg-[#0F172A]">CE</option>
              </select>
            </div>

            <div className="pt-2">
              {/* Royal Blue fill CTA */}
              <button
                type="submit"
                disabled={checkingEligibility}
                className="w-full bg-[#3B82F6] hover:bg-blue-700 text-white rounded-lg font-bold text-sm py-3 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 border-none"
              >
                {checkingEligibility ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Evaluate Specific Eligibility'}
              </button>
            </div>
          </form>

          {/* Checker Result Widget */}
          {eligibilityResult && (
            <div className="mt-4 pt-4 border-t border-[#1E293B]">
              {eligibilityResult.eligible ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm">Congratulations! You are eligible.</h4>
                    <p className="text-xs text-emerald-300/80 mt-1">You satisfy the company's placement criteria. Ready for application.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-400">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm">Criteria Match Failed.</h4>
                    <ul className="list-disc list-inside text-xs text-rose-300/80 mt-1.5 space-y-0.5">
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

        {/* AI CAREER COACH & ATS ANALYZER (Glassmorphism with Blue Glow Border) */}
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-tr from-[#0F172A] via-[#1E293B]/20 to-transparent p-6 shadow-2xl shadow-blue-500/5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center border border-blue-500/20">
              <Cpu className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F4F6] leading-tight">AI Career Coach & ATS Analyzer</h3>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Dynamic Resume Scan</span>
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Audit your qualifications against typical corporate requirements. Paste your resume details (experience, tools, certifications) to receive an instant ATS score and learning checklist.
          </p>

          <form onSubmit={handleAnalyzeResume} className="space-y-4 pt-1">
            <textarea
              placeholder="Paste resume content here (e.g., programming languages, core projects, academic history)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full glass-input min-h-36 resize-none text-xs leading-relaxed bg-[#020617]/50 focus:border-blue-500/50"
              required
            />

            <button
              type="submit"
              disabled={analyzingResume || !resumeText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm py-2.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
            >
              {analyzingResume ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Resume Structure...
                </>
              ) : (
                'Scan Resume & Generate Career Roadmap'
              )}
            </button>
          </form>

          {analysisResult && (
            <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-4">
              {/* ATS Score widget */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#020617] border border-[#1E293B] rounded-xl">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.03)" strokeWidth="5" fill="transparent" />
                    <circle cx="32" cy="32" r="26" stroke="#3B82F6" strokeWidth="5" fill="transparent"
                      strokeDasharray={163.3}
                      strokeDashoffset={163.3 - (163.3 * analysisResult.ats_score) / 100}
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#F3F4F6]">{analysisResult.ats_score}%</span>
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-[#F3F4F6]">ATS Fit Score</h4>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">Resume elements check out. Complete the recommended actions to optimize keyword counts.</p>
                </div>
              </div>

              {/* Strengths / Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Key Strengths</h5>
                  <ul className="space-y-1">
                    {analysisResult.strengths.slice(0, 3).map((str: string, i: number) => (
                      <li key={i} className="text-[10px] text-[#9CA3AF] leading-snug">
                        ✓ {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Improvement Steps</h5>
                  <ul className="space-y-1">
                    {analysisResult.improvements.slice(0, 3).map((imp: string, i: number) => (
                      <li key={i} className="text-[10px] text-[#9CA3AF] leading-snug">
                        • {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Roadmap timeline */}
              <div className="bg-[#020617]/80 border border-[#1E293B] rounded-lg p-3">
                <h5 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Tailored Learning Roadmap
                </h5>
                <div className="space-y-3 relative pl-4 border-l border-blue-500/20">
                  {analysisResult.roadmap.slice(0, 3).map((step: string, idx: number) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border border-[#020617]"></div>
                      <span className="font-extrabold text-[10px] text-slate-400">Step {idx + 1}</span>
                      <p className="text-[#9CA3AF] mt-0.5 leading-normal text-[11px]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
