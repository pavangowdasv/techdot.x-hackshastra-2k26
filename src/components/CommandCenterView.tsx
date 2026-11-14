import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  HardHat,
  MapPin,
  Search,
  Send,
  UserCheck,
} from 'lucide-react';
import { DOMAIN_AGENTS } from '../types/auth';
import type { CivilTicket, TicketSeverity, TicketStatus } from '../types/ticket';
import { computeCommandMetrics, filterTickets, sortQueuePriority } from '../utils/triageEngine';
import { AiAgentSwarmPanel } from './AiAgentSwarmPanel';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { RadarMap } from './RadarMap';
import { SlaTimer } from './SlaTimer';
import { SeverityBadge, StatusBadge } from './StatusBadge';

interface CommandCenterViewProps {
  tickets: CivilTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  onUpdateTicketStatus: (ticketId: string, nextStatus: TicketStatus, actor?: string) => void;
  onAssignCrew: (ticketId: string, crew: string) => void;
  onEscalateSeverity: (ticketId: string) => void;
  onBatchAutoDispatch?: () => void;
  isDispatching?: boolean;
  nowMs: number;
}

const CREW_OPTIONS = [
  'Unit Alpha-01',
  'Unit Hydro-04',
  'Unit Volt-02',
  'Unit Sweep-09',
  'Unit Signal-07',
  'Unit Struct-03',
];

export function CommandCenterView({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onUpdateTicketStatus,
  onAssignCrew,
  onEscalateSeverity,
  onBatchAutoDispatch,
  isDispatching = false,
  nowMs,
}: CommandCenterViewProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<TicketSeverity | 'all'>('all');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>(null);

  const metrics = useMemo(() => computeCommandMetrics(tickets, nowMs), [tickets, nowMs]);

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (selectedAgentFilter) {
      const agent = DOMAIN_AGENTS.find((a) => a.id === selectedAgentFilter);
      if (agent) {
        list = list.filter(
          (t) =>
            t.department === agent.department ||
            agent.categories.includes(t.category) ||
            t.aiAgentAssigned === agent.name ||
            t.assignedCrew === agent.assignedWorker.crew,
        );
      }
    }

    const filtered = filterTickets(list, {
      search,
      severity: severityFilter,
      status: 'all',
      department: 'all',
    });
    return sortQueuePriority(filtered);
  }, [tickets, search, severityFilter, selectedAgentFilter]);

  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) ?? filteredTickets[0] ?? tickets[0] ?? null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      {/* Page Title Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F4F6] text-balance">
            Operations AI Command Center
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Live municipal intake telemetry, autonomous 4-department multi-agent division, and technician dispatch routing.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-[#9CA3AF]">
          <span>TOTAL COMPLAINTS: {tickets.length}</span>
          <span aria-hidden="true">·</span>
          <span>ACTIVE QUEUE: {metrics.activeCount}</span>
          <span aria-hidden="true">·</span>
          <span className={metrics.criticalOpenCount > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
            CRITICAL OPEN: {metrics.criticalOpenCount}
          </span>
        </div>
      </div>

      {/* AUTONOMOUS AI MULTI-AGENT SWARM PANEL */}
      <AiAgentSwarmPanel
        tickets={tickets}
        selectedAgentId={selectedAgentFilter}
        onSelectAgent={setSelectedAgentFilter}
        onBatchAutoDispatch={onBatchAutoDispatch ?? (() => {})}
        isDispatching={isDispatching}
      />

      {/* 12-Column Responsive Command Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        {/* LEFT RAIL: Ingestion Queue (3 cols) */}
        <aside
          aria-label="Live Ticket Ingestion Queue"
          className="glass-level-1 flex flex-col rounded-2xl border border-[#22304A] xl:col-span-3 shadow-xl"
        >
          <div className="border-b border-[#22304A] p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-[#F3F4F6]">
                Complaint Ingestion Queue
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#06B6D4]">
                {filteredTickets.length} / {tickets.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, street, citizen..."
                aria-label="Search ingestion queue"
                className="h-10 w-full rounded-xl border border-[#22304A] bg-[#090D18] pr-3 pl-9 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#7657F6] focus:shadow-[0_0_10px_rgba(118,87,246,0.3)] focus:outline-none"
              />
            </div>

            {/* Severity Filter Segmented Tabs */}
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-[#22304A] bg-[#090D18] p-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'critical', label: 'Crit' },
                  { id: 'warning', label: 'Warn' },
                  { id: 'nominal', label: 'Nom' },
                ] as const
              ).map((item) => {
                const isActive = severityFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSeverityFilter(item.id)}
                    className={`h-7 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#7657F6] text-[#F3F4F6]'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket List */}
          <div className="max-h-[580px] divide-y divide-[#22304A]/70 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#9CA3AF]">No complaints match active filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSeverityFilter('all');
                    setSelectedAgentFilter(null);
                  }}
                  className="mt-3 rounded-lg border border-[#22304A] bg-[#151D2E] px-3 py-1.5 text-xs font-medium text-[#06B6D4] hover:border-[#06B6D4]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = activeTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => onSelectTicket(ticket.id)}
                    aria-pressed={isSelected}
                    className={`flex w-full flex-col gap-2 p-4 text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[#151D2E] shadow-[inset_0_0_0_1px_rgba(6,182,212,0.45)]'
                        : 'hover:bg-[#151D2E]/55'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#CABEFF]">
                        {ticket.id}
                      </span>
                      <SeverityBadge severity={ticket.severity} />
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-[#F3F4F6]">
                      {ticket.title}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-xs text-[#9CA3AF]">
                      <span className="truncate">
                        {ticket.district} · {ticket.category}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CENTER FLUID CANVAS: GIS Radar Map + 4-Column KPI Strip (5 cols) */}
        <div className="flex flex-col gap-6 xl:col-span-5">
          <RadarMap
            tickets={tickets}
            selectedTicketId={activeTicket?.id ?? null}
            onSelectTicket={onSelectTicket}
          />

          {/* 4-Column Operational KPI Strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass-level-2 flex flex-col justify-between rounded-xl p-4 border border-[#22304A]">
              <span className="font-mono text-[11px] font-medium whitespace-nowrap text-[#9CA3AF]">
                Active Queue
              </span>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#F3F4F6]">
                {metrics.activeCount}
              </div>
              <p className="mt-1 text-xs whitespace-nowrap text-[#64748B]">
                {metrics.totalTickets} total complaints
              </p>
            </div>

            <div className="glass-level-2 flex flex-col justify-between rounded-xl p-4 border border-[#22304A]">
              <span className="font-mono text-[11px] font-medium whitespace-nowrap text-[#9CA3AF]">
                SLA At Risk
              </span>
              <div
                className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
                  metrics.slaAtRiskCount > 0 ? 'text-[#F59E0B]' : 'text-[#10B981]'
                }`}
              >
                {metrics.slaAtRiskCount}
              </div>
              <p className="mt-1 text-xs whitespace-nowrap text-[#64748B]">5h horizon</p>
            </div>

            <div className="glass-level-2 flex flex-col justify-between rounded-xl p-4 border border-[#22304A]">
              <span className="font-mono text-[11px] font-medium whitespace-nowrap text-[#9CA3AF]">
                Agent Precision
              </span>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#06B6D4]">
                {metrics.meanAiConfidence}%
              </div>
              <p className="mt-1 text-xs whitespace-nowrap text-[#64748B]">Mean swarm triage</p>
            </div>

            <div className="glass-level-2 flex flex-col justify-between rounded-xl p-4 border border-[#22304A]">
              <span className="font-mono text-[11px] font-medium whitespace-nowrap text-[#9CA3AF]">
                Citizen Verified
              </span>
              <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-[#10B981]">
                {metrics.slaCompliancePct}%
              </div>
              <p className="mt-1 text-xs whitespace-nowrap text-[#64748B]">
                {metrics.resolvedCount} signed off
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR DRAWER: SLA, AI Agent Triage & Dispatch Controls (4 cols) */}
        <section
          aria-label="Incident Inspector"
          className="glass-level-2 flex flex-col gap-5 rounded-2xl p-6 xl:col-span-4 border border-[#22304A] shadow-xl"
        >
          {activeTicket ? (
            <>
              {/* Inspector Header */}
              <div className="border-b border-[#22304A] pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold tracking-wide text-[#06B6D4]">
                    {activeTicket.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={activeTicket.severity} />
                    <StatusBadge status={activeTicket.status} />
                  </div>
                </div>
                <h2 className="mt-2 font-display text-lg font-bold leading-snug text-[#F3F4F6]">
                  {activeTicket.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                  <MapPin className="h-3.5 w-3.5 text-[#06B6D4]" aria-hidden="true" />
                  <span>{activeTicket.address}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeTicket.district}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#CABEFF]">By: {activeTicket.reporterName}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#C9C4D8]">
                  {activeTicket.description}
                </p>
              </div>

              {/* Citizen's Uploaded Photo Preview if available */}
              {activeTicket.citizenPhotoUrl || activeTicket.verification?.beforeUrl ? (
                <div className="p-3 rounded-xl border border-[#22304A] bg-[#090D18]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#CABEFF] mb-2">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Camera className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      Citizen Photo Evidence
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">Attached by Resident</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden h-36 border border-[#22304A]">
                    <img
                      src={activeTicket.citizenPhotoUrl || activeTicket.verification?.beforeUrl}
                      alt="Citizen report"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {/* Live SLA Countdown */}
              <SlaTimer ticket={activeTicket} nowMs={nowMs} />

              {/* AI Agent Triage & Worker Assignment Card */}
              <div className="rounded-xl border border-[#7657F6]/40 bg-[#0F172A]/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[#CABEFF]" aria-hidden="true" />
                    <h3 className="font-display text-xs font-bold text-[#F3F4F6]">
                      {activeTicket.aiAgentAssigned ?? 'AI Agent Triage Routing'}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-[#06B6D4]">
                    {activeTicket.aiConfidence}% match
                  </span>
                </div>

                {/* Confidence Progress Bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#22304A]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7657F6] to-[#06B6D4]"
                    style={{ width: `${Math.min(100, activeTicket.aiConfidence)}%` }}
                  />
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-[#9CA3AF]">
                  {activeTicket.aiRationale}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#22304A] pt-3 text-xs">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-[#64748B]">
                      Department
                    </span>
                    <span className="mt-0.5 block font-semibold text-[#F3F4F6] truncate">
                      {activeTicket.department}
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="inspector-crew-select"
                      className="block font-mono text-[10px] uppercase text-[#64748B]"
                    >
                      Assigned Crew / Worker
                    </label>
                    <select
                      id="inspector-crew-select"
                      value={activeTicket.assignedCrew ?? ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignCrew(activeTicket.id, e.target.value);
                        }
                      }}
                      className="mt-0.5 h-7 w-full rounded border border-[#22304A] bg-[#090D18] px-2 text-xs text-[#F3F4F6] focus:border-[#7657F6] focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {CREW_OPTIONS.map((crew) => (
                        <option key={crew} value={crew}>
                          {crew}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tactical Dispatch Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {activeTicket.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const next: TicketStatus =
                        activeTicket.status === 'new' || activeTicket.status === 'triaged'
                          ? 'dispatched'
                          : activeTicket.status === 'dispatched'
                            ? 'en_route'
                            : activeTicket.status === 'en_route'
                              ? 'on_site'
                              : 'resolved';
                      onUpdateTicketStatus(activeTicket.id, next, 'Manager Dispatch');
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7657F6] px-4 text-xs font-semibold text-[#F3F4F6] transition-all hover:bg-[#8B5CF6] hover:shadow-[0_0_16px_rgba(118,87,246,0.45)] active:scale-[0.98] whitespace-nowrap"
                  >
                    {activeTicket.status === 'on_site' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Force Resolve (Manager)</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {activeTicket.status === 'new' || activeTicket.status === 'triaged'
                            ? 'Dispatch Assigned Worker'
                            : activeTicket.status === 'dispatched'
                              ? 'Mark En Route'
                              : 'Arrive On-Site'}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {activeTicket.severity !== 'critical' && activeTicket.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => onEscalateSeverity(activeTicket.id)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#EF4444]/60 bg-[#EF4444]/15 px-3.5 text-xs font-semibold text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white whitespace-nowrap"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Escalate</span>
                  </button>
                )}

                {activeTicket.status === 'resolved' && (
                  <div className="flex w-full items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-3 py-2 text-xs text-[#10B981]">
                    <UserCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Remediation completed and ready for citizen verification.</span>
                  </div>
                )}
              </div>

              {/* Embedded Before / After Preview if resolved */}
              {activeTicket.verification && (
                <div className="border-t border-[#22304A] pt-4">
                  <h3 className="mb-2.5 font-display text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Visual Field Verification Comparison
                  </h3>
                  <BeforeAfterSlider
                    beforeUrl={activeTicket.verification.beforeUrl}
                    afterUrl={activeTicket.verification.afterUrl}
                    beforeCaption={activeTicket.verification.beforeCaption}
                    afterCaption={activeTicket.verification.afterCaption}
                    heightClass="h-44"
                  />
                </div>
              )}

              {/* Audit Trail */}
              <div className="border-t border-[#22304A] pt-4">
                <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Audit Log
                </h3>
                <ul className="space-y-2">
                  {activeTicket.auditLog.slice(0, 5).map((event) => (
                    <li
                      key={event.id}
                      className="flex items-start justify-between gap-3 text-xs text-[#9CA3AF]"
                    >
                      <span>
                        <strong className="font-semibold text-[#F3F4F6]">{event.actor}:</strong>{' '}
                        {event.action}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-[#64748B]">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#9CA3AF]">Select an incident to inspect telemetry.</p>
          )}
        </section>
      </div>
    </div>
  );
}
