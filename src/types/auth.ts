import type { DepartmentName, TicketCategory } from './ticket';

export type UserRole = 'citizen' | 'manager' | 'worker';

export interface CitizenUser {
  id: string;
  role: 'citizen';
  name: string;
  email: string;
  district: string;
  avatar: string;
  phone: string;
}

export interface ManagerUser {
  id: string;
  role: 'manager';
  name: string;
  email: string;
  title: string;
  avatar: string;
  clearanceLevel: string;
}

export interface WorkerUser {
  id: string;
  role: 'worker';
  name: string;
  email: string;
  crew: string;
  department: DepartmentName;
  domain: string;
  avatar: string;
  specialty: string;
  rating: number;
}

export type AuthUser = CitizenUser | ManagerUser | WorkerUser;

export const CITIZEN_ACCOUNTS: CitizenUser[] = [
  {
    id: 'citizen-1',
    role: 'citizen',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@seattlecivic.org',
    district: 'Sector 01',
    phone: '(206) 555-0142',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'citizen-2',
    role: 'citizen',
    name: 'Marcus Vance',
    email: 'marcus.vance@soundtransit.net',
    district: 'Sector 04',
    phone: '(206) 555-0189',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'citizen-3',
    role: 'citizen',
    name: 'Elena Rostova',
    email: 'elena.rostova@cascadecivic.io',
    district: 'Sector 05',
    phone: '(206) 555-0211',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export const MANAGER_ACCOUNT: ManagerUser = {
  id: 'manager-1',
  role: 'manager',
  name: 'Commander Alex Chen',
  email: 'alex.chen@citydispatch.gov',
  title: 'Chief Operations Commander',
  clearanceLevel: 'LEVEL-IV DISPATCH SUPREME',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

export const WORKER_ACCOUNTS: WorkerUser[] = [
  {
    id: 'worker-1',
    role: 'worker',
    name: 'Dave Miller',
    email: 'dave.miller@pavingops.city.gov',
    crew: 'Unit Alpha-01',
    department: 'Surface Transit & Paving',
    domain: 'Roadways & Asphalt Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    specialty: 'Heavy Milling, Asphalt Resurfacing, Pothole Compaction',
    rating: 4.9,
  },
  {
    id: 'worker-2',
    role: 'worker',
    name: 'Maya Lin',
    email: 'maya.lin@hydrology.city.gov',
    crew: 'Unit Hydro-04',
    department: 'Hydrology & Storm Systems',
    domain: 'Water, Storm Drains & Flood Management',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Hydraulic Jetting, Culvert Clearing, Pressure Valves',
    rating: 4.95,
  },
  {
    id: 'worker-3',
    role: 'worker',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@gridelectric.city.gov',
    crew: 'Unit Volt-02',
    department: 'Grid Illumination & Signals',
    domain: 'Electrical Grid & Traffic Signals',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    specialty: 'Photocell Sensors, Intersection Phasing, High-Voltage Lines',
    rating: 4.88,
  },
  {
    id: 'worker-4',
    role: 'worker',
    name: 'Aisha Patel',
    email: 'aisha.patel@sanitation.city.gov',
    crew: 'Unit Sweep-09',
    department: 'Civic Sanitation & Cleanliness',
    domain: 'Sanitation, Waste Remediation & Biohazard Debris',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    specialty: 'Mechanical Street Sweeping, Hazardous Debris, Rapid Waste Clearing',
    rating: 4.92,
  },
];

export interface DomainAgent {
  id: string;
  name: string;
  code: string;
  domain: string;
  department: DepartmentName;
  assignedWorker: WorkerUser;
  categories: TicketCategory[];
  avatarIcon: string;
  description: string;
  accentColor: string;
  status: 'active' | 'analyzing' | 'dispatched';
}

export const DOMAIN_AGENTS: DomainAgent[] = [
  {
    id: 'agent-pave',
    name: 'Agent Pave-AI',
    code: 'INFRA-01',
    domain: 'Roadways & Asphalt Infrastructure',
    department: 'Surface Transit & Paving',
    assignedWorker: WORKER_ACCOUNTS[0],
    categories: ['Roadway & Asphalt', 'Structural Hazard'],
    avatarIcon: 'Hammer',
    description: 'Neural vision & text parser for asphalt fractures, sinkholes, road debris, and lane spalls.',
    accentColor: '#F59E0B',
    status: 'active',
  },
  {
    id: 'agent-hydro',
    name: 'Agent Hydro-AI',
    code: 'HYDRO-02',
    domain: 'Water, Storm Drains & Flood Management',
    department: 'Hydrology & Storm Systems',
    assignedWorker: WORKER_ACCOUNTS[1],
    categories: ['Water & Drainage'],
    avatarIcon: 'Droplets',
    description: 'Telemetry sensor fusion and catchment flood diagnostics for storm drains and main bursts.',
    accentColor: '#06B6D4',
    status: 'active',
  },
  {
    id: 'agent-volt',
    name: 'Agent Volt-AI',
    code: 'VOLT-03',
    domain: 'Electrical Grid & Traffic Signals',
    department: 'Grid Illumination & Signals',
    assignedWorker: WORKER_ACCOUNTS[2],
    categories: ['Street Lighting', 'Traffic Signals'],
    avatarIcon: 'Zap',
    description: 'Smart grid phase monitor and signal outage detector for pedestrian and vehicular corridors.',
    accentColor: '#8B5CF6',
    status: 'active',
  },
  {
    id: 'agent-sweep',
    name: 'Agent Sweep-AI',
    code: 'SWEEP-04',
    domain: 'Sanitation, Waste Remediation & Biohazard Debris',
    department: 'Civic Sanitation & Cleanliness',
    assignedWorker: WORKER_ACCOUNTS[3],
    categories: ['Sanitation & Debris'],
    avatarIcon: 'Trash2',
    description: 'Optical litter density classifier and automated dispatch for industrial sweeping fleets.',
    accentColor: '#10B981',
    status: 'active',
  },
];

