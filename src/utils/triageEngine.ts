import type {
  CivilTicket,
  DepartmentName,
  SortDirection,
  TicketCategory,
  TicketFilterState,
  TicketSeverity,
  TicketSortField,
} from '../types/ticket';

export interface TriageClassification {
  severity: TicketSeverity;
  targetSlaHours: number;
  department: DepartmentName;
  recommendedCrew: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  agentName: string;
  confidence: number;
  rationale: string;
}

const CATEGORY_ROUTING: Record<
  TicketCategory,
  {
    department: DepartmentName;
    defaultCrew: string;
    workerId: string;
    workerName: string;
    agentName: string;
    baseSlaHours: number;
    baseSeverity: TicketSeverity;
  }
> = {
  'Roadway & Asphalt': {
    department: 'Surface Transit & Paving',
    defaultCrew: 'Unit Alpha-01',
    workerId: 'worker-1',
    workerName: 'Dave Miller',
    agentName: 'Agent Pave-AI',
    baseSlaHours: 12,
    baseSeverity: 'warning',
  },
  'Water & Drainage': {
    department: 'Hydrology & Storm Systems',
    defaultCrew: 'Unit Hydro-04',
    workerId: 'worker-2',
    workerName: 'Maya Lin',
    agentName: 'Agent Hydro-AI',
    baseSlaHours: 8,
    baseSeverity: 'warning',
  },
  'Street Lighting': {
    department: 'Grid Illumination & Signals',
    defaultCrew: 'Unit Volt-02',
    workerId: 'worker-3',
    workerName: 'Carlos Ruiz',
    agentName: 'Agent Volt-AI',
    baseSlaHours: 24,
    baseSeverity: 'nominal',
  },
  'Traffic Signals': {
    department: 'Grid Illumination & Signals',
    defaultCrew: 'Unit Volt-02',
    workerId: 'worker-3',
    workerName: 'Carlos Ruiz',
    agentName: 'Agent Volt-AI',
    baseSlaHours: 4,
    baseSeverity: 'critical',
  },
  'Sanitation & Debris': {
    department: 'Civic Sanitation & Cleanliness',
    defaultCrew: 'Unit Sweep-09',
    workerId: 'worker-4',
    workerName: 'Aisha Patel',
    agentName: 'Agent Sweep-AI',
    baseSlaHours: 18,
    baseSeverity: 'nominal',
  },
  'Structural Hazard': {
    department: 'Surface Transit & Paving',
    defaultCrew: 'Unit Alpha-01',
    workerId: 'worker-1',
    workerName: 'Dave Miller',
    agentName: 'Agent Pave-AI',
    baseSlaHours: 3,
    baseSeverity: 'critical',
  },
};

const CRITICAL_KEYWORDS = [
  'collapse',
  'collapsed',
  'flood',
  'flooding',
  'burst',
  'main break',
  'exposed wire',
  'sparking',
  'signal out',
  'blackout',
  'sinkhole',
  'emergency',
  'intersection dark',
  'gas',
  'bridge',
];

const WARNING_KEYWORDS = [
  'deep pothole',
  'pothole',
  'clogged',
  'overflow',
  'standing water',
  'flickering',
  'cracked',
  'blocked',
  'leaning',
  'damaged',
  'outage',
];

export function classifyIncident(input: {
  title: string;
  category: TicketCategory;
  description: string;
}): TriageClassification {
  const routing = CATEGORY_ROUTING[input.category];
  const combined = `${input.title} ${input.description}`.toLowerCase();

  const criticalHits = CRITICAL_KEYWORDS.filter((kw) => combined.includes(kw));
  const warningHits = WARNING_KEYWORDS.filter((kw) => combined.includes(kw));

  let severity: TicketSeverity = routing.baseSeverity;
  let targetSlaHours = routing.baseSlaHours;
  let confidence = 91.2;

  if (criticalHits.length > 0) {
    severity = 'critical';
    targetSlaHours = Math.min(routing.baseSlaHours, 4);
    confidence = Math.min(99.2, 94.4 + criticalHits.length * 1.6);
  } else if (warningHits.length > 0 && severity === 'nominal') {
    severity = 'warning';
    targetSlaHours = Math.min(routing.baseSlaHours, 12);
    confidence = Math.min(97.8, 92.5 + warningHits.length * 1.3);
  } else if (input.description.trim().length > 40) {
    confidence = 94.8;
  }

  const matchedTokens = [...criticalHits, ...warningHits].slice(0, 3);
  const triggerPhrase =
    matchedTokens.length > 0
      ? `Detected risk indicators (${matchedTokens.join(', ')})`
      : `Standard ${input.category.toLowerCase()} intake profile`;

  return {
    severity,
    targetSlaHours,
    department: routing.department,
    recommendedCrew: routing.defaultCrew,
    assignedWorkerId: routing.workerId,
    assignedWorkerName: routing.workerName,
    agentName: routing.agentName,
    confidence: Number(confidence.toFixed(1)),
    rationale: `${triggerPhrase}. Analyzed by ${routing.agentName} → Auto-routed to ${routing.department} and assigned to ${routing.workerName} (${routing.defaultCrew}) with a ${targetSlaHours}h SLA horizon.`,
  };
}

export type SlaRiskState = 'resolved' | 'breached' | 'critical' | 'warning' | 'nominal';

export interface SlaMetrics {
  remainingMs: number;
  elapsedRatio: number;
  formattedCountdown: string;
  riskState: SlaRiskState;
  label: string;
}

export function computeSlaMetrics(
  ticket: Pick<CivilTicket, 'createdAt' | 'slaDeadlineAt' | 'status' | 'resolvedAt'>,
  nowMs: number = Date.now(),
): SlaMetrics {
  const createdMs = Date.parse(ticket.createdAt);
  const deadlineMs = Date.parse(ticket.slaDeadlineAt);
  const totalWindowMs = Math.max(1, deadlineMs - createdMs);

  if (ticket.status === 'resolved') {
    const resolvedMs = ticket.resolvedAt ? Date.parse(ticket.resolvedAt) : nowMs;
    const withinSla = resolvedMs <= deadlineMs;
    return {
      remainingMs: Math.max(0, deadlineMs - resolvedMs),
      elapsedRatio: 1,
      formattedCountdown: withinSla ? 'SLA MET' : 'CLOSED LATE',
      riskState: 'resolved',
      label: withinSla ? 'Verified within target' : 'Resolved post-SLA',
    };
  }

  const remainingMs = deadlineMs - nowMs;
  const elapsedRatio = Math.min(1, Math.max(0, (nowMs - createdMs) / totalWindowMs));

  if (remainingMs <= 0) {
    const overdueMs = Math.abs(remainingMs);
    return {
      remainingMs: 0,
      elapsedRatio: 1,
      formattedCountdown: `-${formatDurationMs(overdueMs)}`,
      riskState: 'breached',
      label: 'SLA breached — escalate immediately',
    };
  }

  const remainingHours = remainingMs / (1000 * 60 * 60);
  let riskState: SlaRiskState = 'nominal';
  let label = 'On schedule';

  if (remainingHours <= 2 || elapsedRatio >= 0.85) {
    riskState = 'critical';
    label = 'Imminent SLA breach';
  } else if (remainingHours <= 5 || elapsedRatio >= 0.6) {
    riskState = 'warning';
    label = 'Approaching escalation horizon';
  }

  return {
    remainingMs,
    elapsedRatio,
    formattedCountdown: formatDurationMs(remainingMs),
    riskState,
    label,
  };
}

export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function filterTickets(tickets: CivilTicket[], filters: TicketFilterState): CivilTicket[] {
  const q = filters.search.trim().toLowerCase();

  return tickets.filter((ticket) => {
    if (filters.severity !== 'all' && ticket.severity !== filters.severity) {
      return false;
    }

    if (filters.status === 'active') {
      if (ticket.status === 'resolved') return false;
    } else if (filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }

    if (filters.department !== 'all' && ticket.department !== filters.department) {
      return false;
    }

    if (q.length > 0) {
      const haystack = `${ticket.id} ${ticket.title} ${ticket.address} ${ticket.district} ${ticket.department} ${ticket.assignedCrew ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

const SEVERITY_RANK: Record<TicketSeverity, number> = {
  critical: 3,
  warning: 2,
  nominal: 1,
};

export function sortTickets(
  tickets: CivilTicket[],
  sortBy: TicketSortField,
  direction: SortDirection,
): CivilTicket[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...tickets].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        return (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) * factor;
      case 'aiConfidence':
        return (a.aiConfidence - b.aiConfidence) * factor;
      case 'slaDeadlineAt':
        return (Date.parse(a.slaDeadlineAt) - Date.parse(b.slaDeadlineAt)) * factor;
      case 'createdAt':
        return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * factor;
      case 'id':
        return a.id.localeCompare(b.id) * factor;
    }
  });
}

export function sortQueuePriority(tickets: CivilTicket[]): CivilTicket[] {
  return [...tickets].sort((a, b) => {
    const aResolved = a.status === 'resolved' ? 1 : 0;
    const bResolved = b.status === 'resolved' ? 1 : 0;
    if (aResolved !== bResolved) return aResolved - bResolved;

    const sevDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (sevDiff !== 0) return sevDiff;

    return Date.parse(a.slaDeadlineAt) - Date.parse(b.slaDeadlineAt);
  });
}

export interface CommandMetrics {
  totalTickets: number;
  activeCount: number;
  criticalOpenCount: number;
  slaAtRiskCount: number;
  resolvedCount: number;
  slaCompliancePct: number;
  meanAiConfidence: number;
}

export function computeCommandMetrics(
  tickets: CivilTicket[],
  nowMs: number = Date.now(),
): CommandMetrics {
  const active = tickets.filter((t) => t.status !== 'resolved');
  const resolved = tickets.filter((t) => t.status === 'resolved');

  const criticalOpenCount = active.filter((t) => t.severity === 'critical').length;
  const slaAtRiskCount = active.filter((t) => {
    const sla = computeSlaMetrics(t, nowMs);
    return sla.riskState === 'critical' || sla.riskState === 'breached' || sla.riskState === 'warning';
  }).length;

  const resolvedWithinSla = resolved.filter((t) => {
    if (!t.resolvedAt) return true;
    return Date.parse(t.resolvedAt) <= Date.parse(t.slaDeadlineAt);
  }).length;

  const slaCompliancePct =
    resolved.length > 0 ? Math.round((resolvedWithinSla / resolved.length) * 100) : 100;

  const meanAiConfidence =
    tickets.length > 0
      ? Number(
        (tickets.reduce((acc, item) => acc + item.aiConfidence, 0) / tickets.length).toFixed(1),
      )
      : 0;

  return {
    totalTickets: tickets.length,
    activeCount: active.length,
    criticalOpenCount,
    slaAtRiskCount,
    resolvedCount: resolved.length,
    slaCompliancePct,
    meanAiConfidence,
  };
}

export function generateNextTicketId(existingTickets: CivilTicket[]): string {
  const maxNum = existingTickets.reduce((max, t) => {
    const match = t.id.match(/TK-(\d+)-CIV/);
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10));
  }, 8940);
  return `TK-${maxNum + 1}-CIV`;
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatTicketsCsv(tickets: CivilTicket[]): string {
  const headers = [
    'Ticket ID',
    'Title',
    'Category',
    'Severity',
    'Status',
    'Department',
    'Assigned Crew',
    'District',
    'Address',
    'AI Confidence (%)',
    'Created At',
    'SLA Deadline',
  ];

  const rows = tickets.map((t) =>
    [
      t.id,
      t.title,
      t.category,
      t.severity,
      t.status,
      t.department,
      t.assignedCrew ?? 'Unassigned',
      t.district,
      t.address,
      String(t.aiConfidence),
      t.createdAt,
      t.slaDeadlineAt,
    ]
      .map(escapeCsvCell)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}
