import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  Bot,
  Camera,
  CheckCircle2,
  FileImage,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  Upload,
  User,
  X,
} from 'lucide-react';
import { REMEDIATION_MEDIA, SAMPLE_PRESET_IMAGES } from '../assets/media';
import type { CitizenUser } from '../types/auth';
import type { CivilTicket, TicketCategory, TicketStatus } from '../types/ticket';
import { classifyIncident } from '../utils/triageEngine';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { SeverityBadge, StatusBadge } from './StatusBadge';

export interface NewTicketInput {
  title: string;
  category: TicketCategory;
  district: string;
  address: string;
  description: string;
  reporterName: string;
  reporterId?: string;
  photoUrl?: string;
}

interface CitizenPortalViewProps {
  tickets: CivilTicket[];
  currentCitizen?: CitizenUser | null;
  onSubmitReport: (input: NewTicketInput) => CivilTicket;
  onToggleCitizenSignOff: (ticketId: string, rating?: number, feedback?: string) => void;
  onRequestRework?: (ticketId: string, reason: string) => void;
}

const CATEGORIES: TicketCategory[] = [
  'Roadway & Asphalt',
  'Water & Drainage',
  'Traffic Signals',
  'Street Lighting',
  'Sanitation & Debris',
  'Structural Hazard',
];

const DISTRICTS = [
  'Sector 01 · Ballard',
  'Sector 02 · Westlake',
  'Sector 03 · Capitol Hill',
  'Sector 04 · Uptown',
  'Sector 05 · Downtown',
  'Sector 06 · Rainier',
  'Sector 07 · Beacon Hill',
];

const TIMELINE_STEPS: Array<{ key: TicketStatus; label: string }> = [
  { key: 'new', label: 'Submitted' },
  { key: 'triaged', label: 'AI Triaged' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'on_site', label: 'Crew On-Site' },
  { key: 'resolved', label: 'Resolved' },
];

function getStepIndex(status: TicketStatus): number {
  if (status === 'en_route') return 2;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function CitizenPortalView({
  tickets,
  currentCitizen,
  onSubmitReport,
  onToggleCitizenSignOff,
  onRequestRework,
}: CitizenPortalViewProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Roadway & Asphalt');
  const [district, setDistrict] = useState(
    currentCitizen ? `${currentCitizen.district} · Local Area` : 'Sector 04 · Uptown',
  );
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(currentCitizen?.name ?? '');
  const [photoUrl, setPhotoUrl] = useState<string>(REMEDIATION_MEDIA.roadBefore);
  const [photoName, setPhotoName] = useState<string>('Default Pothole Sample Photo');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [trackerFilter, setTrackerFilter] = useState<'all' | 'my' | 'resolved'>('all');
  const [activeRating, setActiveRating] = useState<Record<string, number>>({});
  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});

  const liveTriage = useMemo(
    () =>
      classifyIncident({
        title: title || 'Municipal issue report',
        category,
        description,
      }),
    [title, category, description],
  );

  const visibleTrackerTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (trackerFilter === 'my' && currentCitizen) {
        return t.reporterId === currentCitizen.id || t.reporterName.toLowerCase().includes(currentCitizen.name.toLowerCase());
      }
      if (trackerFilter === 'resolved') return t.status === 'resolved';
      return true;
    });
  }, [tickets, trackerFilter, currentCitizen]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: typeof SAMPLE_PRESET_IMAGES[number]) => {
    setPhotoUrl(preset.beforeUrl);
    setPhotoName(preset.name);
    setCategory(preset.category as TicketCategory);
    if (!title) setTitle(`${preset.name} hazard detected`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (title.trim().length < 4) errors.title = 'Please enter a brief issue summary (min 4 characters).';
    if (address.trim().length < 3) errors.address = 'Please enter a street address or intersection.';
    if (description.trim().length < 8)
      errors.description = 'Please provide at least 8 characters describing the issue.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const created = onSubmitReport({
      title: title.trim(),
      category,
      district: district.split(' · ')[0],
      address: address.trim(),
      description: description.trim(),
      reporterName: reporterName.trim() || currentCitizen?.name || 'Neighborhood Resident',
      reporterId: currentCitizen?.id,
      photoUrl: photoUrl || REMEDIATION_MEDIA.roadBefore,
    });

    setSubmittedTicketId(created.id);
    setTitle('');
    setAddress('');
    setDescription('');
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Resident Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#22304A] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#CABEFF] mb-1">
            <User className="h-4 w-4 text-[#8B5CF6]" />
            <span>Citizen Civic Action Console</span>
            {currentCitizen && (
              <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-white font-semibold">
                Logged in as: {currentCitizen.name} ({currentCitizen.district})
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F3F4F6] text-balance">
            Neighborhood Reporting, Live Tracking &amp; Verification
          </h1>
          <p className="mt-1.5 text-sm text-[#9CA3AF] max-w-3xl">
            Raise local complaints with photo attachments. The NagarSetu AI Multi-Agent Swarm divides and routes each issue across 4 specialized city departments, and field technicians upload proof of remediation for your final sign-off.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* LEFT: Citizen Intake Form with Photo Attachment (5 cols) */}
        <section
          aria-label="Submit Civil Issue Report"
          className="glass-level-2 rounded-2xl border border-[#8B5CF6]/40 p-6 lg:col-span-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#8B5CF6]" />
                <span>Raise Civic Complaint</span>
              </h2>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Attach a photo for instant AI visual triage and automated crew dispatch.
              </p>
            </div>
          </div>

          {submittedTicketId && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#10B981]/50 bg-[#10B981]/15 px-4 py-3 text-sm text-[#10B981]"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-semibold">Complaint Logged Successfully!</span>
                <p className="text-xs text-[#6ee7b7] mt-0.5">
                  Ticket <strong className="font-mono text-white">{submittedTicketId}</strong> dispatched to the AI Multi-Agent Swarm.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            <div>
              <label htmlFor="citizen-title" className="block text-xs font-mono uppercase tracking-wider text-[#C9C4D8]">
                Complaint Title *
              </label>
              <input
                id="citizen-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Hazardous sinkhole or collapsed storm drain grate"
                className="mt-1.5 h-10 w-full rounded-xl border border-[#22304A] bg-[#0F172A] px-3.5 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#8B5CF6] focus:shadow-[0_0_12px_rgba(139,92,246,0.35)] focus:outline-none"
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-[#EF4444]">{formErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="citizen-category"
                  className="block text-xs font-mono uppercase tracking-wider text-[#C9C4D8]"
                >
                  Issue Category
                </label>
                <select
                  id="citizen-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#22304A] bg-[#0F172A] px-3 text-sm text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="citizen-district"
                  className="block text-xs font-mono uppercase tracking-wider text-[#C9C4D8]"
                >
                  District Sector
                </label>
                <select
                  id="citizen-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#22304A] bg-[#0F172A] px-3 text-sm text-[#F3F4F6] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="citizen-address" className="block text-xs font-mono uppercase tracking-wider text-[#C9C4D8]">
                Street Address / Location *
              </label>
              <input
                id="citizen-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 4th Ave & Mercer St, near pedestrian crosswalk"
                className="mt-1.5 h-10 w-full rounded-xl border border-[#22304A] bg-[#0F172A] px-3.5 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#8B5CF6] focus:outline-none"
              />
              {formErrors.address && (
                <p className="mt-1 text-xs text-[#EF4444]">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="citizen-description"
                className="block text-xs font-mono uppercase tracking-wider text-[#C9C4D8]"
              >
                Complaint Details &amp; Safety Hazard *
              </label>
              <textarea
                id="citizen-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, damage extent, standing water depth, or traffic obstruction..."
                className="mt-1.5 w-full rounded-xl border border-[#22304A] bg-[#0F172A] p-3 text-sm text-[#F3F4F6] placeholder:text-[#64748B] focus:border-[#8B5CF6] focus:outline-none"
              />
              {formErrors.description && (
                <p className="mt-1 text-xs text-[#EF4444]">{formErrors.description}</p>
              )}
            </div>

            {/* PHOTO ATTACHMENT SECTION */}
            <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#0F172A]/90 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#CABEFF] flex items-center gap-1.5 font-semibold">
                  <Camera className="h-4 w-4 text-[#8B5CF6]" />
                  Attach Hazard Photo Evidence
                </span>
                <span className="text-[11px] text-[#06B6D4] font-mono">Image attached</span>
              </div>

              {/* Photo Preview */}
              {photoUrl ? (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-[#22304A] bg-[#090D18]">
                  <img
                    src={photoUrl}
                    alt="Complaint Evidence"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#090D18]/85 p-2 flex items-center justify-between text-xs">
                    <span className="truncate text-[#CABEFF] text-[11px] font-mono">
                      {photoName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoName('');
                      }}
                      className="text-[#EF4444] hover:text-[#f87171] text-xs font-semibold px-2 py-0.5 rounded bg-[#EF4444]/15"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 border-2 border-dashed border-[#22304A] rounded-xl p-4 text-center">
                  <ImageIcon className="h-8 w-8 text-[#64748B] mx-auto mb-1" />
                  <p className="text-xs text-[#9CA3AF]">No photo attached yet</p>
                </div>
              )}

              {/* Upload Input & Preset Buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-xs font-medium text-[#CABEFF] hover:bg-[#8B5CF6]/30 transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Local File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <span className="text-xs text-[#64748B]">or choose sample:</span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {SAMPLE_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="text-left text-[11px] font-mono px-2 py-1 rounded bg-[#151D2E] border border-[#22304A] hover:border-[#8B5CF6] text-[#9CA3AF] hover:text-[#F3F4F6] truncate transition-colors"
                  >
                    📷 {preset.name.split(' ')[0]} ({preset.category.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Live AI Swarm Forecast */}
            <div className="rounded-xl border border-[#7657F6]/35 bg-[#0F172A]/85 p-3.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#D0BCFF]">
                  <Bot className="h-4 w-4 text-[#06B6D4]" />
                  AI Agent Swarm Routing Preview
                </span>
                <span className="font-mono text-[#06B6D4]">
                  {liveTriage.targetSlaHours}h SLA Target
                </span>
              </div>
              <p className="mt-1.5 text-xs text-[#9CA3AF]">
                Will be analyzed by <strong className="text-[#06B6D4]">{liveTriage.agentName}</strong> →{' '}
                routed to <strong className="text-[#F3F4F6]">{liveTriage.department}</strong> →{' '}
                assigned to Worker <strong className="text-[#CABEFF]">{liveTriage.assignedWorkerName} ({liveTriage.recommendedCrew})</strong>
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7657F6] to-[#8B5CF6] px-5 text-sm font-semibold text-[#F3F4F6] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.45)] active:scale-[0.98]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Submit Complaint to AI Dispatch</span>
            </button>
          </form>
        </section>

        {/* RIGHT: Community Resolution Tracker & Citizen Verification (7 cols) */}
        <section aria-label="Neighborhood Resolution Tracker" className="space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#F3F4F6]">
                Complaints &amp; Verification Tracker
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Track assigned workers, real-time remediation status, and sign off on completed work orders.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-[#22304A] bg-[#0F172A] p-1">
              {(
                [
                  { id: 'all', label: 'All Complaints' },
                  { id: 'my', label: 'My Reports' },
                  { id: 'resolved', label: 'Awaiting Sign-Off' },
                ] as const
              ).map((tab) => {
                const active = trackerFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTrackerFilter(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            {visibleTrackerTickets.map((ticket) => {
              const currentStep = getStepIndex(ticket.status);
              const isResolved = ticket.status === 'resolved';
              const userRating = activeRating[ticket.id] ?? ticket.verification?.citizenRating ?? 5;

              return (
                <article
                  key={ticket.id}
                  className="glass-level-2 rounded-2xl p-5 sm:p-6 transition-all border border-[#22304A] hover:border-[#8B5CF6]/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <span className="font-mono font-bold text-[#D0BCFF]">{ticket.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ticket.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ticket.district}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={ticket.severity} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <h3 className="mt-2.5 font-display text-lg font-bold text-[#F3F4F6]">
                    {ticket.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <MapPin className="h-3.5 w-3.5 text-[#8B5CF6]" aria-hidden="true" />
                    <span>{ticket.address}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#06B6D4]">
                      Assigned Worker: {ticket.assignedWorkerName ?? ticket.assignedCrew ?? 'Pending Dispatch'}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#C9C4D8]">
                    {ticket.description}
                  </p>

                  {/* Transparent 5-step Timeline */}
                  <div className="mt-4 grid grid-cols-5 gap-1.5">
                    {TIMELINE_STEPS.map((step, index) => {
                      const reached = index <= currentStep;
                      return (
                        <div key={step.key} className="flex flex-col gap-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              ticket.status === 'resolved'
                                ? 'bg-[#10B981]'
                                : reached
                                  ? 'bg-[#8B5CF6]'
                                  : 'bg-[#22304A]'
                            }`}
                          />
                          <span
                            className={`truncate font-mono text-[10px] ${
                              reached ? 'text-[#F3F4F6] font-medium' : 'text-[#64748B]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CITIZEN VERIFICATION STUDIO FOR RESOLVED WORK ORDERS */}
                  {isResolved && ticket.verification && (
                    <div className="mt-5 border-t border-[#22304A] pt-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Work Completed by {ticket.assignedWorkerName ?? 'Technician'}
                          </span>
                          <span className="text-[11px] font-mono text-[#9CA3AF]">
                            (Drag slider to compare Before vs After)
                          </span>
                        </div>

                        {ticket.verification.citizenSignedOff ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#10B981]/50 bg-[#10B981]/15 px-3 py-1 text-xs font-semibold text-[#10B981]">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Verified &amp; Signed Off by Resident</span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#F59E0B] animate-pulse">
                            Action Required: Verify Remediation
                          </span>
                        )}
                      </div>

                      {/* Before / After Slider */}
                      <BeforeAfterSlider
                        beforeUrl={ticket.verification.beforeUrl}
                        afterUrl={ticket.verification.afterUrl}
                        beforeCaption={ticket.verification.beforeCaption || 'Citizen Before Photo'}
                        afterCaption={ticket.verification.afterCaption || 'Worker Remediation Photo'}
                        heightClass="h-56"
                      />

                      {/* Field Notes from Technician */}
                      <div className="mt-3 p-3 rounded-lg bg-[#0F172A] border border-[#22304A] text-xs">
                        <span className="font-mono text-[#06B6D4] font-semibold">
                          Technician Field Closeout Notes:
                        </span>
                        <p className="text-[#C9C4D8] mt-1 italic">
                          "{ticket.fieldNotes || 'Task completed according to municipal engineering standards.'}"
                        </p>
                      </div>

                      {/* Citizen Feedback & Sign-Off Action Box */}
                      <div className="mt-4 p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-[#F3F4F6] flex items-center gap-2">
                            <span>Resident Quality Rating:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  disabled={ticket.verification?.citizenSignedOff}
                                  onClick={() =>
                                    setActiveRating((prev) => ({ ...prev, [ticket.id]: star }))
                                  }
                                  className={`p-0.5 ${
                                    star <= userRating ? 'text-[#F59E0B]' : 'text-[#475569]'
                                  }`}
                                >
                                  <Star className="h-4 w-4 fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                            {ticket.verification.citizenSignedOff
                              ? 'Your sign-off has been permanently recorded in the civic audit ledger.'
                              : 'Does the repaired infrastructure match your expectations? Confirm to close the ticket.'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onToggleCitizenSignOff(
                                ticket.id,
                                userRating,
                                feedbackNotes[ticket.id] || 'Verified repaired to satisfaction.',
                              )
                            }
                            className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto ${
                              ticket.verification.citizenSignedOff
                                ? 'border border-[#10B981]/50 bg-[#10B981]/20 text-[#10B981]'
                                : 'bg-[#10B981] text-[#090D18] hover:bg-[#34D399] shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            <span>
                              {ticket.verification.citizenSignedOff
                                ? 'Repair Approved ✓'
                                : 'Approve & Verify Repair'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
