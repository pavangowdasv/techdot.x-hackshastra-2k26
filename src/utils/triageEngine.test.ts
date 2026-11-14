import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyIncident,
  computeCommandMetrics,
  computeSlaMetrics,
  filterTickets,
  formatTicketsCsv,
  generateNextTicketId,
  sortQueuePriority,
  sortTickets,
} from './triageEngine';
import type { CivilTicket } from '../types/ticket';

const BASE_TIME = Date.parse('2026-11-13T18:00:00.000Z');

function makeTicket(overrides: Partial<CivilTicket> = {}): CivilTicket {
  return {
    id: 'TK-8941-CIV',
    title: 'Storm drain grate obstructed',
    category: 'Water & Drainage',
    description: 'Standing rainwater pooling at curb inlet.',
    district: 'Sector 04',
    address: '412 Mercer St',
    coordinates: { lat: 47.6245, lng: -122.3481 },
    mapPosition: { x: 48, y: 52 },
    severity: 'warning',
    status: 'triaged',
    department: 'Hydrology & Storm Systems',
    assignedCrew: 'Unit Hydro-04',
    reporterName: 'M. Alvarez',
    reporterSource: 'Citizen Portal',
    aiConfidence: 95.4,
    aiRationale: 'Auto-routed to Hydrology.',
    createdAt: new Date(BASE_TIME - 4 * 3600 * 1000).toISOString(),
    slaDeadlineAt: new Date(BASE_TIME + 4 * 3600 * 1000).toISOString(),
    resolvedAt: null,
    fieldNotes: '',
    auditLog: [],
    ...overrides,
  };
}

test('classifyIncident escalates critical keywords and tightens SLA horizon', () => {
  const result = classifyIncident({
    title: 'Water main break flooding intersection',
    category: 'Water & Drainage',
    description: 'Major burst pipe causing street flood near hospital access.',
  });

  assert.equal(result.severity, 'critical');
  assert.equal(result.targetSlaHours, 4);
  assert.equal(result.department, 'Hydrology & Storm Systems');
  assert.ok(result.confidence >= 94);
});

test('classifyIncident upgrades nominal category on warning indicators', () => {
  const result = classifyIncident({
    title: 'Streetlamp flickering rapidly',
    category: 'Street Lighting',
    description: 'Pole #44 damaged and flickering along crosswalk.',
  });

  assert.equal(result.severity, 'warning');
  assert.equal(result.targetSlaHours, 12);
  assert.equal(result.department, 'Grid Illumination & Signals');
});

test('computeSlaMetrics tracks warning, critical, breached, and resolved states', () => {
  const warningTicket = makeTicket({
    createdAt: new Date(BASE_TIME - 5 * 3600 * 1000).toISOString(),
    slaDeadlineAt: new Date(BASE_TIME + 3 * 3600 * 1000).toISOString(),
  });
  const warningSla = computeSlaMetrics(warningTicket, BASE_TIME);
  assert.equal(warningSla.riskState, 'warning');
  assert.equal(warningSla.formattedCountdown, '03:00:00');

  const criticalTicket = makeTicket({
    createdAt: new Date(BASE_TIME - 7 * 3600 * 1000).toISOString(),
    slaDeadlineAt: new Date(BASE_TIME + 3600 * 1000).toISOString(),
  });
  assert.equal(computeSlaMetrics(criticalTicket, BASE_TIME).riskState, 'critical');

  const breachedTicket = makeTicket({
    slaDeadlineAt: new Date(BASE_TIME - 1800 * 1000).toISOString(),
  });
  const breachedSla = computeSlaMetrics(breachedTicket, BASE_TIME);
  assert.equal(breachedSla.riskState, 'breached');
  assert.equal(breachedSla.formattedCountdown, '-00:30:00');

  const resolvedTicket = makeTicket({
    status: 'resolved',
    resolvedAt: new Date(BASE_TIME - 600 * 1000).toISOString(),
  });
  assert.equal(computeSlaMetrics(resolvedTicket, BASE_TIME).formattedCountdown, 'SLA MET');
});

test('filterTickets and sortTickets isolate matching records accurately', () => {
  const list = [
    makeTicket({ id: 'TK-8941-CIV', severity: 'nominal', status: 'new', district: 'Sector 01' }),
    makeTicket({ id: 'TK-8942-CIV', severity: 'critical', status: 'dispatched', district: 'Sector 04' }),
    makeTicket({ id: 'TK-8943-CIV', severity: 'warning', status: 'resolved', district: 'Sector 02' }),
  ];

  const activeCritical = filterTickets(list, {
    search: 'sector 04',
    severity: 'critical',
    status: 'active',
    department: 'all',
  });
  assert.equal(activeCritical.length, 1);
  assert.equal(activeCritical[0].id, 'TK-8942-CIV');

  const sorted = sortTickets(list, 'severity', 'desc');
  assert.deepEqual(
    sorted.map((t) => t.severity),
    ['critical', 'warning', 'nominal'],
  );
});

test('computeCommandMetrics, generateNextTicketId, and formatTicketsCsv produce accurate outputs', () => {
  const list = [
    makeTicket({ id: 'TK-8945-CIV', severity: 'critical', status: 'dispatched', aiConfidence: 98.0 }),
    makeTicket({
      id: 'TK-8950-CIV',
      severity: 'nominal',
      status: 'resolved',
      aiConfidence: 92.0,
      resolvedAt: new Date(BASE_TIME + 1000).toISOString(),
    }),
  ];

  const stats = computeCommandMetrics(list, BASE_TIME);
  assert.equal(stats.totalTickets, 2);
  assert.equal(stats.activeCount, 1);
  assert.equal(stats.criticalOpenCount, 1);
  assert.equal(stats.resolvedCount, 1);
  assert.equal(stats.slaCompliancePct, 100);
  assert.equal(stats.meanAiConfidence, 95);

  assert.equal(generateNextTicketId(list), 'TK-8951-CIV');

  const csv = formatTicketsCsv(list);
  assert.ok(csv.startsWith('Ticket ID,Title,Category'));
  assert.ok(csv.includes('TK-8945-CIV'));
});

test('sortQueuePriority orders active critical tickets before resolved tickets', () => {
  const list = [
    makeTicket({
      id: 'TK-8901-CIV',
      status: 'resolved',
      severity: 'critical',
      slaDeadlineAt: new Date(BASE_TIME - 5000).toISOString(),
    }),
    makeTicket({
      id: 'TK-8902-CIV',
      status: 'new',
      severity: 'nominal',
      slaDeadlineAt: new Date(BASE_TIME + 7200 * 1000).toISOString(),
    }),
    makeTicket({
      id: 'TK-8903-CIV',
      status: 'triaged',
      severity: 'critical',
      slaDeadlineAt: new Date(BASE_TIME + 3600 * 1000).toISOString(),
    }),
  ];

  const prioritized = sortQueuePriority(list);
  assert.deepEqual(
    prioritized.map((t) => t.id),
    ['TK-8903-CIV', 'TK-8902-CIV', 'TK-8901-CIV'],
  );
});

