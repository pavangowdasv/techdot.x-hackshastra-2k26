-- NagarSetu Control Surface: Supabase Postgres Schema
-- Run this script in your Supabase SQL Editor before deploying to Vercel.

create table if not exists public.civil_tickets (
  id text primary key,
  title text not null,
  category text not null,
  description text not null,
  district text not null,
  address text not null,
  coordinates jsonb not null,
  map_position jsonb not null,
  severity text not null check (severity in ('critical', 'warning', 'nominal')),
  status text not null check (status in ('new', 'triaged', 'dispatched', 'en_route', 'on_site', 'resolved')),
  department text not null,
  assigned_crew text,
  reporter_name text not null,
  reporter_source text not null,
  ai_confidence numeric(5, 2) not null,
  ai_rationale text not null,
  created_at timestamptz not null default now(),
  sla_deadline_at timestamptz not null,
  resolved_at timestamptz,
  field_notes text not null default '',
  verification jsonb,
  audit_log jsonb not null default '[]'::jsonb
);

alter table public.civil_tickets enable row level security;

create policy "Allow public read of civil tickets"
  on public.civil_tickets
  for select
  using (true);

create policy "Allow public insert of citizen reports"
  on public.civil_tickets
  for insert
  with check (true);

create policy "Allow operational updates on civil tickets"
  on public.civil_tickets
  for update
  using (true)
  with check (true);
