import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import {
  Users,
  Plus,
  Send,
  MessageSquare,
  BookOpen,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const StudyGroups: React.FC = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const { messages, sendMessage, connected } = useWebSocket();
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  // Creation States
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchGroups = async () => {
    try {
      const data = await apiFetch('/study-groups/list');
      setGroups(data);
      if (data.length > 0 && !activeGroupId) {
        // default to first joined group
        setActiveGroupId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeGroupId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGroup = await apiFetch('/study-groups/create', {
        method: 'POST',
        body: JSON.stringify({ name, description })
      });
      setShowCreate(false);
      setName('');
      setDescription('');
      fetchGroups();
      setActiveGroupId(newGroup.id);
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await apiFetch(`/study-groups/${id}/join`, { method: 'POST' });
      fetchGroups();
      setActiveGroupId(id);
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeGroupId) return;
    sendMessage(null, activeGroupId, chatInput);
    setChatInput('');
  };

  // Filter messages for active group chat
  const groupMessages = messages.filter((m) => m.group_id === activeGroupId);
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* SIDE PANEL: STUDY GROUPS LIST */}
      <div className="lg:col-span-1 glass-vision p-5 flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-violet-400">
              <Users className="w-5 h-5" />
              Study Groups
            </h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-[var(--border-glass)] rounded-lg text-[var(--text-primary)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* GROUPS ITERATION */}
          <div className="space-y-2 pt-2">
            {groups.map((g) => {
              const isActive = g.id === activeGroupId;
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveGroupId(g.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border-violet-500 text-[var(--text-primary)]'
                      : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-white/5'
                  }`}
                >
                  <h4 className="text-xs font-bold truncate">{g.name}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 line-clamp-1">{g.description}</p>
                  <span className="text-[9px] text-cyan-400 mt-2 block font-semibold">
                    {g.members_count} members
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[var(--border-glass)] pt-4 text-center">
          <span className="text-[9px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {connected ? 'WebSocket Stream Connected' : 'Connecting to campus mesh...'}
          </span>
        </div>
      </div>

      {/* CHAT BOARD VIEW */}
      <div className="lg:col-span-3 glass-vision flex flex-col justify-between overflow-hidden relative">
        {/* CREATE MODAL */}
        {showCreate && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-sm glass-vision p-6 space-y-4">
              <h3 className="text-base font-bold">New Study Circle</h3>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Group Name</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech 3rd Year DSA Circle"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Description</label>
                  <textarea
                    placeholder="e.g. Preparing for placements and solving LeetCode problems."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-input min-h-20 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="glass-button-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="glass-button text-xs">
                    Assemble Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-[var(--border-glass)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] leading-tight">{activeGroup.name}</h3>
                <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
                  {activeGroup.description}
                </span>
              </div>

              {/* Join action if not in members list (mock representation or verify) */}
              <button
                onClick={() => handleJoin(activeGroup.id)}
                className="glass-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" /> Join Group
              </button>
            </div>

            {/* Chat Scroll Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {groupMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                  <MessageSquare className="w-8 h-8 text-violet-400" />
                  <p className="text-xs">No messages in this study group yet. Type below to start!</p>
                </div>
              ) : (
                groupMessages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[80%] ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        msg.sender.profile_photo_url ? (
                          <img src={msg.sender.profile_photo_url} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs flex-shrink-0 border border-white/10">
                            {msg.sender.full_name[0]}
                          </div>
                        )
                      )}

                      <div>
                        {!isMe && (
                          <span className="text-[10px] text-[var(--text-secondary)] font-semibold mb-1 block pl-1">
                            {msg.sender.full_name}
                          </span>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white rounded-tr-none'
                              : 'bg-white/3 border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none font-medium'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className={`text-[8px] text-[var(--text-secondary)] mt-1 block pl-1 ${isMe ? 'text-right' : ''}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatScrollRef}></div>
            </div>

            {/* Chat Input Field */}
            <div className="p-4 border-t border-[var(--border-glass)]">
              <form onSubmit={handleSendChat} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Collaborate and share notes with the group..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 glass-input py-3 text-xs"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="glass-button p-3.5 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
            <BookOpen className="w-12 h-12 text-violet-400" />
            <h3 className="font-bold text-base">Select or Assemble a Study Circle</h3>
            <p className="text-xs max-w-xs">Double click or select a study circle in the left pane to initialize chat workspace coordinates.</p>
          </div>
        )}
      </div>
    </div>
  );
};
