/* Global Search — tiered filtering.
 *
 * "Show the most useful filters first. Keep the rest available, but out of the way."
 *
 * Tier 1 = the module's default list columns, 5-7 of them, on the group header.
 * Tier 2 = the module's full list-filter set, behind "+ Filter", grouped Common /
 *          Module-Specific / Custom Fields.
 * Tier 3 = automation predicates (time-elapsed, workflow-only, routing conditions). Deliberately
 *          absent — those belong to Scenario Builder and SLA logic, not known-item retrieval.
 *
 * Filters are GROUP-scoped, never global: same-label fields do not mean the same thing across
 * modules, and this data proves it (a request is "Open", an asset is "In Use", a deployment is
 * "Ready to Deploy"). Every field reads from the ORIGINAL record via an accessor, so nothing has
 * to be denormalised into the index and the two can never drift.
 */

import type { SearchGroup, SearchHit } from './globalSearchData';
import { CURRENT_USER } from './globalSearchData';

export type FilterKind = 'select' | 'person' | 'date' | 'text';
export type FilterSection = 'common' | 'module' | 'custom';

export interface FilterField {
  id: string;
  label: string;
  kind: FilterKind;
  section: FilterSection;
  /** Values a record carries for this field. Multiple = the record matches any of them. */
  get: (hit: SearchHit) => string[];
  /** Fixed option list; when absent options are collected from the data. */
  options?: string[];
  /** Renders a colored dot beside each option. */
  dots?: Record<string, string>;
}

/** One active filter. Values inside a filter are OR'd; separate filters are AND'd. */
export interface ActiveFilter {
  fieldId: string;
  values: string[];
}

export type GroupFilters = Partial<Record<SearchGroup, ActiveFilter[]>>;

// ── Value helpers ──────────────────────────────────────────────────────────

const str = (v: unknown): string[] => {
  if (v == null || v === '' || v === '—' || v === '---') return [];
  return [String(v)];
};
const person = (v: any): string[] => {
  const name = typeof v === 'string' ? v : v?.name ?? v?.label;
  return name && name !== 'Unassigned' ? [String(name)] : name ? ['Unassigned'] : [];
};

/* Dates arrive in five shapes across these mocks: a Date, "Wed, May 27, 2026",
 * "Tue, Apr 14, 2026 05:00 PM", "30 Sep 2026" and "24/07/2026" (DD/MM/YYYY, which Date.parse
 * reads as MM/DD and silently gets wrong). */
export function parseAnyDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  if (!s || s === '—' || s === '---') return null;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const d = new Date(s.replace(/^\w{3},\s*/, ''));
  return isNaN(d.getTime()) ? null : d;
}

const dateVal = (v: unknown): string[] => {
  const d = parseAnyDate(v);
  // ISO day is the stored value; the UI turns presets into a range and compares on this.
  return d ? [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`] : [];
};

export const DATE_PRESETS = ['Today', 'Last 7 days', 'Last 30 days', 'This month', 'Custom range'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

/** Resolves a preset (or a `custom:from..to` value) to an inclusive day range. */
export function dateRange(value: string, now = new Date()): { from: Date; to: Date } | null {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now);
  const endToday = new Date(today.getTime() + 86_400_000 - 1);
  if (value.startsWith('custom:')) {
    const [from, to] = value.slice(7).split('..');
    const f = parseAnyDate(from);
    const t = parseAnyDate(to);
    if (!f && !t) return null;
    return { from: f ?? new Date(0), to: t ? new Date(t.getTime() + 86_400_000 - 1) : endToday };
  }
  switch (value) {
    case 'Today': return { from: today, to: endToday };
    case 'Last 7 days': return { from: new Date(today.getTime() - 6 * 86_400_000), to: endToday };
    case 'Last 30 days': return { from: new Date(today.getTime() - 29 * 86_400_000), to: endToday };
    case 'This month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endToday };
    default: return null;
  }
}

// ── Shared option sets ─────────────────────────────────────────────────────

const PRIORITY_DOTS: Record<string, string> = {
  Urgent: '#EF4444', High: '#EF4444', P1: '#EF4444',
  Medium: '#F59E0B', P2: '#F59E0B',
  Low: '#22C55E', P3: '#3D8BD0', P4: '#22C55E',
};
const SEVERITY_DOTS: Record<string, string> = {
  Critical: '#DC2626', Important: '#EA580C', High: '#EA580C',
  Moderate: '#F59E0B', Medium: '#F59E0B', Low: '#22C55E', Unspecified: '#94A3B8',
};
const REQ_STATUS_DOTS: Record<string, string> = {
  Open: '#3D8BD0', 'In Progress': '#F59E0B', Pending: '#F59E0B',
  Completed: '#22C55E', Resolved: '#22C55E', Closed: '#94A3B8', Cancelled: '#94A3B8',
};

/* A ticket's "Due By Status" is the derived column the Requests list shows, not a stored field —
 * it is what a technician actually scans for, so it is a Tier 1 filter. */
const dueByStatus = (hit: SearchHit): string[] => {
  const due = parseAnyDate(hit.data?.dueBy);
  if (!due) return [];
  const closed = /closed|completed|cancelled|resolved/i.test(hit.data?.status ?? '');
  if (closed) return ['Closed'];
  const now = Date.now();
  if (due.getTime() < now) return ['Overdue'];
  if (due.getTime() - now < 86_400_000) return ['Due today'];
  return ['On track'];
};

/* Tenant custom fields have definitions in this prototype but no per-record values, so a picker
 * backed by them would filter everything out. Values are derived deterministically from the
 * record id — the same approach the BOM and topology mocks use — so the Tier 2 Custom Fields
 * section behaves like the real thing and a chosen value always matches a stable set of records. */
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  return h;
};
const derived = (options: string[]) => (hit: SearchHit): string[] =>
  [options[hash(hit.key) % options.length]];

const REGIONS = ['APAC', 'EMEA', 'Americas'];
const BUSINESS_UNITS = ['Corporate IT', 'Engineering', 'Field Operations', 'Shared Services'];
const COST_CENTERS = ['CC-1100', 'CC-2400', 'CC-3050', 'CC-4820'];

// ── Field catalog ──────────────────────────────────────────────────────────
// Tier 1 order IS the order these are declared in, so a module's chips always appear in the same
// place. Admin Settings and Destinations are deliberately absent: they are name-matched
// navigation, and filters would be noise.

interface GroupFilterSet {
  /** Field ids shown as chips on the group header. Keep to 5-7. */
  tier1: string[];
  fields: FilterField[];
}

const requesterField: FilterField = { id: 'requester', label: 'Requester', kind: 'person', section: 'common', get: (h) => person(h.data?.requester) };
const assigneeField: FilterField = { id: 'assignee', label: 'Assignee', kind: 'person', section: 'common', get: (h) => person(h.data?.assignedTo ?? h.data?.assignee) };
const createdField: FilterField = { id: 'created', label: 'Created Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.createdBy ?? h.data?.createdDate) };
const priorityField = (options: string[]): FilterField => ({ id: 'priority', label: 'Priority', kind: 'select', section: 'common', options, dots: PRIORITY_DOTS, get: (h) => str(h.data?.priority) });
const customFields: FilterField[] = [
  { id: 'cf_region', label: 'Region', kind: 'select', section: 'custom', options: REGIONS, get: derived(REGIONS) },
  { id: 'cf_bu', label: 'Business Unit', kind: 'select', section: 'custom', options: BUSINESS_UNITS, get: derived(BUSINESS_UNITS) },
  { id: 'cf_cc', label: 'Cost Center', kind: 'select', section: 'custom', options: COST_CENTERS, get: derived(COST_CENTERS) },
];

export const FILTER_SETS: Partial<Record<SearchGroup, GroupFilterSet>> = {
  Requests: {
    tier1: ['status', 'priority', 'assignee', 'requester', 'created', 'dueByStatus'],
    fields: [
      { id: 'status', label: 'Status', kind: 'select', section: 'common', options: ['Open', 'In Progress', 'Pending', 'Completed', 'Closed', 'Cancelled'], dots: REQ_STATUS_DOTS, get: (h) => str(h.data?.status) },
      priorityField(['Urgent', 'High', 'Medium', 'Low']),
      assigneeField,
      requesterField,
      createdField,
      { id: 'dueByStatus', label: 'Due By Status', kind: 'select', section: 'common', options: ['Overdue', 'Due today', 'On track', 'Closed'], dots: { Overdue: '#EF4444', 'Due today': '#F59E0B', 'On track': '#22C55E', Closed: '#94A3B8' }, get: dueByStatus },
      { id: 'recordType', label: 'Request Type', kind: 'select', section: 'module', options: ['Incident', 'Service Request'], get: (h) => str(h.type) },
      ...customFields,
    ],
  },

  // Problem / Change / Release Tier 1 sets are read off what each list page actually renders,
  // rather than invented.
  Problems: {
    tier1: ['status', 'priority', 'assignee', 'requester', 'created'],
    fields: [
      { id: 'status', label: 'Status', kind: 'select', section: 'common', options: ['Open', 'In Progress', 'Pending', 'Pending QA', 'Resolved', 'Closed'], dots: REQ_STATUS_DOTS, get: (h) => str(h.data?.status) },
      priorityField(['Urgent', 'High', 'Medium', 'Low']),
      assigneeField,
      requesterField,
      createdField,
      { id: 'urgency', label: 'Urgency', kind: 'select', section: 'module', options: ['High', 'Medium', 'Low'], get: (h) => str(h.data?.urgency) },
    ],
  },

  Changes: {
    tier1: ['status', 'priority', 'assignee', 'requester', 'created'],
    fields: [
      { id: 'status', label: 'Status', kind: 'select', section: 'common', get: (h) => str(h.data?.status) },
      priorityField(['P1', 'P2', 'P3', 'P4', 'Urgent', 'High', 'Medium', 'Low']),
      assigneeField,
      requesterField,
      createdField,
      { id: 'changeType', label: 'Change Type', kind: 'select', section: 'module', options: ['Standard', 'Normal', 'Emergency'], get: (h) => str(h.data?.changeType) },
      { id: 'changeRisk', label: 'Change Risk', kind: 'select', section: 'module', options: ['High', 'Medium', 'Low'], dots: PRIORITY_DOTS, get: (h) => str(h.data?.changeRisk) },
    ],
  },

  Releases: {
    tier1: ['status', 'priority', 'assignee', 'requester', 'created'],
    fields: [
      { id: 'status', label: 'Status', kind: 'select', section: 'common', get: (h) => str(h.data?.status) },
      priorityField(['P1', 'P2', 'High', 'Medium']),
      assigneeField,
      requesterField,
      createdField,
      { id: 'releaseType', label: 'Release Type', kind: 'select', section: 'module', options: ['Major', 'Minor', 'Standard', 'Significant'], get: (h) => str(h.data?.releaseType) },
      { id: 'releaseRisk', label: 'Release Risk', kind: 'select', section: 'module', options: ['High', 'Medium', 'Low'], dots: PRIORITY_DOTS, get: (h) => str(h.data?.releaseRisk) },
    ],
  },

  // One group covering seven record types, so Record Type leads — without it "Status: In Use"
  // would sit next to purchase orders it can never match.
  Assets: {
    tier1: ['recordType', 'status', 'assetType', 'usedBy', 'managedByGroup', 'managedBy'],
    fields: [
      { id: 'recordType', label: 'Record Type', kind: 'select', section: 'common', options: ['Hardware Asset', 'Software Asset', 'Non-IT Asset', 'Consumable', 'Software License', 'Contract', 'Purchase Order'], get: (h) => str(h.type) },
      { id: 'status', label: 'Status', kind: 'select', section: 'common', get: (h) => str(h.data?.status) },
      { id: 'assetType', label: 'Asset Type', kind: 'select', section: 'module', get: (h) => str(h.data?.assetType ?? h.data?.contractType ?? h.data?.licenseType) },
      { id: 'usedBy', label: 'Used By', kind: 'person', section: 'common', get: (h) => person(h.data?.usedBy) },
      { id: 'managedByGroup', label: 'Managed By Group', kind: 'select', section: 'module', get: (h) => str(h.data?.managedByGroup) },
      { id: 'managedBy', label: 'Managed By', kind: 'person', section: 'common', get: (h) => person(h.data?.managedBy ?? h.data?.owner) },
      { id: 'hostName', label: 'Host Name', kind: 'text', section: 'module', get: (h) => str(h.data?.hostName) },
      { id: 'ipAddress', label: 'IP Address', kind: 'text', section: 'module', get: (h) => str(h.data?.ipAddress) },
      { id: 'impact', label: 'Impact', kind: 'select', section: 'module', get: (h) => str(h.data?.impact) },
      { id: 'vendor', label: 'Vendor', kind: 'select', section: 'module', get: (h) => str(h.data?.vendor).map((v) => v.replace(/^V(EN|CAT)-\d+:\s*/, '')) },
      { id: 'location', label: 'Location', kind: 'select', section: 'module', get: (h) => str(h.data?.location) },
      ...customFields,
    ],
  },

  'Configuration Items': {
    tier1: ['ciType', 'status', 'hostName', 'ipAddress', 'usedBy', 'managedBy'],
    fields: [
      { id: 'ciType', label: 'CI Type', kind: 'select', section: 'common', get: (h) => str(h.data?.ciType ?? h.type) },
      { id: 'status', label: 'Status', kind: 'select', section: 'common', get: (h) => str(h.data?.status ?? (h.data?.agentOnline === undefined ? null : h.data.agentOnline ? 'Online' : 'Offline')) },
      { id: 'hostName', label: 'Host Name', kind: 'text', section: 'common', get: (h) => str(h.data?.hostName) },
      { id: 'ipAddress', label: 'IP Address', kind: 'text', section: 'common', get: (h) => str(h.data?.ipAddress) },
      { id: 'usedBy', label: 'Used By', kind: 'person', section: 'common', get: (h) => person(h.data?.usedBy) },
      { id: 'managedBy', label: 'Managed By', kind: 'person', section: 'common', get: (h) => person(h.data?.managedBy) },
      { id: 'managedByGroup', label: 'Managed By Group', kind: 'select', section: 'module', get: (h) => str(h.data?.managedByGroup) },
      { id: 'health', label: 'System Health', kind: 'select', section: 'module', options: ['Healthy', 'Warning', 'Critical'], dots: { Healthy: '#22C55E', Warning: '#F59E0B', Critical: '#EF4444' }, get: (h) => str(h.data?.systemHealth) },
      { id: 'remoteOffice', label: 'Remote Office', kind: 'select', section: 'module', get: (h) => str(h.data?.remoteOffice) },
    ],
  },

  Patches: {
    tier1: ['severity', 'approvalStatus', 'category', 'rebootRequired', 'released'],
    fields: [
      { id: 'severity', label: 'Severity', kind: 'select', section: 'common', options: ['Critical', 'Important', 'Moderate', 'Low', 'Unspecified'], dots: SEVERITY_DOTS, get: (h) => str(h.data?.severity) },
      { id: 'approvalStatus', label: 'Approval Status', kind: 'select', section: 'common', get: (h) => str(h.data?.approvalStatus ?? h.data?.status) },
      { id: 'category', label: 'Category', kind: 'select', section: 'module', get: (h) => str(h.data?.category) },
      { id: 'rebootRequired', label: 'Reboot Required', kind: 'select', section: 'module', options: ['Yes', 'No'], get: (h) => str(h.data?.rebootRequired) },
      { id: 'released', label: 'Release Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.releaseDate) },
      { id: 'policy', label: 'Deployment Policy', kind: 'select', section: 'module', get: (h) => str(h.data?.deploymentPolicy) },
      { id: 'recordType', label: 'Record Type', kind: 'select', section: 'common', options: ['Patch', 'Patch Deployment'], get: (h) => str(h.type) },
    ],
  },

  Vulnerabilities: {
    tier1: ['severity', 'exploitStatus', 'patchAvailability', 'category', 'published'],
    fields: [
      { id: 'severity', label: 'Severity', kind: 'select', section: 'common', options: ['Critical', 'High', 'Medium', 'Low'], dots: SEVERITY_DOTS, get: (h) => str(h.data?.severity) },
      { id: 'exploitStatus', label: 'Exploit Status', kind: 'select', section: 'module', options: ['Yes', 'No'], dots: { Yes: '#DC2626', No: '#94A3B8' }, get: (h) => (h.data?.exploitStatus ? str(h.data.exploitStatus) : h.data?.exploitedCves ? [h.data.exploitedCves.length ? 'Yes' : 'No'] : []) },
      { id: 'patchAvailability', label: 'Patch Availability', kind: 'select', section: 'module', options: ['Yes', 'No'], get: (h) => str(h.data?.patchAvailability) },
      { id: 'category', label: 'Category', kind: 'select', section: 'module', get: (h) => str(h.data?.category) },
      { id: 'published', label: 'Published Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.publishedDate) },
      { id: 'nvdStatus', label: 'NVD Status', kind: 'select', section: 'module', options: ['Modified', 'Analyzed', 'Awaiting Analysis'], get: (h) => str(h.data?.status) },
      { id: 'recordType', label: 'Record Type', kind: 'select', section: 'common', options: ['Vulnerability', 'Detected CVE'], get: (h) => str(h.type) },
    ],
  },

  // The Knowledge list shows ID, Subject and Created Date. ID and Subject are already covered by
  // text search, so Created Date is the only Tier 1 filter worth surfacing.
  Knowledge: {
    tier1: ['created'],
    fields: [
      { id: 'created', label: 'Created Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.created) },
      { id: 'updated', label: 'Updated Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.updated) },
      { id: 'category', label: 'Category', kind: 'select', section: 'module', get: (h) => str(h.data?.category) },
      { id: 'author', label: 'Author', kind: 'person', section: 'common', get: (h) => person(h.data?.author) },
    ],
  },

  Projects: {
    tier1: ['status', 'priority', 'owner', 'start', 'end'],
    fields: [
      { id: 'status', label: 'Status', kind: 'select', section: 'common', options: ['Planning', 'In Progress', 'On Hold', 'Completed'], dots: REQ_STATUS_DOTS, get: (h) => str(h.data?.status) },
      priorityField(['High', 'Medium', 'Low']),
      { id: 'owner', label: 'Owner', kind: 'person', section: 'common', get: (h) => person(h.data?.manager) },
      { id: 'start', label: 'Start Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.start) },
      { id: 'end', label: 'End Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.due) },
    ],
  },

  Users: {
    tier1: ['department', 'location'],
    fields: [
      { id: 'department', label: 'Department', kind: 'select', section: 'common', get: (h) => str(h.data?.department) },
      { id: 'location', label: 'Location', kind: 'select', section: 'common', get: (h) => str(h.data?.location) },
      { id: 'title', label: 'Job Title', kind: 'select', section: 'module', get: (h) => str(h.data?.title) },
    ],
  },

  'Reports & Dashboards': {
    tier1: ['kind', 'access', 'owner', 'updated'],
    fields: [
      { id: 'kind', label: 'Type', kind: 'select', section: 'common', options: ['Report', 'Dashboard'], get: (h) => str(h.data?.kind) },
      { id: 'access', label: 'Access', kind: 'select', section: 'module', options: ['Public', 'Restricted', 'Private'], get: (h) => str(h.data?.access) },
      { id: 'owner', label: 'Owner', kind: 'person', section: 'common', get: (h) => person(h.data?.owner) },
      { id: 'updated', label: 'Updated Date', kind: 'date', section: 'common', get: (h) => dateVal(h.data?.updated) },
    ],
  },
};

export const filterSetFor = (g: SearchGroup): GroupFilterSet | undefined => FILTER_SETS[g];
export const fieldFor = (g: SearchGroup, id: string): FilterField | undefined =>
  FILTER_SETS[g]?.fields.find((f) => f.id === id);

/** Options for a select/person field: fixed list where declared, otherwise whatever the matching
 *  records actually carry — so a picker never offers a value that returns nothing. */
export function optionsFor(g: SearchGroup, field: FilterField, hits: SearchHit[]): string[] {
  if (field.options) return field.options;
  const seen = new Set<string>();
  hits.forEach((h) => field.get(h).forEach((v) => seen.add(v)));
  const list = [...seen].sort((a, b) => a.localeCompare(b));
  // "Me" is worth having at the top of every person picker; the rest stay alphabetical.
  if (field.kind === 'person' && list.includes(CURRENT_USER.name)) {
    return [CURRENT_USER.name, ...list.filter((v) => v !== CURRENT_USER.name)];
  }
  return list;
}

// ── Applying ───────────────────────────────────────────────────────────────

const matchesOne = (hit: SearchHit, field: FilterField, values: string[]): boolean => {
  if (!values.length) return true; // a filter with no value chosen yet narrows nothing
  const actual = field.get(hit);
  if (field.kind === 'date') {
    const day = actual[0];
    if (!day) return false;
    const d = parseAnyDate(day);
    if (!d) return false;
    // Presets inside one date filter are OR'd like any other multi-value filter.
    return values.some((v) => {
      const r = dateRange(v);
      return !!r && d >= r.from && d <= r.to;
    });
  }
  if (field.kind === 'text') {
    return values.some((v) => actual.some((a) => a.toLowerCase().includes(v.toLowerCase())));
  }
  return values.some((v) => actual.includes(v));
};

/** AND across filters, OR within a filter's values — the same behaviour as the module lists. */
export function applyFilters(hits: SearchHit[], group: SearchGroup, filters: ActiveFilter[]): SearchHit[] {
  const active = filters.filter((f) => f.values.length);
  if (!active.length) return hits;
  return hits.filter((h) => active.every((f) => {
    const field = fieldFor(group, f.fieldId);
    return !field || matchesOne(h, field, f.values);
  }));
}

export const activeCount = (filters: ActiveFilter[] = []) => filters.filter((f) => f.values.length).length;
export const anyActive = (gf: GroupFilters) => Object.values(gf).some((fs) => activeCount(fs) > 0);

/** Human-readable value, e.g. `Status: Open` or `Priority: High +1`. */
export function chipLabel(field: FilterField, values: string[]): string {
  if (!values.length) return field.label;
  const first = values[0].startsWith('custom:') ? 'Custom range' : values[0];
  const shown = field.kind === 'person' && first === CURRENT_USER.name ? 'Me' : first;
  return values.length > 1 ? `${field.label}: ${shown} +${values.length - 1}` : `${field.label}: ${shown}`;
}

/** What gets handed to a module list on "See all N" — the query plus that group's filters. */
export function handoffSummary(group: SearchGroup, filters: ActiveFilter[] = []): string[] {
  return filters
    .filter((f) => f.values.length)
    .map((f) => {
      const field = fieldFor(group, f.fieldId);
      return field ? chipLabel(field, f.values) : f.fieldId;
    });
}

// ── Analytics ──────────────────────────────────────────────────────────────
// Instrumented so Product can check whether the Tier 1 assumptions hold. In this prototype the
// events go to an in-memory ring buffer readable from the demo panel rather than to a collector.

export type FilterEventName =
  | 'tier1_applied' | 'tier2_applied' | 'filter_removed' | 'filters_cleared'
  | 'picker_opened' | 'empty_after_filter' | 'see_all_with_filters' | 'search_with_filters';

export interface FilterEvent {
  name: FilterEventName;
  group?: SearchGroup;
  fieldId?: string;
  /** Number of active filters on that group at the time. */
  count?: number;
  at: number;
}

const EVENTS: FilterEvent[] = [];
let clock = 0;

export function trackFilter(e: Omit<FilterEvent, 'at'>) {
  // A counter, not Date.now(): ordering is all these events are read for, and a monotonic
  // counter keeps the buffer deterministic in tests.
  EVENTS.push({ ...e, at: ++clock });
  if (EVENTS.length > 200) EVENTS.shift();
}

export const filterEvents = (): FilterEvent[] => [...EVENTS].reverse();

/** Rolled-up counters — the shape the real collector would aggregate. */
export function filterAnalytics() {
  const byName = new Map<string, number>();
  const byField = new Map<string, number>();
  EVENTS.forEach((e) => {
    byName.set(e.name, (byName.get(e.name) ?? 0) + 1);
    if (e.fieldId && (e.name === 'tier1_applied' || e.name === 'tier2_applied')) {
      const key = `${e.group ?? '—'} · ${e.fieldId}`;
      byField.set(key, (byField.get(key) ?? 0) + 1);
    }
  });
  return {
    totals: [...byName.entries()].sort((a, b) => b[1] - a[1]),
    topFields: [...byField.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
}
