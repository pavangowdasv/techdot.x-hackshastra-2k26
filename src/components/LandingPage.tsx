import { useState, useEffect } from 'react';
import type React from 'react';
import {
  ArrowRight,
  Bot,
  Building2,
  Camera,
  CheckCircle2,
  HardHat,
  MapPin,
  Menu,
  Shield,
  Sparkles,
  User,
  Wrench,
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

interface LandingPageProps {
  onLogin: (user: AuthUser) => void;
  onNavigateToLogin?: () => void;
  onOpenReportModal: () => void;
  onTrackComplaint: () => void;
  onOpenCommandCenter: () => void;
  targetSection?: string | null;
  onClearTargetSection?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', targetId: 'hero' },
  { id: 'how-it-works', label: 'How It Works', targetId: 'how-it-works' },
  { id: 'features', label: 'Features', targetId: 'features' },
  { id: 'departments', label: 'Departments', targetId: 'departments' },
  { id: 'about', label: 'About', targetId: 'about' },
];

export function LandingPage({
  onLogin,
  onNavigateToLogin,
  onOpenReportModal,
  onTrackComplaint,
  onOpenCommandCenter,
  targetSection,
  onClearTargetSection,
}: LandingPageProps) {
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(CITIZEN_ACCOUNTS[0].id);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(WORKER_ACCOUNTS[0].id);
  const [expandedPortal, setExpandedPortal] = useState<'citizen' | 'manager' | 'worker' | null>(null);
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [verificationDeptIndex, setVerificationDeptIndex] = useState(0);

  const selectedCitizen =
    CITIZEN_ACCOUNTS.find((c) => c.id === selectedCitizenId) ?? CITIZEN_ACCOUNTS[0];
  const selectedWorker =
    WORKER_ACCOUNTS.find((w) => w.id === selectedWorkerId) ?? WORKER_ACCOUNTS[0];

  // Smooth scroll handler for any section
  const handleNavClick = (navId: string, sectionId: string) => {
    setActiveNav(navId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        window.history.replaceState(null, '', '#hero');
      } catch {
        // Ignore
      }
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 80;
      const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
      try {
        window.history.replaceState(null, '', `#${sectionId}`);
      } catch {
        // Ignore
      }
    }
  };

  // Scroll to targetSection if specified via props or hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const toScroll = targetSection || hash;
    if (toScroll) {
      const timer = setTimeout(() => {
        if (toScroll === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveNav('home');
        } else {
          const el = document.getElementById(toScroll);
          if (el) {
            const headerOffset = 80;
            const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top, behavior: 'smooth' });
            if (toScroll === 'how-it-works') setActiveNav('how-it-works');
            else if (toScroll === 'features') setActiveNav('features');
            else if (toScroll === 'departments') setActiveNav('departments');
            else if (toScroll === 'about') setActiveNav('about');
          }
        }
        if (onClearTargetSection) onClearTargetSection();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [targetSection, onClearTargetSection]);

  // Track active section as user scrolls
  useEffect(() => {
    const sectionIds = ['hero', 'how-it-works', 'features', 'departments', 'about'];
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0].target.id;
        if (id === 'hero') setActiveNav('home');
        else if (id === 'how-it-works') setActiveNav('how-it-works');
        else if (id === 'features') setActiveNav('features');
        else if (id === 'departments') setActiveNav('departments');
        else if (id === 'about') setActiveNav('about');
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -40% 0px',
      threshold: [0.1, 0.25, 0.5],
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  const deptCards = [
    {
      name: 'Roads & Infra',
      icon: 'construction',
      color: '#cabeff',
      hoverBorder: '[#7657f6]/40',
      sla: '24h',
      fleet: '48 Crews',
      compliance: '98.1% SLA Compliant',
      desc: 'Pothole patching, road caving, pedestrian pavement repairs, speed breakers, and bridge integrity.',
      img: '/departments/road-infra-after.jpeg',
      beforeImg: '/departments/road-infra-before.jpeg',
    },
    {
      name: 'Water & Drainage',
      icon: 'water_drop',
      color: '#4cd7f6',
      hoverBorder: '[#4cd7f6]/40',
      sla: '12h',
      fleet: '34 Units',
      compliance: '94.7% SLA Compliant',
      desc: 'Main supply pipeline leaks, storm water drain clogs, sewage overflow, and contamination reports.',
      img: '/departments/water-drainage-after.jpeg',
      beforeImg: '/departments/water-drainage-before.jpeg',
    },
    {
      name: 'Sanitation & Eco',
      icon: 'recycling',
      color: '#d0bcff',
      hoverBorder: '[#d0bcff]/40',
      sla: '8h',
      fleet: '62 Crews',
      compliance: '99.2% SLA Compliant',
      desc: 'Blackspot clearing, segregated waste clearing, public sanitation hygiene, and mosquito fumigation.',
      img: '/departments/sanitation-eco-after.jpeg',
      beforeImg: '/departments/sanitation-eco-before.jpeg',
    },
    {
      name: 'Safety & Civic',
      icon: 'security',
      color: '#4cd7f6',
      hoverBorder: '[#4cd7f6]/40',
      sla: '6h',
      fleet: '28 Squads',
      compliance: '96.8% SLA Compliant',
      desc: 'Dark streetlights, unauthorized commercial encroachments, open electric lines, and fallen trees.',
      img: '/departments/safety-civic-after.jpeg',
      beforeImg: '/departments/safety-civic-before.jpeg',
    },
  ];

  const verificationDepts = [
    {
      name: 'Roads & Infra',
      ticketId: 'BBMP-4921-W15',
      beforeImg: '/departments/road-infra-before.jpeg',
      afterImg: '/departments/road-infra-after.jpeg',
      beforeTime: 'BEFORE: 14 OCT 08:30 AM',
      afterTime: 'AFTER: 14 OCT 04:15 PM',
      beforeNote: 'Reported by Citizen: Deep asphalt crater on Ring Road',
      afterNote: 'AI Vision Match: 99.4% Remediated (Fresh Hot-Mix)',
      accuracy: 'Geo-accuracy 0.8m',
    },
    {
      name: 'Water & Drainage',
      ticketId: 'BWSSB-2084-D03',
      beforeImg: '/departments/water-drainage-before.jpeg',
      afterImg: '/departments/water-drainage-after.jpeg',
      beforeTime: 'BEFORE: 13 OCT 11:20 AM',
      afterTime: 'AFTER: 13 OCT 03:45 PM',
      beforeNote: 'Reported by Citizen: High-pressure main pipe rupture',
      afterNote: 'AI Vision Match: 98.7% Remediated (Valve Sealed & Flow Restored)',
      accuracy: 'Hydraulic Sensor Verified',
    },
    {
      name: 'Sanitation & Eco',
      ticketId: 'SWM-8319-E07',
      beforeImg: '/departments/sanitation-eco-before.jpeg',
      afterImg: '/departments/sanitation-eco-after.jpeg',
      beforeTime: 'BEFORE: 12 OCT 07:15 AM',
      afterTime: 'AFTER: 12 OCT 10:30 AM',
      beforeNote: 'Reported by Citizen: Blackspot waste overflow at market',
      afterNote: 'AI Vision Match: 99.8% Remediated (Mechanical Sweep & Sanitized)',
      accuracy: 'CCTV Telemetry Audit Passed',
    },
    {
      name: 'Safety & Civic',
      ticketId: 'BESCOM-1102-S04',
      beforeImg: '/departments/safety-civic-before.jpeg',
      afterImg: '/departments/safety-civic-after.jpeg',
      beforeTime: 'BEFORE: 11 OCT 06:40 PM',
      afterTime: 'AFTER: 11 OCT 09:10 PM',
      beforeNote: 'Reported by Citizen: Damaged street pole & dark intersection',
      afterNote: 'AI Vision Match: 99.1% Remediated (Pole Replaced & LED Restored)',
      accuracy: 'Grid Telemetry Synchronized',
    },
  ];

  const handlePortalSelect = (role: 'citizen' | 'manager' | 'worker') => {
    if (role === 'manager') {
      onLogin(MANAGER_ACCOUNT);
      setPortalModalOpen(false);
    } else {
      setExpandedPortal(role);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#F8FAFC] font-['Geist',sans-serif] selection:bg-[#9565F5] selection:text-white">
      {/* TOP NAVIGATION BAR (Water Glass Effect & Full Frame Balance) */}
      <header className="fixed top-0 left-0 right-0 h-18 bg-[#080B1A]/85 backdrop-blur-xl z-50 border-b border-white/[0.08]">
        <div className="w-full h-full px-6 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-3 items-center">
          {/* Left (Far Left): NagarSetu Logo + Brand Name */}
          <div className="flex items-center justify-start">
            <a
              className="flex items-center gap-3 group cursor-pointer select-none"
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('home', 'hero');
              }}
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
            </a>
          </div>

          {/* Center (Centered): Navigation Links with Proper Spacing & Alignment */}
          <nav className="hidden md:flex items-center justify-center gap-2 md:gap-3 lg:gap-6 xl:gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.targetId);
                  }}
                  className={`text-[15px] lg:text-base font-medium transition-all duration-200 relative px-3.5 py-2 rounded-xl flex items-center justify-center whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-[#F8FAFC] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2.5px] after:bg-[#9565F5] after:rounded-full after:transition-all after:duration-300"
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right (Far Right): Login Button + Mobile Toggle */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl text-[15px] font-semibold text-[#F8FAFC] border border-white/[0.18] bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/[0.30] transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
              onClick={() => {
                if (onNavigateToLogin) {
                  onNavigateToLogin();
                } else {
                  setPortalModalOpen(true);
                }
              }}
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
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.targetId);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center h-11 px-4 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9565F5]/15 text-[#F8FAFC] border border-[#9565F5]/30 font-semibold'
                      : 'text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        )}
      </header>

      <main className="w-full pt-18 min-h-screen bg-[#080B1A]">
        <div className="flex flex-col w-full">
          {/* HERO SECTION */}
          <section id="hero" className="relative bg-[#080B1A] overflow-hidden scroll-mt-24">

            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute -top-24 left-8 w-[600px] h-[500px] bg-[#9565F5]/12 rounded-full blur-[140px]" />
              <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[#27C5E8]/10 rounded-full blur-[120px]" />
              <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#9565F5]/15 rounded-full blur-[130px]" />
              <div className="absolute bottom-0 -left-10 w-[500px] h-[340px] bg-[#9565F5]/15 rounded-full blur-[110px]" />
            </div>

            {/* CONTENT: 2-column layout (words on left, AI illustration on right) */}
            <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 pt-6 md:pt-10 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">

                {/* Left column: Badge, Headline, Subtitle, CTAs */}
                <div className="lg:col-span-6 flex flex-col items-start">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.14] backdrop-blur-sm mb-6 w-fit">
                    <span className="text-xs font-medium text-[#E2D8FF] tracking-wide">
                      AI-Powered Smart City Platform
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="font-extrabold text-[#F8FAFC] tracking-tight leading-[1.08] mb-5" style={{ fontSize: 'clamp(38px, 4.2vw, 62px)' }}>
                    Building a Better City
                    <br />
                    Through Intelligent
                    <br />
                    <span className="text-[#9B6FFA]">Complaint Management.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[#94A3B8] font-normal leading-relaxed mb-9 max-w-lg" style={{ fontSize: 'clamp(14px, 1.1vw, 16px)' }}>
                    Report civic issues, let AI find the right department,
                    <br />
                    and track every problem until it is resolved.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3.5">
                    <button
                      type="button"
                      onClick={onOpenReportModal}
                      className="px-6 py-3 rounded-xl bg-[#9565F5] hover:bg-[#8352ec] text-white font-semibold text-sm shadow-lg transition-all duration-150 active:scale-[0.98] flex items-center gap-2.5 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform duration-150">
                        send
                      </span>
                      <span>Report a Complaint</span>
                    </button>
                    <button
                      type="button"
                      onClick={onTrackComplaint}
                      className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/[0.06] text-[#F8FAFC] font-medium text-sm border border-white/[0.22] hover:border-white/[0.35] transition-all duration-150 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#9565F5]">
                        search
                      </span>
                      <span>Track Complaint</span>
                    </button>
                  </div>
                </div>

                {/* Right column: AI central processor illustration (Increased Size & Halos) */}
                <div className="lg:col-span-6 flex items-center justify-center lg:justify-end relative">
                  {/* Ambient backlighting halos */}
                  <div className="absolute w-80 h-80 sm:w-96 sm:h-96 bg-[#27C5E8]/25 rounded-full blur-[90px] pointer-events-none" />
                  <div className="absolute w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] bg-[#9565F5]/30 rounded-full blur-[110px] pointer-events-none" />

                  <div className="relative w-full max-w-[580px] lg:max-w-[700px] xl:max-w-[780px] flex items-center justify-center">
                    <img
                      src="/hero-ai-hub.png"
                      alt="NagarSetu AI Central Dispatch Processor with Connected Municipal Services"
                      className="w-full h-auto max-h-[540px] lg:max-h-[640px] xl:max-h-[720px] object-contain select-none drop-shadow-[0_0_50px_rgba(39,197,232,0.45)] hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                </div>

              </div>
            </div>

          </section>

          {/* STATISTICS SECTION */}
          <section className="relative bg-[#080B1A] px-6 sm:px-8 lg:px-12 pb-14">
            <div className="w-full">
              <div className="w-full bg-[#10152A] rounded-2xl border border-white/[0.08] px-6 sm:px-10 py-6 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
                  {/* Stat 1 */}
                  <div className="flex items-center gap-3.5 pr-4 py-2 sm:py-0">
                    <div className="text-[#9565F5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight leading-tight">
                        12,548
                      </span>
                      <span className="text-xs text-[#94A3B8] font-medium whitespace-nowrap">
                        Complaints Resolved
                      </span>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="flex items-center gap-3.5 sm:px-4 py-2 sm:py-0">
                    <div className="text-[#9565F5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight leading-tight">
                        98%
                      </span>
                      <span className="text-xs text-[#94A3B8] font-medium whitespace-nowrap">
                        Citizen Satisfaction
                      </span>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="flex items-center gap-3.5 sm:px-4 py-2 sm:py-0">
                    <div className="text-[#9565F5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">bolt</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight leading-tight">
                        4
                      </span>
                      <span className="text-xs text-[#94A3B8] font-medium whitespace-nowrap">
                        Departments
                      </span>
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="flex items-center gap-3.5 sm:pl-4 py-2 sm:py-0">
                    <div className="text-[#9565F5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">schedule</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight leading-tight">
                        36 hrs
                      </span>
                      <span className="text-xs text-[#94A3B8] font-medium whitespace-nowrap">
                        Avg. Resolution Time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5-STAGE WORKFLOW PIPELINE */}
          <section className="px-6 md:px-10 lg:px-12 py-16 relative" id="how-it-works">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-[#571bc1]/30 text-[#d0bcff] font-mono text-xs uppercase tracking-wider border border-[#571bc1]/40">
                Algorithmic Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl text-white mt-3 font-bold tracking-tight">
                How NagarSetu Works
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                Zero bureaucratic latency. From citizen reporting to verified completion, every
                transition is backed by neural validation and automated dispatch protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="glass-card relative p-5 rounded-2xl bg-[#0f1224] flex flex-col justify-between hover:bg-[#141830] transition-all border border-white/10 hover:border-[#7dd3fc]/50 shadow-lg" onMouseMove={handleCardMouseMove}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#7dd3fc] font-bold">01</span>
                    <span className="material-symbols-outlined text-white p-2 rounded-xl bg-white/5">
                      photo_camera
                    </span>
                  </div>
                  <h3 className="text-base text-white font-semibold">Citizen Reports Issue</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Captured via voice memo, multilingual web chat, or instant GPS-tagged mobile
                    photograph.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="text-[11px] font-semibold text-[#7dd3fc] bg-white/[0.04] border border-[#7dd3fc]/20 px-2.5 py-1 rounded-md">
                    Voice / Web / App
                  </span>
                </div>
              </div>

              <div className="glass-card relative p-5 rounded-2xl bg-[#0f1224] flex flex-col justify-between hover:bg-[#141830] transition-all border border-white/10 hover:border-[#7dd3fc]/50 shadow-lg" onMouseMove={handleCardMouseMove}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#38bdf8] font-bold">02</span>
                    <span className="material-symbols-outlined text-white p-2 rounded-xl bg-white/5">
                      smart_toy
                    </span>
                  </div>
                  <h3 className="text-base text-white font-semibold">AI Triage &amp; Deduplication</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Neural vision detects severity, matches existing tickets in 50m radius, and flags
                    urgency.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="text-[11px] font-semibold text-[#38bdf8] bg-white/[0.04] border border-[#38bdf8]/20 px-2.5 py-1 rounded-md">
                    Computer Vision 99.4%
                  </span>
                </div>
              </div>

              <div className="glass-card relative p-5 rounded-2xl bg-[#0f1224] flex flex-col justify-between hover:bg-[#141830] transition-all border border-white/10 hover:border-[#7dd3fc]/50 shadow-lg" onMouseMove={handleCardMouseMove}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#7dd3fc] font-bold">03</span>
                    <span className="material-symbols-outlined text-white p-2 rounded-xl bg-white/5">
                      alt_route
                    </span>
                  </div>
                  <h3 className="text-base text-white font-semibold">Automated Routing</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Direct telemetry push to ward supervisor or autonomous fleet dispatch without manual
                    delay.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="text-[11px] font-semibold text-gray-300 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md">
                    Sub-Second Dispatch
                  </span>
                </div>
              </div>

              <div className="glass-card relative p-5 rounded-2xl bg-[#0f1224] flex flex-col justify-between hover:bg-[#141830] transition-all border border-white/10 hover:border-[#7dd3fc]/50 shadow-lg" onMouseMove={handleCardMouseMove}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#38bdf8] font-bold">04</span>
                    <span className="material-symbols-outlined text-white p-2 rounded-xl bg-white/5">
                      engineering
                    </span>
                  </div>
                  <h3 className="text-base text-white font-semibold">Field Crew Remediation</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    On-ground units receive turn-by-turn routing, execute repair, and upload geo-stamped
                    proof.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="text-[11px] font-semibold text-[#38bdf8] bg-white/[0.04] border border-[#38bdf8]/20 px-2.5 py-1 rounded-md">
                    Live Geo-Proof
                  </span>
                </div>
              </div>

              <div className="glass-card relative p-5 rounded-2xl bg-[#0f1224] flex flex-col justify-between hover:bg-[#141830] transition-all border border-white/10 hover:border-[#7dd3fc]/50 shadow-lg" onMouseMove={handleCardMouseMove}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl text-[#7dd3fc] font-bold">05</span>
                    <span className="material-symbols-outlined text-white p-2 rounded-xl bg-white/5">
                      published_with_changes
                    </span>
                  </div>
                  <h3 className="text-base text-white font-semibold">Photographic Proof</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Dual before/after visual audit validated by computer vision and confirmed directly by
                    citizen.
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <span className="text-[11px] font-semibold text-[#7dd3fc] bg-white/[0.04] border border-[#7dd3fc]/20 px-2.5 py-1 rounded-md">
                    Citizen Signed-Off
                  </span>
                </div>
              </div>
            </div>
          </section>


          {/* INTERACTIVE VERIFICATION PREVIEW & LEADERSHIP QUOTE */}
          <section className="px-6 md:px-10 lg:px-12 py-16" id="features">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Dual-Photo Verification Model */}
              <div
                onMouseMove={handleCardMouseMove}
                className="glass-card lg:col-span-7 bg-[#0f1224] rounded-2xl p-6 shadow-2xl border border-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                    <span className="text-lg text-white font-semibold">
                      Dual-Photo Verification Model
                    </span>
                  </div>
                  {/* Department Toggle Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {verificationDepts.map((vDept, idx) => (
                      <button
                        key={vDept.name}
                        type="button"
                        onClick={() => setVerificationDeptIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          verificationDeptIndex === idx
                            ? 'bg-[#9565F5] text-white shadow-sm font-semibold'
                            : 'bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08] hover:text-white border border-white/10'
                        }`}
                      >
                        {vDept.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#94A3B8]">
                  <span>TICKET: #{verificationDepts[verificationDeptIndex].ticketId}</span>
                  <span className="text-[#4cd7f6]">{verificationDepts[verificationDeptIndex].accuracy}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative rounded-xl overflow-hidden h-64 bg-[#070913] border border-white/5">
                    <img
                      className="w-full h-full object-cover transition-all duration-300"
                      alt={`Before repair - ${verificationDepts[verificationDeptIndex].name}`}
                      src={verificationDepts[verificationDeptIndex].beforeImg}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#93000a]/90 text-[#ffdad6] text-xs font-bold">
                      {verificationDepts[verificationDeptIndex].beforeTime}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm p-1.5 rounded-md text-[11px] text-gray-300">
                      {verificationDepts[verificationDeptIndex].beforeNote}
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden h-64 bg-[#070913] border border-white/5">
                    <img
                      className="w-full h-full object-cover transition-all duration-300"
                      alt={`After repair - ${verificationDepts[verificationDeptIndex].name}`}
                      src={verificationDepts[verificationDeptIndex].afterImg}
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#007f95]/90 text-[#f5fcff] text-xs font-bold">
                      {verificationDepts[verificationDeptIndex].afterTime}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm p-1.5 rounded-md text-[11px] text-[#4cd7f6] font-medium">
                      {verificationDepts[verificationDeptIndex].afterNote}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-xl">
                      verified_user
                    </span>
                    <span className="text-xs text-gray-300">
                      Verified by Ward Commissioner &amp; Complainant
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onTrackComplaint}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Inspect AI Audit Log
                  </button>
                </div>
              </div>

              {/* AI Verification & Quality Matrix */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                <span className="text-xs font-semibold text-[#4cd7f6] uppercase tracking-widest">
                  Neural Quality Control
                </span>
                <h3 className="text-2xl sm:text-3xl text-white font-bold leading-tight">
                  Automated Photographic Verification
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Every civic fix is rigorously cross-checked with neural computer vision and verified by the citizen before the ticket can close.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#27C5E8] text-xl shrink-0 mt-0.5">
                      center_focus_strong
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">99.4% Computer Vision Match</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Compares pre-repair crater/damage geometry with fresh asphalt or sealed conduits.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#9565F5] text-xl shrink-0 mt-0.5">
                      pin_drop
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Anti-Fraud Geofencing</h4>
                      <p className="text-xs text-gray-400 mt-0.5">50m GPS telemetry ensures field crews are physically present at the reported coordinates.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#10B981] text-xl shrink-0 mt-0.5">
                      how_to_reg
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Citizen Final Sign-Off</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Residents rate the repair quality with 1-click confirmation directly from their phone.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MUNICIPAL DEPARTMENT SHOWCASE */}
          <section className="px-6 md:px-10 lg:px-12 py-16 bg-[#0a0d1a]/60" id="departments">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
              <div>
                <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest">
                  Departmental Grid Matrix
                </span>
                <h2 className="text-3xl text-white font-bold mt-1">Dedicated Municipal Squads</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mt-2 md:mt-0">
                Four specialized municipal divisions wired into unified real-time SLA thresholds with
                dedicated on-call equipment units.
              </p>
            </div>

            {/* Infinite Horizontal Carousel (3 cards desktop / 2 tablet / 1 mobile) */}
            <div className="carousel-container">
              <div className="carousel-track">
                {[...deptCards, ...deptCards].map((dept, index) => (
                  <div
                    key={`${dept.name}-${index}`}
                    onMouseMove={handleCardMouseMove}
                    className="dept-carousel-card glass-card rounded-2xl bg-[#0f1224] p-5 flex flex-col justify-between border border-white/10 hover:border-[#9565F5]/50 shadow-xl group cursor-pointer"
                  >
                    <div>
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-4 relative">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={dept.name}
                          src={dept.img}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1224] via-transparent to-transparent" />
                        <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs font-semibold border border-white/10">
                          SLA: {dept.sla}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-xl" style={{ color: dept.color }}>
                          {dept.icon}
                        </span>
                        <h3 className="text-lg text-white font-bold">{dept.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                        {dept.desc}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between font-mono text-xs">
                      <span className="text-gray-400">Active Fleet: {dept.fleet}</span>
                      <span className="font-bold" style={{ color: dept.color }}>
                        {dept.compliance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT SECTION: MUNICIPAL ENDORSEMENT & CITIZEN MISSION */}
          <section className="px-6 md:px-10 lg:px-12 py-16 space-y-10" id="about">
            {/* Municipal Authority Endorsement Card */}
            <div
              onMouseMove={handleCardMouseMove}
              className="glass-card relative rounded-3xl bg-[#0f1224] p-8 md:p-10 border border-white/10 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9565F5]/15 border border-[#9565F5]/30 text-[#cabeff] text-xs font-semibold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Municipal Authority Endorsement</span>
                  </div>
                  <blockquote className="text-xl sm:text-2xl text-white font-medium leading-snug">
                    “NagarSetu transformed our civic governance from reactive firefighting into an
                    automated, predictable machine. What previously took 14 days of paperwork now
                    resolves in under 24 hours.”
                  </blockquote>
                  <div className="flex items-center gap-4 pt-3">
                    <img
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-[#cabeff]/60 shadow-lg"
                      alt="Dr. Arvind Sharma, IAS"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLlLUntkzxdRa3tly06aNSaNj1UBRJs5RizSpc4vZnYPT7q_NgpdYWuyFtxw4jlArwnjn_wMCTIeM0CT-m72gn-VwqeXkG7oAgxeyGvxW6c-QTpuE0MOpimdV1bVkdjN2b0tO9RdGLoeVygRNN87qf9Ve-M9E2V0cRc_9T28bm5Hgy5oMww2POjpym5w1CQr-xlHFLEkA2oHhLKiffpvrAPY0guRX132npRn41B9ga"
                    />
                    <div className="flex flex-col">
                      <span className="text-base text-white font-bold">Dr. Arvind Sharma, IAS</span>
                      <span className="text-xs text-[#4cd7f6] font-medium">
                        Commissioner of Urban Infrastructure
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Government of Karnataka Municipal Grids
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Banner */}
            <div
              onMouseMove={handleCardMouseMove}
              className="glass-card relative rounded-3xl bg-gradient-to-r from-[#0e4d6e]/40 via-[#141c2e] to-[#0a0e1a] p-8 md:p-14 overflow-hidden border border-[#7dd3fc]/20 shadow-2xl backdrop-blur-xl"
            >
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#00d4ff]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#7dd3fc]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl flex flex-col space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#7dd3fc] text-xs font-medium w-fit border border-[#7dd3fc]/30 backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm">public</span>
                  <span>CITIZEN EMPOWERMENT PROTOCOL</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Join 1.2M Citizens Building a Smarter, Cleaner, Safer City.
                </h2>
                <p className="text-base text-gray-300 max-w-xl">
                  You don't need connections or bureaucratic patience. Snap a picture, report in 10
                  seconds, and watch city infrastructure fix itself with total digital transparency.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onOpenReportModal}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7dd3fc] hover:from-[#38bdf8] hover:to-[#00d4ff] text-[#001f2e] font-bold text-sm shadow-[0_0_20px_rgba(125,211,252,0.45)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">camera_alt</span>
                    <span>Lodge a Complaint Right Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortalModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-[#7dd3fc]/30 hover:border-[#7dd3fc]/50 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#7dd3fc] text-lg">
                      dataset
                    </span>
                    <span>Explore Public Grid Data</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PORTAL SWITCHER MODAL (Water Glass Dialog) */}
        {portalModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B1A]/80 backdrop-blur-md p-4"
            id="portal-modal"
          >
            <div className="bg-[#10152A]/90 backdrop-blur-xl p-6 rounded-2xl max-w-md w-full border border-white/[0.14] shadow-2xl shadow-black/50 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <h3 className="text-lg text-white font-bold">Select NagarSetu Portal</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white"
                  onClick={() => {
                    setPortalModalOpen(false);
                    setExpandedPortal(null);
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. CITIZEN PORTAL (3 ACCOUNTS) */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handlePortalSelect('citizen')}
                    className="w-full p-3.5 hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#7657f6]/20 border border-[#7657f6]/40 flex items-center justify-center shrink-0 text-[#cabeff]">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <div className="text-sm text-white font-semibold flex items-center gap-2">
                          <span>Citizen Portal</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7657f6]/20 text-[#cabeff] border border-[#7657f6]/40">
                            3 Logins
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Submit, attach photos, track and verify repairs
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </button>

                  {expandedPortal === 'citizen' && (
                    <div className="p-3 bg-[#0a0c16] border-t border-white/10 space-y-2">
                      <p className="text-[11px] font-mono text-[#cabeff] uppercase tracking-wider">
                        Select Citizen Profile:
                      </p>
                      {CITIZEN_ACCOUNTS.map((cit) => (
                        <button
                          key={cit.id}
                          type="button"
                          onClick={() => {
                            onLogin(cit);
                            setPortalModalOpen(false);
                          }}
                          className="w-full p-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-[#7657f6]/20 hover:border-[#7657f6] transition-all flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cit.avatar}
                              alt={cit.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{cit.name}</div>
                              <div className="text-[10px] text-gray-400">{cit.district}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#7dd3fc]">Enter →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. AI COMMAND CENTER (MANAGER LOGIN) */}
                <button
                  type="button"
                  onClick={() => handlePortalSelect('manager')}
                  className="w-full p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center justify-between text-left group border border-white/10"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center shrink-0 text-[#4cd7f6]">
                      <span className="material-symbols-outlined">monitoring</span>
                    </div>
                    <div>
                      <div className="text-sm text-white font-semibold flex items-center gap-2">
                        <span>AI Command Center</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00d4ff]/20 text-[#4cd7f6] border border-[#00d4ff]/40">
                          Manager
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Commander Alex Chen · 4 Domain AI Agents
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                {/* 3. WORKER LOGIN (4 WORKERS) */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handlePortalSelect('worker')}
                    className="w-full p-3.5 hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center shrink-0 text-[#34d399]">
                        <span className="material-symbols-outlined">engineering</span>
                      </div>
                      <div>
                        <div className="text-sm text-white font-semibold flex items-center gap-2">
                          <span>Worker Portal</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40">
                            4 Workers
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Work orders, on-site status &amp; photo uploads
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </button>

                  {expandedPortal === 'worker' && (
                    <div className="p-3 bg-[#0a0c16] border-t border-white/10 space-y-2">
                      <p className="text-[11px] font-mono text-[#34d399] uppercase tracking-wider">
                        Select Domain Worker:
                      </p>
                      {WORKER_ACCOUNTS.map((worker) => (
                        <button
                          key={worker.id}
                          type="button"
                          onClick={() => {
                            onLogin(worker);
                            setPortalModalOpen(false);
                          }}
                          className="w-full p-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-[#10b981]/20 hover:border-[#10b981] transition-all flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{worker.name}</span>
                                <span className="text-[10px] font-mono text-[#34d399]">
                                  ({worker.crew})
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                                {worker.department}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#34d399]">Enter →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#05070e] py-8 border-t border-white/5">
        <div className="w-full px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#7dd3fc] flex items-center justify-center text-[#001f2e] font-bold">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <span className="text-gray-300 font-medium">
              NagarSetu Intelligent Municipal Infrastructure
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a className="hover:text-[#4cd7f6] transition-colors" href="#">
              Privacy Telemetry
            </a>
            <a className="hover:text-[#4cd7f6] transition-colors" href="#">
              Public API
            </a>
            <a className="hover:text-[#4cd7f6] transition-colors" href="#">
              Municipal Grievance Protocol
            </a>
          </div>
          <div>© 2025 NagarSetu Civic Command. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

