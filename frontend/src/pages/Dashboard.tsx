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
  MessageSquare
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

  // 3D Campus states
  const [rotateZ, setRotateZ] = useState(-45);
  const [zoom, setZoom] = useState(1);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Notification Creation States
  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('general');
  const [notifTargetRole, setNotifTargetRole] = useState('all');
  const [notifTargetDept, setNotifTargetDept] = useState('all');
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

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
          content: notifContent,
          type: notifType,
          target_role: notifTargetRole,
          target_department: notifTargetDept
        })
      });
      setNotifSuccess('Campus-wide notification dispatched successfully! +20 XP');
      setNotifTitle('');
      setNotifContent('');
      setShowCreateNotif(false);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to dispatch notification');
    } finally {
      setSendingNotif(false);
    }
  };

  // Load backend seed data
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleNoticeClick = (notice: any) => {
    const title = notice.title.toLowerCase();
    const content = notice.content.toLowerCase();
    
    let targetBuilding = 'admin';
    
    if (title.includes('placement') || title.includes('job') || title.includes('hiring') || title.includes('career') || content.includes('placement')) {
      targetBuilding = 'place';
    } else if (title.includes('hackathon') || title.includes('auditorium') || title.includes('seminar') || title.includes('workshop') || title.includes('event')) {
      targetBuilding = 'aud';
    } else if (title.includes('club') || title.includes('society') || title.includes('fest') || title.includes('student')) {
      targetBuilding = 'stud';
    } else if (title.includes('library') || title.includes('exam') || title.includes('syllabus') || title.includes('note') || title.includes('academic') || title.includes('study')) {
      targetBuilding = 'lib';
    } else if (title.includes('project') || title.includes('innovation') || title.includes('lab') || title.includes('hack')) {
      targetBuilding = 'lab';
    }
    
    setHoveredBuilding(targetBuilding);
    
    if (targetBuilding === 'lib') setRotateZ(-30);
    else if (targetBuilding === 'place') setRotateZ(60);
    else if (targetBuilding === 'aud') setRotateZ(-120);
    else if (targetBuilding === 'stud') setRotateZ(120);
    else if (targetBuilding === 'lab') setRotateZ(15);
    else if (targetBuilding === 'admin') setRotateZ(-75);
    
    setZoom(1.35);
    
    setTimeout(() => {
      setHoveredBuilding(null);
      setZoom(1);
    }, 4500);
  };

  // Buildings data on Campus
  const buildings = [
    { id: 'lib', name: 'Library Hub', desc: 'Syllabus notes & PDF Manuals', path: '/resources', grid: 'col-start-2 row-start-2', hoverColor: 'text-violet-400', label: 'Academic Resources' },
    { id: 'place', name: 'Placement Cell', desc: 'ATS scanner & Job drives', path: '/placements', grid: 'col-start-3 row-start-1', hoverColor: 'text-emerald-400', label: 'Career Hub' },
    { id: 'aud', name: 'Auditorium', desc: 'Campus Seminars & Hackathons', path: '/events', grid: 'col-start-1 row-start-3', hoverColor: 'text-cyan-400', label: 'Events' },
    { id: 'stud', name: 'Student Center', desc: 'Clubs registration dashboard', path: '/events', grid: 'col-start-2 row-start-4', hoverColor: 'text-fuchsia-400', label: 'Clubs' },
    { id: 'lab', name: 'Innovation Lab', desc: 'Student project collaborators', path: '/profile', grid: 'col-start-4 row-start-2', hoverColor: 'text-amber-400', label: 'Projects' },
    { id: 'admin', name: 'Admin Block', desc: 'Official notice schedules', path: '/notices', grid: 'col-start-3 row-start-3', hoverColor: 'text-rose-400', label: 'Notices' },
  ];

  return (
    <div className="space-y-6 relative pb-16">
      {/* 3D CAMPUS VIEWPORT WINDOW */}
      <div className="glass-vision p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-glass)] pb-4 mb-6">
          <div className="text-left">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Spatial Campus Mesh
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Interactive 3D SRGEC Campus</h2>
            <p className="text-xs text-[var(--text-secondary)]">Rotate camera angles and hover over buildings to traverse campus modules.</p>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-4 bg-black/20 p-2.5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <input
                type="range"
                min="-180"
                max="180"
                value={rotateZ}
                onChange={(e) => setRotateZ(parseInt(e.target.value))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-[9px] font-mono w-8 text-right">{rotateZ}°</span>
            </div>
            
            <div className="border-r border-white/10 h-4"></div>
            
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <input
                type="range"
                min="8"
                max="15"
                step="1"
                value={zoom * 10}
                onChange={(e) => setZoom(parseInt(e.target.value) / 10)}
                className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* 3D CANVAS VIEWPORT AREA */}
        <div className="h-96 relative flex items-center justify-center scene-3d">
          {/* Spatial Grid Projection */}
          <div
            className="map-mesh-3d grid grid-cols-4 grid-rows-4 gap-x-12 gap-y-12 items-center justify-center p-8 bg-slate-900/10 border border-violet-500/5 rounded-full w-[600px] h-[600px]"
            style={{
              transform: `rotateX(60deg) rotateZ(${rotateZ}deg) scale(${zoom})`,
            }}
          >
            {/* Grid connecting lines */}
            <div className="absolute inset-0 border border-dashed border-violet-500/10 rounded-full pointer-events-none"></div>
            <div className="absolute inset-20 border border-dashed border-cyan-400/10 rounded-full pointer-events-none"></div>

            {buildings.map((b) => (
              <div
                key={b.id}
                className={`${b.grid} flex items-center justify-center`}
                onMouseEnter={() => setHoveredBuilding(b.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => navigate(b.path)}
              >
                {/* 3D Building block */}
                <div className="building-3d">
                  <div className="face face-top"></div>
                  <div className="face face-front"></div>
                  <div className="face face-right"></div>
                  
                  {/* Glowing anchor node on base */}
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Hover metadata overlays suspended in 2D space above buildings */}
          {buildings.map((b) => {
            const isHovered = hoveredBuilding === b.id;
            return (
              <div
                key={b.id}
                className={`absolute transition-all duration-300 pointer-events-none ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-4'
                }`}
              >
                {isHovered && (
                  <div className="glass-vision p-4 w-52 border-violet-500/40 text-center relative z-30">
                    <span className="text-[9px] uppercase font-bold text-violet-400 tracking-wider">
                      {b.label}
                    </span>
                    <h4 className="text-xs font-bold mt-1 text-[var(--text-primary)]">{b.name}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-tight">
                      {b.desc}
                    </p>
                    <div className="border-t border-[var(--border-glass)] pt-2.5 mt-3 text-[9px] font-semibold text-cyan-400 flex items-center justify-center gap-0.5">
                      Enter Portal <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FACULTY QUICK ACTIONS BAR */}
      {user && (user.role === 'faculty' || user.role === 'admin') && (
        <div className="space-y-4 text-left">
          <div className="glass-vision p-6 bg-gradient-to-tr from-violet-950/20 to-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
            <div>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest block mb-1">Mentor Action Board</span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Quick Publisher Controls</h3>
              <p className="text-xs text-[var(--text-secondary)]">Announce notices, upload study manuals, or create placement listings instantly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateNotif(!showCreateNotif)}
                className={`glass-button text-xs py-2.5 px-4 cursor-pointer transition-all ${showCreateNotif ? 'border-pink-500/50 bg-pink-500/10' : ''}`}
              >
                Send Custom Notification
              </button>
              <Link to="/notices?create=true" className="glass-button text-xs py-2.5 px-4 cursor-pointer">
                Post Campus Notice
              </Link>
              <Link to="/resources?create=true" className="glass-button text-xs py-2.5 px-4 cursor-pointer">
                Upload Study Material
              </Link>
              <Link to="/placements?create=true" className="glass-button text-xs py-2.5 px-4 cursor-pointer">
                Host Placement Drive
              </Link>
            </div>
          </div>

          {/* CREATE NOTIFICATION FORM */}
          {showCreateNotif && (
            <div className="glass-vision p-6 border-pink-500/30 text-left animate-fadeIn">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-400" />
                Dispatch Custom Notification (Earn +20 XP)
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
                      className="w-full glass-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Target Role</label>
                    <select
                      value={notifTargetRole}
                      onChange={(e) => setNotifTargetRole(e.target.value)}
                      className="w-full glass-input"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students Only</option>
                      <option value="faculty">Faculty Only</option>
                      <option value="club_coordinator">Club Coordinators Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Target Department</label>
                    <select
                      value={notifTargetDept}
                      onChange={(e) => setNotifTargetDept(e.target.value)}
                      className="w-full glass-input"
                    >
                      <option value="all">All Departments</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Notification Type</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="w-full glass-input"
                    >
                      <option value="general">General Broadcast</option>
                      <option value="notice">Official Announcement</option>
                      <option value="placement">Placement Info</option>
                      <option value="event">Campus Event</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Short Message Content</label>
                    <input
                      type="text"
                      placeholder="Brief details about this notification..."
                      value={notifContent}
                      onChange={(e) => setNotifContent(e.target.value)}
                      className="w-full glass-input"
                      required
                    />
                  </div>
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

      {/* DYNAMIC BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WIDGET 1: LARGE HERO - AI ASSISTANT ORB OR CHAT ENTRY */}
        <div className="md:col-span-2 glass-vision p-6 flex flex-col md:flex-row items-center gap-6 justify-between bento-card-active relative overflow-hidden">
          <div className="space-y-4 z-10 max-w-sm">
            <span className="text-[9px] text-violet-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Assistant Orb
            </span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Ready to examine your curriculum?</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask questions in Exam, Expert, or Socratic teacher modes. Upload notes to trigger automatic flashcards and quizzes.
            </p>
            <Link to="/ai-assistant" className="glass-button text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer">
              Launch Dialogue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* AI Orb animation container */}
          <div className="relative w-36 h-36 flex items-center justify-center z-10">
            {/* outer energy ring */}
            <div className="absolute inset-0 border-2 border-violet-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-4 border border-cyan-400/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            <div
              className="w-24 h-24 ai-orb-hologram cursor-pointer flex items-center justify-center shadow-2xl"
              onClick={() => navigate('/ai-assistant')}
            >
              <Cpu className="w-6 h-6 text-white/80 animate-pulse" />
            </div>
          </div>

          {/* background neon particles */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-radial-gradient(from 50% 50%, rgba(139, 92, 246, 0.08), transparent 70%) pointer-events-none"></div>
        </div>

        {/* WIDGET 2: SMALL WIDGET - PLACEMENTS AND AT ELIGIBILITY */}
        <div className="glass-vision p-6 flex flex-col justify-between bento-card-active">
          <div>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              Career Drive Analyzer
            </span>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Cognizant Recruitment Drive</h3>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Programmer Analyst Trainee position hiring. Package: 4.5 LPA. Branches: CSE, IT, ECE. 
            </p>
          </div>

          <div className="border-t border-[var(--border-glass)] pt-4 mt-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Eligibility Match
            </span>
            <Link to="/placements" className="text-xs text-[var(--text-primary)] hover:underline flex items-center font-semibold">
              Check ATS <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
            </Link>
          </div>
        </div>

        {/* WIDGET 3: SMALL WIDGET - LEVEL AND GAMIFICATION PROGRESS */}
        <div className="glass-vision p-6 flex items-center justify-between bento-card-active">
          <div className="space-y-2">
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard Stats
            </span>
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Level {user?.level} Rank</h3>
            <p className="text-[10px] text-[var(--text-secondary)]">Earn XP by uploading notes and logging event attendances.</p>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 flex items-center justify-center font-extrabold text-violet-400 text-lg bg-violet-500/5 shadow-inner">
            #{user?.id || 1}
          </div>
        </div>

        {/* WIDGET 4: MEDIUM WIDGET - ANNOUNCEMENTS AND NOTICES */}
        <div className="glass-vision p-6 space-y-4 bento-card-active text-left">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Campus Notices
            </span>
            <Link to="/notices" className="text-[10px] text-violet-400 font-semibold hover:underline">View Ticker</Link>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 2).map((n) => (
              <div
                key={n.id}
                className="p-3 bg-white/2 border border-white/5 rounded-xl cursor-pointer hover:border-violet-500/50 hover:bg-white/5 transition-all duration-300"
                onClick={() => handleNoticeClick(n)}
              >
                <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{n.title}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 line-clamp-1">{n.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 5: MEDIUM WIDGET - EVENTS AND RSVPS */}
        <div className="glass-vision p-6 space-y-4 bento-card-active text-left">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Seminars Grid
            </span>
            <Link to="/events" className="text-[10px] text-cyan-400 font-semibold hover:underline">Calendar</Link>
          </div>

          <div className="space-y-3">
            {events.slice(0, 2).map((e) => (
              <div key={e.id} className="p-3 bg-white/2 border border-white/5 rounded-xl">
                <h4 className="text-xs font-bold truncate text-[var(--text-primary)]">{e.title}</h4>
                <div className="flex items-center justify-between mt-2 text-[9px] text-[var(--text-secondary)]">
                  <span>{e.location}</span>
                  <span className="text-cyan-400 font-semibold">RSVP: {e.rsvp_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
