import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Briefcase,
  UserCheck,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Shield,
  LogOut,
  Sun,
  Moon,
  Trophy,
  User as UserIcon,
  Megaphone,
  Info
} from 'lucide-react';

interface NavigationProps {
  children: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const { user, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const data = await apiFetch('/notifications/list');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications in navigation:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, apiFetch]);

  if (!user) return <>{children}</>;

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Resource Hub', path: '/resources', icon: BookOpen },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Placements', path: '/placements', icon: Briefcase },
    { name: 'Mock Interview', path: '/mock-interview', icon: UserCheck },
    { name: 'Events & Clubs', path: '/events', icon: Calendar },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
    { name: 'Social Feed', path: '/feed', icon: MessageSquare },
    { name: 'Notice Board', path: '/notices', icon: Bell },
  ];

  if (user.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  // Calculate XP progress (Level up at every 200 XP threshold)
  const currentLevelXP = user.xp % 200;
  const xpPercent = Math.min((currentLevelXP / 200) * 100, 100);

  const getNotifMeta = (type: string) => {
    switch (type) {
      case 'notice':
        return { icon: Megaphone, color: 'text-violet-400', bg: 'bg-violet-500/10' };
      case 'placement':
        return { icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'event':
        return { icon: Calendar, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      default:
        return { icon: Info, color: 'text-pink-400', bg: 'bg-pink-500/10' };
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] space-grid-bg transition-colors duration-300">
      {/* BACKGROUND SCI-FI GLOWS */}
      <div className="bg-glow-purple top-[-100px] left-[-100px] pulse-glow"></div>
      <div className="bg-glow-cyan bottom-[-100px] right-[-100px] pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* SIDEBAR */}
      <aside className="w-68 glass-vision fixed inset-y-4 left-4 z-20 flex flex-col p-4 m-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 py-4 border-b border-[var(--border-glass)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] m-0 leading-none">
              SRGEC Connect
            </h1>
            <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">
              Digital Campus
            </span>
          </div>
        </div>

        {/* GAMIFIED USER STATUS CARD */}
        <div className="mt-4 p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Level {user.level}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              {user.xp} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            ></div>
          </div>
          <div className="text-[9px] text-violet-300 mt-1.5 text-center font-medium">
            {200 - currentLevelXP} XP remaining for Level {user.level + 1}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border-l-2 border-violet-500 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT FOOTER */}
        <div className="border-t border-[var(--border-glass)] pt-4 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-all"
          >
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="profile"
                className="w-7 h-7 rounded-full object-cover border border-violet-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-violet-500/30">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="text-left leading-none">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-28">
                {user.full_name}
              </div>
              <span className="text-[9px] text-violet-400 capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col pl-76 pr-4 py-4 min-h-screen">
        {/* TOPBAR */}
        <header className="glass-vision flex items-center justify-between px-6 py-3 mb-4">
          <div className="text-left">
            <span className="text-xs text-[var(--text-secondary)]">Welcome back,</span>
            <h2 className="text-base font-bold text-[var(--text-primary)] m-0 leading-tight">
              {user.full_name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white/5 border border-[var(--border-glass)] rounded-lg hover:bg-white/10 transition-all text-[var(--text-primary)] cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-vision p-4 z-40 text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-[var(--border-glass)] pb-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                    <Link
                      to="/notices"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-violet-400 hover:underline font-semibold"
                    >
                      View All Notices
                    </Link>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-secondary)] text-center py-4">No new notifications.</p>
                    ) : (
                      notifications.slice(0, 4).map((n) => {
                        const { icon: Icon, color, bg } = getNotifMeta(n.type);
                        const targetPath = n.type === 'notice' ? '/notices' : n.type === 'placement' ? '/placements' : n.type === 'event' ? '/events' : '/notices';
                        return (
                          <Link
                            key={n.id}
                            to={targetPath}
                            onClick={() => setShowNotifications(false)}
                            className="flex gap-2.5 p-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl transition-all cursor-pointer"
                          >
                            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Icon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="flex justify-between items-center">
                                <span className={`text-[8px] font-bold uppercase tracking-wider ${color}`}>
                                  {n.type}
                                </span>
                                <span className="text-[7px] text-[var(--text-secondary)]">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="text-[10px] font-bold truncate text-[var(--text-primary)] m-0 mt-0.5 leading-tight">
                                {n.title}
                              </h4>
                              <p className="text-[9px] text-[var(--text-secondary)] line-clamp-2 mt-0.5 m-0 leading-relaxed">
                                {n.content}
                              </p>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 bg-white/5 border border-[var(--border-glass)] rounded-lg hover:bg-white/10 transition-all text-[var(--text-primary)] cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {user.roll_number || 'Faculty ID'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {user.department || 'SRGEC'} Dept
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
