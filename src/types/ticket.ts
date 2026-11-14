export type TicketSeverity = 'critical' | 'warning' | 'nominal';

export type TicketStatus =
  | 'new'
  | 'triaged'
  | 'dispatched'
  | 'en_route'
  | 'on_site'
  | 'resolved';

export type TicketCategory =
  | 'Roadway & Asphalt'
  | 'Water & Drainage'
  | 'Street Lighting'
  | 'Traffic Signals'
  | 'Sanitation & Debris'
  | 'Structural Hazard';

export type DepartmentName =
  | 'Surface Transit & Paving'
  | 'Hydrology & Storm Systems'
  | 'Grid Illumination & Signals'
  | 'Grid Illumination'
  | 'Traffic Operations'
  | 'Civic Sanitation & Cleanliness'
  | 'Civic Sanitation'
  | 'Structural Engineering';

export type ActiveView = 'landing' | 'login' | 'command' | 'matrix' | 'field' | 'citizen' | 'verification';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
}

export interface VerificationMedia {
  beforeUrl: string;
  afterUrl: string;
  beforeCaption: string;
  afterCaption: string;
  citizenSignedOff: boolean;
  citizenRating?: number;
  citizenFeedback?: string;
  verifiedAt?: string;
}

export interface CivilTicket {
  id: string;
  title: string;
  category: TicketCategory;
  description: string;
  district: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  /** Normalized 0-100 coordinates on the GIS radar viewport */
  mapPosition: {
    x: number;
    y: number;
  };
  severity: TicketSeverity;
  status: TicketStatus;
  department: DepartmentName;
  assignedCrew: string | null;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  aiAgentAssigned?: string;
  reporterName: string;
  reporterId?: string;
  reporterSource: 'Citizen Portal' | 'IoT Sensor' | 'Field Patrol';
  citizenPhotoUrl?: string;
  aiConfidence: number;
  aiRationale: string;
  createdAt: string;
  slaDeadlineAt: string;
  resolvedAt: string | null;
  fieldNotes: string;
  verification?: VerificationMedia;
  auditLog: AuditEvent[];
  reworkRequested?: boolean;
  reworkNotes?: string;
}

export interface TicketFilterState {
  search: string;
  severity: TicketSeverity | 'all';
  status: TicketStatus | 'all' | 'active';
  department: DepartmentName | 'all';
}

export type TicketSortField = 'slaDeadlineAt' | 'severity' | 'createdAt' | 'aiConfidence' | 'id';
export type SortDirection = 'asc' | 'desc';
