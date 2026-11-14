import { useEffect, useState } from 'react';
import { REMEDIATION_MEDIA } from './assets/media';
import { CitizenPortalView, type NewTicketInput } from './components/CitizenPortalView';
import { CommandCenterView } from './components/CommandCenterView';
import { FieldDispatchView } from './components/FieldDispatchView';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ReportIssueModal } from './components/ReportIssueModal';
import { TicketMatrixView } from './components/TicketMatrixView';
import { TopNav } from './components/TopNav';
import { VerificationStudioView } from './components/VerificationStudioView';
import {
  fetchTicketsFromBackend,
  loadLocalTickets,
  persistTicketUpsert,
  resetLocalTickets,
  saveLocalTickets,
} from './services/ticketStore';
import { CITIZEN_ACCOUNTS, MANAGER_ACCOUNT, type AuthUser, type CitizenUser, type WorkerUser } from './types/auth';
import type { ActiveView, CivilTicket, TicketStatus } from './types/ticket';
import { classifyIncident, generateNextTicketId } from './utils/triageEngine';

const SECTOR_MAP_COORDS: Record<string, { x: number; y: number; lat: number; lng: number }> = {
  'Sector 01': { x: 26, y: 24, lat: 47.6654, lng: -122.3821 },
  'Sector 02': { x: 52, y: 44, lat: 47.6212, lng: -122.3411 },
  'Sector 03': { x: 68, y: 38, lat: 47.6148, lng: -122.3182 },
  'Sector 04': { x: 35, y: 38, lat: 47.6251, lng: -122.3514 },
  'Sector 05': { x: 48, y: 63, lat: 47.6062, lng: -122.3321 },
  'Sector 06': { x: 76, y: 72, lat: 47.5819, lng: -122.2994 },
  'Sector 07': { x: 60, y: 84, lat: 47.5691, lng: -122.3102 },
};

function getInitialView(): ActiveView {
  try {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('view');
    if (
      requested === 'landing' ||
      requested === 'command' ||
      requested === 'matrix' ||
      requested === 'field' ||
      requested === 'citizen' ||
      requested === 'verification' ||
      requested === 'login'
    ) {
      return requested;
    }
  } catch {
    // Ignore URL parsing issues
  }
  return 'landing';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = window.localStorage.getItem('nagarsetu_user_v2');
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [tickets, setTickets] = useState<CivilTicket[]>(() => loadLocalTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    () => loadLocalTickets()[0]?.id ?? null,
  );
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Sync optional Supabase backend on mount if configured
  useEffect(() => {
    let mounted = true;
    fetchTicketsFromBackend().then((loaded) => {
      if (mounted && loaded.length > 0) {
        setTickets(loaded);
        setSelectedTicketId((prev) => prev ?? loaded[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Live 1s SLA countdown clock
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      window.localStorage.setItem('nagarsetu_user_v2', JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }

    if (user.role === 'citizen') {
      setActiveView('citizen');
    } else if (user.role === 'worker') {
      setActiveView('field');
    } else {
      setActiveView('command');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      window.localStorage.removeItem('nagarsetu_user_v2');
    } catch {
      // Ignore
    }
    setActiveView('landing');
  };

  const commitTicketUpdate = (updatedTicket: CivilTicket) => {
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
      saveLocalTickets(next);
      return next;
    });
    void persistTicketUpsert(updatedTicket);
  };

  const handleCreateReport = (input: NewTicketInput): CivilTicket => {
    const triage = classifyIncident({
      title: input.title,
      category: input.category,
      description: input.description,
    });

    const createdAtMs = Date.now();
    const slaDeadlineMs = createdAtMs + triage.targetSlaHours * 3600 * 1000;
    const baseCoords = SECTOR_MAP_COORDS[input.district] ?? SECTOR_MAP_COORDS['Sector 04'];
    const jitterX = ((tickets.length * 7) % 11) - 5;
    const jitterY = ((tickets.length * 5) % 9) - 4;

    const attachedPhoto = input.photoUrl || REMEDIATION_MEDIA.roadBefore;

    const newTicket: CivilTicket = {
      id: generateNextTicketId(tickets),
      title: input.title,
      category: input.category,
      description: input.description,
      district: input.district,
      address: input.address,
      coordinates: {
        lat: Number((baseCoords.lat + jitterY * 0.0008).toFixed(4)),
        lng: Number((baseCoords.lng + jitterX * 0.0008).toFixed(4)),
      },
      mapPosition: {
        x: Math.max(12, Math.min(88, baseCoords.x + jitterX)),
        y: Math.max(14, Math.min(86, baseCoords.y + jitterY)),
      },
      severity: triage.severity,
      status: 'triaged',
      department: triage.department,
      assignedCrew: triage.recommendedCrew,
      assignedWorkerId: triage.assignedWorkerId,
      assignedWorkerName: triage.assignedWorkerName,
      aiAgentAssigned: triage.agentName,
      reporterName: input.reporterName,
      reporterId: input.reporterId || (currentUser?.role === 'citizen' ? currentUser.id : undefined),
      reporterSource: 'Citizen Portal',
      citizenPhotoUrl: attachedPhoto,
      aiConfidence: triage.confidence,
      aiRationale: triage.rationale,
      createdAt: new Date(createdAtMs).toISOString(),
      slaDeadlineAt: new Date(slaDeadlineMs).toISOString(),
      resolvedAt: null,
      fieldNotes: `Auto-triaged by ${triage.agentName}; routed to ${triage.department} for ${triage.assignedWorkerName}.`,
      verification: {
        beforeUrl: attachedPhoto,
        afterUrl: '',
        beforeCaption: 'Citizen Reported Hazard Photo',
        afterCaption: 'Pending Technician Remediation Photo',
        citizenSignedOff: false,
      },
      auditLog: [
        {
          id: `aud-${createdAtMs}-1`,
          timestamp: new Date(createdAtMs).toISOString(),
          actor: `${input.reporterName} (Citizen)`,
          action: `Submitted ${input.category} complaint with attached photo evidence`,
        },
        {
          id: `aud-${createdAtMs}-2`,
          timestamp: new Date(createdAtMs).toISOString(),
          actor: triage.agentName,
          action: `Auto-routed to ${triage.department} · Dispatched to Worker ${triage.assignedWorkerName} (${triage.recommendedCrew})`,
        },
      ],
    };

    setTickets((prev) => {
      const next = [newTicket, ...prev];
      saveLocalTickets(next);
      return next;
    });
    setSelectedTicketId(newTicket.id);
    void persistTicketUpsert(newTicket);
    return newTicket;
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    nextStatus: TicketStatus,
    actor: string = 'Operations Dispatch',
    afterPhotoUrl?: string,
    fieldNotes?: string,
  ) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    const isResolving = nextStatus === 'resolved';

    let updatedVerification = target.verification;
    if (isResolving) {
      const beforeImg =
        target.citizenPhotoUrl || target.verification?.beforeUrl || REMEDIATION_MEDIA.roadBefore;
      const afterImg =
        afterPhotoUrl ||
        (target.category === 'Water & Drainage'
          ? REMEDIATION_MEDIA.drainAfter
          : target.category === 'Traffic Signals' || target.category === 'Street Lighting'
            ? REMEDIATION_MEDIA.gridAfter
            : target.category === 'Sanitation & Debris'
              ? REMEDIATION_MEDIA.sanitationAfter
              : REMEDIATION_MEDIA.roadAfter);

      updatedVerification = {
        beforeUrl: beforeImg,
        afterUrl: afterImg,
        beforeCaption: target.verification?.beforeCaption || 'Citizen Before Photo',
        afterCaption: 'Worker Remediation Proof Photo',
        citizenSignedOff: false,
      };
    }

    const updated: CivilTicket = {
      ...target,
      status: nextStatus,
      assignedCrew: target.assignedCrew ?? 'Unit Alpha-01',
      fieldNotes: fieldNotes !== undefined ? fieldNotes : target.fieldNotes,
      resolvedAt: isResolving ? nowIso : target.resolvedAt,
      verification: updatedVerification,
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          actor,
          action: isResolving
            ? 'Completed on-site remediation & uploaded proof photo (Awaiting Citizen Verification)'
            : `Transitioned ticket status to ${nextStatus.replace('_', ' ')}`,
        },
        ...target.auditLog,
      ],
    };

    commitTicketUpdate(updated);
  };

  const handleAssignCrew = (ticketId: string, crew: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    commitTicketUpdate({
      ...target,
      assignedCrew: crew,
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          actor: 'Operations Dispatch',
          action: `Assigned ${crew}`,
        },
        ...target.auditLog,
      ],
    });
  };

  const handleEscalateSeverity = (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    commitTicketUpdate({
      ...target,
      severity: 'critical',
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          actor: 'Operations Dispatch',
          action: 'Escalated ticket severity to Critical',
        },
        ...target.auditLog,
      ],
    });
  };

  const handleUpdateFieldNotes = (ticketId: string, notes: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return;

    commitTicketUpdate({
      ...target,
      fieldNotes: notes,
    });
  };

  const handleToggleCitizenSignOff = (
    ticketId: string,
    rating: number = 5,
    feedback?: string,
  ) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target || !target.verification) return;

    const nextSigned = !target.verification.citizenSignedOff;
    const nowIso = new Date().toISOString();

    commitTicketUpdate({
      ...target,
      verification: {
        ...target.verification,
        citizenSignedOff: nextSigned,
        citizenRating: nextSigned ? rating : undefined,
        citizenFeedback: nextSigned ? feedback : undefined,
        verifiedAt: nextSigned ? nowIso : undefined,
      },
      auditLog: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          actor: currentUser?.name || 'Citizen Verification',
          action: nextSigned
            ? `Resident verified repair sign-off (${rating}★ - "${feedback || 'Satisfied'}")`
            : 'Reopened citizen verification audit check',
        },
        ...target.auditLog,
      ],
    });
  };

  const handleBatchAutoDispatch = () => {
    setIsDispatching(true);
    window.setTimeout(() => {
      setTickets((prev) => {
        const next = prev.map((ticket) => {
          if (ticket.status === 'new' || !ticket.assignedCrew || !ticket.assignedWorkerId) {
            const triage = classifyIncident({
              title: ticket.title,
              category: ticket.category,
              description: ticket.description,
            });
            return {
              ...ticket,
              status: 'triaged' as TicketStatus,
              department: triage.department,
              assignedCrew: triage.recommendedCrew,
              assignedWorkerId: triage.assignedWorkerId,
              assignedWorkerName: triage.assignedWorkerName,
              aiAgentAssigned: triage.agentName,
              aiConfidence: triage.confidence,
              aiRationale: triage.rationale,
              auditLog: [
                {
                  id: `aud-${Date.now()}-${ticket.id}`,
                  timestamp: new Date().toISOString(),
                  actor: triage.agentName,
                  action: `Auto-routed to ${triage.department} and assigned to Worker ${triage.assignedWorkerName} (${triage.recommendedCrew})`,
                },
                ...ticket.auditLog,
              ],
            };
          }
          return ticket;
        });
        saveLocalTickets(next);
        return next;
      });
      setIsDispatching(false);
    }, 700);
  };

  const handleResetDemoData = () => {
    const fresh = resetLocalTickets();
    setTickets(fresh);
    setSelectedTicketId(fresh[0]?.id ?? null);
  };

  const handleNavigateToSection = (sectionId: string) => {
    setActiveView('landing');
    setTargetSection(sectionId);
  };

  // If on landing view or explicitly visiting landing page
  if (activeView === 'landing' && !currentUser) {
    return (
      <>
        <LandingPage
          onLogin={handleLogin}
          onNavigateToLogin={() => setActiveView('login')}
          onOpenReportModal={() => setReportModalOpen(true)}
          onTrackComplaint={() => {
            handleLogin(CITIZEN_ACCOUNTS[0]);
            setActiveView('citizen');
          }}
          onOpenCommandCenter={() => {
            handleLogin(MANAGER_ACCOUNT);
            setActiveView('command');
          }}
          targetSection={targetSection}
          onClearTargetSection={() => setTargetSection(null)}
        />
        <ReportIssueModal
          open={reportModalOpen}
          defaultReporterName="Guest Resident"
          onClose={() => setReportModalOpen(false)}
          onSubmit={(input) => {
            handleCreateReport(input);
            handleLogin(CITIZEN_ACCOUNTS[0]);
            setActiveView('citizen');
          }}
        />
      </>
    );
  }

  // If on login view or not authenticated
  if (activeView === 'login' || !currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackToHome={() => setActiveView('landing')}
        onNavigateToSection={handleNavigateToSection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#F8FAFC]">
      <TopNav
        activeView={activeView}
        currentUser={currentUser}
        onSelectView={setActiveView}
        onNavigateToSection={handleNavigateToSection}
        onOpenReportModal={() => setReportModalOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        {activeView === 'landing' && (
          <LandingPage
            onLogin={handleLogin}
            onOpenReportModal={() => setReportModalOpen(true)}
            onTrackComplaint={() => setActiveView('citizen')}
            onOpenCommandCenter={() => setActiveView('command')}
            targetSection={targetSection}
            onClearTargetSection={() => setTargetSection(null)}
          />
        )}

        {activeView === 'command' && (
          <CommandCenterView
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onAssignCrew={handleAssignCrew}
            onEscalateSeverity={handleEscalateSeverity}
            onBatchAutoDispatch={handleBatchAutoDispatch}
            isDispatching={isDispatching}
            nowMs={nowMs}
          />
        )}

        {activeView === 'matrix' && (
          <TicketMatrixView
            tickets={tickets}
            nowMs={nowMs}
            onInspectTicket={(id) => {
              setSelectedTicketId(id);
              setActiveView('command');
            }}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {activeView === 'field' && (
          <FieldDispatchView
            tickets={tickets}
            currentWorker={currentUser.role === 'worker' ? (currentUser as WorkerUser) : null}
            nowMs={nowMs}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onUpdateFieldNotes={handleUpdateFieldNotes}
          />
        )}

        {activeView === 'citizen' && (
          <CitizenPortalView
            tickets={tickets}
            currentCitizen={currentUser.role === 'citizen' ? (currentUser as CitizenUser) : null}
            onSubmitReport={handleCreateReport}
            onToggleCitizenSignOff={handleToggleCitizenSignOff}
          />
        )}

        {activeView === 'verification' && (
          <VerificationStudioView
            tickets={tickets}
            onToggleCitizenSignOff={handleToggleCitizenSignOff}
          />
        )}
      </main>

      <ReportIssueModal
        open={reportModalOpen}
        defaultReporterName={currentUser?.name}
        defaultReporterId={currentUser?.id}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
