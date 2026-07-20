import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Layers, 
  BookOpen, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  Bell, 
  User, 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Info, 
  LogOut, 
  Trash2, 
  Check, 
  Sparkles,
  PieChart as PieIcon,
  ChevronDown
} from 'lucide-react';

// Mock Data for the screens
const TRANSACTION_MOCK = [
  { id: 1, title: 'Weekly Groceries', category: 'Groceries', amount: -124.50, date: 'Today, 2:30 PM' },
  { id: 2, title: 'Freelance Design Retainer', category: 'Income', amount: 850.00, date: 'Yesterday, 9:15 AM' },
  { id: 3, title: 'Streaming Services', category: 'Entertainment', amount: -14.99, date: '18 Jul, 11:45 PM' },
  { id: 4, title: 'Coffee & Bakery Cafe', category: 'Food & Drinks', amount: -8.75, date: '17 Jul, 8:30 AM' },
  { id: 5, title: 'Monthly Gym Membership', category: 'Health & Fitness', amount: -65.00, date: '15 Jul, 6:00 AM' }
];

const BUDGET_MOCK = [
  { id: 1, name: 'Groceries & Foods', spent: 345.50, limit: 500, percentage: 69 },
  { id: 2, name: 'Rent & Utilities', spent: 1200.00, limit: 1200, percentage: 100 },
  { id: 3, name: 'Entertainment & Leisure', spent: 98.40, limit: 300, percentage: 32 },
  { id: 4, name: 'Transport & Fuel', spent: 45.00, limit: 150, percentage: 30 }
];

const NOTIFICATIONS_MOCK = [
  { id: 1, title: 'Budget Alert: Groceries', preview: 'You have spent 69% of your groceries budget for July.', time: '10m ago', unread: true },
  { id: 2, title: 'Recurring Salary Dispatched', preview: 'Your freelance design retainer of $850.00 has cleared.', time: '1d ago', unread: false },
  { id: 3, title: 'Security Check: New Login', preview: 'A new login was detected from Safari on macOS (Mumbai).', time: '3d ago', unread: false }
];

export const FinanceTypographyDemo: React.FC = () => {
  const [fontFriendly, setFontFriendly] = useState(false); // false = Inter, true = Manrope
  const [showSpecsOverlay, setShowSpecsOverlay] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'onboarding' | 'auth' | 'dashboard' | 'add' | 'budget' | 'analytics' | 'notifications' | 'settings'>('dashboard');
  
  // Interactive app states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isLoginState, setIsLoginState] = useState(true);
  const [transactions, setTransactions] = useState(TRANSACTION_MOCK);
  const [budgets, setBudgets] = useState(BUDGET_MOCK);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_MOCK);
  
  // Add Expense form state
  const [formAmount, setFormAmount] = useState('0.00');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formError, setFormError] = useState('');

  // Fonts class selection
  const uiFontClass = fontFriendly ? 'font-finance-ui-friendly' : 'font-finance-ui';

  // Handler for adding expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Please enter a valid expense amount.');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Description is required.');
      return;
    }
    
    // Success: Add new transaction
    const newTx = {
      id: Date.now(),
      title: formTitle,
      category: formCategory,
      amount: -amountVal,
      date: 'Just now'
    };
    
    setTransactions([newTx, ...transactions]);
    
    // Update budget spent amount
    setBudgets(prev => prev.map(b => {
      if (b.name.toLowerCase().includes(formCategory.toLowerCase())) {
        const spentNew = b.spent + amountVal;
        return {
          ...b,
          spent: spentNew,
          percentage: Math.min(Math.round((spentNew / b.limit) * 100), 100)
        };
      }
      return b;
    }));

    // Reset Form
    setFormAmount('0.00');
    setFormTitle('');
    setFormError('');
    setActiveScreen('dashboard');
  };

  // Helper component to render spec labels inline if active
  const SpecTag = ({ label }: { label: string }) => {
    if (!showSpecsOverlay) return null;
    return (
      <span className="inline-block bg-violet-600 text-white font-mono text-[9px] uppercase tracking-wider px-1 py-0.5 rounded ml-1 scale-90 origin-left select-none relative z-10 pointer-events-none">
        {label}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${uiFontClass} bg-[#090D1A] text-slate-100 flex flex-col lg:flex-row relative overflow-x-hidden p-4 lg:p-8 gap-8`}>
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* LEFT PANEL: DESIGN SYSTEM DECK */}
      <div className="w-full lg:w-[480px] bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md shadow-2xl relative z-10">
        <div>
          {/* Header */}
          <div className="border-b border-slate-800 pb-5 mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Personal Finance</span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Typography Design System
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              An interactive environment showcasing global type scales, monospaced numerals, and typographic hierarchy across eight target pages.
            </p>
          </div>

          {/* Controller Panel */}
          <div className="space-y-6">
            {/* Font Pair Selectors */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Active UI Font Pairing</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFontFriendly(false)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    !fontFriendly 
                      ? 'bg-violet-600/10 border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-semibold">Inter &amp; IBM Plex</span>
                  <span className="text-[10px] opacity-75 mt-0.5 font-mono">Modern, High-Contrast</span>
                </button>

                <button
                  onClick={() => setFontFriendly(true)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    fontFriendly 
                      ? 'bg-violet-600/10 border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-semibold">Manrope &amp; IBM Plex</span>
                  <span className="text-[10px] opacity-75 mt-0.5 font-mono">Friendly, Geometric</span>
                </button>
              </div>
            </div>

            {/* Specs Overlay Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-white block">Typography HUD Overlay</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Labels target typographic scale names inside screens</span>
              </div>
              <button 
                onClick={() => setShowSpecsOverlay(!showSpecsOverlay)}
                className={`w-11 h-6 rounded-full p-0.5 transition-all cursor-pointer ${showSpecsOverlay ? 'bg-violet-600' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all ${showSpecsOverlay ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Screen Selector Deck */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Select Viewport Screen</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'onboarding', label: '1. Onboarding' },
                  { id: 'auth', label: '2. Auth Login' },
                  { id: 'dashboard', label: '3. Home Dashboard' },
                  { id: 'add', label: '4. Add Expense' },
                  { id: 'budget', label: '5. Budget Categories' },
                  { id: 'analytics', label: '6. Charts / Analytics' },
                  { id: 'notifications', label: '7. Notifications' },
                  { id: 'settings', label: '8. Profile Settings' }
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScreen(sc.id as any);
                      setFormError('');
                    }}
                    className={`py-2.5 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                      activeScreen === sc.id 
                        ? 'bg-violet-600 text-white border-violet-500 font-bold' 
                        : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Scale Blueprint */}
        <div className="mt-8 bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            Global Scale Cheat Sheet
          </h3>
          <div className="space-y-2 text-[11px] leading-relaxed text-slate-400 border-t border-slate-800/50 pt-2.5">
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">Display</span>
              <span className="font-mono">32–44px · Bold 700 · Tracking -0.5px (Num only)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">H1</span>
              <span className="font-mono">22–24px · Semibold 600</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">H2</span>
              <span className="font-mono">18–20px · Semibold 600</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">Body Large</span>
              <span className="font-mono text-violet-400">16px · Regular/Medium (Form Input Min)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">Body</span>
              <span className="font-mono">14–15px · Regular/Medium</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/20 pb-1.5">
              <span className="font-semibold text-white">Caption</span>
              <span className="font-mono">12–13px · Regular · Muted (60-70% Opacity)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-white">Micro</span>
              <span className="font-mono text-emerald-400">11px · Medium (App Floor Limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: PHONE VIEWPORT FRAME */}
      <div className="flex-1 flex justify-center items-center relative py-4">
        {/* Device Wrapper */}
        <div className="w-[375px] h-[780px] bg-black border-[12px] border-slate-800 rounded-[55px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between">
          
          {/* Notch Speaker */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-7 w-36 bg-slate-800 rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-black rounded-full mb-1"></div>
          </div>

          {/* Dynamic Viewport View */}
          <div className="flex-1 bg-[#090b11] text-slate-100 flex flex-col relative z-10 pt-9 pb-4 px-5 overflow-y-auto overflow-x-hidden">
            
            {/* 1. ONBOARDING SCREEN */}
            {activeScreen === 'onboarding' && (
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="space-y-1">
                  <span className="inline-block bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium text-violet-400 uppercase tracking-widest">
                    Step {onboardingStep} of 3
                  </span>
                </div>
                
                {/* Illustration block */}
                <div className="my-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center h-48 relative overflow-hidden">
                  <div className="absolute w-24 h-24 rounded-full bg-violet-600/10 blur-xl"></div>
                  {onboardingStep === 1 ? (
                    <>
                      <Sparkles className="w-12 h-12 text-violet-400 animate-pulse mb-3" />
                      <span className="finance-caption text-slate-400 font-finance-ui text-center">Smart expense classification engine</span>
                    </>
                  ) : onboardingStep === 2 ? (
                    <>
                      <TrendingUp className="w-12 h-12 text-violet-400 mb-3" />
                      <span className="finance-caption text-slate-400 font-finance-ui text-center">Real-time analytical graphs & forecasts</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-12 h-12 text-emerald-400 mb-3" />
                      <span className="finance-caption text-slate-400 font-finance-ui text-center">Save, track, and budget stress-free</span>
                    </>
                  )}
                </div>

                {/* Typography System Elements */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-[28px] font-bold leading-tight tracking-tight text-white font-finance-ui">
                      {onboardingStep === 1 ? 'Control Your Spending Life.' : onboardingStep === 2 ? 'Track Smart Wealth Analytics.' : 'Your Finance, Fully Restored.'}
                      <SpecTag label="Bold 28-32px" />
                    </h2>
                    
                    <p className="text-[15px] font-normal leading-relaxed text-slate-400 font-finance-ui mt-3">
                      {onboardingStep === 1 
                        ? 'Connect multiple banks, set target budgets, and scan daily transactions automatically.' 
                        : onboardingStep === 2 
                        ? 'Understand where your income disappears with predictive models and automated categories.' 
                        : 'Establish smart alerts and keep your balances positive with strict spending caps.'
                      }
                      <SpecTag label="Regular 15-16px" />
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={() => {
                        if (onboardingStep < 3) {
                          setOnboardingStep(prev => prev + 1);
                        } else {
                          setOnboardingStep(1);
                          setActiveScreen('auth');
                        }
                      }}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-base font-semibold py-3.5 transition-all text-center border-none cursor-pointer"
                    >
                      {onboardingStep === 3 ? 'Get Started Now' : 'Continue Step'}
                      <SpecTag label="Semibold 16px" />
                    </button>
                    
                    {onboardingStep < 3 && (
                      <button 
                        onClick={() => {
                          setActiveScreen('auth');
                        }}
                        className="w-full text-[14px] font-medium text-slate-400 hover:text-white py-1 transition-all border-none bg-transparent cursor-pointer text-center"
                      >
                        Skip Onboarding
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. AUTH SCREEN */}
            {activeScreen === 'auth' && (
              <div className="flex-1 flex flex-col justify-between py-6">
                <div>
                  <h2 className="finance-h1 text-white font-finance-ui font-semibold">
                    {isLoginState ? 'Welcome Back' : 'Create Account'}
                    <SpecTag label="H1 (22-24px)" />
                  </h2>
                  <p className="finance-caption text-slate-400 font-finance-ui mt-1.5">
                    {isLoginState ? 'Sign in to access your ledger dashboard' : 'Start your financial journey with a free account'}
                  </p>

                  <form className="space-y-4 mt-8" onSubmit={(e) => e.preventDefault()}>
                    {!isLoginState && (
                      <div>
                        <label className="text-[12px] font-medium text-slate-400 uppercase tracking-widest block mb-2">
                          Full Name
                          <SpecTag label="Muted uppercase 12-13px (+0.3px tracking)" />
                        </label>
                        <input 
                          type="text" 
                          placeholder="Jane Doe" 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white finance-body-large focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="text-[12px] font-medium text-slate-400 uppercase tracking-widest block mb-2">
                        Email Address
                        <SpecTag label="Muted uppercase 12-13px" />
                      </label>
                      <input 
                        type="email" 
                        placeholder="jane@example.com" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white finance-body-large focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-medium text-slate-400 uppercase tracking-widest block mb-2">
                        Password
                        <SpecTag label="Muted uppercase 12-13px" />
                      </label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white finance-body-large focus:outline-none focus:border-violet-500"
                      />
                      <span className="text-[12px] text-slate-500 block mt-1.5">
                        Minimum 8 characters with at least one number
                        <SpecTag label="Helper/error 12-13px" />
                      </span>
                    </div>
                  </form>
                </div>

                <div className="space-y-4 pt-6">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveScreen('dashboard');
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-base font-semibold py-3.5 transition-all border-none cursor-pointer text-center"
                  >
                    {isLoginState ? 'Sign In Securely' : 'Sign Up Securely'}
                    <SpecTag label="Semibold 16px" />
                  </button>

                  <button 
                    onClick={() => setIsLoginState(!isLoginState)}
                    className="w-full text-[13px] text-slate-400 hover:text-white text-center cursor-pointer bg-transparent border-none py-1"
                  >
                    {isLoginState ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </div>
            )}

            {/* 3. HOME DASHBOARD */}
            {activeScreen === 'dashboard' && (
              <div className="space-y-6 py-2">
                {/* Greeting Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="finance-body text-slate-400 block font-finance-ui">
                      Good morning, Jane
                      <SpecTag label="Muted 14-15px" />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                      20 July 2026
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('notifications')}
                    className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 relative cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                  </button>
                </div>

                {/* Big Balance Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl"></div>
                  <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest block">
                    Total Account Balance
                  </span>
                  
                  {/* DISPLAY NUMERAL ANCHOR */}
                  <div className="text-[38px] font-bold text-white font-finance-num tracking-tight mt-2 flex items-baseline">
                    $14,840.50
                    <SpecTag label="Display Tabular 36-44px" />
                  </div>

                  {/* Muted subtitles */}
                  <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 mt-4 text-[12px]">
                    <span className="text-emerald-500 font-medium font-finance-ui flex items-center gap-1">
                      +$1,420.00 this month
                    </span>
                    <span className="text-slate-500 font-finance-ui">
                      Active: 2 cards linked
                    </span>
                  </div>
                </div>

                {/* Section header */}
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest font-finance-ui">
                      Recent Activity
                      <SpecTag label="Semibold 13-14px tracked" />
                    </h3>
                    <button 
                      onClick={() => setActiveScreen('add')}
                      className="text-[13px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Expense
                    </button>
                  </div>

                  {/* Transactions list */}
                  <div className="space-y-2.5">
                    {transactions.map((tx) => {
                      const isIncome = tx.amount > 0;
                      return (
                        <div key={tx.id} className="bg-slate-900/40 border border-slate-850 rounded-xl p-3.5 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <h4 className="text-[15px] font-medium text-white font-finance-ui leading-tight">
                              {tx.title}
                              <SpecTag label="Medium 15-16px" />
                            </h4>
                            <span className="text-[13px] text-slate-500 block font-finance-ui leading-none">
                              {tx.date} · {tx.category}
                              <SpecTag label="Muted 13px" />
                            </span>
                          </div>
                          
                          {/* Numerical Amount */}
                          <div className={`text-[15px] font-semibold font-finance-num ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            <SpecTag label="Semibold 15-16px tabular-num" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Shortcut */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setActiveScreen('budget')}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800/40 py-3 rounded-xl text-[13px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Budgets
                  </button>
                  <button 
                    onClick={() => setActiveScreen('analytics')}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800/40 py-3 rounded-xl text-[13px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            )}

            {/* 4. ADD EXPENSE SCREEN */}
            {activeScreen === 'add' && (
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setActiveScreen('dashboard');
                        setFormError('');
                      }}
                      className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="finance-h2 text-white font-finance-ui font-semibold">
                      Add New Expense
                      <SpecTag label="H2 (18-20px)" />
                    </h3>
                  </div>

                  {/* Form amount block */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 text-center space-y-2">
                    <label className="text-[12px] font-medium text-slate-400 uppercase tracking-wider block">
                      Enter Amount (USD)
                      <SpecTag label="Field label 13px" />
                    </label>
                    
                    {/* BOLD AMOUNT INPUT VALUE */}
                    <div className="relative inline-block">
                      <input 
                        type="text"
                        value={formAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9.]*$/.test(val)) {
                            setFormAmount(val);
                          }
                        }}
                        className="bg-transparent border-none text-center text-[36px] font-bold text-violet-400 font-finance-num w-full focus:outline-none focus:ring-0"
                      />
                      <SpecTag label="Bold 32-40px tabular-num" />
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSaveExpense} className="space-y-4">
                    {formError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[12px] font-medium">
                        {formError}
                      </div>
                    )}

                    <div>
                      <label className="text-[13px] font-medium text-slate-400 block mb-2">
                        Description / Title
                        <SpecTag label="Medium 13px label" />
                      </label>
                      {/* Body large input input for autozoom avoidance */}
                      <input 
                        type="text" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Weekly Groceries Shop" 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-white finance-body-large focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-medium text-slate-400 block mb-2">
                        Category Tag
                        <SpecTag label="Medium 13px label" />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Groceries', 'Entertainment', 'Food & Drinks', 'Transport'].map((cat) => {
                          const isSelected = formCategory === cat;
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => setFormCategory(cat)}
                              className={`py-2 px-3 rounded-lg text-[14px] font-medium cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-violet-600 text-white border-violet-500' 
                                  : 'bg-slate-900 border border-slate-800 text-slate-400'
                              }`}
                            >
                              {cat}
                              {isSelected && <SpecTag label="Selected chip 14px" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </form>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSaveExpense}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-base font-semibold py-3.5 transition-all border-none cursor-pointer text-center"
                  >
                    Save Transaction Details
                    <SpecTag label="Semibold 16px" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. BUDGET SCREEN */}
            {activeScreen === 'budget' && (
              <div className="space-y-6 py-2">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveScreen('dashboard')}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="finance-h2 text-white font-finance-ui font-semibold">
                    Monthly Budget Rules
                  </h3>
                </div>

                {/* Budget Category Progress items */}
                <div className="space-y-4">
                  {budgets.map((b) => {
                    const isWarning = b.percentage >= 85;
                    const isLimit = b.percentage >= 100;
                    
                    return (
                      <div key={b.id} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-[15px] font-semibold text-white font-finance-ui">
                            {b.name}
                            <SpecTag label="Medium 15-16px" />
                          </h4>
                          
                          {/* Percentage labels (weight conveying hierarchy) */}
                          <span className={`text-[12px] font-bold ${isLimit ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-400'}`}>
                            {b.percentage}%
                            <SpecTag label="Semibold 12px percentage" />
                          </span>
                        </div>

                        {/* Custom visual progress bar (colorblind safe - thickness, indicators) */}
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isLimit ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-violet-600'
                            }`}
                            style={{ width: `${b.percentage}%` }}
                          ></div>
                        </div>

                        {/* spent progress text */}
                        <div className="flex justify-between items-center text-[13px] font-finance-num">
                          <span className="text-white font-medium">
                            Spent ${b.spent.toFixed(2)}
                            <SpecTag label="Full-opacity spent amount 13-14px" />
                          </span>
                          <span className="text-slate-500 font-normal">
                            of ${b.limit.toFixed(2)}
                            <SpecTag label="Muted limit text 13-14px" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl flex gap-3">
                  <Info className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <p className="finance-caption text-slate-400">
                    Syllabus thresholds will highlight warnings once category spending reaches 85% of total budget limit cap.
                  </p>
                </div>
              </div>
            )}

            {/* 6. ANALYTICS/CHARTS SCREEN */}
            {activeScreen === 'analytics' && (
              <div className="space-y-6 py-2">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveScreen('dashboard')}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="finance-h2 text-white font-finance-ui font-semibold">
                    Analytics Board
                  </h3>
                </div>

                {/* SVG Analytical Chart */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] font-semibold text-white font-finance-ui">
                      Weekly Expense Graph
                      <SpecTag label="Semibold 16-18px chart title" />
                    </span>
                    <span className="text-[12px] font-medium text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                      Last 5 Days
                    </span>
                  </div>

                  {/* SVG Chart block */}
                  <div className="h-36 w-full relative pt-2">
                    <svg className="w-full h-full" viewBox="0 0 100 50">
                      {/* Graph Path */}
                      <path 
                        d="M 5 40 L 25 32 L 45 45 L 65 15 L 85 20" 
                        fill="none" 
                        stroke="#7C3AED" 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Points */}
                      <circle cx="5" cy="40" r="1.5" fill="#FFF" stroke="#7C3AED" strokeWidth="0.8" />
                      <circle cx="25" cy="32" r="1.5" fill="#FFF" stroke="#7C3AED" strokeWidth="0.8" />
                      <circle cx="45" cy="45" r="1.5" fill="#FFF" stroke="#7C3AED" strokeWidth="0.8" />
                      <circle cx="65" cy="15" r="1.5" fill="#7C3AED" stroke="#FFF" strokeWidth="1" />
                      <circle cx="85" cy="20" r="1.5" fill="#FFF" stroke="#7C3AED" strokeWidth="0.8" />

                      {/* Tooltip callout marker */}
                      <line x1="65" y1="15" x2="65" y2="45" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
                    </svg>

                    {/* Chart axis label - floor of the scale (11-12px) */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[11px] font-medium text-slate-500 font-finance-ui">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span className="text-violet-400 font-bold">Thu</span>
                      <span>Fri</span>
                      <SpecTag label="Regular 11-12px muted axis labels" />
                    </div>

                    {/* Float tooltip callout */}
                    <div className="absolute top-2 left-[50%] transform -translate-x-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 shadow-xl z-20">
                      <span className="text-[14px] font-bold text-white font-finance-num block text-center">
                        $245.50
                        <SpecTag label="Semibold 14-16px data callout" />
                      </span>
                      <span className="text-[10px] text-slate-500 block text-center">Thursday Peak</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="flex justify-center gap-4 border-t border-slate-800/40 pt-3 mt-2 text-[12px] text-slate-400 font-finance-ui">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block"></span>
                      <span>
                        Spent ($343.24)
                        <SpecTag label="Regular 12-13px legend" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
                      <span>Averages ($120.00)</span>
                    </div>
                  </div>
                </div>

                {/* Key Insights Stats callout */}
                <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider">Historical Callouts</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <span className="text-[11px] text-slate-500 uppercase tracking-widest block">Highest Category</span>
                      <span className="text-[15px] font-bold text-white block mt-1">Rent &amp; Utilities</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl">
                      <span className="text-[11px] text-slate-500 uppercase tracking-widest block">Daily Average</span>
                      <span className="text-[15px] font-bold text-white font-finance-num block mt-1">$45.60</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. NOTIFICATIONS SCREEN */}
            {activeScreen === 'notifications' && (
              <div className="space-y-6 py-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveScreen('dashboard')}
                      className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="finance-h2 text-white font-finance-ui font-semibold">
                      Notifications
                    </h3>
                  </div>

                  <button 
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, unread: false })));
                    }}
                    className="text-[12px] font-semibold text-violet-400 hover:text-violet-300 cursor-pointer bg-transparent border-none"
                  >
                    Mark all read
                  </button>
                </div>

                {/* Alerts List */}
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item));
                      }}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                        n.unread 
                          ? 'bg-violet-600/5 border-violet-500/30' 
                          : 'bg-slate-900/20 border-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <h4 className={`text-[14.5px] font-finance-ui leading-tight ${n.unread ? 'font-semibold text-white' : 'font-normal text-slate-300'}`}>
                            {n.title}
                            {n.unread ? (
                              <SpecTag label="Semibold 14-15px (Unread)" />
                            ) : (
                              <SpecTag label="Regular 14-15px (Read)" />
                            )}
                          </h4>
                          <p className="text-[13.5px] text-slate-500 font-finance-ui leading-relaxed">
                            {n.preview}
                            <SpecTag label="Muted preview 13-14px" />
                          </p>
                        </div>

                        {/* Timestamp - regular 12px muted */}
                        <span className="text-[12px] text-slate-500 font-normal whitespace-nowrap">
                          {n.time}
                          <SpecTag label="Muted 12px timestamp" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. PROFILE & SETTINGS */}
            {activeScreen === 'settings' && (
              <div className="space-y-6 py-2">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveScreen('dashboard')}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="finance-h2 text-white font-finance-ui font-semibold">
                    Profile &amp; Settings
                  </h3>
                </div>

                {/* Profile Avatar Card */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                    JD
                  </div>
                  <div>
                    <h4 className="text-[16px] font-semibold text-white font-finance-ui">Jane Doe</h4>
                    <span className="text-[12.5px] text-slate-500 block mt-0.5">Premium Vault Account</span>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-2.5">
                  <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest block pl-1">
                    Preferences Configuration
                    <SpecTag label="Semibold uppercase 12-13px (+0.3px tracking)" />
                  </h3>

                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl divide-y divide-slate-800/40 overflow-hidden">
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-850/20">
                      <span className="text-[16px] font-normal text-white font-finance-ui">
                        Email Notifications
                        <SpecTag label="Regular 16px row labels" />
                      </span>
                      <span className="text-[14px] text-slate-400 font-finance-ui">
                        Daily Digest
                        <SpecTag label="Muted value 14px" />
                      </span>
                    </div>

                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-850/20">
                      <span className="text-[16px] font-normal text-white font-finance-ui">
                        Default Currency
                      </span>
                      <span className="text-[14px] text-slate-400 font-finance-ui">
                        USD ($)
                      </span>
                    </div>

                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-850/20">
                      <span className="text-[16px] font-normal text-white font-finance-ui">
                        Pin Verification
                      </span>
                      <span className="text-[14px] text-slate-400 font-finance-ui">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Destructive Actions block */}
                <div className="space-y-2.5">
                  <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest block pl-1">
                    Critical Actions
                  </h3>

                  <div className="bg-slate-900/40 border border-slate-850 rounded-2xl divide-y divide-slate-800/40 overflow-hidden">
                    {/* Log out destructive row - same weight as normal rows, color signals danger, not bold */}
                    <button 
                      onClick={() => {
                        setActiveScreen('onboarding');
                        setOnboardingStep(1);
                      }}
                      className="w-full p-4 flex justify-between items-center hover:bg-slate-850/20 cursor-pointer text-left border-none bg-transparent"
                    >
                      <span className="text-[16px] font-normal text-rose-500 font-finance-ui">
                        Log out Session
                        <SpecTag label="Regular 16px row (color signals danger, not extra weight)" />
                      </span>
                      <LogOut className="w-4 h-4 text-rose-500" />
                    </button>

                    <button 
                      onClick={() => {
                        alert("Account deletion triggered!");
                      }}
                      className="w-full p-4 flex justify-between items-center hover:bg-slate-850/20 cursor-pointer text-left border-none bg-transparent"
                    >
                      <span className="text-[16px] font-normal text-rose-500 font-finance-ui">
                        Delete Ledger Account
                      </span>
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Device Tab bar footer for easy jumping */}
          <div className="h-16 bg-[#0c0f17] border-t border-slate-850 px-6 flex justify-between items-center relative z-20">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className={`flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none ${activeScreen === 'dashboard' ? 'text-violet-500' : 'text-slate-500'}`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold font-finance-ui">Home</span>
            </button>
            <button 
              onClick={() => setActiveScreen('analytics')}
              className={`flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none ${activeScreen === 'analytics' ? 'text-violet-500' : 'text-slate-500'}`}
            >
              <PieIcon className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold font-finance-ui">Charts</span>
            </button>
            <button 
              onClick={() => setActiveScreen('notifications')}
              className={`flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none ${activeScreen === 'notifications' ? 'text-violet-500' : 'text-slate-500'}`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold font-finance-ui">Alerts</span>
            </button>
            <button 
              onClick={() => setActiveScreen('settings')}
              className={`flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none ${activeScreen === 'settings' ? 'text-violet-500' : 'text-slate-500'}`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold font-finance-ui">Profile</span>
            </button>
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full z-40"></div>
        </div>
      </div>
    </div>
  );
};
