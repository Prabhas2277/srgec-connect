import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Bell,
  Briefcase,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Maximize2,
  Cpu,
  RotateCw,
  Compass,
  Trophy,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Inbox,
  Building,
  GraduationCap,
  FileText
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard states
  const [events, setEvents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter for 2D Campus Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Notification Dispatch States
  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('general');
  const [notifTargetRole, setNotifTargetRole] = useState('all');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['all']);
  const [urgency, setUrgency] = useState('low');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const handleDeptToggle = (dept: string) => {
    if (dept === 'all') {
      setSelectedDepts(['all']);
    } else {
      let updated = selectedDepts.filter(d => d !== 'all');
      if (updated.includes(dept)) {
        updated = updated.filter(d => d !== dept);
        if (updated.length === 0) updated = ['all'];
      } else {
        updated.push(dept);
      }
      setSelectedDepts(updated);
    }
  };

  const handleNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    setNotifSuccess('');
    setNotifError('');
    try {
      await apiFetch('/notifications/create', {
        method: 'POST',
        body: JSON.stringify({
          title: notifTitle,
          content: `[URGENCY: ${urgency.toUpperCase()}] ${notifContent}`,
          type: notifType,
          target_role: notifTargetRole,
          target_department: selectedDepts.join(',')
        })
      });
      setNotifSuccess('Campus notification successfully dispatched!');
      setNotifTitle('');
      setNotifContent('');
      setSelectedDepts(['all']);
      setUrgency('low');
      setShowCreateNotif(false);
      
      const updatedNotices = await apiFetch('/notices/list');
      setNotices(updatedNotices);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to dispatch notification');
    } finally {
      setSendingNotif(false);
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventData, noticeData, jobData, leaderboardData] = await Promise.all([
          apiFetch('/events/list'),
          apiFetch('/notices/list'),
          apiFetch('/placements/jobs'),
          apiFetch('/auth/leaderboard')
        ]);
        setEvents(eventData);
        setNotices(noticeData);
        setJobs(jobData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const buildings = [
    { id: 'lib', name: 'Library Hub', desc: 'Syllabus records, engineering reference manuals & PDF notes.', path: '/resources', label: 'Academic Resources', category: 'academic', icon: BookOpen },
    { id: 'place', name: 'Placement Cell', desc: 'Active recruitment drives, vendor listings & ATS checker tool.', path: '/placements', label: 'Career Hub', category: 'career', icon: Briefcase },
    { id: 'aud', name: 'Auditorium Hall', desc: 'Official student workshops, webinars, hackathons & code fests.', path: '/events', label: 'Events', category: 'events', icon: Calendar },
    { id: 'stud', name: 'Student Center', desc: 'Official club directories, coordinator indexes & social feeds.', path: '/events', label: 'Clubs', category: 'social', icon: Users },
    { id: 'lab', name: 'Innovation Lab', desc: 'Collaborators ledger, profile resumes & project guidelines.', path: '/profile', label: 'Projects', category: 'academic', icon: Cpu },
    { id: 'admin', name: 'Admin Block', desc: 'Official notices, exam schedules, fee details & faculty board.', path: '/notices', label: 'Notices', category: 'admin', icon: Building },
  ];

  const filteredBuildings = buildings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="uiverse-loader"></div>
        <span className="text-xs text-[var(--text-secondary)] font-medium animate-pulse tracking-wider">Syncing Campus Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-12 animate-fadeIn">
      
      {/* 1. TOP SUMMARY STATS STRIP (Minimal outlines, clean borders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Placement Drives</span>
            <span className="text-2xl font-black text-[var(--text-primary)] mt-1 block">{jobs.length} Active</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] border border-[var(--border-glass)] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Dispatched Announcements</span>
            <span className="text-2xl font-black text-[var(--text-primary)] mt-1 block">{notices.length} Notices</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] border border-[var(--border-glass)] flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-700" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Campus Seminars</span>
            <span className="text-2xl font-black text-[var(--text-primary)] mt-1 block">{events.length} Scheduled</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FAFAF8] border border-[var(--border-glass)] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </div>

      {/* 2. FLAT MINIMAL CAMPUS HUB DIRECTORY */}
      <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-glass)] pb-5 mb-5">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Interactive Campus Directory</h2>
          </div>

          {/* Filtering and search tools */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input text-xs py-2 px-3 w-full sm:w-48"
            />
            
            <div className="flex bg-[#FAFAF8] border border-[var(--border-glass)] p-1 rounded-lg text-[11px] font-bold text-[var(--text-secondary)]">
              {['all', 'academic', 'career', 'admin'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-white text-[var(--text-primary)] border border-[var(--border-glass)] shadow-sm' 
                      : 'hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <Inbox className="w-10 h-10 opacity-30 mb-2" />
              <span className="text-xs font-semibold">No departments found matching your criteria.</span>
            </div>
          ) : (
            filteredBuildings.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(b.path)}
                  className="rounded-xl border border-[var(--border-glass)] bg-white p-5 cursor-pointer hover:border-slate-400 hover:bg-[#FAFAF8]/50 transition-all duration-200 flex flex-col justify-between h-40 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[#FAFAF8] border border-[var(--border-glass)] px-2 py-0.5 rounded">
                        {b.label}
                      </span>
                      <Icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] mt-1">{b.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. FACULTY ANNOUNCEMENT ACTION PANEL */}
      {user && (user.role === 'faculty' || user.role === 'admin') && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest block mb-1">Mentor Action Board</span>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Quick Publisher Controls</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Disseminate notices, update placement drives, or upload study material sheets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateNotif(!showCreateNotif)}
                className="glass-button text-xs py-2.5 px-4 cursor-pointer"
              >
                Send Custom Notification
              </button>
              <Link to="/notices?create=true" className="glass-button-secondary text-xs py-2.5 px-4">
                Post Notice
              </Link>
              <Link to="/resources?create=true" className="glass-button-secondary text-xs py-2.5 px-4">
                Upload Materials
              </Link>
              <Link to="/placements?create=true" className="glass-button-secondary text-xs py-2.5 px-4">
                Host Placement
              </Link>
            </div>
          </div>

          {showCreateNotif && (
            <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 text-left shadow-sm">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                Dispatch Custom Notification
              </h3>
              
              {notifError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {notifError}
                </div>
              )}

              <form onSubmit={handleNotifSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Notification Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Records Submission"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Target Role</label>
                    <select
                      value={notifTargetRole}
                      onChange={(e) => setNotifTargetRole(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                    >
                      <option value="all" className="bg-white">All Roles</option>
                      <option value="student" className="bg-white">Students Only</option>
                      <option value="faculty" className="bg-white">Faculty Only</option>
                      <option value="club_coordinator" className="bg-white">Coordinators Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Notification Type</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="w-full glass-input px-3 py-2 text-sm"
                    >
                      <option value="general" className="bg-white">General Broadcast</option>
                      <option value="notice" className="bg-white">Official Announcement</option>
                      <option value="placement" className="bg-white">Placement Info</option>
                      <option value="event" className="bg-white">Campus Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Urgency Level</label>
                    <div className="uiverse-radio-group">
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="low" 
                          checked={urgency === 'low'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        Low
                      </label>
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="medium" 
                          checked={urgency === 'medium'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        Medium
                      </label>
                      <label className="uiverse-radio-label">
                        <input 
                          type="radio" 
                          name="urgency" 
                          value="high" 
                          checked={urgency === 'high'}
                          onChange={(e) => setUrgency(e.target.value)} 
                        />
                        <span className="uiverse-radio-circle"></span>
                        High
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Target Departments</label>
                    <div className="flex flex-wrap gap-2.5 bg-[#FAFAF8] p-2 rounded-lg border border-[var(--border-glass)]">
                      {['all', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'].map((dept) => (
                        <label key={dept} className="uiverse-checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedDepts.includes(dept)}
                            onChange={() => handleDeptToggle(dept)}
                          />
                          <span className="uiverse-checkmark"></span>
                          {dept === 'all' ? 'All' : dept}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Short Message Content</label>
                  <input
                    type="text"
                    placeholder="Brief details about this notification..."
                    value={notifContent}
                    onChange={(e) => setNotifContent(e.target.value)}
                    className="w-full glass-input px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateNotif(false)}
                    className="glass-button-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingNotif} className="glass-button text-xs">
                    {sendingNotif ? 'Dispatching...' : 'Dispatch Notification'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {notifSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              {notifSuccess}
            </div>
          )}
        </div>
      )}

      {/* 4. DYNAMIC BENTO GRID SYSTEM (Flat card layout, Cream Highlights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WIDGET 1: LARGE HERO - AI ASSISTANT PANEL */}
        <div className="md:col-span-2 rounded-xl border border-[var(--border-glass)] bg-white p-6 flex flex-col sm:flex-row items-center gap-6 justify-between shadow-sm min-h-[240px]">
          <div className="space-y-4 max-w-md text-left">
            <span className="text-[10px] text-slate-800 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-[var(--accent-cream)] px-2.5 py-1 rounded w-fit">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              AI Assistant Agent
            </span>
            <h3 className="text-lg font-black text-[var(--text-primary)]">Ready to examine your curriculum?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask questions in Exam, Expert, or Socratic teacher modes. Upload academic notes to trigger automatic flashcards and review roadmap guidelines.
            </p>
            <Link to="/ai-assistant" className="uiverse-btn-slide text-xs py-2 px-4">
              Launch AI Dialogue
              <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
            </Link>
          </div>

          <div className="w-24 h-24 rounded-full border border-[var(--border-glass)] bg-[#FAFAF8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Cpu className="w-8 h-8 text-slate-600" />
          </div>
        </div>

        {/* WIDGET 2: PLACEMENTS MODULE */}
        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 flex flex-col justify-between shadow-sm text-left min-h-[240px]">
          <div className="space-y-3">
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded w-fit">
              <Briefcase className="w-3.5 h-3.5" />
              Career Drive Analyzer
            </span>
            <h3 className="text-base font-black text-[var(--text-primary)]">Cognizant Recruitment Drive</h3>
            
            <div className="bg-[#FAFAF8] border border-[var(--border-glass)] rounded-lg p-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Min CGPA:</span>
                <span className="font-bold text-[var(--text-primary)]">7.0</span>
              </div>
              <div className="flex justify-between">
                <span>Active Backlogs:</span>
                <span className="font-bold text-[var(--text-primary)]">0</span>
              </div>
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-bold text-emerald-600">4.5 LPA</span>
              </div>
            </div>
          </div>
          
          <Link to="/placements" className="uiverse-btn-slide text-xs py-2 px-3 mt-4 justify-center">
            Launch ATS Scanner
            <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
          </Link>
        </div>

        {/* WIDGET 3: QUICK LINKS DIRECTORY */}
        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 shadow-sm flex flex-col justify-between text-left h-[260px]">
          <div className="space-y-3">
            <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded w-fit">
              <Compass className="w-3.5 h-3.5" />
              Quick Shortcuts
            </span>
            
            <div className="border-b border-[var(--border-glass)] pb-2">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Helpful Links</h3>
            </div>

            <div className="space-y-2 mt-1">
              <Link to="/profile" className="flex justify-between items-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline border-b border-[#FAFAF8] pb-1">
                <span>My Profile Portal</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/resources" className="flex justify-between items-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline border-b border-[#FAFAF8] pb-1">
                <span>Academic Resources</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/placements" className="flex justify-between items-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline border-b border-[#FAFAF8] pb-1">
                <span>Career Placement Portal</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
          
          <Link to="/profile" className="text-[10px] font-bold text-slate-700 hover:underline flex items-center justify-center gap-0.5 mt-2">
            View My Profile <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* WIDGET 4: CAMPUS NOTICES */}
        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 shadow-sm text-left h-[260px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded w-fit">
                <Bell className="w-3.5 h-3.5" />
                Campus Notices
              </span>
              <div className="uiverse-tooltip-container">
                <Link to="/notices" className="text-xs text-slate-700 font-bold hover:underline">View Board</Link>
                <span className="uiverse-tooltip">Open notices</span>
              </div>
            </div>

            <div className="space-y-2">
              {notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-[var(--text-secondary)]">
                  <Inbox className="w-8 h-8 opacity-25" />
                  <span className="text-[10px] mt-1">No announcements posted</span>
                </div>
              ) : (
                notices.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-[#FAFAF8] border border-[var(--border-glass)] rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all duration-150"
                    onClick={() => navigate('/notices')}
                  >
                    <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{n.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 truncate">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[9px] text-[var(--text-secondary)] font-medium">Click notice card to read full article</div>
        </div>

        {/* WIDGET 5: UPCOMING SEMINARS */}
        <div className="rounded-xl border border-[var(--border-glass)] bg-white p-6 shadow-sm text-left h-[260px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded w-fit">
                <Calendar className="w-3.5 h-3.5" />
                Seminars Grid
              </span>
              <div className="uiverse-tooltip-container">
                <Link to="/events" className="text-xs text-slate-700 font-bold hover:underline">Calendar</Link>
                <span className="uiverse-tooltip">View full schedule</span>
              </div>
            </div>

            <div className="space-y-2">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-[var(--text-secondary)]">
                  <Inbox className="w-8 h-8 opacity-25" />
                  <span className="text-[10px] mt-1">No upcoming seminars</span>
                </div>
              ) : (
                events.slice(0, 2).map((e) => (
                  <div key={e.id} className="p-2.5 bg-[#FAFAF8] border border-[var(--border-glass)] rounded-xl">
                    <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{e.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-secondary)]">
                      <span>{e.location}</span>
                      <span className="text-slate-800 font-semibold">RSVP: {e.rsvp_count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="text-[9px] text-[var(--text-secondary)] font-medium">Verify details and register for upcoming sessions</div>
        </div>

      </div>
    </div>
  );
};
