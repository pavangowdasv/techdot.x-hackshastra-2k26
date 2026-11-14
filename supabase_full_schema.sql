-- ============================================================
--  NagarSetu — Full Supabase Schema + Seed Data
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  Project: vksnxnrzvxwcyxymzszo.supabase.co
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  ENUM TYPES
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE ticket_severity AS ENUM ('critical', 'warning', 'nominal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('new', 'triaged', 'dispatched', 'en_route', 'on_site', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_category AS ENUM (
    'Roadway & Asphalt',
    'Water & Drainage',
    'Street Lighting',
    'Traffic Signals',
    'Sanitation & Debris',
    'Structural Hazard'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE department_name AS ENUM (
    'Surface Transit & Paving',
    'Hydrology & Storm Systems',
    'Grid Illumination & Signals',
    'Grid Illumination',
    'Traffic Operations',
    'Civic Sanitation & Cleanliness',
    'Civic Sanitation',
    'Structural Engineering'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'manager', 'worker');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reporter_source AS ENUM ('Citizen Portal', 'IoT Sensor', 'Field Patrol');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
--  TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  role            user_role NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  avatar          TEXT,
  phone           TEXT,
  district        TEXT,          -- citizens only
  title           TEXT,          -- manager only
  clearance_level TEXT,          -- manager only
  crew            TEXT,          -- workers only
  department      department_name, -- workers only
  domain          TEXT,          -- workers only
  specialty       TEXT,          -- workers only
  rating          NUMERIC(4,2),  -- workers only
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  TABLE: civil_tickets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS civil_tickets (
  id                 TEXT PRIMARY KEY,
  title              TEXT NOT NULL,
  category           ticket_category NOT NULL,
  description        TEXT NOT NULL,
  district           TEXT NOT NULL,
  address            TEXT NOT NULL,
  coordinates        JSONB NOT NULL,          -- { lat, lng }
  map_position       JSONB NOT NULL,          -- { x, y }
  severity           ticket_severity NOT NULL,
  status             ticket_status NOT NULL DEFAULT 'new',
  department         department_name NOT NULL,
  assigned_crew      TEXT,
  assigned_worker_id TEXT REFERENCES users(id),
  assigned_worker_name TEXT,
  ai_agent_assigned  TEXT,
  reporter_name      TEXT NOT NULL,
  reporter_id        TEXT REFERENCES users(id),
  reporter_source    reporter_source NOT NULL DEFAULT 'Citizen Portal',
  citizen_photo_url  TEXT,
  ai_confidence      NUMERIC(5,2) NOT NULL DEFAULT 0,
  ai_rationale       TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sla_deadline_at    TIMESTAMPTZ NOT NULL,
  resolved_at        TIMESTAMPTZ,
  field_notes        TEXT NOT NULL DEFAULT '',
  verification       JSONB,                   -- VerificationMedia object
  audit_log          JSONB NOT NULL DEFAULT '[]'::JSONB,
  rework_requested   BOOLEAN DEFAULT FALSE,
  rework_notes       TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_status    ON civil_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_severity  ON civil_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_tickets_dept      ON civil_tickets(department);
CREATE INDEX IF NOT EXISTS idx_tickets_created   ON civil_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_sla       ON civil_tickets(sla_deadline_at);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter  ON civil_tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_worker    ON civil_tickets(assigned_worker_id);

-- ─────────────────────────────────────────────────────────────
--  TABLE: audit_events (optional flat table for fast audit queries)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
  id         TEXT PRIMARY KEY,
  ticket_id  TEXT NOT NULL REFERENCES civil_tickets(id) ON DELETE CASCADE,
  timestamp  TIMESTAMPTZ NOT NULL,
  actor      TEXT NOT NULL,
  action     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_ticket ON audit_events(ticket_id);

-- ─────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE civil_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events   ENABLE ROW LEVEL SECURITY;

-- Public read for demo (anon key can SELECT all)
CREATE POLICY IF NOT EXISTS "Public read users"
  ON users FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read tickets"
  ON civil_tickets FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read audit"
  ON audit_events FOR SELECT USING (true);

-- Public write (anon key can INSERT/UPDATE for demo)
CREATE POLICY IF NOT EXISTS "Public insert tickets"
  ON civil_tickets FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public update tickets"
  ON civil_tickets FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Public insert audit"
  ON audit_events FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
--  REALTIME
-- ─────────────────────────────────────────────────────────────
-- Enable realtime on civil_tickets so UI gets live push updates
ALTER PUBLICATION supabase_realtime ADD TABLE civil_tickets;

-- ─────────────────────────────────────────────────────────────
--  SEED: USERS
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (id, role, name, email, avatar, phone, district) VALUES
  ('citizen-1', 'citizen', 'Sarah Jenkins',  'sarah.jenkins@seattlecivic.org',   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', '(206) 555-0142', 'Sector 01'),
  ('citizen-2', 'citizen', 'Marcus Vance',   'marcus.vance@soundtransit.net',    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '(206) 555-0189', 'Sector 04'),
  ('citizen-3', 'citizen', 'Elena Rostova',  'elena.rostova@cascadecivic.io',    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '(206) 555-0211', 'Sector 05')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, role, name, email, avatar, title, clearance_level) VALUES
  ('manager-1', 'manager', 'Commander Alex Chen', 'alex.chen@citydispatch.gov',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
   'Chief Operations Commander', 'LEVEL-IV DISPATCH SUPREME')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, role, name, email, avatar, crew, department, domain, specialty, rating) VALUES
  ('worker-1', 'worker', 'Dave Miller',  'dave.miller@pavingops.city.gov',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
   'Unit Alpha-01', 'Surface Transit & Paving', 'Roadways & Asphalt Infrastructure',
   'Heavy Milling, Asphalt Resurfacing, Pothole Compaction', 4.9),

  ('worker-2', 'worker', 'Maya Lin',     'maya.lin@hydrology.city.gov',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
   'Unit Hydro-04', 'Hydrology & Storm Systems', 'Water, Storm Drains & Flood Management',
   'Hydraulic Jetting, Culvert Clearing, Pressure Valves', 4.95),

  ('worker-3', 'worker', 'Carlos Ruiz',  'carlos.ruiz@gridelectric.city.gov',
   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
   'Unit Volt-02', 'Grid Illumination & Signals', 'Electrical Grid & Traffic Signals',
   'Photocell Sensors, Intersection Phasing, High-Voltage Lines', 4.88),

  ('worker-4', 'worker', 'Aisha Patel',  'aisha.patel@sanitation.city.gov',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
   'Unit Sweep-09', 'Civic Sanitation & Cleanliness', 'Sanitation, Waste Remediation & Biohazard Debris',
   'Mechanical Street Sweeping, Hazardous Debris, Rapid Waste Clearing', 4.92)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
--  SEED: CIVIL TICKETS (8 tickets from app seed data)
--  Timestamps are relative to 2026-11-14T08:40:00Z (UTC)
-- ─────────────────────────────────────────────────────────────

-- TK-8942-CIV  |  Water main pressure surge & curb flooding
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8942-CIV',
  'Water main pressure surge & curb flooding',
  'Water & Drainage',
  'Sub-surface valve leak flooding north curb lane at Mercer & 4th Ave. Storm sensor indicates 140% peak flow.',
  'Sector 04', '408 Mercer St & 4th Ave',
  '{"lat": 47.6246, "lng": -122.3492}',
  '{"x": 38, "y": 34}',
  'critical', 'on_site', 'Hydrology & Storm Systems',
  'Unit Hydro-04', 'worker-2', 'Maya Lin', 'Agent Hydro-AI',
  'Marcus Vance', 'citizen-2', 'Citizen Portal',
  '/departments/water-drainage-before.jpeg',
  98.4,
  'Detected risk indicators (flooding, main break). Auto-routed by Agent Hydro-AI to Hydrology & Storm Systems. Assigned to Maya Lin (Unit Hydro-04) with a 4h SLA horizon.',
  NOW() - INTERVAL '2.4 hours',
  NOW() + INTERVAL '1.6 hours',
  NULL,
  'Valve isolation wrench & pump truck staged on-site; water shutoff initiated.',
  '{"beforeUrl": "/departments/water-drainage-before.jpeg", "afterUrl": "/departments/water-drainage-after.jpeg", "beforeCaption": "Standing curb water & valve surge", "afterCaption": "Subsurface valve replaced and basin pumped dry", "citizenSignedOff": false}',
  '[
    {"id":"aud-1","timestamp":"' || (NOW() - INTERVAL '2.4 hours')::TEXT || '","actor":"Marcus Vance (Citizen)","action":"Submitted curb flooding complaint with photo evidence"},
    {"id":"aud-2","timestamp":"' || (NOW() - INTERVAL '2.35 hours')::TEXT || '","actor":"Agent Hydro-AI","action":"Classified Critical · Routed to Hydrology & Assigned to Maya Lin (Unit Hydro-04)"},
    {"id":"aud-2b","timestamp":"' || (NOW() - INTERVAL '1 hour')::TEXT || '","actor":"Maya Lin (Unit Hydro-04)","action":"Arrived on-site with pump truck"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8943-CIV  |  Signal controller blackout at Westlake corridor
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8943-CIV',
  'Signal controller blackout at Westlake corridor',
  'Traffic Signals',
  'All-way red flash mode triggered after grid transient. Heavy evening commuter throughput requires manual override.',
  'Sector 02', 'Westlake Ave N & Denny Way',
  '{"lat": 47.6186, "lng": -122.3388}',
  '{"x": 56, "y": 48}',
  'critical', 'on_site', 'Grid Illumination & Signals',
  'Unit Volt-02', 'worker-3', 'Carlos Ruiz', 'Agent Volt-AI',
  'Sarah Jenkins', 'citizen-1', 'Citizen Portal',
  '/departments/safety-civic-before.jpeg',
  97.6,
  'Detected risk indicators (blackout, signal out). Auto-routed by Agent Volt-AI to Grid Illumination & Signals. Assigned to Carlos Ruiz (Unit Volt-02) with a 4h SLA horizon.',
  NOW() - INTERVAL '3.1 hours',
  NOW() + INTERVAL '0.9 hours',
  NULL,
  'Technician replacing phase relay board inside controller cabinet #WL-12.',
  '{"beforeUrl": "/departments/safety-civic-before.jpeg", "afterUrl": "/departments/safety-civic-after.jpeg", "beforeCaption": "Intersection controller blackout & hazard flash", "afterCaption": "Controller synchronized; phased green waves active", "citizenSignedOff": false}',
  '[
    {"id":"aud-3","timestamp":"' || (NOW() - INTERVAL '3.1 hours')::TEXT || '","actor":"Sarah Jenkins (Citizen)","action":"Reported intersection controller dark with photo"},
    {"id":"aud-4","timestamp":"' || (NOW() - INTERVAL '2.8 hours')::TEXT || '","actor":"Agent Volt-AI","action":"Dispatched Carlos Ruiz (Unit Volt-02)"},
    {"id":"aud-5","timestamp":"' || (NOW() - INTERVAL '1.2 hours')::TEXT || '","actor":"Carlos Ruiz (Unit Volt-02)","action":"Arrived on-site; diagnostic telemetry active"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8944-CIV  |  Deep arterial pothole on Rainier southbound lane
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8944-CIV',
  'Deep arterial pothole on Rainier southbound lane',
  'Roadway & Asphalt',
  '18-inch wide asphalt spall exposing aggregate sub-base near bus stop bay. High tire-damage risk during wet commute.',
  'Sector 06', '2140 Rainier Ave S',
  '{"lat": 47.5844, "lng": -122.3011}',
  '{"x": 74, "y": 71}',
  'warning', 'dispatched', 'Surface Transit & Paving',
  'Unit Alpha-01', 'worker-1', 'Dave Miller', 'Agent Pave-AI',
  'Elena Rostova', 'citizen-3', 'Citizen Portal',
  '/departments/road-infra-before.jpeg',
  95.1,
  'Detected risk indicators (deep pothole, damaged). Auto-routed by Agent Pave-AI to Surface Transit & Paving. Assigned to Dave Miller (Unit Alpha-01) with a 12h SLA horizon.',
  NOW() - INTERVAL '6.5 hours',
  NOW() + INTERVAL '5.5 hours',
  NULL,
  'Hot-mix asphalt crew loaded 2.4 tons; en route to Rainier corridor.',
  '{"beforeUrl": "/departments/road-infra-before.jpeg", "afterUrl": "/departments/road-infra-after.jpeg", "beforeCaption": "Exposed asphalt spall & safety cone perimeter", "afterCaption": "Compacted fresh asphalt patch and sealed edges", "citizenSignedOff": false}',
  '[
    {"id":"aud-6","timestamp":"' || (NOW() - INTERVAL '6.5 hours')::TEXT || '","actor":"Elena Rostova (Citizen)","action":"Submitted citizen complaint with street-level pothole photo"},
    {"id":"aud-7","timestamp":"' || (NOW() - INTERVAL '5.9 hours')::TEXT || '","actor":"Agent Pave-AI","action":"Assigned to Dave Miller (Unit Alpha-01)"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8945-CIV  |  Clogged storm inlet grate on 12th & Pine
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8945-CIV',
  'Clogged storm inlet grate on 12th & Pine',
  'Water & Drainage',
  'Autumn leaf mat and street sediment blocking cast-iron grate; runoff encroaching onto pedestrian curb ramp.',
  'Sector 03', '1205 E Pine St',
  '{"lat": 47.6152, "lng": -122.3168}',
  '{"x": 64, "y": 42}',
  'warning', 'new', 'Hydrology & Storm Systems',
  NULL, NULL, NULL, 'Agent Hydro-AI',
  'Sarah Jenkins', 'citizen-1', 'Citizen Portal',
  '/departments/water-drainage-before.jpeg',
  93.8,
  'Detected risk indicators (clogged, standing water). Triaged by Agent Hydro-AI for Hydrology & Storm Systems. Awaiting batch or manual dispatch.',
  NOW() - INTERVAL '1.2 hours',
  NOW() + INTERVAL '6.8 hours',
  NULL,
  'Awaiting crew dispatch confirmation.',
  NULL,
  '[
    {"id":"aud-8","timestamp":"' || (NOW() - INTERVAL '1.2 hours')::TEXT || '","actor":"Sarah Jenkins (Citizen)","action":"Submitted drainage obstruction complaint with photo"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8946-CIV  |  LED luminaire outage along Ballard Greenway
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8946-CIV',
  'LED luminaire outage along Ballard Greenway',
  'Street Lighting',
  'Three consecutive pedestrian-scale light standards offline between 17th Ave NW and 20th Ave NW.',
  'Sector 01', '5412 Ballard Ave NW',
  '{"lat": 47.6661, "lng": -122.3842}',
  '{"x": 23, "y": 21}',
  'nominal', 'en_route', 'Grid Illumination & Signals',
  'Unit Volt-02', 'worker-3', 'Carlos Ruiz', 'Agent Volt-AI',
  'Sarah Jenkins', 'citizen-1', 'Citizen Portal',
  '/departments/safety-civic-before.jpeg',
  94.5,
  'Standard street lighting profile. Auto-routed by Agent Volt-AI to Carlos Ruiz (Unit Volt-02).',
  NOW() - INTERVAL '5 hours',
  NOW() + INTERVAL '19 hours',
  NULL,
  'Bucket truck en route with replacement photocell relays.',
  '{"beforeUrl": "/departments/safety-civic-before.jpeg", "afterUrl": "/departments/safety-civic-after.jpeg", "beforeCaption": "Pedestrian corridor dark luminaire standard", "afterCaption": "Illuminated 4000K LED standard with active photo-sensor", "citizenSignedOff": false}',
  '[
    {"id":"aud-9","timestamp":"' || (NOW() - INTERVAL '5 hours')::TEXT || '","actor":"Sarah Jenkins (Citizen)","action":"Logged pedestrian lighting outage"},
    {"id":"aud-10","timestamp":"' || (NOW() - INTERVAL '3.5 hours')::TEXT || '","actor":"Carlos Ruiz (Unit Volt-02)","action":"Departed depot; en route to Ballard corridor"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8947-CIV  |  Ohio St & Wells intersection asphalt resurfacing (RESOLVED)
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8947-CIV',
  'Ohio St & Wells intersection asphalt resurfacing',
  'Roadway & Asphalt',
  'Deep water-filled pothole remediated with infrared hot-patch milling and thermoplastic lane striping.',
  'Sector 05', 'N Ohio St & Wells Ave',
  '{"lat": 47.6091, "lng": -122.3324}',
  '{"x": 47, "y": 61}',
  'warning', 'resolved', 'Surface Transit & Paving',
  'Unit Alpha-01', 'worker-1', 'Dave Miller', 'Agent Pave-AI',
  'Elena Rostova', 'citizen-3', 'Citizen Portal',
  '/departments/road-infra-before.jpeg',
  96.7,
  'Detected risk indicators (deep pothole, cracked). Auto-routed to Dave Miller (Unit Alpha-01).',
  NOW() - INTERVAL '18 hours',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '8.2 hours',
  'Compacted 4-inch asphalt lift, sealed perimeter seam, repainted turn arrows.',
  '{"beforeUrl": "/departments/road-infra-before.jpeg", "afterUrl": "/departments/road-infra-after.jpeg", "beforeCaption": "Pre-repair: 16-inch waterlogged pothole & spalling", "afterCaption": "Post-repair: Smooth asphalt & fresh lane markings", "citizenSignedOff": true, "citizenRating": 5, "citizenFeedback": "Remarkable job by Dave Miller! Road is completely smooth again.", "verifiedAt": "' || (NOW() - INTERVAL '5 hours')::TEXT || '"}',
  '[
    {"id":"aud-11","timestamp":"' || (NOW() - INTERVAL '18 hours')::TEXT || '","actor":"Elena Rostova (Citizen)","action":"Submitted roadway hazard photo"},
    {"id":"aud-12","timestamp":"' || (NOW() - INTERVAL '8.2 hours')::TEXT || '","actor":"Dave Miller (Unit Alpha-01)","action":"Completed resurfacing & uploaded remediation photo"},
    {"id":"aud-12b","timestamp":"' || (NOW() - INTERVAL '5 hours')::TEXT || '","actor":"Elena Rostova (Citizen)","action":"Inspected photographic proof & verified repair sign-off (5-Star Rating)"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8948-CIV  |  Cast-iron storm catch basin restoration (RESOLVED)
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8948-CIV',
  'Cast-iron storm catch basin restoration',
  'Water & Drainage',
  'Cleared compacted debris blockage and reseated cast-iron catch basin frame to restore full curb drainage.',
  'Sector 07', '820 Beacon Ave S',
  '{"lat": 47.5712, "lng": -122.3114}',
  '{"x": 69, "y": 83}',
  'nominal', 'resolved', 'Hydrology & Storm Systems',
  'Unit Hydro-04', 'worker-2', 'Maya Lin', 'Agent Hydro-AI',
  'Marcus Vance', 'citizen-2', 'Citizen Portal',
  '/departments/water-drainage-before.jpeg',
  95.9,
  'Detected risk indicators (clogged, standing water). Auto-routed to Maya Lin (Unit Hydro-04).',
  NOW() - INTERVAL '14 hours',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '7.4 hours',
  'Hydro-flushed lateral line (45 ft) and cleared grate aperture.',
  '{"beforeUrl": "/departments/water-drainage-before.jpeg", "afterUrl": "/departments/water-drainage-after.jpeg", "beforeCaption": "Pre-repair: Leaf debris dam & curb ponding", "afterCaption": "Post-repair: Cleared cast-iron grate & dry curb", "citizenSignedOff": false}',
  '[
    {"id":"aud-13","timestamp":"' || (NOW() - INTERVAL '14 hours')::TEXT || '","actor":"Marcus Vance (Citizen)","action":"Reported street curb ponding after rainfall"},
    {"id":"aud-14","timestamp":"' || (NOW() - INTERVAL '7.4 hours')::TEXT || '","actor":"Maya Lin (Unit Hydro-04)","action":"Basin flushed and completed remediation photo uploaded"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- TK-8949-CIV  |  Hazardous debris spill blocking Dexter Ave cycle track
INSERT INTO civil_tickets (
  id, title, category, description, district, address,
  coordinates, map_position, severity, status, department,
  assigned_crew, assigned_worker_id, assigned_worker_name, ai_agent_assigned,
  reporter_name, reporter_id, reporter_source, citizen_photo_url,
  ai_confidence, ai_rationale,
  created_at, sla_deadline_at, resolved_at,
  field_notes, verification, audit_log
) VALUES (
  'TK-8949-CIV',
  'Hazardous debris spill blocking Dexter Ave cycle track',
  'Sanitation & Debris',
  'Scattered construction debris, broken glass, and fallen timber obstructing protected bike lane near Aloha St.',
  'Sector 02', '910 Dexter Ave N',
  '{"lat": 47.6272, "lng": -122.3422}',
  '{"x": 43, "y": 41}',
  'warning', 'on_site', 'Civic Sanitation & Cleanliness',
  'Unit Sweep-09', 'worker-4', 'Aisha Patel', 'Agent Sweep-AI',
  'Marcus Vance', 'citizen-2', 'Citizen Portal',
  '/departments/sanitation-eco-before.jpeg',
  96.2,
  'Detected obstruction risk. Auto-routed by Agent Sweep-AI to Civic Sanitation & Cleanliness. Assigned to Aisha Patel (Unit Sweep-09).',
  NOW() - INTERVAL '2.8 hours',
  NOW() + INTERVAL '15.2 hours',
  NULL,
  'Mechanical vacuum sweeper on-site. Debris container 60% full.',
  '{"beforeUrl": "/departments/sanitation-eco-before.jpeg", "afterUrl": "/departments/sanitation-eco-after.jpeg", "beforeCaption": "Pre-cleaning: Glass & solid timber hazard in bike lane", "afterCaption": "Post-sweep: Mechanically cleared and power-washed", "citizenSignedOff": false}',
  '[
    {"id":"aud-15","timestamp":"' || (NOW() - INTERVAL '2.8 hours')::TEXT || '","actor":"Marcus Vance (Citizen)","action":"Submitted cycle track hazard report with photo"},
    {"id":"aud-16","timestamp":"' || (NOW() - INTERVAL '2.5 hours')::TEXT || '","actor":"Agent Sweep-AI","action":"Dispatched Aisha Patel (Unit Sweep-09)"},
    {"id":"aud-17","timestamp":"' || (NOW() - INTERVAL '0.8 hours')::TEXT || '","actor":"Aisha Patel (Unit Sweep-09)","action":"Arrived on-site with mechanical vacuum sweeper"}
  ]'::JSONB
) ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
--  SEED: AUDIT_EVENTS (flat copy for fast reporting queries)
-- ─────────────────────────────────────────────────────────────
INSERT INTO audit_events (id, ticket_id, timestamp, actor, action) VALUES
  ('aud-1',   'TK-8942-CIV', NOW()-INTERVAL '2.4 hours',  'Marcus Vance (Citizen)',        'Submitted curb flooding complaint with photo evidence'),
  ('aud-2',   'TK-8942-CIV', NOW()-INTERVAL '2.35 hours', 'Agent Hydro-AI',                'Classified Critical · Routed to Hydrology & Assigned to Maya Lin'),
  ('aud-2b',  'TK-8942-CIV', NOW()-INTERVAL '1 hour',     'Maya Lin (Unit Hydro-04)',      'Arrived on-site with pump truck'),
  ('aud-3',   'TK-8943-CIV', NOW()-INTERVAL '3.1 hours',  'Sarah Jenkins (Citizen)',       'Reported intersection controller dark with photo'),
  ('aud-4',   'TK-8943-CIV', NOW()-INTERVAL '2.8 hours',  'Agent Volt-AI',                 'Dispatched Carlos Ruiz (Unit Volt-02)'),
  ('aud-5',   'TK-8943-CIV', NOW()-INTERVAL '1.2 hours',  'Carlos Ruiz (Unit Volt-02)',    'Arrived on-site; diagnostic telemetry active'),
  ('aud-6',   'TK-8944-CIV', NOW()-INTERVAL '6.5 hours',  'Elena Rostova (Citizen)',       'Submitted citizen complaint with street-level pothole photo'),
  ('aud-7',   'TK-8944-CIV', NOW()-INTERVAL '5.9 hours',  'Agent Pave-AI',                 'Assigned to Dave Miller (Unit Alpha-01)'),
  ('aud-8',   'TK-8945-CIV', NOW()-INTERVAL '1.2 hours',  'Sarah Jenkins (Citizen)',       'Submitted drainage obstruction complaint with photo'),
  ('aud-9',   'TK-8946-CIV', NOW()-INTERVAL '5 hours',    'Sarah Jenkins (Citizen)',       'Logged pedestrian lighting outage'),
  ('aud-10',  'TK-8946-CIV', NOW()-INTERVAL '3.5 hours',  'Carlos Ruiz (Unit Volt-02)',    'Departed depot; en route to Ballard corridor'),
  ('aud-11',  'TK-8947-CIV', NOW()-INTERVAL '18 hours',   'Elena Rostova (Citizen)',       'Submitted roadway hazard photo'),
  ('aud-12',  'TK-8947-CIV', NOW()-INTERVAL '8.2 hours',  'Dave Miller (Unit Alpha-01)',   'Completed resurfacing & uploaded remediation photo'),
  ('aud-12b', 'TK-8947-CIV', NOW()-INTERVAL '5 hours',    'Elena Rostova (Citizen)',       'Inspected photographic proof & verified repair sign-off (5-Star Rating)'),
  ('aud-13',  'TK-8948-CIV', NOW()-INTERVAL '14 hours',   'Marcus Vance (Citizen)',        'Reported street curb ponding after rainfall'),
  ('aud-14',  'TK-8948-CIV', NOW()-INTERVAL '7.4 hours',  'Maya Lin (Unit Hydro-04)',      'Basin flushed and completed remediation photo uploaded'),
  ('aud-15',  'TK-8949-CIV', NOW()-INTERVAL '2.8 hours',  'Marcus Vance (Citizen)',        'Submitted cycle track hazard report with photo'),
  ('aud-16',  'TK-8949-CIV', NOW()-INTERVAL '2.5 hours',  'Agent Sweep-AI',                'Dispatched Aisha Patel (Unit Sweep-09)'),
  ('aud-17',  'TK-8949-CIV', NOW()-INTERVAL '0.8 hours',  'Aisha Patel (Unit Sweep-09)',   'Arrived on-site with mechanical vacuum sweeper')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
--  VERIFY (run these to check everything was inserted)
-- ─────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM users;         -- should return 8
-- SELECT COUNT(*) FROM civil_tickets; -- should return 8
-- SELECT COUNT(*) FROM audit_events;  -- should return 19
-- SELECT id, title, status, severity FROM civil_tickets ORDER BY created_at DESC;

