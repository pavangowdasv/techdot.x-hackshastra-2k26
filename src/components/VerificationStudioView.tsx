import { CheckCircle2, HardHat, ShieldCheck, Star, User } from 'lucide-react';
import type { CivilTicket } from '../types/ticket';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { StatusBadge } from './StatusBadge';

interface VerificationStudioViewProps {
  tickets: CivilTicket[];
  onToggleCitizenSignOff: (ticketId: string, rating?: number, feedback?: string) => void;
}

export function VerificationStudioView({
  tickets,
  onToggleCitizenSignOff,
}: VerificationStudioViewProps) {
  const verifiableTickets = tickets.filter(
    (t) => Boolean(t.verification) && Boolean(t.verification?.afterUrl),
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#22304A] pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F4F6] text-balance">
            Before &amp; After Remediation Verification Studio
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Public visual audit comparing original citizen complaint photos with verified field technician closeout images.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] font-semibold">
            {verifiableTickets.length} VERIFIED REMEDIATION PAIRS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {verifiableTickets.length === 0 ? (
          <div className="glass-level-2 col-span-full rounded-2xl p-12 text-center border border-[#22304A]">
            <p className="text-sm text-[#9CA3AF]">
              No resolved tickets with after-remediation imagery yet.
            </p>
          </div>
        ) : (
          verifiableTickets.map((ticket) => {
            const verification = ticket.verification!;
            const isResolved = ticket.status === 'resolved';

            return (
              <article
                key={ticket.id}
                className="glass-level-2 flex flex-col justify-between gap-4 rounded-2xl p-6 border border-[#22304A] shadow-xl hover:border-[#06B6D4]/40 transition-all"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#22304A] pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-[#CABEFF]">{ticket.id}</span>
                      <span className="text-[#64748B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#9CA3AF]">{ticket.district}</span>
                      <span className="text-[#64748B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#06B6D4]">{ticket.category}</span>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <h2 className="mt-3 font-display text-lg font-bold text-[#F3F4F6]">
                    {ticket.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                    <span className="text-[#CABEFF] flex items-center gap-1">
                      <User className="h-3 w-3 text-[#8B5CF6]" />
                      Reported by: {ticket.reporterName}
                    </span>
                    <span>·</span>
                    <span className="text-[#F59E0B] flex items-center gap-1">
                      <HardHat className="h-3 w-3 text-[#F59E0B]" />
                      Remediated by: {ticket.assignedWorkerName ?? ticket.assignedCrew ?? 'Specialist'}
                    </span>
                  </div>

                  {/* Before / After Interactive Slider */}
                  <div className="mt-4">
                    <BeforeAfterSlider
                      beforeUrl={verification.beforeUrl}
                      afterUrl={verification.afterUrl}
                      beforeCaption={verification.beforeCaption || 'Before: Citizen Reported Defect'}
                      afterCaption={verification.afterCaption || 'After: Technician Remediated Site'}
                      heightClass="h-60"
                    />
                  </div>

                  {/* Technician field closeout note */}
                  <div className="mt-3 p-3 rounded-xl bg-[#0F172A] border border-[#22304A] text-xs">
                    <span className="font-mono text-[11px] text-[#06B6D4] font-semibold">
                      Field Closeout Log:
                    </span>
                    <p className="text-[#C9C4D8] mt-1 italic">
                      "{ticket.fieldNotes || 'Standard remediation procedures completed.'}"
                    </p>
                  </div>

                  {/* Citizen Review Display if already signed off */}
                  {verification.citizenSignedOff && (
                    <div className="mt-3 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#10B981] flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Citizen Verified &amp; Signed Off
                        </span>
                        {verification.citizenRating && (
                          <div className="flex items-center gap-0.5 text-[#F59E0B]">
                            {Array.from({ length: verification.citizenRating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                        )}
                      </div>
                      {verification.citizenFeedback && (
                        <p className="text-[#6ee7b7] mt-1 text-[11px]">
                          "{verification.citizenFeedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#22304A] pt-4 mt-2">
                  <span className="text-xs text-[#9CA3AF] font-mono">
                    {ticket.department} · {ticket.assignedCrew}
                  </span>

                  {isResolved ? (
                    <button
                      type="button"
                      onClick={() => onToggleCitizenSignOff(ticket.id, 5, 'Verified repaired.')}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition-all whitespace-nowrap ${
                        verification.citizenSignedOff
                          ? 'border-[#10B981]/50 bg-[#10B981]/20 text-[#10B981]'
                          : 'border-[#10B981] bg-[#10B981] text-[#090D18] hover:bg-[#34D399] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      }`}
                    >
                      {verification.citizenSignedOff ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Citizen Approved ✓</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Approve &amp; Sign Off</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="font-mono text-[11px] text-[#F59E0B]">
                      Awaiting technician remediation upload
                    </span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
