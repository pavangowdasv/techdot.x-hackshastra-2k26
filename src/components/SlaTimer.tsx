import type { CivilTicket } from '../types/ticket';
import { computeSlaMetrics, type SlaRiskState } from '../utils/triageEngine';

interface SlaTimerProps {
  ticket: CivilTicket;
  nowMs: number;
  compact?: boolean;
}

const RISK_STYLES: Record<
  SlaRiskState,
  { text: string; bar: string; border: string }
> = {
  resolved: {
    text: 'text-[#10B981]',
    bar: 'bg-[#10B981]',
    border: 'border-[#10B981]/30',
  },
  nominal: {
    text: 'text-[#06B6D4]',
    bar: 'bg-[#06B6D4]',
    border: 'border-[#22304A]',
  },
  warning: {
    text: 'text-[#F59E0B]',
    bar: 'bg-[#F59E0B]',
    border: 'border-[#F59E0B]/40',
  },
  critical: {
    text: 'text-[#EF4444]',
    bar: 'bg-[#EF4444]',
    border: 'border-[#EF4444]/50',
  },
  breached: {
    text: 'text-[#EF4444]',
    bar: 'bg-[#EF4444]',
    border: 'border-[#EF4444]/60',
  },
};

export function SlaTimer({ ticket, nowMs, compact = false }: SlaTimerProps) {
  const sla = computeSlaMetrics(ticket, nowMs);
  const style = RISK_STYLES[sla.riskState];
  const progressWidth = `${Math.round(sla.elapsedRatio * 100)}%`;

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <span className={`font-mono text-xs font-semibold tabular-nums ${style.text}`}>
          {sla.formattedCountdown}
        </span>
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#22304A]">
          <div className={`h-full transition-all duration-300 ${style.bar}`} style={{ width: progressWidth }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-[#0F172A]/90 p-4 ${style.border}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.04em] text-[#9CA3AF] uppercase">
          SLA Countdown
        </span>
        <span className="font-mono text-[11px] text-[#64748B]">
          Target {new Date(ticket.slaDeadlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={`mt-2 font-mono text-[28px] leading-9 font-bold tracking-[-0.02em] tabular-nums ${style.text}`}>
        {sla.formattedCountdown}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#22304A]">
        <div
          className={`h-full transition-all duration-300 ${style.bar}`}
          style={{ width: progressWidth }}
        />
      </div>
      <p className="mt-2 text-xs text-[#9CA3AF]">{sla.label}</p>
    </div>
  );
}
