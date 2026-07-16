import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Calendar,
  BookOpen,
  Flag,
  Trash,
  CheckCircle,
  Activity,
  Award
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats Counters
  const [statUsers, setStatUsers] = useState(6);
  const [statEvents, setStatEvents] = useState(2);
  const [statResources, setStatResources] = useState(2);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/auth/users');
      setUsersList(data);
      setStatUsers(data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    // Mock user delete (filter out from UI list)
    setUsersList((prev) => prev.filter((u) => u.id !== id));
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
      {/* TITLE */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Admin Control Center</h2>
        <p className="text-sm text-[var(--text-secondary)] font-medium">Verify system registrations, moderate uploaded note files, and oversee event parameters.</p>
      </div>

      {/* STATS COUNT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', val: statUsers.toString(), icon: Users, color: 'text-violet-400 bg-violet-500/10' },
          { label: 'Academic Files', val: statResources.toString(), icon: BookOpen, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Hosted Events', val: statEvents.toString(), icon: Calendar, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Moderation Flags', val: '0', icon: Flag, color: 'text-rose-400 bg-rose-500/10' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-vision p-4 flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold block">{card.val}</span>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                  {card.label}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* USERS MANAGEMENT LIST */}
        <div className="lg:col-span-2 glass-vision p-5 space-y-4 overflow-hidden">
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Registered Campus Users
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3 text-right">Roll / ID</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="text-[var(--text-primary)]">
                    <td className="py-3 font-semibold">{usr.full_name}<br/><span className="text-[9px] text-[var(--text-secondary)]">{usr.email}</span></td>
                    <td className="py-3 capitalize text-[var(--text-secondary)]">{usr.role.replace('_', ' ')}</td>
                    <td className="py-3">{usr.department || 'N/A'}</td>
                    <td className="py-3 text-right font-semibold text-[var(--text-primary)]">{usr.roll_number || 'N/A'}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="p-1.5 hover:bg-red-500/15 text-red-400 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODERATION QUEUE & AUDIT LOGS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-vision p-5 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Content Moderation
            </h3>
            
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center space-y-1.5">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-bold text-emerald-400">Queue is Clear!</h4>
              <p className="text-[10px] text-[var(--text-secondary)]">All uploaded notes and posts match AI moderation parameters.</p>
            </div>
          </div>

          <div className="glass-vision p-5 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Real-time Campus Mesh Logs
            </h3>

            <div className="space-y-3 font-mono text-[9px] text-indigo-300">
              <div className="p-2.5 bg-black/10 rounded-lg border border-[var(--border-glass)]">
                [08:24:42] User amit@srgec.edu.in created NoticeMid-I examinations schedule.
              </div>
              <div className="p-2.5 bg-black/10 rounded-lg border border-[var(--border-glass)]">
                [08:23:51] Student pavan@srgec.edu.in completed AI Mock Interview practice simulation.
              </div>
              <div className="p-2.5 bg-black/10 rounded-lg border border-[var(--border-glass)]">
                [08:21:18] Database context seeded: loaded 6 mock student nodes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
