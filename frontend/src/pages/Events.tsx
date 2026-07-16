import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle,
  QrCode,
  FileText,
  AlertCircle,
  PlusCircle,
  FileCheck,
  Star,
  RefreshCw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Events: React.FC = () => {
  const { user, apiFetch, refreshUser } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Event Creation state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('workshop');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [feedbackUrl, setFeedbackUrl] = useState('');
  
  // Attendance Verification state
  const [showQRModal, setShowQRModal] = useState<number | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [qrError, setQrError] = useState('');
  const [verifyingQR, setVerifyingQR] = useState(false);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');

  // Certificate Modal State
  const [showCert, setShowCert] = useState<any>(null);

  const fetchEvents = async () => {
    try {
      const data = await apiFetch('/events/list');
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/events/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          type,
          date: new Date(date).toISOString(),
          location,
          max_participants: parseInt(maxParticipants),
          feedback_form_url: feedbackUrl || null
        })
      });
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      fetchEvents();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRSVP = async (id: number) => {
    try {
      await apiFetch(`/events/${id}/register`, { method: 'POST' });
      fetchEvents();
      refreshUser();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQRVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQRModal) return;
    setVerifyingQR(true);
    setQrError('');
    try {
      const data = await apiFetch(`/events/${showQRModal}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ qr_code: qrInput })
      });
      
      setShowQRModal(null);
      setQrInput('');
      fetchEvents();
      refreshUser();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      setQrError(err.message || 'Invalid QR code code token');
    } finally {
      setVerifyingQR(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedbackModal) return;
    try {
      await apiFetch(`/events/${showFeedbackModal}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ rating: feedbackRating, comments: feedbackComments })
      });
      setShowFeedbackModal(null);
      setFeedbackComments('');
      fetchEvents();
      refreshUser();
    } catch (err) {
      console.error(err);
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
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Events & Workshops</h2>
          <p className="text-sm text-[var(--text-secondary)]">Register for college events, scan QR attendance, and earn participation certificates.</p>
        </div>

        {user && (user.role === 'faculty' || user.role === 'club_coordinator' || user.role === 'admin') && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="glass-button text-sm flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Host Event
          </button>
        )}
      </div>

      {/* CREATE EVENT FORM PANEL */}
      {showCreate && (
        <div className="glass-vision p-6 border-violet-500/30">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            Create Event Listing
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Android Development Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Venue Location</label>
                <input
                  type="text"
                  placeholder="e.g. CSE Seminar Hall / Online"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Description</label>
              <textarea
                placeholder="Give details about workshop modules, speakers, eligibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input min-h-20 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Event Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full glass-input">
                  <option value="workshop" className="bg-[var(--bg-secondary)]">Workshop</option>
                  <option value="hackathon" className="bg-[var(--bg-secondary)]">Hackathon</option>
                  <option value="seminar" className="bg-[var(--bg-secondary)]">Guest Lecture</option>
                  <option value="cultural" className="bg-[var(--bg-secondary)]">Cultural Fest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Participant Limit</label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Feedback URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Google Forms URL"
                  value={feedbackUrl}
                  onChange={(e) => setFeedbackUrl(e.target.value)}
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="glass-button-secondary text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="glass-button text-sm">
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EVENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          // Check if current user is registered
          const isRegistered = user?.registrations?.some((r: any) => r.event_id === ev.id);
          const regInfo = user?.registrations?.find((r: any) => r.event_id === ev.id);
          const hasAttended = regInfo?.status === 'attended' || regInfo?.status === 'feedback_submitted' || regInfo?.status === 'certificate_generated';
          const hasSubmittedFeedback = regInfo?.status === 'feedback_submitted';
          
          return (
            <div key={ev.id} className="glass-vision-interactive p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-3 top-3">
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                  {ev.type}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] pr-12">{ev.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-3">{ev.description}</p>

                <div className="mt-4 space-y-2 border-t border-[var(--border-glass)] pt-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span>{new Date(ev.date).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{ev.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>RSVPs: {ev.rsvp_count} / {ev.max_participants || 'Unlimited'}</span>
                  </div>
                </div>
              </div>

              {/* ACTION ROW BAR */}
              <div className="border-t border-[var(--border-glass)] pt-4 mt-4 flex items-center gap-2.5">
                {!isRegistered ? (
                  <button
                    onClick={() => handleRSVP(ev.id)}
                    className="glass-button text-xs py-2 px-4 cursor-pointer w-full flex items-center justify-center gap-1.5"
                  >
                    RSVP Register
                  </button>
                ) : (
                  <div className="w-full space-y-2">
                    {/* Registered Status Banner */}
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Registered
                      </span>
                      {hasAttended && <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-400">Attended</span>}
                    </div>

                    {/* Conditional Action Buttons */}
                    <div className="flex gap-2 w-full">
                      {!hasAttended ? (
                        <button
                          onClick={() => setShowQRModal(ev.id)}
                          className="glass-button-secondary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Verify Attendance
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowCert({ eventTitle: ev.title, date: ev.date })}
                            className="glass-button text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 border-none shadow-amber-500/20"
                          >
                            <Award className="w-3.5 h-3.5 text-white" /> Get Certificate
                          </button>
                          
                          {!hasSubmittedFeedback && (
                            <button
                              onClick={() => setShowFeedbackModal(ev.id)}
                              className="glass-button-secondary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" /> Submit Feedback
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QR VERIFY DIALOGUE MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-vision p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Scan Attendance QR</h3>
            <p className="text-xs text-[var(--text-secondary)]">Enter the event coordinate token to log your physical attendance. (e.g. Try typing: <code>CODEQUEST_2026_TOKEN</code> or <code>GENAI_WORKSHOP_TOKEN</code> depending on the event)</p>

            {qrError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {qrError}
              </div>
            )}

            <form onSubmit={handleQRVerify} className="space-y-4">
              <input
                type="text"
                placeholder="Paste event token here..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full glass-input"
                required
              />

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRModal(null);
                    setQrError('');
                  }}
                  className="glass-button-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingQR}
                  className="glass-button text-xs flex items-center gap-1.5"
                >
                  {verifyingQR ? 'Verifying...' : 'Log Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-vision p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Event Feedback</h3>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-2">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1.5">Comments</label>
                <textarea
                  placeholder="Share your thoughts about speakers, timing, topics..."
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  className="w-full glass-input min-h-20 resize-none text-xs"
                  required
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(null)}
                  className="glass-button-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button text-xs">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE VIEWER MODAL */}
      {showCert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-8 relative shadow-2xl border-8 border-violet-950 font-serif overflow-hidden">
            {/* Design Watermarks */}
            <div className="absolute right-[-100px] bottom-[-100px] w-64 h-64 border border-violet-100 rounded-full opacity-30 pointer-events-none"></div>
            <div className="absolute left-[-100px] top-[-100px] w-64 h-64 border border-violet-100 rounded-full opacity-30 pointer-events-none"></div>
            
            <div className="text-center space-y-6">
              <h1 className="text-2xl font-bold tracking-widest text-violet-950 border-b-2 border-violet-950 pb-2 m-0 uppercase font-sans">
                Seshadri Rao Gudlavalleru Engineering College
              </h1>
              <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-slate-500 block">
                Gudlavalleru, Andhra Pradesh
              </span>
              
              <div className="py-2">
                <span className="text-3xl font-extrabold text-amber-600 block uppercase font-serif">Certificate of Participation</span>
                <span className="text-[11px] text-slate-500 italic block mt-1">This is proudly awarded to</span>
              </div>

              <div>
                <span className="text-2xl font-bold border-b border-slate-300 pb-1.5 px-12 inline-block font-sans text-slate-950">
                  {user?.full_name}
                </span>
                <span className="text-[10px] text-slate-500 block mt-2">
                  Roll Number: <strong className="text-slate-800">{user?.roll_number || 'Faculty ID'}</strong>
                </span>
              </div>

              <p className="text-sm leading-relaxed max-w-lg mx-auto text-slate-700 italic">
                for successfully attending the workshop/event titled <strong>"{showCert.eventTitle}"</strong> held on{' '}
                {new Date(showCert.date).toLocaleDateString()} organized by the college campus club.
              </p>

              <div className="flex justify-between items-center pt-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-24 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans mt-1 block">Club Convener</span>
                </div>
                <div className="w-16 h-16 border border-violet-200 rounded-full flex items-center justify-center font-bold text-violet-900 bg-violet-50 text-[9px] uppercase tracking-wider shadow-inner font-sans">
                  SRGEC
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans mt-1 block">Principal</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCert(null)}
              className="absolute right-4 top-4 font-sans text-slate-500 hover:text-slate-800 font-bold border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
