import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Group,
  HardHat,
  Hexagon,
  Lock,
  Mail,
  Menu,
  Shield,
  X,
} from 'lucide-react';
import {
  CITIZEN_ACCOUNTS,
  MANAGER_ACCOUNT,
  WORKER_ACCOUNTS,
  type AuthUser,
  type CitizenUser,
  type WorkerUser,
} from '../types/auth';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  onBackToHome?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', targetId: 'hero' },
  { id: 'how-it-works', label: 'How It Works', targetId: 'how-it-works' },
  { id: 'features', label: 'Features', targetId: 'features' },
  { id: 'departments', label: 'Departments', targetId: 'departments' },
  { id: 'about', label: 'About', targetId: 'about' },
];

export function LoginPage({ onLogin, onBackToHome, onNavigateToSection }: LoginPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Citizen state
  const [selectedCitizenIndex, setSelectedCitizenIndex] = useState(0);
  const [citizenEmail, setCitizenEmail] = useState(CITIZEN_ACCOUNTS[0].email);
  const [citizenPassword, setCitizenPassword] = useState('CitizenSecure#2025');
  const [showCitizenPass, setShowCitizenPass] = useState(false);

  // Manager state
  const [managerEmail, setManagerEmail] = useState(MANAGER_ACCOUNT.email);
  const [managerPassword, setManagerPassword] = useState('ManagerCommand#2025');
  const [showManagerPass, setShowManagerPass] = useState(false);

  // Worker state (4 workers: 0=Roads, 1=Water, 2=Signals, 3=Sanitation)
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  const [workerEmail, setWorkerEmail] = useState(WORKER_ACCOUNTS[0].email);
  const [workerPassword, setWorkerPassword] = useState('FieldDispatch#2025');
  const [showWorkerPass, setShowWorkerPass] = useState(false);

  const [activeHighlightCard, setActiveHighlightCard] = useState<string | null>(null);
  const [activePortal, setActivePortal] = useState<'citizen' | 'manager' | 'worker'>('citizen');

  const handleSelectPortal = (portal: 'citizen' | 'manager' | 'worker') => {
    setActivePortal(portal);
    setActiveHighlightCard(`${portal}-card`);
    const el = document.getElementById('auth-portal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      setActiveHighlightCard(null);
    }, 1500);
  };

  const scrollToCard = (cardId: string) => {
    if (cardId.startsWith('citizen')) setActivePortal('citizen');
    else if (cardId.startsWith('manager')) setActivePortal('manager');
    else if (cardId.startsWith('worker')) setActivePortal('worker');

    setActiveHighlightCard(cardId);
    const el = document.getElementById('auth-portal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      setActiveHighlightCard(null);
    }, 1500);
  };

  const handleSelectCitizenPreset = (index: number) => {
    setSelectedCitizenIndex(index);
    setCitizenEmail(CITIZEN_ACCOUNTS[index].email);
  };

  const handleSelectWorkerPreset = (index: number) => {
    setSelectedWorkerIndex(index);
    setWorkerEmail(WORKER_ACCOUNTS[index].email);
  };

  const handleCitizenSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(CITIZEN_ACCOUNTS[selectedCitizenIndex]);
  };

  const handleManagerSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(MANAGER_ACCOUNT);
  };

  const handleWorkerSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(WORKER_ACCOUNTS[selectedWorkerIndex]);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#F8FAFC] font-['Geist',sans-serif] overflow-x-hidden selection:bg-[#9565F5]/30 relative">
      {/* Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#9565F5]/10 rounded-full blur-[140px]" />
        <div className="absolute top-[480px] -left-40 w-[500px] h-[400px] bg-[#27C5E8]/8 rounded-full blur-[160px]" />
        <div className="absolute top-[700px] -right-40 w-[550px] h-[400px] bg-[#10B981]/8 rounded-full blur-[160px]" />
      </div>

      {/* TOP NAVIGATION BAR (Water Glass Effect & Full Frame Balance) */}
      <header className="fixed top-0 left-0 right-0 h-18 bg-[#080B1A]/85 backdrop-blur-xl z-50 border-b border-white/[0.08]">
        <div className="w-full h-full px-6 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
          {/* Left: NagarSetu Logo + Brand */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToSection) onNavigateToSection('hero');
                else if (onBackToHome) onBackToHome();
              }}
              className="flex items-center gap-3 group cursor-pointer select-none text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all">
                <div className="w-full h-full bg-[#0a0c1a] rounded-[10px] flex items-center justify-center">
                  <svg
                    className="w-4.5 h-4.5 text-[#c084fc]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" x2="12" y1="22.08" y2="12" />
                  </svg>
                </div>
              </div>
              <span className="text-xl lg:text-[22px] font-bold tracking-tight text-[#F8FAFC] flex items-center">
                Nagar<span className="text-[#9565F5]">Setu</span>
              </span>
            </button>
          </div>

          {/* Center: Navigation Links with Proper Spacing & Alignment */}
          <nav className="hidden md:flex items-center justify-center gap-2 md:gap-3 lg:gap-6 xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onNavigateToSection) onNavigateToSection(item.targetId);
                  else if (onBackToHome) onBackToHome();
                }}
                className="text-[15px] lg:text-base font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04] transition-all duration-200 relative px-3.5 py-2 rounded-xl flex items-center justify-center whitespace-nowrap cursor-pointer focus:outline-none"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Login Button (Active) + Mobile Toggle */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl text-[15px] font-semibold text-white bg-[#9565F5]/25 border border-[#9565F5]/50 shadow-[0_0_15px_rgba(149,101,245,0.25)] cursor-default"
            >
              Login
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl border border-white/[0.14] bg-white/[0.05] text-[#F8FAFC] hover:bg-white/[0.10] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/[0.08] bg-[#0c1022]/95 backdrop-blur-2xl px-6 py-4 space-y-2 shadow-2xl">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToSection) onNavigateToSection(item.targetId);
                  else if (onBackToHome) onBackToHome();
                }}
                className="w-full text-left flex items-center h-11 px-4 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/[0.08]">
              <div className="w-full flex items-center justify-center h-11 px-4 rounded-xl text-sm font-semibold text-[#F8FAFC] bg-[#9565F5]/25 border border-[#9565F5]/50">
                Login Active
              </div>
            </div>
          </nav>
        )}
      </header>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-16">
        {/* Navigation Back Link */}
        {onBackToHome && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors px-3.5 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>← Back to Public Smart City Portal</span>
            </button>
            <span className="text-[11px] font-mono text-[#94A3B8]">NagarSetu Gateway</span>
          </div>
        )}

        {/* ========================================== */}
        {/* SECTION 1: CHOOSE YOUR LOGIN PORTAL */}
        {/* ========================================== */}
        <section className="max-w-5xl mx-auto text-center space-y-10">
          {/* Brand & Tagline Header */}
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="flex items-center gap-2.5">
              {/* NagarSetu Hex Logo */}
              <div className="w-9 h-9 rounded-xl bg-[#9565F5] flex items-center justify-center shadow-md text-white font-bold">
                <span className="material-symbols-outlined text-[22px]">hexagon</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#F8FAFC] flex items-center">
                Nagar<span className="text-[#9565F5]">Setu</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#94A3B8]">
              Intelligent Cities. Faster Resolutions.
            </p>
          </div>

          {/* Section Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              Choose Your Login Portal
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] font-normal">
              Access your personalized dashboard
            </p>
          </div>

          {/* 3 Prominent Portal Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Portal Card 1: Citizen Login */}
            <div
              onMouseMove={handleCardMouseMove}
              onClick={() => handleSelectPortal('citizen')}
              className={`glass-card group relative rounded-2xl bg-[#10152A]/70 backdrop-blur-xl p-7 border transition-all duration-300 flex flex-col justify-between text-center cursor-pointer shadow-lg hover:shadow-2xl ${
                activePortal === 'citizen'
                  ? 'border-[#9565F5] ring-2 ring-[#9565F5]/40 bg-[#9565F5]/10 shadow-[0_0_25px_rgba(149,101,245,0.25)]'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              <div className="space-y-4">
                {/* Icon */}
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activePortal === 'citizen'
                      ? 'bg-[#9565F5]/25 border border-[#9565F5]/50 text-[#F8FAFC] scale-105'
                      : 'bg-[#9565F5]/10 border border-[#9565F5]/25 text-[#9565F5] group-hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">group</span>
                </div>
                {/* Title & Badge (Unified Height) */}
                <div className="min-h-[56px] flex flex-col justify-center items-center">
                  <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                    Citizen Login
                  </h2>
                  <span className="text-xs font-semibold text-[#9565F5] mt-1">
                    Resident &amp; Public Access
                  </span>
                </div>
                {/* Description (Unified Height & Clean Alignment) */}
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed px-1 min-h-[44px] flex items-center justify-center">
                  Report civic issues, track live progress and verify resolutions.
                </p>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                    activePortal === 'citizen'
                      ? 'bg-[#9565F5] text-white shadow-[0_0_15px_rgba(149,101,245,0.4)]'
                      : 'bg-white/[0.08] hover:bg-[#9565F5] text-white border border-white/[0.14]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPortal('citizen');
                  }}
                >
                  <span>{activePortal === 'citizen' ? 'Active Portal ✓' : 'Login as Citizen'}</span>
                  <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Portal Card 2: AI Command Center (Manager Login) */}
            <div
              onMouseMove={handleCardMouseMove}
              onClick={() => handleSelectPortal('manager')}
              className={`glass-card group relative rounded-2xl bg-[#10152A]/70 backdrop-blur-xl p-7 border transition-all duration-300 flex flex-col justify-between text-center cursor-pointer shadow-lg hover:shadow-2xl ${
                activePortal === 'manager'
                  ? 'border-[#27C5E8] ring-2 ring-[#27C5E8]/40 bg-[#27C5E8]/10 shadow-[0_0_25px_rgba(39,197,232,0.25)]'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              <div className="space-y-4">
                {/* Icon */}
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activePortal === 'manager'
                      ? 'bg-[#27C5E8]/25 border border-[#27C5E8]/50 text-[#F8FAFC] scale-105'
                      : 'bg-[#27C5E8]/10 border border-[#27C5E8]/25 text-[#27C5E8] group-hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">query_stats</span>
                </div>
                {/* Title & Badge (Unified Height) */}
                <div className="min-h-[56px] flex flex-col justify-center items-center">
                  <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                    AI Command Center
                  </h2>
                  <span className="text-xs font-semibold text-[#27C5E8] mt-1">
                    Manager Operations Cockpit
                  </span>
                </div>
                {/* Description (Unified Height & Clean Alignment) */}
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed px-1 min-h-[44px] flex items-center justify-center">
                  Monitor telemetry, dispatch squads and resolve city complaints.
                </p>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                    activePortal === 'manager'
                      ? 'bg-[#27C5E8] text-slate-950 font-bold shadow-[0_0_15px_rgba(39,197,232,0.4)]'
                      : 'bg-white/[0.08] hover:bg-[#27C5E8] hover:text-slate-950 text-white border border-white/[0.14]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPortal('manager');
                  }}
                >
                  <span>{activePortal === 'manager' ? 'Active Portal ✓' : 'Login as Manager'}</span>
                  <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Portal Card 3: Worker Login */}
            <div
              onMouseMove={handleCardMouseMove}
              onClick={() => handleSelectPortal('worker')}
              className={`glass-card group relative rounded-2xl bg-[#10152A]/70 backdrop-blur-xl p-7 border transition-all duration-300 flex flex-col justify-between text-center cursor-pointer shadow-lg hover:shadow-2xl ${
                activePortal === 'worker'
                  ? 'border-[#10B981] ring-2 ring-[#10B981]/40 bg-[#10B981]/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              <div className="space-y-4">
                {/* Icon */}
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    activePortal === 'worker'
                      ? 'bg-[#10B981]/25 border border-[#10B981]/50 text-[#F8FAFC] scale-105'
                      : 'bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] group-hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">engineering</span>
                </div>
                {/* Title & Badge (Unified Height) */}
                <div className="min-h-[56px] flex flex-col justify-center items-center">
                  <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                    Worker Login
                  </h2>
                  <span className="text-xs font-semibold text-[#10B981] mt-1">
                    Field Squad Dispatch
                  </span>
                </div>
                {/* Description (Unified Height & Clean Alignment) */}
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed px-1 min-h-[44px] flex items-center justify-center">
                  View assigned tasks, update progress and submit completion evidence.
                </p>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                    activePortal === 'worker'
                      ? 'bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-white/[0.08] hover:bg-[#10B981] text-white border border-white/[0.14]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPortal('worker');
                  }}
                >
                  <span>{activePortal === 'worker' ? 'Active Portal ✓' : 'Login as Worker'}</span>
                  <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Skyline Separator Strip */}
        <div className="relative w-full py-4 flex items-center justify-center overflow-hidden">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
          <div className="absolute px-4 py-1.5 rounded-xl bg-[#10152A]/85 backdrop-blur-md border border-white/[0.12] text-[11px] font-mono tracking-wider uppercase text-[#94A3B8] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9565F5] animate-pulse" />
            <span>Operational Auth Nodes • Multi-Portal Federation</span>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 2: DEDICATED LOGIN PORTAL FORM */}
        {/* ========================================== */}
        <section id="auth-portal-section" className="max-w-4xl mx-auto w-full scroll-mt-28 space-y-6">
          {/* Active Portal Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleSelectPortal('citizen')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activePortal === 'citizen'
                  ? 'bg-[#9565F5] text-white shadow-[0_0_15px_rgba(149,101,245,0.4)]'
                  : 'bg-white/[0.05] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.10]'
              }`}
            >
              <span className="material-symbols-outlined text-base">group</span>
              <span>Citizen Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPortal('manager')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activePortal === 'manager'
                  ? 'bg-[#27C5E8] text-slate-950 font-bold shadow-[0_0_15px_rgba(39,197,232,0.4)]'
                  : 'bg-white/[0.05] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.10]'
              }`}
            >
              <span className="material-symbols-outlined text-base">query_stats</span>
              <span>AI Command Center</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPortal('worker')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activePortal === 'worker'
                  ? 'bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-white/[0.05] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.10]'
              }`}
            >
              <span className="material-symbols-outlined text-base">engineering</span>
              <span>Field Worker</span>
            </button>
          </div>

          {/* CARD 1: CITIZEN LOGIN (Displayed ONLY when Citizen is selected) */}
          {activePortal === 'citizen' && (
            <div
              id="citizen-card"
              onMouseMove={handleCardMouseMove}
              className={`glass-card rounded-2xl bg-[#10152A] border transition-all duration-300 shadow-2xl overflow-hidden flex flex-col md:flex-row ${
                activeHighlightCard === 'citizen-card'
                  ? 'border-[#9565F5] ring-2 ring-[#9565F5]/40'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              {/* Left Visual Side */}
              <div className="relative w-full md:w-5/12 min-h-[300px] md:min-h-[500px] overflow-hidden bg-slate-950 flex flex-col justify-end">
                <img
                  alt="Citizen reporting pothole with smartphone"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr41mrpfRmo6nSzo7SDY5Zo4fBMMWGnrxNMwaFDV2niRIBMvkWbRUrriDXxQuHYcaA4ke2oFv_95tRSTg1m2pRNXWcbzoOBYVq7o3opIGCufY80iKE8AyAvEdugavVrVuE9VenMKnPtKYoCrU2lhPCvj7j_Mj6giFsUhWyB1AixJ5Ea7UxodYfoan2zwv03MrcxE2IZ1ZMmc918-V2DBNiCcWAXm1avx13PtQ3-yPH"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <div className="relative z-10 p-6 space-y-1.5">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                    Report <span className="text-[#9565F5]">•</span> Track{' '}
                    <span className="text-[#9565F5]">•</span> Verify
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    Make your city cleaner, safer and better with NagarSetu.
                  </p>
                </div>
              </div>

              {/* Right Form Side */}
              <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#10152A]/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/[0.08]">
                {/* Card Header & Logo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#9565F5] text-xl">hexagon</span>
                      <span className="text-base font-bold tracking-tight text-white">
                        Nagar<span className="text-[#9565F5]">Setu</span>
                      </span>
                    </div>
                    {/* Citizen Quick Presets */}
                    <div className="flex gap-1.5">
                      {CITIZEN_ACCOUNTS.map((cit, idx) => (
                        <button
                          key={cit.id}
                          type="button"
                          onClick={() => handleSelectCitizenPreset(idx)}
                          className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            selectedCitizenIndex === idx
                              ? 'bg-[#9565F5] text-white font-semibold shadow-sm'
                              : 'bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08] hover:text-white border border-white/[0.10]'
                          }`}
                          title={cit.name}
                        >
                          {cit.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center pt-1 space-y-1">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#9565F5]/10 text-[#9565F5] border border-[#9565F5]/25 mb-0.5">
                      <span className="material-symbols-outlined text-xl">group</span>
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight">Citizen Login</h4>
                    <p className="text-xs text-[#94A3B8]">
                      Signing in as:{' '}
                      <strong className="text-white font-semibold">
                        {CITIZEN_ACCOUNTS[selectedCitizenIndex].name}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleCitizenSubmit} className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        mail
                      </span>
                      <input
                        id="citizen-email"
                        type="email"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        lock
                      </span>
                      <input
                        id="citizen-password"
                        type={showCitizenPass ? 'text' : 'password'}
                        value={citizenPassword}
                        onChange={(e) => setCitizenPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCitizenPass((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showCitizenPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-white/[0.06] border-white/[0.20] text-[#9565F5] focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>
                    <a className="text-[#94A3B8] hover:text-white transition-colors" href="#citizen-card">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#9565F5] hover:bg-[#8352ec] text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Login as {CITIZEN_ACCOUNTS[selectedCitizenIndex].name}</span>
                  </button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="w-full border-t border-white/[0.08]" />
                    <span className="absolute px-2.5 bg-[#10152A] text-xs text-[#94A3B8] font-mono">
                      or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCitizenSubmit}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-[#F8FAFC] text-xs sm:text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Login with Google</span>
                  </button>
                </form>

                <div className="text-center pt-2 text-xs text-[#94A3B8] border-t border-white/[0.08]">
                  <span>District: </span>
                  <span className="text-white font-medium">
                    {CITIZEN_ACCOUNTS[selectedCitizenIndex].district}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 2: MANAGER LOGIN (Displayed ONLY when Manager is selected) */}
          {activePortal === 'manager' && (
            <div
              id="manager-card"
              onMouseMove={handleCardMouseMove}
              className={`glass-card rounded-2xl bg-[#10152A] border transition-all duration-300 shadow-2xl overflow-hidden flex flex-col md:flex-row ${
                activeHighlightCard === 'manager-card'
                  ? 'border-[#27C5E8] ring-2 ring-[#27C5E8]/40'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              {/* Left Visual Side */}
              <div className="relative w-full md:w-5/12 min-h-[300px] md:min-h-[500px] overflow-hidden bg-slate-950 flex flex-col justify-end">
                <img
                  alt="Smart city control room operator with multi-screen map displays"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMBE4ffzUJtqRbPRMWuHwailrhGyOWz2Wg-GJWrqG8Ue46MWJYZRCjiZCJ_aHQZXjwVX1Wo4dY4sPI-SL4V807n1Ko4WZ5nd7lGH-Bm--QrZmKPCMpG6-5I5nob7t7rB7xDCR576YdPuW5RwJSUudk6vB86k8DcQWUfjs9yzUm6q8gFBNqpqIPQ3nTvXvmSnrTwPVSjbAVAmjOznVjguXe6V27bS9sATCESwOzplJ5"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-6 space-y-1.5">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                    AI Command Center
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    Oversee, assign and resolve city complaints with the power of AI.
                  </p>
                </div>
              </div>

              {/* Right Form Side */}
              <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#10152A]/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/[0.08]">
                {/* Card Header & Logo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#9565F5] text-xl">hexagon</span>
                      <span className="text-base font-bold tracking-tight text-white">
                        Nagar<span className="text-[#9565F5]">Setu</span>
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#27C5E8] bg-[#27C5E8]/10 border border-[#27C5E8]/25 px-2.5 py-1 rounded-lg">
                      Commander Alex Chen
                    </span>
                  </div>

                  <div className="text-center pt-1 space-y-1">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#27C5E8]/10 text-[#27C5E8] border border-[#27C5E8]/25 mb-0.5">
                      <span className="material-symbols-outlined text-xl">query_stats</span>
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight">Manager Login</h4>
                    <p className="text-xs text-[#94A3B8]">Access the AI Command Center Cockpit</p>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleManagerSubmit} className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        mail
                      </span>
                      <input
                        id="manager-email"
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        lock
                      </span>
                      <input
                        id="manager-password"
                        type={showManagerPass ? 'text' : 'password'}
                        value={managerPassword}
                        onChange={(e) => setManagerPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowManagerPass((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showManagerPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-white/[0.06] border-white/[0.20] text-[#9565F5] focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>
                    <a className="text-[#94A3B8] hover:text-white transition-colors" href="#manager-card">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#27C5E8] hover:bg-[#1dbad8] text-slate-950 font-bold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch AI Command Cockpit</span>
                  </button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="w-full border-t border-white/[0.08]" />
                    <span className="absolute px-2.5 bg-[#10152A] text-xs text-[#94A3B8] font-mono">
                      or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleManagerSubmit}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-[#F8FAFC] text-xs sm:text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Login with Google</span>
                  </button>
                </form>

                <div className="text-center pt-2 text-xs text-[#94A3B8] border-t border-white/[0.08] flex items-center justify-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27C5E8]" />
                  <span>Admin Level 4 • Automated Multi-Agent Swarm</span>
                </div>
              </div>
            </div>
          )}

          {/* CARD 3: WORKER LOGIN (Displayed ONLY when Worker is selected) */}
          {activePortal === 'worker' && (
            <div
              id="worker-card"
              onMouseMove={handleCardMouseMove}
              className={`glass-card rounded-2xl bg-[#10152A] border transition-all duration-300 shadow-2xl overflow-hidden flex flex-col md:flex-row ${
                activeHighlightCard === 'worker-card'
                  ? 'border-[#10B981] ring-2 ring-[#10B981]/40'
                  : 'border-white/[0.12] hover:border-white/[0.22]'
              }`}
            >
              {/* Left Visual Side */}
              <div className="relative w-full md:w-5/12 min-h-[300px] md:min-h-[500px] overflow-hidden bg-slate-950 flex flex-col justify-end">
                <img
                  alt="Field department worker with hard hat holding tablet with green checkmark"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdeJeXH4Fa2xtazi8T_pL7WW7lX1U2Vwk-9fjn0pYW5jAEBPZGheQccCUb1W9Ust1fqq0oPAGGtERifisy7MKoQI2KcPAOBFvJ5hQy_Jvj9iR9-FJFzKFWfkVTC1th6Gc5KQExqP8u0l8lvo1rf9BIwx3lpWZN5zOHDhbmft-uSwcbAzCiDE1a1TKYyRFvh9pAjGKmsnx0CoYKgtkIwsrtou0WqUS2WaEjcU_aSTt5"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 p-6 space-y-1.5">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 tracking-tight">
                    Department Worker
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    Receive tasks, update progress and submit completion proof.
                  </p>
                </div>
              </div>

              {/* Right Form Side */}
              <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-[#10152A]/90 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/[0.08]">
                {/* Card Header & Logo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#9565F5] text-xl">hexagon</span>
                      <span className="text-base font-bold tracking-tight text-white">
                        Nagar<span className="text-[#9565F5]">Setu</span>
                      </span>
                    </div>
                    {/* Worker Preset Buttons (4 Departments) */}
                    <div className="grid grid-cols-2 gap-1 sm:flex sm:gap-1.5">
                      {WORKER_ACCOUNTS.map((worker, idx) => {
                        const label =
                          idx === 0
                            ? 'Roads'
                            : idx === 1
                              ? 'Water'
                              : idx === 2
                                ? 'Signals'
                                : 'Sanitation';
                        return (
                          <button
                            key={worker.id}
                            type="button"
                            onClick={() => handleSelectWorkerPreset(idx)}
                            className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              selectedWorkerIndex === idx
                                ? 'bg-[#10B981] text-white font-semibold shadow-sm'
                                : 'bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08] hover:text-white border border-white/[0.10]'
                            }`}
                            title={`${worker.name} (${worker.department})`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center pt-1 space-y-1">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 mb-0.5">
                      <span className="material-symbols-outlined text-xl">engineering</span>
                    </div>
                    <h4 className="text-xl font-bold text-white tracking-tight">Worker Login</h4>
                    <p className="text-xs text-[#94A3B8]">
                      Technician:{' '}
                      <strong className="text-white font-semibold">
                        {WORKER_ACCOUNTS[selectedWorkerIndex].name}
                      </strong>{' '}
                      ({WORKER_ACCOUNTS[selectedWorkerIndex].crew})
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleWorkerSubmit} className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        mail
                      </span>
                      <input
                        id="worker-email"
                        type="email"
                        value={workerEmail}
                        onChange={(e) => setWorkerEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-base">
                        lock
                      </span>
                      <input
                        id="worker-password"
                        type={showWorkerPass ? 'text' : 'password'}
                        value={workerPassword}
                        onChange={(e) => setWorkerPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.12] text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWorkerPass((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showWorkerPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[#94A3B8]">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-white/[0.06] border-white/[0.20] text-[#9565F5] focus:ring-0"
                      />
                      <span>Remember me</span>
                    </label>
                    <a className="text-[#94A3B8] hover:text-white transition-colors" href="#worker-card">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#10B981] hover:bg-[#0ea372] text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Login as {WORKER_ACCOUNTS[selectedWorkerIndex].name}</span>
                  </button>

                  <div className="relative flex items-center justify-center py-1">
                    <div className="w-full border-t border-white/[0.08]" />
                    <span className="absolute px-2.5 bg-[#10152A] text-xs text-[#94A3B8] font-mono">
                      or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWorkerSubmit}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-[#F8FAFC] text-xs sm:text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Login with Google</span>
                  </button>
                </form>

                <div className="text-center pt-2 text-xs text-[#94A3B8] border-t border-white/[0.08] flex items-center justify-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>GPS Tracking &amp; Offline Sync Enabled</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Global Footer */}
        <footer className="pt-8 pb-4 text-center text-xs text-[#94A3B8] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9565F5] text-sm">shield</span>
            <span>NagarSetu Civic Enterprise Authentication System • 256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-4 text-[#94A3B8]">
            <a className="hover:text-white transition-colors" href="#citizen-card">
              Privacy Policy
            </a>
            <span>•</span>
            <a className="hover:text-white transition-colors" href="#manager-card">
              Security Clearance
            </a>
            <span>•</span>
            <a className="hover:text-white transition-colors" href="#worker-card">
              Help Desk
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
