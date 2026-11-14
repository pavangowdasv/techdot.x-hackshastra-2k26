import { useState } from 'react';
import {
  Bot,
  HardHat,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';
import type { AuthUser } from '../types/auth';
import type { ActiveView } from '../types/ticket';

interface TopNavProps {
  activeView: ActiveView;
  currentUser: AuthUser | null;
  onSelectView: (view: ActiveView) => void;
  onNavigateToSection?: (sectionId: string) => void;
  onOpenReportModal: () => void;
  onLogout: () => void;
  onSwitchUser?: (user: AuthUser) => void;
}

export function TopNav({
  activeView,
  currentUser,
  onSelectView,
  onNavigateToSection,
  onOpenReportModal,
  onLogout,
}: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavItems = (): Array<{ id: ActiveView; label: string }> => {
    if (!currentUser) return [];

    if (currentUser.role === 'citizen') {
      return [
        { id: 'landing', label: 'Home' },
        { id: 'citizen', label: 'Citizen Portal & Tracker' },
        { id: 'verification', label: 'Verification Studio' },
        { id: 'command', label: 'Command Telemetry' },
      ];
    }

    if (currentUser.role === 'worker') {
      return [
        { id: 'landing', label: 'Home' },
        { id: 'field', label: 'My Field Work Orders' },
        { id: 'verification', label: 'Remediation Proofs' },
        { id: 'command', label: 'City Radar' },
      ];
    }

    // Manager
    return [
      { id: 'landing', label: 'Home' },
      { id: 'command', label: 'AI Command Center' },
      { id: 'matrix', label: 'Ticket Matrix' },
      { id: 'field', label: 'Field Dispatch Fleet' },
      { id: 'citizen', label: 'Citizen View' },
      { id: 'verification', label: 'Verification Studio' },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (view: ActiveView) => {
    if (view === 'landing' && onNavigateToSection) {
      onNavigateToSection('hero');
    } else {
      onSelectView(view);
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'citizen') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#9565F5]/10 border border-[#9565F5]/25 px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#9565F5]">
          <User className="h-3 w-3" />
          <span>Resident · {currentUser.district}</span>
        </span>
      );
    }
    if (currentUser.role === 'manager') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#27C5E8]/10 border border-[#27C5E8]/25 px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#27C5E8]">
          <Shield className="h-3 w-3" />
          <span>Ops Commander</span>
        </span>
      );
    }
    // worker
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#10B981]">
        <HardHat className="h-3 w-3" />
        <span>{currentUser.crew}</span>
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080B1A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand Wordmark & Role Badge */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectView(currentUser?.role === 'worker' ? 'field' : currentUser?.role === 'citizen' ? 'citizen' : 'command')}
            className="font-display text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9565F5] rounded-lg"
          >
            <span className="h-7 w-7 rounded-lg bg-[#9565F5] flex items-center justify-center text-xs font-black text-white shadow-sm">
              NS
            </span>
            <span>NagarSetu</span>
          </button>
          <div className="hidden sm:flex items-center">
            {getRoleBadge()}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-4 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9565F5] ${
                  isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#9565F5]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Status, Report Action & Switch/Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-md">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full object-cover border border-white/[0.15]"
              />
              <div className="text-left text-xs leading-none">
                <div className="font-semibold text-[#F8FAFC]">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5 capitalize">
                  {currentUser.role}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#9565F5] px-3.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-[#8352ec] active:scale-[0.98] whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Raise Complaint</span>
            <span className="sm:hidden">Report</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Switch Login / Logout"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.14] bg-white/[0.04] px-3 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08] hover:border-white/[0.22] transition-all whitespace-nowrap shrink-0 active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#27C5E8]" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-[#F8FAFC] hover:bg-white/[0.08] lg:hidden transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="border-t border-white/[0.08] bg-[#10152A]/90 backdrop-blur-xl px-4 py-3 lg:hidden space-y-2"
        >
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/[0.10] mb-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-[#F8FAFC]">{currentUser.name}</div>
                <div className="text-xs text-[#94A3B8]">{getRoleBadge()}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-11 items-center rounded-xl px-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9565F5]/15 text-[#F8FAFC] border border-[#9565F5]/30'
                      : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-white/[0.14] bg-white/[0.04] text-xs font-semibold text-[#F8FAFC] hover:bg-white/[0.08] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Switch Login / Return to Login Page</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
