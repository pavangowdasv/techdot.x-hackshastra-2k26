import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Camera,
  CheckCircle2,
  HardHat,
  MapPin,
  Navigation,
  Sparkles,
  Upload,
  User,
  Wrench,
  Image as ImageIcon,
} from 'lucide-react';
import { REMEDIATION_MEDIA, SAMPLE_PRESET_IMAGES } from '../assets/media';
import { WORKER_ACCOUNTS, type WorkerUser } from '../types/auth';
import type { CivilTicket, TicketStatus } from '../types/ticket';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { SlaTimer } from './SlaTimer';
import { SeverityBadge, StatusBadge } from './StatusBadge';

interface FieldDispatchViewProps {
  tickets: CivilTicket[];
  currentWorker?: WorkerUser | null;
  nowMs: number;
  onUpdateTicketStatus: (
    ticketId: string,
    nextStatus: TicketStatus,
    actor?: string,
    afterPhotoUrl?: string,
    fieldNotes?: string,
  ) => void;
  onUpdateFieldNotes: (ticketId: string, notes: string) => void;
}

const CREWS = [
  'All Crews',
  'Unit Alpha-01',
  'Unit Hydro-04',
  'Unit Volt-02',
  'Unit Sweep-09',
];

export function FieldDispatchView({
  tickets,
  currentWorker,
  nowMs,
  onUpdateTicketStatus,
  onUpdateFieldNotes,
}: FieldDispatchViewProps) {
  const [selectedCrew, setSelectedCrew] = useState<string>(
    currentWorker ? currentWorker.crew : 'All Crews',
  );
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savedNoticeId, setSavedNoticeId] = useState<string | null>(null);

  // Remediation photo uploads per ticket
  const [remediationPhotos, setRemediationPhotos] = useState<Record<string, string>>({});
  const [remediationPhotoNames, setRemediationPhotoNames] = useState<Record<string, string>>({});

  const workOrders = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedCrew === 'All Crews') return true;
      return ticket.assignedCrew === selectedCrew;
    });
  }, [tickets, selectedCrew]);

  const handleSaveNote = (ticket: CivilTicket) => {
    const value = draftNotes[ticket.id] ?? ticket.fieldNotes;
    onUpdateFieldNotes(ticket.id, value);
    setSavedNoticeId(ticket.id);
    window.setTimeout(() => setSavedNoticeId(null), 2000);
  };

  const handleFileUpload = (ticketId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemediationPhotoNames((prev) => ({ ...prev, [ticketId]: file.name }));
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRemediationPhotos((prev) => ({ ...prev, [ticketId]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const getDefaultAfterMediaForTicket = (ticket: CivilTicket): string => {
    if (ticket.category === 'Water & Drainage') return REMEDIATION_MEDIA.drainAfter;
    if (ticket.category === 'Traffic Signals' || ticket.category === 'Street Lighting')
      return REMEDIATION_MEDIA.gridAfter;
    if (ticket.category === 'Sanitation & Debris') return REMEDIATION_MEDIA.sanitationAfter;
    return REMEDIATION_MEDIA.roadAfter;
  };

  const handleCompleteWorkOrder = (ticket: CivilTicket) => {
    const afterPhoto = remediationPhotos[ticket.id] || getDefaultAfterMediaForTicket(ticket);
    const notes = draftNotes[ticket.id] || ticket.fieldNotes || 'Completed on-site remediation to municipal specification.';
    const workerName = currentWorker?.name || ticket.assignedWorkerName || ticket.assignedCrew || 'Field Specialist';

    onUpdateTicketStatus(ticket.id, 'resolved', workerName, afterPhoto, notes);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Worker Profile Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#22304A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] mb-1">
            <HardHat className="h-4 w-4" />
            <span>Field Technician Operations Portal</span>
            {currentWorker && (
              <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] font-semibold">
                Worker: {currentWorker.name} ({currentWorker.crew})
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F4F6] text-balance">
            {currentWorker ? `${currentWorker.name}'s Dispatch Console` : 'Field Technician Work Order Queue'}
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {currentWorker
              ? `${currentWorker.domain} · Specialty: ${currentWorker.specialty}`
              : 'Review dispatched orders from the AI Command Center, progress on-site work, and upload completion photos for citizen verification.'}
          </p>
        </div>

        {/* Crew Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#22304A] bg-[#0F172A] p-1.5">
          {CREWS.map((crew) => {
            const active = selectedCrew === crew;
            return (
              <button
                key={crew}
                type="button"
                onClick={() => setSelectedCrew(crew)}
                className={`h-9 rounded-lg px-3 text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#F59E0B] text-[#090D18] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                {crew}
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Order Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {workOrders.length === 0 ? (
          <div className="glass-level-2 col-span-full rounded-2xl p-12 text-center border border-[#22304A]">
            <HardHat className="h-10 w-10 text-[#64748B] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#F3F4F6]">No active work orders for {selectedCrew}</h3>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Switch crew filters or check the AI Command Center to dispatch incoming complaints.
            </p>
          </div>
        ) : (
          workOrders.map((ticket) => {
            const currentNotes = draftNotes[ticket.id] ?? ticket.fieldNotes;
            const actorName = currentWorker?.name || ticket.assignedWorkerName || ticket.assignedCrew || 'Field Specialist';
            const uploadedAfterPhoto = remediationPhotos[ticket.id];
            const defaultAfterPhoto = getDefaultAfterMediaForTicket(ticket);
            const activeAfterPhoto = uploadedAfterPhoto || defaultAfterPhoto;

            return (
              <article
                key={ticket.id}
                className="glass-level-2 flex flex-col justify-between gap-5 rounded-2xl p-6 border border-[#22304A] hover:border-[#F59E0B]/40 transition-all shadow-xl"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#22304A] pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-[#CABEFF]">{ticket.id}</span>
                      <span className="text-[#64748B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#06B6D4] font-semibold">
                        Crew: {ticket.assignedCrew ?? 'Unassigned'}
                      </span>
                      {ticket.aiAgentAssigned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7657F6]/20 border border-[#7657F6]/40 text-[#D0BCFF]">
                          via {ticket.aiAgentAssigned}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={ticket.severity} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  {/* Title & Address */}
                  <h2 className="mt-3 font-display text-lg font-bold text-[#F3F4F6]">
                    {ticket.title}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                    <div className="flex items-center gap-1 text-[#06B6D4]">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{ticket.address} · {ticket.district}</span>
                    </div>
                    <span>·</span>
                    <span className="text-[#CABEFF]">
                      Reported by: {ticket.reporterName}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#C9C4D8] leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Citizen's Uploaded Hazard Photo Preview */}
                  {ticket.citizenPhotoUrl || ticket.verification?.beforeUrl ? (
                    <div className="mt-4 p-3 rounded-xl border border-[#22304A] bg-[#090D18]">
                      <div className="flex items-center justify-between text-xs font-mono text-[#CABEFF] mb-2">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Camera className="h-3.5 w-3.5 text-[#8B5CF6]" />
                          Citizen's Reported Hazard Photo
                        </span>
                        <span className="text-[#9CA3AF] text-[11px]">Before Remediation</span>
                      </div>
                      <div className="relative rounded-lg overflow-hidden h-36 border border-[#22304A]">
                        <img
                          src={ticket.citizenPhotoUrl || ticket.verification?.beforeUrl}
                          alt="Citizen Hazard Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* SLA Countdown Timer */}
                  <div className="mt-4">
                    <SlaTimer ticket={ticket} nowMs={nowMs} />
                  </div>

                  {/* Technician Field Log */}
                  <div className="mt-4">
                    <label
                      htmlFor={`notes-${ticket.id}`}
                      className="block font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF] font-semibold"
                    >
                      Technician Repair &amp; Material Log
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        id={`notes-${ticket.id}`}
                        type="text"
                        value={currentNotes}
                        onChange={(e) =>
                          setDraftNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                        }
                        placeholder="e.g., Milled 10 sq ft, compacted hot-mix asphalt, replaced photocell relay..."
                        className="h-11 flex-1 rounded-xl border border-[#22304A] bg-[#090D18] px-3.5 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#F59E0B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(ticket)}
                        className="h-11 rounded-xl border border-[#22304A] bg-[#0F172A] px-4 text-xs font-semibold text-[#F3F4F6] transition-colors hover:border-[#F59E0B] hover:text-[#F59E0B] whitespace-nowrap"
                      >
                        {savedNoticeId === ticket.id ? 'Saved ✓' : 'Save Log'}
                      </button>
                    </div>
                  </div>

                  {/* WORKER PHOTO UPLOAD & RESOLUTION PROOF SECTION */}
                  {ticket.status === 'on_site' && (
                    <div className="mt-5 p-4 rounded-xl border border-[#10B981]/40 bg-[#10B981]/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-bold flex items-center gap-1.5">
                          <Camera className="h-4 w-4" />
                          Upload Completed Remediation Photo
                        </span>
                        <span className="text-[11px] text-[#6ee7b7] font-mono">Proof of Work</span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mb-3">
                        Citizens verify this photographic proof before the ticket is officially closed.
                      </p>

                      {/* Photo Preview */}
                      <div className="relative rounded-xl overflow-hidden border border-[#22304A] h-40 bg-[#090D18] mb-3">
                        <img
                          src={activeAfterPhoto}
                          alt="Remediation Proof"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-[#090D18]/85 px-3 py-1.5 flex items-center justify-between text-xs font-mono">
                          <span className="text-[#10B981] truncate">
                            {remediationPhotoNames[ticket.id] || 'Verified Municipal Standard Photo'}
                          </span>
                          <span className="text-[#64748B] text-[10px]">Ready for Upload</span>
                        </div>
                      </div>

                      {/* File Upload Button + Preset Selector */}
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#10B981]/50 bg-[#10B981]/20 text-xs font-semibold text-[#10B981] hover:bg-[#10B981]/30 transition-all">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload After Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(ticket.id, e)}
                            className="hidden"
                          />
                        </label>

                        {SAMPLE_PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setRemediationPhotos((prev) => ({
                                ...prev,
                                [ticket.id]: preset.afterUrl,
                              }));
                              setRemediationPhotoNames((prev) => ({
                                ...prev,
                                [ticket.id]: `${preset.name} (Resolved)`,
                              }));
                            }}
                            className="text-[10px] font-mono px-2 py-1 rounded bg-[#0F172A] border border-[#22304A] text-[#9CA3AF] hover:text-[#10B981]"
                          >
                            Use {preset.name.split(' ')[0]} Preset
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Before/After Verification if resolved */}
                  {ticket.status === 'resolved' && ticket.verification && (
                    <div className="mt-5 border-t border-[#22304A] pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Remediation Completed &amp; Photo Attached
                        </span>
                        {ticket.verification.citizenSignedOff ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                            Citizen Verified ✓
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#F59E0B]">
                            Awaiting Citizen Verification
                          </span>
                        )}
                      </div>
                      <BeforeAfterSlider
                        beforeUrl={ticket.verification.beforeUrl}
                        afterUrl={ticket.verification.afterUrl}
                        beforeCaption={ticket.verification.beforeCaption}
                        afterCaption={ticket.verification.afterCaption}
                        heightClass="h-48"
                      />
                    </div>
                  )}
                </div>

                {/* Tactical Status Advancement Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 border-t border-[#22304A] pt-4">
                  {ticket.status === 'new' || ticket.status === 'triaged' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateTicketStatus(ticket.id, 'dispatched', actorName)}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7657F6] px-4 text-sm font-semibold text-[#F3F4F6] hover:bg-[#8B5CF6] hover:shadow-[0_0_15px_rgba(118,87,246,0.4)] whitespace-nowrap"
                    >
                      <Wrench className="h-4 w-4" aria-hidden="true" />
                      <span>Accept Dispatch Order</span>
                    </button>
                  ) : ticket.status === 'dispatched' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateTicketStatus(ticket.id, 'en_route', actorName)}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#06B6D4] px-4 text-sm font-semibold text-[#090D18] hover:bg-[#38BDF8] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      <span>Start Transit / En Route</span>
                    </button>
                  ) : ticket.status === 'en_route' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateTicketStatus(ticket.id, 'on_site', actorName)}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-4 text-sm font-semibold text-[#090D18] hover:bg-[#FBBF24] hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>Confirm Arrival On-Site</span>
                    </button>
                  ) : ticket.status === 'on_site' ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteWorkOrder(ticket)}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 text-sm font-bold text-[#090D18] hover:bg-[#34D399] shadow-[0_0_20px_rgba(16,185,129,0.5)] whitespace-nowrap transition-all"
                    >
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      <span>Complete Work &amp; Upload Proof for Citizen</span>
                    </button>
                  ) : (
                    <div className="flex h-11 w-full items-center justify-between rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 px-4 text-xs font-semibold text-[#10B981]">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Remediation Completed
                      </span>
                      <span className="font-mono text-[11px]">
                        {ticket.verification?.citizenSignedOff ? 'Citizen Signed Off ✓' : 'Awaiting Citizen Sign-Off'}
                      </span>
                    </div>
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
