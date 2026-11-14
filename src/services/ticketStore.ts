import { buildSeedTickets } from '../data/seedTickets';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type { CivilTicket } from '../types/ticket';

const STORAGE_KEY = 'nagarsetu_tickets_v2';

export function loadLocalTickets(): CivilTicket[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CivilTicket[];
      }
    }
  } catch {
    // Fall back to deterministic seed tickets
  }
  const seeded = buildSeedTickets();
  saveLocalTickets(seeded);
  return seeded;
}

export function saveLocalTickets(tickets: CivilTicket[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function resetLocalTickets(): CivilTicket[] {
  const seeded = buildSeedTickets();
  saveLocalTickets(seeded);
  return seeded;
}

export async function fetchTicketsFromBackend(): Promise<CivilTicket[]> {
  if (!isSupabaseConfigured || !supabase) {
    return loadLocalTickets();
  }

  const { data, error } = await supabase
    .from('civil_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return loadLocalTickets();
  }

  const mapped: CivilTicket[] = data.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    title: String(row.title),
    category: row.category as CivilTicket['category'],
    description: String(row.description),
    district: String(row.district),
    address: String(row.address),
    coordinates: row.coordinates as CivilTicket['coordinates'],
    mapPosition: row.map_position as CivilTicket['mapPosition'],
    severity: row.severity as CivilTicket['severity'],
    status: row.status as CivilTicket['status'],
    department: row.department as CivilTicket['department'],
    assignedCrew: row.assigned_crew ? String(row.assigned_crew) : null,
    reporterName: String(row.reporter_name),
    reporterSource: row.reporter_source as CivilTicket['reporterSource'],
    aiConfidence: Number(row.ai_confidence),
    aiRationale: String(row.ai_rationale),
    createdAt: String(row.created_at),
    slaDeadlineAt: String(row.sla_deadline_at),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : null,
    fieldNotes: String(row.field_notes ?? ''),
    verification: (row.verification as CivilTicket['verification']) ?? undefined,
    auditLog: Array.isArray(row.audit_log) ? (row.audit_log as CivilTicket['auditLog']) : [],
  }));

  saveLocalTickets(mapped);
  return mapped;
}

export async function persistTicketUpsert(ticket: CivilTicket): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  await supabase.from('civil_tickets').upsert({
    id: ticket.id,
    title: ticket.title,
    category: ticket.category,
    description: ticket.description,
    district: ticket.district,
    address: ticket.address,
    coordinates: ticket.coordinates,
    map_position: ticket.mapPosition,
    severity: ticket.severity,
    status: ticket.status,
    department: ticket.department,
    assigned_crew: ticket.assignedCrew,
    reporter_name: ticket.reporterName,
    reporter_source: ticket.reporterSource,
    ai_confidence: ticket.aiConfidence,
    ai_rationale: ticket.aiRationale,
    created_at: ticket.createdAt,
    sla_deadline_at: ticket.slaDeadlineAt,
    resolved_at: ticket.resolvedAt,
    field_notes: ticket.fieldNotes,
    verification: ticket.verification ?? null,
    audit_log: ticket.auditLog,
  });
}
