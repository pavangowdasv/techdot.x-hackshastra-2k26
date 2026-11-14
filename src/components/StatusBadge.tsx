import type { TicketSeverity, TicketStatus } from '../types/ticket';

export function SeverityBadge({ severity }: { severity: TicketSeverity }) {
  const styles: Record<TicketSeverity, { container: string; dot: string; label: string }> = {
    critical: {
      container: 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]',
      dot: 'bg-[#EF4444]',
      label: 'Critical',
    },
    warning: {
      container: 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]',
      dot: 'bg-[#F59E0B]',
      label: 'Warning',
    },
    nominal: {
      container: 'border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]',
      dot: 'bg-[#06B6D4]',
      label: 'Nominal',
    },
  };

  const config = styles[severity];

  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded border px-2 font-mono text-[10px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap shrink-0 ${config.container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New Intake',
  triaged: 'AI Triaged',
  dispatched: 'Dispatched',
  en_route: 'En Route',
  on_site: 'On-Site',
  resolved: 'Resolved',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, { container: string; dot: string }> = {
    new: {
      container: 'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#D0BCFF]',
      dot: 'bg-[#8B5CF6]',
    },
    triaged: {
      container: 'border-[#7657F6]/40 bg-[#7657F6]/15 text-[#CABEFF]',
      dot: 'bg-[#7657F6]',
    },
    dispatched: {
      container: 'border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]',
      dot: 'bg-[#06B6D4]',
    },
    en_route: {
      container: 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]',
      dot: 'bg-[#F59E0B]',
    },
    on_site: {
      container: 'border-[#06B6D4]/50 bg-[#06B6D4]/15 text-[#4CD7F6]',
      dot: 'bg-[#06B6D4]',
    },
    resolved: {
      container: 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]',
      dot: 'bg-[#10B981]',
    },
  };

  const cfg = styles[status];

  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded border px-2 font-mono text-[10px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap shrink-0 ${cfg.container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
}
