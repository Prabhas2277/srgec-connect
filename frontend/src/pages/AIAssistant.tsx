import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Cpu,
  BookOpen,
  GraduationCap,
  Award,
  ArrowRight,
  Bot
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const { apiFetch } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your SRGEC AI Academic Assistant. How can I help you study today? You can select different explanation modes depending on what you're learning."
    }
  ]);
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<'beginner' | 'exam' | 'expert' | 'teacher'>('beginner');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { text: 'Explain TCP sliding window protocol', icon: Cpu },
    { text: 'Give me exam-style points for CAP theorem', icon: BookOpen },
    { text: 'Teach me Dijkstra routing step-by-step', icon: GraduationCap },
    { text: 'Compare SQLite vs. PostgreSQL mathematically', icon: Award }
  ];

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAsk = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Add user query
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await apiFetch('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question: textToSend, mode })
      });
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: response.answer
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: `Error: ${err.message || 'I am having trouble connecting to Gemini API right now. Please try again.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* SIDE CONTROL CONFIG */}
      <div className="lg:col-span-1 glass-vision p-5 flex flex-col gap-5 justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-violet-400 font-bold">
            <Sparkles className="w-5 h-5" />
            <span>AI Brain Settings</span>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Learning Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'beginner', title: 'Beginner Mode', desc: 'Simple explanations, rich analogies.' },
                { id: 'exam', title: 'Exam Mode', desc: 'Point-wise structures for full marks.' },
                { id: 'expert', title: 'Expert Mode', desc: 'Math proofs and coding examples.' },
                { id: 'teacher', title: 'Teacher Mode', desc: 'Socratic step-by-step guidance.' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    mode === m.id
                      ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border-violet-500 text-[var(--text-primary)]'
                      : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-white/5'
                  }`}
                >
                  <h4 className="text-xs font-bold leading-none">{m.title}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-tight">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#FAFAF8] border border-[var(--border-glass)] rounded-xl text-center">
          <span className="text-[10px] text-[var(--text-primary)] font-semibold block">Academic Tip</span>
          <span className="text-[9px] text-[var(--text-secondary)] mt-1 block">
            Use Expert Mode to generate custom code blocks and mathematical proofs.
          </span>
        </div>
      </div>

      {/* CHAT INTERFACE */}
      <div className="lg:col-span-3 glass-vision flex flex-col justify-between overflow-hidden">
        {/* Messages Screen */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {msg.sender === 'assistant' ? (
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              ) : null}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white rounded-tr-none'
                    : 'bg-white/3 border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none font-medium'
                }`}
              >
                {/* Parse Markdown-like structure */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Check headers
                    if (line.startsWith('### ')) {
                      return <h3 key={lIdx} className="text-base font-bold text-violet-400 mt-2">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h4 key={lIdx} className="text-sm font-bold text-cyan-400 mt-2">{line.replace('#### ', '')}</h4>;
                    }
                    if (line.startsWith('* **')) {
                      return <p key={lIdx} className="pl-4 border-l-2 border-cyan-400">{line.replace('* ', '')}</p>;
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
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

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 py-3 border-t border-[var(--border-glass)] flex flex-wrap gap-2.5">
            {suggestionChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAsk(chip.text)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/3 border border-[var(--border-glass)] hover:border-violet-500/50 py-1.5 px-3 rounded-full cursor-pointer transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  {chip.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 border-t border-[var(--border-glass)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder="Ask an academic question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 glass-input py-3"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
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
