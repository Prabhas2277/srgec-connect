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

  const getNotifMeta = (type: string) => {
    switch (type) {
      case 'notice':
        return { icon: Bell, color: 'text-rose-600' };
      case 'placement':
        return { icon: Briefcase, color: 'text-emerald-600' };
      case 'event':
        return { icon: Calendar, color: 'text-blue-600' };
      default:
        return { icon: Bell, color: 'text-slate-600' };
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[var(--border-glass)] bg-[var(--bg-secondary)] fixed inset-y-0 left-0 z-20 flex flex-col p-5 m-0">
        <div className="flex items-center gap-3 px-1 py-4 border-b border-[var(--border-glass)] mb-4">
          <img
            src="/logo.png"
            alt="SRGEC Emblem"
            className="w-10 h-10 object-contain rounded-lg flex-shrink-0 bg-white border border-[#E5E7EB] p-0.5 shadow-sm"
          />
          <div className="text-left">
            <h1 className="text-sm font-black tracking-tight text-[var(--text-primary)] m-0 leading-none">
              SRGEC Connect
            </h1>
            <span className="text-[9px] text-[#F59E0B] font-bold tracking-wider uppercase mt-1 block">
              GUDLAVALLERU
            </span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-cream)] text-[var(--text-primary)] font-bold border-l-2 border-slate-700 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-800' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT FOOTER */}
        <div className="border-t border-[var(--border-glass)] pt-4 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all"
          >
            {user.profile_photo_url ? (
              <img
                src={user.profile_photo_url}
                alt="profile"
                className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-[#E5E7EB]">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
            <div className="text-left leading-none">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-28">
                {user.full_name}
              </div>
              <span className="text-[9px] text-[var(--text-secondary)] capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col pl-72 pr-8 py-6 min-h-screen">
        {/* TOPBAR */}
        <header className="bg-white border border-[var(--border-glass)] rounded-xl flex items-center justify-between px-6 py-4 shadow-sm mb-6">
          <div className="text-left">
            <span className="text-xs text-[var(--text-secondary)]">Welcome back,</span>
            <h2 className="text-base font-bold text-[var(--text-primary)] m-0 leading-tight">
              {user.full_name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white border border-[var(--border-glass)] rounded-lg hover:bg-slate-50 transition-all text-[var(--text-primary)] cursor-pointer relative"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--border-glass)] rounded-xl p-4 z-40 shadow-lg text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-[var(--border-glass)] pb-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">Notifications</span>
                    <Link
                      to="/notices"
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      View All Notices
                    </Link>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-secondary)] text-center py-4">No new notifications.</p>
                    ) : (
                      notifications.slice(0, 4).map((n) => {
                        const { icon: Icon, color } = getNotifMeta(n.type);
                        const targetPath = n.type === 'notice' ? '/notices' : n.type === 'placement' ? '/placements' : n.type === 'event' ? '/events' : '/notices';
                        return (
                          <Link
                            key={n.id}
                            to={targetPath}
                            onClick={() => setShowNotifications(false)}
                            className="flex gap-2.5 p-2 bg-[#FAFAF8] hover:bg-[#F8F3E7]/40 border border-[#E5E7EB] rounded-lg transition-all cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0 mt-0.5">
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
              className="p-2 bg-white border border-[var(--border-glass)] rounded-lg hover:bg-slate-50 transition-all text-[var(--text-primary)] cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-600" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <div className="flex flex-col text-right leading-none">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {user.roll_number || 'Faculty ID'}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] mt-1">
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
