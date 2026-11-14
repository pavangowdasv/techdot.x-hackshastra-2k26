-- ============================================================
-- NAGARSETU SMART CITY COMPLAINT MANAGEMENT PLATFORM
-- SUPABASE POSTGRESQL SCHEMA & INITIAL DATA EXPORT
-- ============================================================

-- 1. Create Civil Tickets Table
CREATE TABLE IF NOT EXISTS public.civil_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates JSONB,
    map_position JSONB,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    department TEXT NOT NULL,
    assigned_crew TEXT,
    assigned_worker_id TEXT,
    assigned_worker_name TEXT,
    ai_agent_assigned TEXT,
    reporter_name TEXT NOT NULL,
    reporter_id TEXT,
    reporter_source TEXT,
    citizen_photo_url TEXT,
    ai_confidence NUMERIC,
    ai_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sla_deadline_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    field_notes TEXT,
    verification JSONB,
    audit_log JSONB DEFAULT '[]'::jsonb
);

-- 2. Create Helpful Indexes for Real-time City Telemetry
CREATE INDEX IF NOT EXISTS idx_civil_tickets_status ON public.civil_tickets(status);
CREATE INDEX IF NOT EXISTS idx_civil_tickets_department ON public.civil_tickets(department);
CREATE INDEX IF NOT EXISTS idx_civil_tickets_district ON public.civil_tickets(district);
CREATE INDEX IF NOT EXISTS idx_civil_tickets_severity ON public.civil_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_civil_tickets_created_at ON public.civil_tickets(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.civil_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Configured Security Policies (Permissive for Multi-Portal Federation)
DROP POLICY IF EXISTS "Allow Public Read on civil_tickets" ON public.civil_tickets;
CREATE POLICY "Allow Public Read on civil_tickets" 
ON public.civil_tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Insert on civil_tickets" ON public.civil_tickets;
CREATE POLICY "Allow Public Insert on civil_tickets" 
ON public.civil_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Update on civil_tickets" ON public.civil_tickets;
CREATE POLICY "Allow Public Update on civil_tickets" 
ON public.civil_tickets FOR UPDATE USING (true);

-- 5. Enable Real-Time Telemetry Stream on Supabase
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'civil_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.civil_tickets;
  END IF;
END $$;

-- 6. Initial Seed Data (Municipal Verified Tickets with Genuine Before & After Proofs)
INSERT INTO public.civil_tickets (
    id, title, category, description, district, address, coordinates, map_position,
    severity, status, department, assigned_crew, assigned_worker_id, assigned_worker_name,
    ai_agent_assigned, reporter_name, reporter_id, reporter_source, citizen_photo_url,
    ai_confidence, ai_rationale, created_at, sla_deadline_at, resolved_at, field_notes,
    verification, audit_log
) VALUES 
(
    'TK-8942-CIV',
    'Water main pressure surge & curb flooding',
    'Water & Drainage',
    'Sub-surface valve leak flooding north curb lane at Mercer & 4th Ave. Storm sensor indicates 140% peak flow.',
    'Sector 04',
    '408 Mercer St & 4th Ave',
    '{"lat": 47.6246, "lng": -122.3492}',
    '{"x": 38, "y": 34}',
    'critical',
    'on_site',
    'Hydrology & Storm Systems',
    'Unit Hydro-04',
    'worker-2',
    'Maya Lin',
    'Agent Hydro-AI',
    'Marcus Vance',
    'citizen-2',
    'Citizen Portal',
    '/departments/water-drainage-before.jpeg',
    98.4,
    'Detected risk indicators (flooding, main break). Auto-routed by Agent Hydro-AI to Hydrology & Storm Systems. Assigned to Maya Lin (Unit Hydro-04) with a 4h SLA horizon.',
    NOW() - INTERVAL '2 hours 24 minutes',
    NOW() + INTERVAL '1 hour 36 minutes',
    NULL,
    'Valve isolation wrench & pump truck staged on-site; water shutoff initiated.',
    '{"beforeUrl": "/departments/water-drainage-before.jpeg", "afterUrl": "/departments/water-drainage-after.jpeg", "beforeCaption": "Standing curb water & valve surge", "afterCaption": "Subsurface valve replaced and basin pumped dry", "citizenSignedOff": false}',
    '[{"id": "aud-1", "timestamp": "2026-11-14T08:00:00Z", "actor": "Marcus Vance (Citizen)", "action": "Submitted curb flooding complaint with photo evidence"}, {"id": "aud-2", "timestamp": "2026-11-14T08:02:00Z", "actor": "Agent Hydro-AI", "action": "Severity escalated to CRITICAL; SLA target locked at 4h"}, {"id": "aud-3", "timestamp": "2026-11-14T08:15:00Z", "actor": "Alex Chen (Ops Commander)", "action": "Dispatched Unit Hydro-04 (Maya Lin) with high-capacity pump truck"}]'::jsonb
),
(
    'TK-7821-CIV',
    'Traffic signal controller fault & dark intersection',
    'Traffic Signals',
    'Complete blackout of 4-way traffic signals following storm surge. High collision probability reported by transit cameras.',
    'Sector 02',
    'Interstate 5 Connector & Pine St',
    '{"lat": 47.6189, "lng": -122.3361}',
    '{"x": 56, "y": 42}',
    'critical',
    'dispatched',
    'Grid & Traffic Networks',
    'Unit Signals-02',
    'worker-3',
    'Devon Brooks',
    'Agent Signal-AI',
    'Elena Rostova',
    'citizen-3',
    'Automated Sensor',
    '/departments/safety-civic-before.jpeg',
    99.1,
    'Sensor anomaly match: zero voltage telemetry on controller board. High-risk traffic confluence. Priority 1 auto-dispatch triggered.',
    NOW() - INTERVAL '1 hour 12 minutes',
    NOW() + INTERVAL '2 hours 48 minutes',
    NULL,
    'Emergency generator and controller replacement hardware en-route.',
    '{"beforeUrl": "/departments/safety-civic-before.jpeg", "afterUrl": "/departments/safety-civic-after.jpeg", "beforeCaption": "Dark signal mast & traffic stall", "afterCaption": "Controller replaced; LED phase synchronised with radar", "citizenSignedOff": false}',
    '[{"id": "aud-10", "timestamp": "2026-11-14T09:00:00Z", "actor": "Grid Sensor #88", "action": "Voltage failure telemetry logged"}, {"id": "aud-11", "timestamp": "2026-11-14T09:01:00Z", "actor": "Agent Signal-AI", "action": "Auto-dispatched Unit Signals-02"}]'::jsonb
),
(
    'TK-6419-CIV',
    'Deep asphalt pothole crater & damaged bicycle lane',
    'Roadway & Asphalt',
    'Severe 45cm diameter crater on arterial cycle highway. Two blown tires and one cyclist near-fall recorded.',
    'Sector 01',
    '812 Westlake Ave N',
    '{"lat": 47.6274, "lng": -122.3385}',
    '{"x": 28, "y": 28}',
    'high',
    'verified',
    'Paving & Civil Works',
    'Unit Pave-01',
    'worker-1',
    'Dave Miller',
    'Agent Pave-AI',
    'Sarah Jenkins',
    'citizen-1',
    'Citizen Portal',
    '/departments/road-infra-before.jpeg',
    97.8,
    'Dual-image vision audit confirmed 100% spall remediation with hot-mix compaction. Complainant digital sign-off completed.',
    NOW() - INTERVAL '5 hours 30 minutes',
    NOW() - INTERVAL '1 hour 30 minutes',
    NOW() - INTERVAL '2 hours 10 minutes',
    'Infrared thermal patch completed; compaction tested at 98.4% density.',
    '{"beforeUrl": "/departments/road-infra-before.jpeg", "afterUrl": "/departments/road-infra-after.jpeg", "beforeCaption": "Exposed aggregate crater in bike corridor", "afterCaption": "Thermal hot-mix rolled flush with grade", "citizenSignedOff": true}',
    '[{"id": "aud-20", "timestamp": "2026-11-14T05:00:00Z", "actor": "Sarah Jenkins (Citizen)", "action": "Reported pothole via mobile photo"}, {"id": "aud-21", "timestamp": "2026-11-14T08:00:00Z", "actor": "Dave Miller (Unit Pave-01)", "action": "Remediation completed; uploaded after photo"}, {"id": "aud-22", "timestamp": "2026-11-14T08:20:00Z", "actor": "Sarah Jenkins (Citizen)", "action": "Digitally verified and approved resolution"}]'::jsonb
),
(
    'TK-5510-CIV',
    'Commercial dumpster overflow & alleyway obstruction',
    'Sanitation & Debris',
    'Uncontrolled commercial waste spill blocking pedestrian emergency egress alley behind 2nd Ave commercial block.',
    'Sector 03',
    '214 Stewart St & Alley',
    '{"lat": 47.6118, "lng": -122.3402}',
    '{"x": 64, "y": 40}',
    'medium',
    'verified',
    'Urban Sanitation & Ecology',
    'Unit San-03',
    'worker-4',
    'Carlos Ruiz',
    'Agent San-AI',
    'Marcus Vance',
    'citizen-2',
    'Field Inspector',
    '/departments/sanitation-eco-before.jpeg',
    96.4,
    'Site cleared by mechanical compaction squad and pressure sanitized. Compliance certificate issued.',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '3 hours 15 minutes',
    'Debris cleared, bin pressure washed, perimeter treated with disinfectant spray.',
    '{"beforeUrl": "/departments/sanitation-eco-before.jpeg", "afterUrl": "/departments/sanitation-eco-after.jpeg", "beforeCaption": "Waste overflow blocking emergency fire lane", "afterCaption": "Cleaned, sanitized and access restored", "citizenSignedOff": true}',
    '[{"id": "aud-30", "timestamp": "2026-11-14T04:30:00Z", "actor": "Inspector #14", "action": "Code violation logged"}, {"id": "aud-31", "timestamp": "2026-11-14T07:15:00Z", "actor": "Carlos Ruiz (Unit San-03)", "action": "Site cleared and sanitized"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status,
    verification = EXCLUDED.verification,
    field_notes = EXCLUDED.field_notes;

