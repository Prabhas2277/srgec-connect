import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Send,
  RefreshCw,
  Award,
  BookOpen,
  CheckCircle,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DialogueMessage {
  role: 'interviewer' | 'candidate';
  text: string;
}

export const MockInterview: React.FC = () => {
  const { apiFetch, refreshUser } = useAuth();
  
  // Setup States
  const [roleType, setRoleType] = useState('Backend');
  const [session, setSession] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  // Active Interview States
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scorecard State
  const [scorecard, setScorecard] = useState<any>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, submittingAnswer]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setScorecard(null);
    setDialogue([]);
    try {
      const data = await apiFetch('/ai/interview/start', {
        method: 'POST',
        body: JSON.stringify({ role_type: roleType })
      });
      setSession(data);
      const history = JSON.parse(data.history);
      setDialogue(history.map((h: any) => ({
        role: h.role,
        text: h.text
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateAnswer.trim() || submittingAnswer) return;

    const answerText = candidateAnswer;
    setCandidateAnswer('');
    
    // Optimistically update local dialogue list
    setDialogue((prev) => [...prev, { role: 'candidate', text: answerText }]);
    setSubmittingAnswer(true);

    try {
      const data = await apiFetch(`/ai/interview/${session.id}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer: answerText })
      });
      
      setSession(data);
      
      if (data.status === 'completed') {
        const feedbackObj = JSON.parse(data.feedback);
        setScorecard(feedbackObj);
        setSession(null);
        // Play level-up success confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        // Refresh XP
        refreshUser();
      } else {
        const history = JSON.parse(data.history);
        setDialogue(history.map((h: any) => ({
          role: h.role,
          text: h.text
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // --- RENDERING CONFIG PANEL ---
  const renderSetupPanel = () => (
    <div className="max-w-md mx-auto glass-vision p-6 space-y-6 mt-8">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">AI Mock Interview Board</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Select a role template to start a 5-question AI technical/HR dialogue simulation.</p>
      </div>

      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Target Interview Role</label>
          <select
            value={roleType}
            onChange={(e) => setRoleType(e.target.value)}
            className="w-full glass-input"
          >
            <option value="Backend" className="bg-[var(--bg-secondary)]">Backend Engineer (SQL, APIs, Scaling)</option>
            <option value="Frontend" className="bg-[var(--bg-secondary)]">Frontend Engineer (React, DOM, JS)</option>
            <option value="HR" className="bg-[var(--bg-secondary)]">HR Behavioral Round (Conflict, Career goals)</option>
            <option value="Aptitude" className="bg-[var(--bg-secondary)]">Quantitative Aptitude (Logic, Puzzles, Probability)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={starting}
          className="w-full glass-button flex items-center justify-center gap-2 cursor-pointer"
        >
          {starting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Begin Interview Session'}
        </button>
      </form>
    </div>
  );

  // --- RENDERING ACTIVE DIALOGUE ---
  const renderActiveDialogue = () => {
    // Current progress calculation
    const qCount = Math.floor(dialogue.filter((d) => d.role === 'interviewer').length);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Status Dashboard Panel */}
        <div className="lg:col-span-1 glass-vision p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block">Simulation Details</span>
            <div className="p-3 bg-white/2 border border-[var(--border-glass)] rounded-xl">
              <span className="text-[10px] text-[var(--text-secondary)] block">Target Role</span>
              <span className="text-sm font-bold block mt-1">{roleType} Drive</span>
            </div>
            
            <div className="p-3 bg-white/2 border border-[var(--border-glass)] rounded-xl">
              <span className="text-[10px] text-[var(--text-secondary)] block">Interview Length</span>
              <span className="text-sm font-bold block mt-1">Question {qCount} / 5</span>
            </div>
          </div>

          <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl text-center">
            <span className="text-xs font-bold text-violet-300 block">XP Multiplier Potential</span>
            <span className="text-xl font-extrabold text-[var(--text-primary)] block my-1">+100 XP</span>
            <span className="text-[9px] text-[var(--text-secondary)] block">Awarded instantly upon completing evaluation criteria.</span>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="lg:col-span-3 glass-vision flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {dialogue.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[80%] ${
                  msg.role === 'candidate' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.role === 'interviewer' && (
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'candidate'
                      ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white rounded-tr-none'
                      : 'bg-white/3 border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none font-medium'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {submittingAnswer && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex gap-1.5 p-3 rounded-2xl bg-white/3 border border-[var(--border-glass)] rounded-tl-none items-center">
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Form Answer submission */}
          <div className="p-4 border-t border-[var(--border-glass)]">
            <form onSubmit={handleSubmitAnswer} className="flex gap-3">
              <input
                type="text"
                placeholder="Type your response to the interviewer..."
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                className="flex-1 glass-input py-3 text-sm"
                required
                disabled={submittingAnswer}
              />
              <button
                type="submit"
                disabled={submittingAnswer || !candidateAnswer.trim()}
                className="glass-button p-3.5 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERING SCORECARD ---
  const renderScorecard = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Banner */}
      <div className="glass-vision p-6 text-center bg-gradient-to-r from-violet-900/30 via-violet-950/15 to-cyan-950/10 border-violet-500/30">
        <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold">Interview Assessment Report</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Excellent training run completed. XP rewards loaded to profile.</p>

        {/* Rating numbers */}
        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-violet-400">{scorecard.overall_score}%</span>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-semibold mt-1">Overall Match</span>
          </div>
          <div className="border-r border-[var(--border-glass)]"></div>
          <div className="text-center">
            <span className="text-3xl font-extrabold text-cyan-400">+100 XP</span>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-semibold mt-1">Earned Reward</span>
          </div>
        </div>
      </div>

      {/* Ratings details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-vision p-4 space-y-1">
          <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Technical Capability</h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{scorecard.technical_rating}</p>
        </div>

        <div className="glass-vision p-4 space-y-1">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Communication & Structure</h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{scorecard.communication_rating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4" />
            Key Strengths
          </h4>
          <ul className="space-y-1.5">
            {scorecard.strengths.map((str: string, i: number) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-emerald-400">•</span> {str}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Key Gaps
          </h4>
          <ul className="space-y-1.5">
            {scorecard.weaknesses.map((w: string, i: number) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-amber-400">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Plan */}
      <div className="glass-vision p-5">
        <h4 className="text-sm font-bold text-violet-400 flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          Recommended Action Plan
        </h4>
        <div className="space-y-3">
          {scorecard.improvement_plan.map((item: string, idx: number) => (
            <div key={idx} className="flex gap-3 items-start bg-white/2 border border-white/5 p-3 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setScorecard(null)}
        className="w-full glass-button flex items-center justify-center gap-2 cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Restart New Practice Simulation
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* TITLE */}
      {!dialogue.length && !scorecard && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">AI Mock Interview Board</h2>
          <p className="text-sm text-[var(--text-secondary)]">Simulate technical and HR campus interviews to earn XP and receive feedback card assessments.</p>
        </div>
      )}

      {dialogue.length > 0 && !scorecard && renderActiveDialogue()}
      {!dialogue.length && !scorecard && renderSetupPanel()}
      {scorecard && renderScorecard()}
    </div>
  );
};
