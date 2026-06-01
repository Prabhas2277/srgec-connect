import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Search,
  Filter,
  PlusCircle,
  Megaphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'notices' | 'notifications'>('notices');
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Creation panel state
  const [showCreate, setShowCreate] = useState(() => {
    return new URLSearchParams(window.location.search).get('create') === 'true';
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Academics');
  const [success, setSuccess] = useState('');

  const fetchNotices = async () => {
    try {
      const [noticeData, notifData] = await Promise.all([
        apiFetch('/notices/list'),
        apiFetch('/notifications/list')
      ]);
      setNotices(noticeData);
      setNotifications(notifData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/notices/create', {
        method: 'POST',
        body: JSON.stringify({ title, content, category })
      });
      setSuccess('Notice posted on digital campus board successfully!');
      setTitle('');
      setContent('');
      setShowCreate(false);
      fetchNotices();
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    const classes: Record<string, string> = {
      Academics: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      Examinations: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      Placements: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Events: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Scholarships: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      General: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return classes[cat] || classes['General'];
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || notice.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Digital Notice Board</h2>
          <p className="text-sm text-[var(--text-secondary)]">Official campus announcements, exam schedules, and placement updates.</p>
        </div>

        {user && (user.role === 'faculty' || user.role === 'admin') && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="glass-button text-sm flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Post Notice
          </button>
        )}
      </div>

      {/* CREATE FORM PANEL */}
      {showCreate && (
        <div className="glass-vision p-6 border-violet-500/30">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-400" />
            Post Official Announcement
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Term Examination Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Notice Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input"
                >
                  <option value="Academics">Academics</option>
                  <option value="Examinations">Examinations</option>
                  <option value="Placements">Placements</option>
                  <option value="Events">Events</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Notice Details Content</label>
              <textarea
                placeholder="Detailed announcement content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full glass-input min-h-32 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="glass-button-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="glass-button text-xs">
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* TABS SELECTOR */}
      <div className="flex gap-4 border-b border-[var(--border-glass)] pb-2 mb-4">
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-2 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'notices'
              ? 'border-violet-500 text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-secondary)]'
          }`}
        >
          Campus Notices Board
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-2 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-pink-500 text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-secondary)]'
          }`}
        >
          My Direct Notifications
          <span className="text-[10px] bg-pink-500/20 text-pink-400 font-bold px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </button>
      </div>

      {activeTab === 'notices' ? (
        <>
          {/* FILTER PANEL */}
          <div className="glass-vision p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search notice titles or contents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-10"
              />
            </div>

            <div className="flex gap-2 items-center w-full md:w-auto">
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input text-xs py-1.5 px-3"
              >
                <option value="">All Categories</option>
                <option value="Academics">Academics</option>
                <option value="Examinations">Examinations</option>
                <option value="Placements">Placements</option>
                <option value="Events">Events</option>
                <option value="Scholarships">Scholarships</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* NOTICES LIST */}
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div key={notice.id} className="glass-vision-interactive p-5 border-l-4 border-violet-500 flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border rounded-full ${getCategoryBadgeClass(notice.category)}`}>
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      Posted on: {new Date(notice.created_at).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)]">{notice.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line pl-1">{notice.content}</p>
                </div>

                <div className="border-t border-[var(--border-glass)] pt-3 mt-4 flex justify-between items-center text-[10px] text-[var(--text-secondary)] text-left">
                  <span>Verified Publisher: <strong className="text-[var(--text-primary)]">{notice.creator.full_name}</strong></span>
                  <span className="capitalize">{notice.creator.role.replace('_', ' ')}</span>
                </div>
              </div>
            ))}

            {filteredNotices.length === 0 && (
              <div className="text-center p-12 glass-vision opacity-50 space-y-2">
                <Megaphone className="w-8 h-8 mx-auto text-violet-400" />
                <p className="text-xs">No active notices found matching filters.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="glass-vision-interactive p-5 border-l-4 border-pink-500 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border rounded-full bg-pink-500/10 text-pink-400 border-pink-500/20`}>
                    {notif.type}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Received: {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">{notif.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line pl-1">{notif.content}</p>
              </div>

              <div className="border-t border-[var(--border-glass)] pt-3 mt-4 flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                <span>Sender: <strong className="text-[var(--text-primary)]">{notif.creator.full_name}</strong></span>
                <span className="capitalize">{notif.creator.role.replace('_', ' ')}</span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center p-12 glass-vision opacity-50 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-pink-400 animate-bounce" />
              <p className="text-xs">No active notifications in your inbox.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
