import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Bot, Camera, Image as ImageIcon, Upload, X } from 'lucide-react';
import { REMEDIATION_MEDIA, SAMPLE_PRESET_IMAGES } from '../assets/media';
import type { TicketCategory } from '../types/ticket';
import { classifyIncident } from '../utils/triageEngine';
import type { NewTicketInput } from './CitizenPortalView';

interface ReportIssueModalProps {
  open: boolean;
  defaultReporterName?: string;
  defaultReporterId?: string;
  onClose: () => void;
  onSubmit: (input: NewTicketInput) => void;
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
  'Sector 01',
  'Sector 02',
  'Sector 03',
  'Sector 04',
  'Sector 05',
  'Sector 06',
  'Sector 07',
];

export function ReportIssueModal({
  open,
  defaultReporterName = '',
  defaultReporterId,
  onClose,
  onSubmit,
}: ReportIssueModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Roadway & Asphalt');
  const [district, setDistrict] = useState('Sector 04');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(defaultReporterName);
  const [photoUrl, setPhotoUrl] = useState<string>(REMEDIATION_MEDIA.roadBefore);
  const [photoName, setPhotoName] = useState<string>('Default Pothole Sample Photo');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open) return null;

  const preview = classifyIncident({
    title: title || 'Incident report',
    category,
    description,
  });

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4 || address.trim().length < 3 || description.trim().length < 8) {
      setErrorMsg('Please complete issue title, street address, and condition details.');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      district,
      address: address.trim(),
      description: description.trim(),
      reporterName: reporterName.trim() || defaultReporterName || 'Citizen Reporter',
      reporterId: defaultReporterId,
      photoUrl: photoUrl || REMEDIATION_MEDIA.roadBefore,
    });

    setTitle('');
    setAddress('');
    setDescription('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B1A]/80 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl p-6 my-8 max-h-[90vh] overflow-y-auto bg-[#10152A]/90 backdrop-blur-xl border border-white/[0.14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#9565F5]" />
            <h2 id="report-modal-title" className="font-display text-lg font-bold text-[#F8FAFC]">
              Log Municipal Complaint with Photo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="modal-title" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Complaint Title *
            </label>
            <input
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Roadway spall or overflowing storm drain"
              className="mt-1 h-10 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 focus:outline-none transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-category" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                Category
              </label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="mt-1 h-10 w-full rounded-xl border border-white/[0.12] bg-[#10152A] px-3 text-sm text-[#F8FAFC] focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 focus:outline-none transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="modal-district" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                District Sector
              </label>
              <select
                id="modal-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-white/[0.12] bg-[#10152A] px-3 text-sm text-[#F8FAFC] focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 focus:outline-none transition-all"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="modal-address" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Street Address / Intersection *
            </label>
            <input
              id="modal-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 4th Ave & Mercer St"
              className="mt-1 h-10 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 focus:outline-none transition-all font-sans"
            />
          </div>

          <div>
            <label htmlFor="modal-desc" className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Hazard Details *
            </label>
            <textarea
              id="modal-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide defect severity, risk to vehicles, or flooding depth..."
              className="mt-1 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] p-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] focus:border-[#9565F5] focus:ring-1 focus:ring-[#9565F5]/30 focus:outline-none transition-all font-sans"
            />
          </div>

          {/* Photo Attachment in Modal */}
          <div className="rounded-xl border border-white/[0.10] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono text-[#F8FAFC] flex items-center gap-1.5 font-semibold">
                <Camera className="h-3.5 w-3.5 text-[#9565F5]" />
                Photo Attachment
              </span>
              <label className="cursor-pointer text-[11px] font-mono text-[#27C5E8] hover:underline flex items-center gap-1">
                <Upload className="h-3 w-3" />
                <span>Upload File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-white/[0.10] h-28">
                <img src={photoUrl} alt="Hazard preview" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-[#080B1A]/85 px-2 py-1 text-[10px] text-white truncate font-mono">
                  {photoName}
                </div>
              </div>
            ) : null}

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {SAMPLE_PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(preset.beforeUrl);
                    setPhotoName(preset.name);
                    setCategory(preset.category as TicketCategory);
                  }}
                  className="text-left text-[10px] font-mono p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#94A3B8] hover:text-white truncate transition-colors"
                >
                  📸 {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* AI Preview */}
          <div className="rounded-xl border border-[#9565F5]/30 bg-[#9565F5]/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-medium text-white">
                <Bot className="h-3.5 w-3.5 text-[#27C5E8]" aria-hidden="true" />
                AI Swarm Forecast
              </span>
              <span className="font-mono text-[#27C5E8]">{preview.confidence}% confidence</span>
            </div>
            <p className="mt-1 text-[#94A3B8] leading-relaxed">
              Analyzed by <strong className="text-[#27C5E8]">{preview.agentName}</strong> → Auto-assigns to Worker <strong className="text-white">{preview.assignedWorkerName} ({preview.recommendedCrew})</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08] transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-xl bg-[#9565F5] hover:bg-[#8352ec] px-5 text-xs font-semibold text-white transition-all shadow-md active:scale-[0.98]"
            >
              Log &amp; Route Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
