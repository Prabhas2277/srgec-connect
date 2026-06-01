import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  User,
  Vote,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SocialFeed: React.FC = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post State
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<string | null>(null); // null, 'poll'
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Expand Comments State
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});

  const fetchFeed = async () => {
    try {
      const data = await apiFetch('/social/feed');
      setFeed(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submittingPost) return;
    setSubmittingPost(true);
    try {
      const filteredOptions = pollOptions.filter((o) => o.trim() !== '');
      const body = {
        content,
        media_type: mediaType || null,
        poll_options: mediaType === 'poll' ? JSON.stringify(filteredOptions) : null
      };

      await apiFetch('/social/post', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      setContent('');
      setMediaType(null);
      setPollOptions(['', '']);
      fetchFeed();
      refreshUser();
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.9 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      const data = await apiFetch(`/social/post/${id}/like`, { method: 'POST' });
      setFeed((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes_count: data.likes_count } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (postId: number, option: string) => {
    try {
      const data = await apiFetch(`/social/post/${postId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ choice: option })
      });
      setFeed((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, poll_votes: JSON.stringify(data.poll_votes) } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendComment = async (postId: number) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;
    try {
      const newComment = await apiFetch(`/social/post/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content: text })
      });
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setFeed((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, newComment]
            };
          }
          return p;
        })
      );
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions((prev) => [...prev, '']);
    }
  };

  const updatePollOptionVal = (idx: number, val: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Campus Social Feed</h2>
        <p className="text-sm text-[var(--text-secondary)]">Discuss academic topics, ask questions, and share updates.</p>
      </div>

      {/* CREATE POST BOX */}
      <div className="glass-vision p-5 space-y-4">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-3">
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-white/5 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
            <textarea
              placeholder="What's happening around SRGEC today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 glass-input min-h-24 resize-none text-xs"
              required
            />
          </div>

          {/* POLL FIELDS */}
          {mediaType === 'poll' && (
            <div className="pl-12 space-y-2 border-l border-[var(--border-glass)]">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Poll Choices</span>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Choice ${idx + 1}`}
                  value={opt}
                  onChange={(e) => updatePollOptionVal(idx, e.target.value)}
                  className="w-full glass-input py-1.5 text-xs"
                  required
                />
              ))}
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={addPollOption}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mt-1 bg-cyan-500/10 px-2 py-1 rounded-full cursor-pointer hover:bg-cyan-500/20"
                >
                  <Plus className="w-3 h-3" /> Add Choice
                </button>
              )}
            </div>
          )}

          <div className="border-t border-[var(--border-glass)] pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaType((prev) => (prev === 'poll' ? null : 'poll'))}
                className={`flex items-center gap-1.5 text-[10px] font-semibold py-1.5 px-3 rounded-full cursor-pointer border transition-all ${
                  mediaType === 'poll'
                    ? 'bg-violet-500/10 border-violet-500 text-violet-400'
                    : 'bg-white/3 border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                Build Poll
              </button>
            </div>

            <button
              type="submit"
              disabled={submittingPost || !content.trim()}
              className="glass-button text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              {submittingPost ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Share Post'}
            </button>
          </div>
        </form>
      </div>

      {/* FEED TIMELINE */}
      <div className="space-y-4">
        {feed.map((post) => {
          const isPoll = post.media_type === 'poll';
          let votesData: Record<string, number> = {};
          if (isPoll && post.poll_votes) {
            try {
              votesData = JSON.parse(post.poll_votes);
            } catch (err) {}
          }
          const totalVotes = Object.values(votesData).reduce((a, b) => a + b, 0);

          return (
            <div key={post.id} className="glass-vision-interactive p-5 space-y-4">
              {/* Header profile info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.creator.profile_photo_url ? (
                    <img src={post.creator.profile_photo_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 text-sm">
                      {post.creator.full_name[0]}
                    </div>
                  )}
                  <div className="text-left leading-tight">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{post.creator.full_name}</h4>
                    <span className="text-[9px] text-[var(--text-secondary)] capitalize mt-0.5 block">
                      {post.creator.role.replace('_', ' ')} • {post.creator.department}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Content text */}
              <p className="text-xs text-[var(--text-primary)] leading-relaxed pl-1">{post.content}</p>

              {/* RENDER POLLS */}
              {isPoll && (
                <div className="space-y-2 pl-1 border-l-2 border-violet-500/20 py-1">
                  {Object.entries(votesData).map(([option, count]) => {
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <button
                        key={option}
                        onClick={() => handleVote(post.id, option)}
                        className="w-full text-left relative overflow-hidden bg-white/2 border border-white/5 p-3 rounded-xl hover:border-violet-500/30 transition-all cursor-pointer block"
                      >
                        {/* Vote Percent background fill */}
                        <div
                          className="absolute inset-y-0 left-0 bg-violet-600/10 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                        
                        <div className="relative flex justify-between text-xs font-semibold">
                          <span>{option}</span>
                          <span className="text-violet-400">{pct}% ({count})</span>
                        </div>
                      </button>
                    );
                  })}
                  <span className="text-[8px] text-[var(--text-secondary)] block pl-1">
                    Total Votes: {totalVotes}
                  </span>
                </div>
              )}

              {/* Reactions Bar */}
              <div className="border-t border-b border-[var(--border-glass)] py-2.5 flex items-center gap-6 text-xs text-[var(--text-secondary)]">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 hover:text-violet-400 cursor-pointer transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Like ({post.likes_count})
                </button>

                <button
                  onClick={() =>
                    setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                  }
                  className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Comments ({post.comments?.length || 0})
                </button>

                <button className="flex items-center gap-1.5 hover:text-indigo-400 cursor-pointer ml-auto transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>

              {/* EXPANDED COMMENTS DRAWER */}
              {expandedComments[post.id] && (
                <div className="space-y-4 pt-1">
                  {/* Comments lists */}
                  <div className="space-y-3 pl-2 border-l border-[var(--border-glass)]">
                    {post.comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-2.5 items-start">
                        {c.creator.profile_photo_url ? (
                          <img src={c.creator.profile_photo_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                            {c.creator.full_name[0]}
                          </div>
                        )}
                        <div className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-[var(--text-primary)]">{c.creator.full_name}</span>
                            <span className="text-[8px] text-[var(--text-secondary)]">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Write your comment..."
                      value={commentInput[post.id] || ''}
                      onChange={(e) =>
                        setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      className="flex-1 glass-input py-2 text-xs"
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      disabled={!commentInput[post.id]?.trim()}
                      className="glass-button p-2.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
