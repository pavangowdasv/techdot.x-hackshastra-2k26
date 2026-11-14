import { useState } from 'react';
import { Crosshair, Layers, LocateFixed } from 'lucide-react';
import type { CivilTicket } from '../types/ticket';

interface RadarMapProps {
  tickets: CivilTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

type MapLayerFilter = 'all' | 'critical' | 'crews';

const SECTORS = [
  { label: 'SEC-01 BALLARD', x: 18, y: 16 },
  { label: 'SEC-02 WESTLAKE', x: 52, y: 24 },
  { label: 'SEC-03 CAPITOL HILL', x: 74, y: 34 },
  { label: 'SEC-04 UPTOWN', x: 28, y: 42 },
  { label: 'SEC-05 DOWNTOWN', x: 46, y: 63 },
  { label: 'SEC-06 RAINIER', x: 78, y: 74 },
  { label: 'SEC-07 BEACON', x: 58, y: 86 },
];

export function RadarMap({ tickets, selectedTicketId, onSelectTicket }: RadarMapProps) {
  const [layerFilter, setLayerFilter] = useState<MapLayerFilter>('all');

  const visibleTickets = tickets.filter((ticket) => {
    if (layerFilter === 'critical') return ticket.severity === 'critical' && ticket.status !== 'resolved';
    if (layerFilter === 'crews') return ticket.assignedCrew !== null && ticket.status !== 'resolved';
    return true;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? visibleTickets[0] ?? null;

  return (
    <section
      aria-label="Municipal GIS Radar Map"
      className="glass-level-2 relative flex flex-col overflow-hidden rounded-lg"
      data-testid="gis-radar-map"
    >
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#22304A] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <LocateFixed className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-[#F3F4F6]">
            Metro Sector GIS Telemetry
          </h2>
          <span className="font-mono text-xs text-[#64748B]">
            · {visibleTickets.length} plotted
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-[#22304A] bg-[#0F172A] p-0.5">
          {(
            [
              { id: 'all', label: 'All Clusters' },
              { id: 'critical', label: 'Critical Risk' },
              { id: 'crews', label: 'Active Crews' },
            ] as const
          ).map((tab) => {
            const active = layerFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLayerFilter(tab.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#7657F6] text-[#F3F4F6]'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radar Viewport */}
      <div className="radar-grid-bg relative h-[380px] w-full overflow-hidden bg-[#090D18] sm:h-[430px]">
        {/* Vector Urban Infrastructure Geometry */}
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {/* Puget Sound / Waterfront Boundary */}
          <path
            d="M0,0 L160,0 C180,95 140,175 185,260 C215,320 140,400 120,500 L0,500 Z"
            fill="rgba(6, 182, 212, 0.05)"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1.5"
          />
          {/* Lake Union & Ship Canal */}
          <path
            d="M210,155 C300,150 385,175 470,160 C530,150 565,120 620,130 L600,185 C530,195 450,210 370,195 C295,180 250,185 200,180 Z"
            fill="rgba(6, 182, 212, 0.06)"
            stroke="rgba(6, 182, 212, 0.22)"
            strokeWidth="1"
          />

          {/* Primary Arterial Corridors */}
          <g stroke="rgba(34, 48, 74, 0.85)" strokeWidth="2" fill="none">
            <path d="M230,0 L460,500" />
            <path d="M480,0 L520,500" />
            <path d="M680,0 L770,500" />
            <path d="M120,120 L980,145" />
            <path d="M160,245 L980,235" />
            <path d="M140,360 L980,385" />
          </g>

          {/* Secondary Grid Arterials */}
          <g stroke="rgba(34, 48, 74, 0.45)" strokeWidth="1" strokeDasharray="4 4" fill="none">
            <path d="M350,0 L390,500" />
            <path d="M600,0 L640,500" />
            <path d="M180,190 L980,190" />
            <path d="M160,305 L980,305" />
          </g>

          {/* Concentric Radar Rings */}
          <g stroke="rgba(6, 182, 212, 0.14)" strokeWidth="1" fill="none">
            <circle cx="500" cy="250" r="95" />
            <circle cx="500" cy="250" r="190" />
            <circle cx="500" cy="250" r="290" />
          </g>
        </svg>

        {/* Animated Cyan Sweep Reticle */}
        <div
          aria-hidden="true"
          className="animate-radar-sweep pointer-events-none absolute top-1/2 left-1/2 h-[580px] w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(6, 182, 212, 0.28) 0deg, rgba(6, 182, 212, 0) 58deg, transparent 360deg)',
          }}
        />

        {/* Sector Labels */}
        {SECTORS.map((sector) => (
          <div
            key={sector.label}
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.06em] text-[#64748B]/80"
            style={{ left: `${sector.x}%`, top: `${sector.y}%` }}
          >
            {sector.label}
          </div>
        ))}

        {/* Interactive Incident Pins */}
        {visibleTickets.map((ticket) => {
          const isSelected = ticket.id === selectedTicket?.id;
          const pinColor =
            ticket.status === 'resolved'
              ? '#10B981'
              : ticket.severity === 'critical'
                ? '#EF4444'
                : ticket.severity === 'warning'
                  ? '#F59E0B'
                  : '#06B6D4';

          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelectTicket(ticket.id)}
              aria-label={`Select incident ${ticket.id}: ${ticket.title} (${ticket.severity})`}
              className="group absolute -translate-x-1/2 -translate-y-1/2 p-2 focus-visible:outline-none"
              style={{ left: `${ticket.mapPosition.x}%`, top: `${ticket.mapPosition.y}%` }}
            >
              {/* Selection Halo */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-[#06B6D4]/70 bg-[#06B6D4]/15 shadow-[0_0_24px_-4px_rgba(6,182,212,0.55)]"
                />
              )}

              {/* Pulsing outer ring for unresolved critical nodes */}
              {ticket.severity === 'critical' && ticket.status !== 'resolved' && (
                <span
                  aria-hidden="true"
                  className="animate-pulse-node absolute inset-1 rounded-full border border-[#EF4444]/60"
                />
              )}

              <span
                aria-hidden="true"
                className="relative block h-3.5 w-3.5 rounded-full border-2 border-[#090D18] transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: pinColor }}
              />

              {/* Compact callout on selected pin */}
              {isSelected && (
                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 rounded border border-[#06B6D4]/50 bg-[#0F172A]/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#F3F4F6] whitespace-nowrap shadow-lg">
                  {ticket.id}
                </span>
              )}
            </button>
          );
        })}

        {/* Selected Coordinate HUD Readout */}
        {selectedTicket && (
          <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[#22304A] bg-[#0F172A]/90 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs">
              <Crosshair className="h-3.5 w-3.5 text-[#06B6D4]" aria-hidden="true" />
              <span className="font-mono font-semibold text-[#F3F4F6]">{selectedTicket.id}</span>
              <span className="text-[#64748B]" aria-hidden="true">
                ·
              </span>
              <span className="truncate max-w-[260px] text-[#9CA3AF]">
                {selectedTicket.address}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#9CA3AF]">
              <span>
                {selectedTicket.coordinates.lat.toFixed(4)}°N, {Math.abs(selectedTicket.coordinates.lng).toFixed(4)}°W
              </span>
              <span className="hidden sm:inline text-[#06B6D4]">
                {selectedTicket.assignedCrew ?? 'Unassigned'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#22304A] bg-[#0F172A]/70 px-4 py-2 text-xs text-[#9CA3AF]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" aria-hidden="true" />
            Critical Hazard
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" aria-hidden="true" />
            Warning / Escalating
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#06B6D4]" aria-hidden="true" />
            Nominal / Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
            Verified Resolved
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#64748B]">
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          <span>CRS: WGS84</span>
        </div>
      </div>
    </section>
  );
}
