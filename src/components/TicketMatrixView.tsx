import { useMemo, useState } from 'react';
import { ArrowDownUp, Download, RotateCcw, Search } from 'lucide-react';
import type {
  CivilTicket,
  DepartmentName,
  SortDirection,
  TicketSeverity,
  TicketSortField,
  TicketStatus,
} from '../types/ticket';
import { filterTickets, formatTicketsCsv, sortTickets } from '../utils/triageEngine';
import { SlaTimer } from './SlaTimer';
import { SeverityBadge, StatusBadge } from './StatusBadge';

interface TicketMatrixViewProps {
  tickets: CivilTicket[];
  nowMs: number;
  onInspectTicket: (ticketId: string) => void;
  onResetDemoData: () => void;
}

const DEPARTMENTS: DepartmentName[] = [
  'Surface Transit & Paving',
  'Hydrology & Storm Systems',
  'Grid Illumination & Signals',
  'Civic Sanitation & Cleanliness',
  'Grid Illumination',
  'Traffic Operations',
  'Civic Sanitation',
  'Structural Engineering',
];

export function TicketMatrixView({
  tickets,
  nowMs,
  onInspectTicket,
  onResetDemoData,
}: TicketMatrixViewProps) {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<TicketSeverity | 'all'>('all');
  const [status, setStatus] = useState<TicketStatus | 'all' | 'active'>('all');
  const [department, setDepartment] = useState<DepartmentName | 'all'>('all');
  const [sortBy, setSortBy] = useState<TicketSortField>('slaDeadlineAt');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const rows = useMemo(() => {
    const filtered = filterTickets(tickets, { search, severity, status, department });
    return sortTickets(filtered, sortBy, sortDir);
  }, [tickets, search, severity, status, department, sortBy, sortDir]);

  const toggleSort = (field: TicketSortField) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'aiConfidence' || field === 'severity' ? 'desc' : 'asc');
    }
  };

  const handleExportCsv = () => {
    const csv = formatTicketsCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nagarsetu-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F3F4F6] text-balance">
            Municipal Ticket Matrix
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Tabular SLA telemetry, department routing audit, and live operational filtering.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-[#22304A] bg-[#151D2E]/60 px-3.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#06B6D4] hover:text-[#06B6D4] whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Seed Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-[#22304A] bg-[#151D2E]/60 px-3.5 text-xs font-medium text-[#F3F4F6] transition-colors hover:border-[#06B6D4] hover:text-[#06B6D4] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-level-1 mb-5 grid grid-cols-1 gap-3 rounded-lg p-4 md:grid-cols-12">
        <div className="relative md:col-span-4">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticket ID, street, crew..."
            aria-label="Filter matrix tickets"
            className="h-10 w-full rounded border border-[#22304A] bg-[#090D18] pr-3 pl-9 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#7657F6] focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <select
            aria-label="Filter by severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as TicketSeverity | 'all')}
            className="h-10 w-full rounded border border-[#22304A] bg-[#090D18] px-3 text-sm text-[#F3F4F6] focus:border-[#7657F6] focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="nominal">Nominal</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | 'all' | 'active')}
            className="h-10 w-full rounded border border-[#22304A] bg-[#090D18] px-3 text-sm text-[#F3F4F6] focus:border-[#7657F6] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="new">New Intake</option>
            <option value="triaged">AI Triaged</option>
            <option value="dispatched">Dispatched</option>
            <option value="en_route">En Route</option>
            <option value="on_site">On-Site</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            aria-label="Filter by department"
            value={department}
            onChange={(e) => setDepartment(e.target.value as DepartmentName | 'all')}
            className="h-10 w-full rounded border border-[#22304A] bg-[#090D18] px-3 text-sm text-[#F3F4F6] focus:border-[#7657F6] focus:outline-none"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="glass-level-2 overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#22304A] bg-[#0F172A]/80 font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                <th className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort('id')}
                    className="inline-flex items-center gap-1 uppercase hover:text-[#F3F4F6]"
                  >
                    <span>Ticket ID</span>
                    <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Incident & Location</th>
                <th className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort('severity')}
                    className="inline-flex items-center gap-1 uppercase hover:text-[#F3F4F6]"
                  >
                    <span>Severity</span>
                    <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Department & Crew</th>
                <th className="px-4 py-3 font-medium text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('aiConfidence')}
                    className="inline-flex items-center gap-1 uppercase hover:text-[#F3F4F6]"
                  >
                    <span>AI Match</span>
                    <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('slaDeadlineAt')}
                    className="inline-flex items-center gap-1 uppercase hover:text-[#F3F4F6]"
                  >
                    <span>SLA Remaining</span>
                    <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                  </button>
                </th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22304A]/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-[#9CA3AF]">
                      No tickets match the current matrix filter criteria.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSeverity('all');
                        setStatus('all');
                        setDepartment('all');
                      }}
                      className="mt-3 rounded border border-[#22304A] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#06B6D4] hover:border-[#06B6D4]"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                rows.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition-colors hover:bg-[#151D2E]/80"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#CABEFF] whitespace-nowrap">
                      {ticket.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs truncate font-medium text-[#F3F4F6]">
                        {ticket.title}
                      </div>
                      <div className="mt-0.5 text-xs text-[#9CA3AF]">
                        {ticket.address} · {ticket.district}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={ticket.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-[#F3F4F6]">{ticket.department}</div>
                      <div className="mt-0.5 font-mono text-[#64748B]">
                        {ticket.assignedCrew ?? 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#06B6D4]">
                      {ticket.aiConfidence.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto w-24">
                        <SlaTimer ticket={ticket} nowMs={nowMs} compact />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectTicket(ticket.id)}
                        className="rounded border border-[#22304A] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#F3F4F6] transition-colors hover:border-[#06B6D4] hover:text-[#06B6D4] whitespace-nowrap"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
