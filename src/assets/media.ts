import roadBeforeImg from './images/road_before_pothole_1794631686390.jpg';
import roadAfterImg from './images/road_after_paved_1794631686909.jpg';
import drainBeforeImg from './images/drain_before_flooded_1794631687742.jpg';
import drainAfterImg from './images/drain_after_cleared_1794631687831.jpg';

// High-fidelity SVG fallbacks for electrical grid and sanitation remediation
const gridBeforeSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#0b1120"/>
    <rect x="0" y="380" width="800" height="70" fill="#1e293b"/>
    <line x1="395" y1="120" x2="395" y2="380" stroke="#475569" stroke-width="12"/>
    <circle cx="395" cy="110" r="28" fill="#334155" stroke="#ef4444" stroke-width="4"/>
    <text x="400" y="240" fill="#f87171" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">⚡ GRID FAILURE: CONTROLLER OFFLINE</text>
    <path d="M375 90 L415 130 M415 90 L375 130" stroke="#ef4444" stroke-width="6"/>
    <rect x="50" y="395" width="200" height="30" fill="#ef4444" opacity="0.3" rx="4"/>
    <text x="150" y="415" fill="#fca5a5" font-family="sans-serif" font-size="12" text-anchor="middle">CORRIDOR BLACKOUT DETECTED</text>
  </svg>`
)}`;

const gridAfterSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#09182b"/>
    <radialGradient id="lampGlow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#0284c7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#09182b" stop-opacity="0"/>
    </radialGradient>
    <circle cx="400" cy="140" r="220" fill="url(#lampGlow)"/>
    <rect x="0" y="380" width="800" height="70" fill="#1e293b"/>
    <line x1="395" y1="120" x2="395" y2="380" stroke="#64748b" stroke-width="12"/>
    <circle cx="395" cy="110" r="28" fill="#e0f2fe" stroke="#38bdf8" stroke-width="6"/>
    <text x="400" y="270" fill="#38bdf8" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">✓ FULL ILLUMINATION &amp; PHASE RESTORED</text>
    <rect x="50" y="395" width="220" height="30" fill="#10b981" opacity="0.3" rx="4"/>
    <text x="160" y="415" fill="#6ee7b7" font-family="sans-serif" font-size="12" text-anchor="middle">GRID SYNCHRONIZED 100%</text>
  </svg>`
)}`;

const sanitationBeforeSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#171717"/>
    <rect x="0" y="320" width="800" height="130" fill="#262626"/>
    <polygon points="260,330 310,240 370,260 440,210 520,330" fill="#78350f" opacity="0.9"/>
    <rect x="330" y="270" width="70" height="50" fill="#525252" rx="4"/>
    <circle cx="410" cy="310" r="24" fill="#a16207"/>
    <circle cx="460" cy="290" r="18" fill="#451a03"/>
    <text x="400" y="160" fill="#f59e0b" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">⚠ UNCONTROLLED DEBRIS &amp; SPILL HAZARD</text>
    <rect x="50" y="395" width="230" height="30" fill="#f59e0b" opacity="0.3" rx="4"/>
    <text x="165" y="415" fill="#fde68a" font-family="sans-serif" font-size="12" text-anchor="middle">ILLEGAL DEPOSIT / BLOCKED LANE</text>
  </svg>`
)}`;

const sanitationAfterSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#0f172a"/>
    <rect x="0" y="320" width="800" height="130" fill="#334155"/>
    <line x1="0" y1="380" x2="800" y2="380" stroke="#f8fafc" stroke-width="4" stroke-dasharray="24,16"/>
    <text x="400" y="200" fill="#10b981" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">✓ CIVIC SITE REMEDIATED &amp; SANITIZED</text>
    <circle cx="400" cy="120" r="36" fill="#10b981" opacity="0.2"/>
    <path d="M386 120 L396 130 L418 108" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
    <rect x="50" y="395" width="220" height="30" fill="#10b981" opacity="0.3" rx="4"/>
    <text x="160" y="415" fill="#6ee7b7" font-family="sans-serif" font-size="12" text-anchor="middle">POST-SWEEP INSPECTION PASSED</text>
  </svg>`
)}`;

export const REMEDIATION_MEDIA = {
  roadBefore: '/departments/road-infra-before.jpeg',
  roadAfter: '/departments/road-infra-after.jpeg',
  drainBefore: '/departments/water-drainage-before.jpeg',
  drainAfter: '/departments/water-drainage-after.jpeg',
  gridBefore: '/departments/safety-civic-before.jpeg',
  gridAfter: '/departments/safety-civic-after.jpeg',
  sanitationBefore: '/departments/sanitation-eco-before.jpeg',
  sanitationAfter: '/departments/sanitation-eco-after.jpeg',
} as const;

export const SAMPLE_PRESET_IMAGES = [
  {
    id: 'road',
    name: 'Roadway & Pothole Spall',
    category: 'Roadway & Asphalt',
    beforeUrl: REMEDIATION_MEDIA.roadBefore,
    afterUrl: REMEDIATION_MEDIA.roadAfter,
    beforeCaption: 'Exposed asphalt spall & safety cone perimeter',
    afterCaption: 'Compacted fresh hot-mix asphalt surface',
  },
  {
    id: 'drain',
    name: 'Storm Drain Curb Flood',
    category: 'Water & Drainage',
    beforeUrl: REMEDIATION_MEDIA.drainBefore,
    afterUrl: REMEDIATION_MEDIA.drainAfter,
    beforeCaption: 'Sub-surface valve overflow & standing curb water',
    afterCaption: 'Cleared catch basin & restored hydraulic flow',
  },
  {
    id: 'grid',
    name: 'Signal & Streetlight Outage',
    category: 'Traffic Signals',
    beforeUrl: REMEDIATION_MEDIA.gridBefore,
    afterUrl: REMEDIATION_MEDIA.gridAfter,
    beforeCaption: 'Signal controller blackout & dark pedestrian crossway',
    afterCaption: 'Phased LED illumination & synchronised telemetry',
  },
  {
    id: 'sanitation',
    name: 'Sanitation & Debris Accumulation',
    category: 'Sanitation & Debris',
    beforeUrl: REMEDIATION_MEDIA.sanitationBefore,
    afterUrl: REMEDIATION_MEDIA.sanitationAfter,
    beforeCaption: 'Solid waste overflow & lane obstruction',
    afterCaption: 'Industrial mechanical sweep & sanitized surface',
  },
] as const;
