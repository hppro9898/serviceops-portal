/* Global Search — the searchable index, the query language, and the ranking.
 *
 * "One input. Find anything. Go anywhere." Global Search answers "I know it exists, take me to
 * it"; Ask AI answers "help me understand this". Everything here serves the first question:
 * deterministic known-item retrieval and navigation.
 *
 * The index is built from the SAME mock pools the list pages render, so a record found here is
 * the record that opens — there is no second, drifting copy of the data. It is built lazily on
 * first search because the list pages import the drawer host, which imports the list pages; a
 * module-level build would run inside that cycle.
 */

import type { StackModule } from './DrawerStack';
import { ADMIN_SECTIONS } from './adminData';
import { MOCK_TICKETS } from './TicketListPage';
import { mockProblems } from './ProblemListPage';
import { mockChanges } from './ChangeListPage';
import { mockReleases } from './ReleaseListPage';
import { mockAssets as mockHardware } from './HardwareAssetsListPage';
import { mockAssets as mockSoftware } from './SoftwareAssetsListPage';
import { mockAssets as mockNonIt } from './NonItAssetsListPage';
import { mockAssets as mockConsumable } from './ConsumableAssetsListPage';
import { mockLicenses } from './SoftwareLicensesListPage';
import { mockContracts } from './ContractsListPage';
import { mockPurchases } from './PurchasesListPage';
import { mockCis } from './CmdbListPage';
import { mockEndpoints } from './endpointsData';
import { mockPatches } from './PatchesListPage';
import { mockPatchDeployments } from './PatchDeploymentsListPage';
import { mockVulnerabilities } from './VulnerabilitiesListPage';
import { mockDetectedCves } from './DetectedCvesListPage';

// ── Groups ─────────────────────────────────────────────────────────────────
// Order is STABLE and never re-sorts by relevance — muscle memory is worth more than a few
// pixels of scroll. This is the spec's suggested order, with Patches and Vulnerabilities
// inserted after Configuration Items because this product genuinely has those modules and a
// service-desk technician searches them daily.

export const SEARCH_GROUPS = [
  'Requests',
  'Problems',
  'Changes',
  'Releases',
  'Assets',
  'Configuration Items',
  'Patches',
  'Vulnerabilities',
  'Knowledge',
  'Projects',
  'Users',
  'Reports & Dashboards',
  'Admin Settings',
  'Destinations',
] as const;

export type SearchGroup = (typeof SEARCH_GROUPS)[number];

/** Which page a group's "See all" hands off to, so the module list can refine what search found. */
export const GROUP_PAGE: Partial<Record<SearchGroup, string>> = {
  Requests: 'request',
  Problems: 'problem',
  Changes: 'change',
  Releases: 'release',
  Assets: 'hardware-assets',
  'Configuration Items': 'cmdb',
  Patches: 'patches',
  Vulnerabilities: 'vulnerabilities',
};

export interface HitField {
  label: string;
  value: string;
  /** Renders a colored dot before the value — status and priority read faster as colour. */
  dot?: string;
}

export interface SearchHit {
  /** Unique across the whole index. */
  key: string;
  group: SearchGroup;
  /** The record type shown on the row — "Incident", "Hardware Asset", "Endpoint", … */
  type: string;
  /** Displayed identifier. Destinations and settings have none. */
  id?: string;
  title: string;
  /** 2-3 fields that answer "is this the one?" without opening it. */
  fields: HitField[];
  /** Opens as a real detail drawer when the module has one. */
  module?: StackModule;
  data?: any;
  /** Navigates to a page instead (destinations, and group hand-offs). */
  page?: string;
  /** Settings and destinations that this prototype does not implement — they report their route. */
  href?: string;
  /** Icon key resolved by the overlay. */
  icon: IconKey;
  /** Everything matched against, lower-cased, joined. Built once at index time. */
  haystack: string;
  /** Operator-addressable facets. */
  facets: {
    type: string[];
    status?: string;
    people: string[];
    tags: string[];
  };
  /** Excluded by default; only surfaced with include:archived. */
  archived?: boolean;
  /** Visible to requesters. Almost nothing is. */
  requesterVisible?: boolean;
}

export type IconKey =
  | 'request' | 'problem' | 'change' | 'release' | 'assets' | 'cmdb' | 'patch'
  | 'vulnerability' | 'knowledge' | 'project' | 'user' | 'report' | 'admin'
  | 'destination' | 'endpoint' | 'software' | 'license' | 'contract' | 'purchase'
  | 'consumable' | 'nonit' | 'bom' | 'task' | 'dashboard';

// ── Signed-in user ─────────────────────────────────────────────────────────
// Rohan Mehta is the spec's persona and already a technician in this repo's mock data, so
// `assignee:me` resolves to a real person with real records rather than a synthetic account.

export const CURRENT_USER = { name: 'Rohan Mehta', initials: 'RM', email: 'rohan.mehta@motadata.com' };

// ── Role ───────────────────────────────────────────────────────────────────
// A tiny external store rather than context: the header pill has to hide itself for a role with
// no searchable modules (never show a search box that opens and then fails), and the header is
// rendered by 19 separate list pages that would each need the prop threaded through.

export type SearchRole = 'technician' | 'requester' | 'none';

let currentRole: SearchRole = 'technician';
const roleListeners = new Set<() => void>();

export const getSearchRole = () => currentRole;
export const setSearchRole = (r: SearchRole) => {
  if (r === currentRole) return;
  currentRole = r;
  roleListeners.forEach((f) => f());
};
export const subscribeSearchRole = (f: () => void) => {
  roleListeners.add(f);
  return () => { roleListeners.delete(f); };
};

// ── Mock pools this product does not have modules for ──────────────────────
// Knowledge, Projects, Users and Reports are real ServiceOps modules that this prototype has not
// built list pages for. They are indexed anyway — a technician searching "VPN" expects the
// knowledge article, and leaving the group out would misrepresent the feature.

interface KbArticle { id: string; title: string; category: string; author: string; created: string; updated: string; views: number }

const KB_ARTICLES: KbArticle[] = [
  { id: 'KB-1042', title: 'How to connect to the corporate VPN (Windows & macOS)', category: 'Network', author: 'Tabrez Khan', created: '02 Aug 2026', updated: '12 Jul 2026', views: 3410 },
  { id: 'KB-1038', title: 'VPN disconnects every few minutes — troubleshooting steps', category: 'Network', author: 'Neha Raje', created: '28 Jul 2026', updated: '02 Jul 2026', views: 1876 },
  { id: 'KB-1031', title: 'Reset your Active Directory password from the portal', category: 'Accounts', author: 'Farah Sheikh', created: '14 Jun 2026', updated: '28 Jun 2026', views: 5920 },
  { id: 'KB-1027', title: 'Request a new laptop — eligibility and approval flow', category: 'Hardware', author: 'Rohan Mehta', created: '02 Jun 2026', updated: '19 Jun 2026', views: 2140 },
  { id: 'KB-1019', title: 'Outlook not receiving mail after mailbox migration', category: 'Email', author: 'Vikram Sethi', created: '21 May 2026', updated: '11 Jun 2026', views: 1502 },
  { id: 'KB-1014', title: 'Printer setup guide — floor-wise queue names', category: 'Hardware', author: 'Imran Qureshi', created: '09 May 2026', updated: '04 Jun 2026', views: 986 },
  { id: 'KB-1008', title: 'Enable BitLocker on a corporate Windows laptop', category: 'Security', author: 'Neha Raje', created: '30 Apr 2026', updated: '27 May 2026', views: 1320 },
  { id: 'KB-0994', title: 'Wi-Fi troubleshooting on the 3rd floor access points', category: 'Network', author: 'Tabrez Khan', created: '11 Apr 2026', updated: '15 May 2026', views: 774 },
  { id: 'KB-0987', title: 'Onboarding checklist for a new employee (IT scope)', category: 'Onboarding', author: 'Rohan Mehta', created: '18 Mar 2026', updated: '30 Apr 2026', views: 2605 },
  { id: 'KB-0961', title: 'Requesting software: approved catalogue and licence rules', category: 'Software', author: 'Farah Sheikh', created: '02 Mar 2026', updated: '18 Apr 2026', views: 1189 },
  { id: 'KB-0940', title: 'Deprecated: legacy VPN client (Cisco AnyConnect) setup', category: 'Network', author: 'Vikram Sethi', created: '06 Nov 2025', updated: '09 Jan 2026', views: 210 },
];
/** The one deprecated article demonstrates include:archived rather than being decoration. */
const KB_ARCHIVED = new Set(['KB-0940']);

// Priority and start date exist because the Tier 1 filter set for Projects calls for them.
interface ProjectRec { id: string; name: string; status: string; priority: string; manager: string; start: string; due: string }

const PROJECTS: ProjectRec[] = [
  { id: 'PRJ-4', name: 'Datacenter migration to Mumbai DC2', status: 'In Progress', priority: 'High', manager: 'Vikram Sethi', start: '06 Apr 2026', due: '30 Sep 2026' },
  { id: 'PRJ-7', name: 'Windows 11 fleet upgrade', status: 'In Progress', priority: 'Medium', manager: 'Tabrez Khan', start: '18 May 2026', due: '15 Dec 2026' },
  { id: 'PRJ-9', name: 'VPN replacement — zero trust rollout', status: 'Planning', priority: 'High', manager: 'Neha Raje', start: '03 Aug 2026', due: '28 Feb 2027' },
  { id: 'PRJ-11', name: 'Service desk knowledge base refresh', status: 'In Progress', priority: 'Low', manager: 'Rohan Mehta', start: '13 Apr 2026', due: '31 Aug 2026' },
  { id: 'PRJ-12', name: 'Asset barcode re-tagging — all offices', status: 'On Hold', priority: 'Low', manager: 'Imran Qureshi', start: '26 Jan 2026', due: '—' },
  { id: 'PRJ-14', name: 'Office 365 tenant consolidation', status: 'Completed', priority: 'Medium', manager: 'Farah Sheikh', start: '05 Nov 2025', due: '12 Mar 2026' },
];

interface UserRec { name: string; title: string; department: string; email: string; location: string }

const USERS: UserRec[] = [
  { name: 'Rohan Mehta', title: 'Senior Service Desk Technician', department: 'IT Operations', email: 'rohan.mehta@motadata.com', location: 'Ahmedabad HQ' },
  { name: 'Tabrez Khan', title: 'Network Engineer', department: 'IT Operations', email: 'tabrez.khan@motadata.com', location: 'Ahmedabad HQ' },
  { name: 'Neha Raje', title: 'Security Analyst', department: 'Information Security', email: 'neha.raje@motadata.com', location: 'Pune Development Center' },
  { name: 'Vikram Sethi', title: 'Datacenter Lead', department: 'Infrastructure', email: 'vikram.sethi@motadata.com', location: 'Mumbai Office' },
  { name: 'Imran Qureshi', title: 'Facilities Manager', department: 'Facilities', email: 'imran.qureshi@motadata.com', location: 'Ahmedabad HQ' },
  { name: 'Farah Sheikh', title: 'Service Desk Manager', department: 'IT Operations', email: 'farah.sheikh@motadata.com', location: 'Bengaluru Campus' },
  { name: 'Priya Nair', title: 'Financial Analyst', department: 'Finance', email: 'priya.nair@motadata.com', location: 'Mumbai Office' },
  { name: 'Aarav Sharma', title: 'Product Designer', department: 'Design', email: 'aarav.sharma@motadata.com', location: 'Ahmedabad HQ' },
  { name: 'Karan Malhotra', title: 'Software Engineer', department: 'Engineering', email: 'karan.malhotra@motadata.com', location: 'Bengaluru Campus' },
  { name: 'Diya Kapoor', title: 'Marketing Executive', department: 'Marketing', email: 'diya.kapoor@motadata.com', location: 'Mumbai Office' },
  { name: 'Sophie Laurent', title: 'Regional IT Coordinator', department: 'IT Operations', email: 'sophie.laurent@motadata.com', location: 'Paris Office' },
  { name: 'Arjun Mehta', title: 'Database Administrator', department: 'Infrastructure', email: 'arjun.mehta@motadata.com', location: 'Pune Development Center' },
];

interface ReportRec { id: string; name: string; kind: 'Report' | 'Dashboard'; owner: string; access: 'Public' | 'Private' | 'Restricted'; updated: string }

const REPORTS: ReportRec[] = [
  { id: 'RPT-21', name: 'SLA compliance by technician group', kind: 'Report', owner: 'Farah Sheikh', access: 'Public', updated: '09 Aug 2026' },
  { id: 'RPT-18', name: 'Incident volume trend — last 12 months', kind: 'Report', owner: 'Farah Sheikh', access: 'Public', updated: '01 Aug 2026' },
  { id: 'DSH-6', name: 'Service Desk daily operations', kind: 'Dashboard', owner: 'Rohan Mehta', access: 'Public', updated: '10 Aug 2026' },
  { id: 'DSH-9', name: 'Patch compliance across the fleet', kind: 'Dashboard', owner: 'Neha Raje', access: 'Public', updated: '08 Aug 2026' },
  { id: 'RPT-24', name: 'Asset depreciation forecast FY27', kind: 'Report', owner: 'Priya Nair', access: 'Restricted', updated: '22 Jul 2026' },
  { id: 'RPT-31', name: 'VPN session failures by office', kind: 'Report', owner: 'Tabrez Khan', access: 'Public', updated: '05 Aug 2026' },
  // Private to its owner. Indexed but filtered before ranking, so it can never leak a title,
  // a count, or even the fact that it exists.
  { id: 'RPT-40', name: 'Board pack — IT spend and headcount', kind: 'Report', owner: 'Vikram Sethi', access: 'Private', updated: '30 Jul 2026' },
];

// ── Destinations ───────────────────────────────────────────────────────────
// Global Search is also navigation: a technician who types "purchases" wants the module, not a
// record inside it.

interface DestRec { name: string; page?: string; icon: IconKey; hint: string; requesterVisible?: boolean }

const DESTINATIONS: DestRec[] = [
  { name: 'Requests', page: 'request', icon: 'request', hint: 'Incidents and service requests', requesterVisible: true },
  { name: 'Problems', page: 'problem', icon: 'problem', hint: 'Root-cause records' },
  { name: 'Changes', page: 'change', icon: 'change', hint: 'Change records and approvals' },
  { name: 'Releases', page: 'release', icon: 'release', hint: 'Release planning and deployment' },
  { name: 'Hardware Assets', page: 'hardware-assets', icon: 'assets', hint: 'Laptops, servers, network gear' },
  { name: 'Software Assets', page: 'software-assets', icon: 'software', hint: 'Discovered and managed software' },
  { name: 'Non-IT Assets', page: 'non-it-assets', icon: 'nonit', hint: 'Furniture, vehicles, equipment' },
  { name: 'Consumable Assets', page: 'consumable-assets', icon: 'consumable', hint: 'Stock and peripherals' },
  { name: 'Software Licenses', page: 'software-licenses', icon: 'license', hint: 'Entitlements and compliance' },
  { name: 'Contracts', page: 'contracts', icon: 'contract', hint: 'Vendor agreements and renewals' },
  { name: 'Purchases', page: 'purchases', icon: 'purchase', hint: 'Purchase orders and settlements' },
  { name: 'CMDB', page: 'cmdb', icon: 'cmdb', hint: 'Configuration items and dependencies' },
  { name: 'Patches', page: 'patches', icon: 'patch', hint: 'Patch catalogue' },
  { name: 'Patch Deployment', page: 'patch-deployments', icon: 'patch', hint: 'Deployment runs' },
  { name: 'Endpoint', page: 'endpoints', icon: 'endpoint', hint: 'Agent-managed machines' },
  { name: 'Vulnerabilities', page: 'vulnerabilities', icon: 'vulnerability', hint: 'Detected vulnerability patches' },
  { name: 'Detected CVEs', page: 'detected-cves', icon: 'vulnerability', hint: 'CVE catalogue' },
  { name: 'BOM Applications', page: 'bom', icon: 'bom', hint: 'Applications in BOM scope — Endpoint or Ingest, one licence each' },
  { name: 'Admin', page: 'admin', icon: 'admin', hint: 'All ServiceOps settings' },
  { name: 'Knowledge', icon: 'knowledge', hint: 'Knowledge base', requesterVisible: true },
  { name: 'Projects', icon: 'project', hint: 'Project delivery' },
  { name: 'Reports', icon: 'report', hint: 'Reports and dashboards' },
  { name: 'My Tasks', icon: 'task', hint: 'Tasks assigned to you', requesterVisible: true },
  { name: 'My Approvals', icon: 'task', hint: 'Approvals waiting on you' },
  { name: 'Dashboard', icon: 'dashboard', hint: 'Your landing dashboard', requesterVisible: true },
];

// ── Index ──────────────────────────────────────────────────────────────────

const norm = (s: unknown) => (typeof s === 'string' ? s : s == null ? '' : String(s));

const STATUS_DOT: Record<string, string> = {
  open: '#3D8BD0', 'in progress': '#F59E0B', pending: '#F59E0B', 'pending qa': '#F59E0B',
  completed: '#22C55E', closed: '#94A3B8', cancelled: '#94A3B8', resolved: '#22C55E',
  'in use': '#22C55E', available: '#3D8BD0', 'in stock': '#3D8BD0', expired: '#EF4444',
  active: '#22C55E', inactive: '#94A3B8', disabled: '#94A3B8', 'not started': '#94A3B8',
  operational: '#94A3B8', healthy: '#22C55E', warning: '#F59E0B', critical: '#EF4444',
};
const PRIORITY_DOT: Record<string, string> = {
  urgent: '#EF4444', p1: '#EF4444', high: '#EF4444',
  p2: '#F59E0B', medium: '#F59E0B',
  p3: '#3D8BD0', low: '#22C55E', p4: '#22C55E',
};
const SEVERITY_DOT: Record<string, string> = {
  critical: '#DC2626', important: '#EA580C', high: '#EA580C',
  moderate: '#F59E0B', medium: '#F59E0B', low: '#22C55E', unspecified: '#94A3B8',
};

const dotFor = (map: Record<string, string>, v: string) => map[v.toLowerCase()] ?? '#94A3B8';

let INDEX: SearchHit[] | null = null;

/* Built lazily and cached. The dynamic requires keep this module out of the list-page /
 * drawer-host import cycle — the same reason DrawerStack's REL_MAP uses lazy getters. */
function buildIndex(): SearchHit[] {
  const hits: SearchHit[] = [];

  const push = (h: Omit<SearchHit, 'haystack'> & { extra?: string[] }) => {
    const { extra, ...rest } = h;
    hits.push({
      ...rest,
      haystack: [
        rest.id, rest.title, rest.type,
        ...rest.fields.map((f) => f.value),
        ...rest.facets.people, ...rest.facets.tags, ...(extra ?? []),
      ].filter(Boolean).join(' ').toLowerCase(),
    });
  };

  // Requests. Service-request subjects read as requests, everything else as incidents — the
  // distinction is what a technician filters on with type:incident.
  MOCK_TICKETS.forEach((t: any) => {
    const isSr = /onboarding|allocation|request for|access|provision/i.test(t.subject);
    push({
      key: `request:${t.id}`, group: 'Requests', type: isSr ? 'Service Request' : 'Incident',
      id: t.id, title: t.subject, icon: 'request', module: 'request', data: t,
      fields: [
        { label: 'Status', value: t.status, dot: dotFor(STATUS_DOT, t.status) },
        { label: 'Assignee', value: t.assignedTo?.name ?? 'Unassigned' },
        { label: 'Requester', value: t.requester },
      ],
      facets: {
        type: isSr ? ['request', 'service-request', 'sr'] : ['incident', 'inc', 'request'],
        status: t.status, people: [t.assignedTo?.name, t.requester].filter(Boolean),
        tags: [norm(t.priority).toLowerCase()],
      },
      archived: t.status === 'Cancelled',
      requesterVisible: t.requester === CURRENT_USER.name,
      extra: [t.priority],
    });
  });

  mockProblems.forEach((p: any) => push({
    key: `problem:${p.id}`, group: 'Problems', type: 'Problem', id: p.id, title: p.subject,
    icon: 'problem', module: 'problem', data: p,
    fields: [
      { label: 'Status', value: p.status, dot: dotFor(STATUS_DOT, p.status) },
      { label: 'Assignee', value: p.assignee?.name ?? 'Unassigned' },
      { label: 'Priority', value: p.priority, dot: dotFor(PRIORITY_DOT, p.priority) },
    ],
    facets: { type: ['problem', 'prb', 'pbm'], status: p.status, people: [p.assignee?.name, p.requester].filter(Boolean), tags: [norm(p.priority).toLowerCase()] },
  }));

  mockChanges.forEach((c: any) => push({
    key: `change:${c.id}`, group: 'Changes', type: 'Change', id: c.id, title: c.subject,
    icon: 'change', module: 'change', data: c,
    fields: [
      { label: 'Status', value: c.status, dot: dotFor(STATUS_DOT, c.status.split(': ')[1] ?? c.status) },
      { label: 'Assignee', value: c.assignee?.name ?? 'Unassigned' },
      { label: 'Risk', value: c.changeRisk ?? '—' },
    ],
    facets: { type: ['change', 'chg'], status: c.status, people: [c.assignee?.name, c.requester].filter(Boolean), tags: [norm(c.changeType).toLowerCase(), norm(c.priority).toLowerCase()].filter(Boolean) },
  }));

  mockReleases.forEach((r: any) => push({
    key: `release:${r.id}`, group: 'Releases', type: 'Release', id: r.id, title: r.subject,
    icon: 'release', module: 'release', data: r,
    fields: [
      { label: 'Status', value: r.status, dot: dotFor(STATUS_DOT, r.status.split(': ')[1] ?? r.status) },
      { label: 'Assignee', value: r.assignee?.name ?? 'Unassigned' },
      { label: 'Type', value: r.releaseType ?? '—' },
    ],
    facets: { type: ['release', 'rel'], status: r.status, people: [r.assignee?.name, r.requester].filter(Boolean), tags: [norm(r.releaseType).toLowerCase()].filter(Boolean) },
  }));

  // Assets — one group covering the four asset types plus the procurement records, each keeping
  // its own type label on the row. A 15th group per record type would break the stable order
  // for no gain: the row already says what it is.
  mockHardware.forEach((a: any) => push({
    key: `hw:${a.id}`, group: 'Assets', type: 'Hardware Asset', id: a.id, title: a.name,
    icon: 'assets', module: 'hardware-assets', data: a,
    fields: [
      { label: 'Status', value: a.status, dot: dotFor(STATUS_DOT, a.status) },
      { label: 'Host', value: a.hostName },
      { label: 'Managed by', value: a.managedBy?.name ?? 'Unassigned' },
    ],
    facets: { type: ['asset', 'hardware', 'hw'], status: a.status, people: [a.managedBy?.name, a.usedBy?.label].filter(Boolean), tags: [norm(a.assetType).toLowerCase()] },
    extra: [a.ipAddress, a.serialNumber, a.assetType],
  }));

  mockSoftware.forEach((a: any) => push({
    key: `sw:${a.id}`, group: 'Assets', type: 'Software Asset', id: a.id, title: a.name,
    icon: 'software', module: 'software-assets', data: a,
    fields: [
      { label: 'Status', value: a.status, dot: dotFor(STATUS_DOT, a.status) },
      { label: 'Version', value: a.version },
      { label: 'Managed by', value: a.managedBy?.name ?? 'Unassigned' },
    ],
    facets: { type: ['asset', 'software', 'sw'], status: a.status, people: [a.managedBy?.name].filter(Boolean), tags: [norm(a.softwareType).toLowerCase(), norm(a.softwareCategory).toLowerCase()] },
  }));

  mockNonIt.forEach((a: any) => push({
    key: `nonit:${a.id}`, group: 'Assets', type: 'Non-IT Asset', id: a.id, title: a.name,
    icon: 'nonit', module: 'non-it-assets', data: a,
    fields: [
      { label: 'Status', value: a.status, dot: dotFor(STATUS_DOT, a.status) },
      { label: 'Type', value: a.assetType },
      { label: 'Used by', value: a.usedBy ?? '—' },
    ],
    facets: { type: ['asset', 'non-it', 'nonit'], status: a.status, people: [a.managedBy?.name, a.usedBy].filter(Boolean), tags: [norm(a.assetType).toLowerCase()] },
  }));

  mockConsumable.forEach((a: any) => push({
    key: `con:${a.id}`, group: 'Assets', type: 'Consumable', id: a.id, title: a.name,
    icon: 'consumable', module: 'consumable-assets', data: a,
    fields: [
      { label: 'Available', value: `${a.availableQuantity} in stock` },
      { label: 'Type', value: a.assetType },
      { label: 'Location', value: a.location },
    ],
    facets: { type: ['asset', 'consumable'], people: [a.managedBy?.name].filter(Boolean), tags: [...(a.tags ?? []).map((t: string) => t.toLowerCase()), norm(a.assetType).toLowerCase()] },
  }));

  mockLicenses.forEach((l: any) => push({
    key: `lic:${l.id}`, group: 'Assets', type: 'Software License', id: l.id, title: l.name,
    icon: 'license', module: 'software-licenses', data: l,
    fields: [
      { label: 'Product', value: l.product },
      { label: 'Allocated', value: `${l.allocationCount ?? 0} of ${l.purchaseCount ?? 0}` },
      { label: 'Expires', value: l.expiryDate ?? '—' },
    ],
    facets: { type: ['asset', 'license', 'licence'], people: [], tags: [norm(l.licenseType).toLowerCase()] },
  }));

  mockContracts.forEach((c: any) => push({
    key: `contract:${c.id}`, group: 'Assets', type: 'Contract', id: c.id, title: c.name,
    icon: 'contract', module: 'contracts', data: c,
    fields: [
      { label: 'Status', value: c.status, dot: dotFor(STATUS_DOT, c.status) },
      { label: 'Vendor', value: c.vendor.replace(/^VEN-\d+:\s*/, '') },
      { label: 'Expires', value: c.endDate },
    ],
    facets: { type: ['asset', 'contract'], status: c.status, people: [], tags: [norm(c.contractType).toLowerCase()] },
    archived: c.status === 'Expired',
  }));

  mockPurchases.forEach((p: any) => push({
    key: `po:${p.id}`, group: 'Assets', type: 'Purchase Order', id: p.id, title: p.name,
    icon: 'purchase', module: 'purchases', data: p,
    fields: [
      { label: 'Status', value: p.status, dot: dotFor(STATUS_DOT, p.status) },
      { label: 'Vendor', value: p.vendor.replace(/^VCAT-\d+:\s*/, '') },
      { label: 'Required by', value: p.requiredBy },
    ],
    facets: { type: ['asset', 'purchase', 'po'], status: p.status, people: [p.owner].filter(Boolean), tags: [] },
    extra: [p.orderNumber],
  }));

  // Configuration Items — base CIs and the agent-managed endpoints, which are CIs in this
  // product (the BOM listing calls them "Agent CIs").
  mockCis.forEach((c: any) => push({
    key: `ci:${c.id}`, group: 'Configuration Items', type: c.ciType, id: c.id, title: c.name,
    icon: 'cmdb', module: 'cmdb', data: c,
    fields: [
      { label: 'Status', value: c.status, dot: dotFor(STATUS_DOT, c.status) },
      { label: 'Host', value: c.hostName },
      { label: 'IP', value: c.ipAddress },
    ],
    facets: { type: ['ci', 'cmdb', 'configuration-item'], status: c.status, people: [c.managedBy?.name, c.usedBy].filter(Boolean), tags: [norm(c.ciType).toLowerCase()] },
  }));

  mockEndpoints.forEach((e: any) => push({
    key: `ep:${e.id}`, group: 'Configuration Items', type: 'Endpoint', id: e.id, title: e.hostName,
    icon: 'endpoint', module: 'endpoints', data: e,
    fields: [
      { label: 'Health', value: e.systemHealth ?? 'Unknown', dot: dotFor(STATUS_DOT, e.systemHealth ?? '') },
      { label: 'OS', value: e.osName },
      { label: 'Office', value: e.remoteOffice ?? '—' },
    ],
    facets: { type: ['ci', 'endpoint', 'ep'], status: e.agentOnline ? 'Online' : 'Offline', people: [], tags: (e.tags ?? []).map((t: string) => t.toLowerCase()) },
    extra: [e.ipAddress, e.version],
  }));

  mockPatches.forEach((p: any) => push({
    key: `patch:${p.id}`, group: 'Patches', type: 'Patch', id: p.id, title: p.name,
    icon: 'patch', module: 'patches', data: p,
    fields: [
      { label: 'Severity', value: p.severity, dot: dotFor(SEVERITY_DOT, p.severity) },
      { label: 'Missing on', value: p.missingSystem == null ? '—' : `${p.missingSystem} endpoints` },
      { label: 'Approval', value: p.approvalStatus },
    ],
    facets: { type: ['patch', 'pch'], status: p.approvalStatus, people: [], tags: [norm(p.category).toLowerCase(), norm(p.severity).toLowerCase()] },
  }));

  mockPatchDeployments.forEach((d: any) => push({
    key: `pdr:${d.id}`, group: 'Patches', type: 'Patch Deployment', id: d.id, title: d.name,
    icon: 'patch', module: 'patch-deployments', data: d,
    fields: [
      { label: 'Status', value: d.status, dot: dotFor(STATUS_DOT, d.status) },
      { label: 'Policy', value: d.deploymentPolicy },
      { label: 'Install after', value: d.installAfter ?? 'Immediate' },
    ],
    facets: { type: ['patch', 'deployment', 'pdr'], status: d.status, people: [], tags: [] },
  }));

  mockVulnerabilities.forEach((v: any) => push({
    key: `vuln:${v.id}`, group: 'Vulnerabilities', type: 'Vulnerability', id: v.id, title: v.name,
    icon: 'vulnerability', module: 'vulnerabilities', data: v,
    fields: [
      { label: 'Severity', value: v.severity, dot: dotFor(SEVERITY_DOT, v.severity) },
      { label: 'CVSS', value: v.cvssScore ? String(v.cvssScore) : '—' },
      { label: 'Impacted', value: `${v.impactedEndpoints} endpoints` },
    ],
    facets: { type: ['vulnerability', 'vuln'], people: [], tags: [norm(v.category).toLowerCase(), norm(v.severity).toLowerCase()] },
    extra: [...(v.exploitedCves ?? []), ...(v.nonExploitedCves ?? [])],
  }));

  mockDetectedCves.forEach((c: any) => push({
    key: `cve:${c.id}`, group: 'Vulnerabilities', type: 'Detected CVE', id: c.id, title: c.description,
    icon: 'vulnerability', module: 'detected-cves', data: c,
    fields: [
      { label: 'Severity', value: c.severity, dot: dotFor(SEVERITY_DOT, c.severity) },
      { label: 'CVSS', value: String(c.cvssScore) },
      { label: 'Exploited', value: c.exploitStatus === 'Yes' ? 'Yes' : 'No' },
    ],
    facets: { type: ['vulnerability', 'cve'], status: c.status, people: [], tags: [norm(c.severity).toLowerCase(), norm(c.cweId).toLowerCase()] },
  }));

  KB_ARTICLES.forEach((k) => push({
    key: `kb:${k.id}`, group: 'Knowledge', type: 'Knowledge Article', id: k.id, title: k.title,
    icon: 'knowledge', href: `/knowledge/${k.id}`, data: k,
    fields: [
      { label: 'Category', value: k.category },
      { label: 'Author', value: k.author },
      { label: 'Updated', value: k.updated },
    ],
    facets: { type: ['knowledge', 'kb', 'article'], people: [k.author], tags: [k.category.toLowerCase()] },
    archived: KB_ARCHIVED.has(k.id),
    requesterVisible: true,
  }));

  PROJECTS.forEach((p) => push({
    key: `prj:${p.id}`, group: 'Projects', type: 'Project', id: p.id, title: p.name,
    icon: 'project', href: `/project/${p.id}`, data: p,
    fields: [
      { label: 'Status', value: p.status, dot: dotFor(STATUS_DOT, p.status) },
      { label: 'Owner', value: p.manager },
      { label: 'Due', value: p.due },
    ],
    facets: { type: ['project', 'prj'], status: p.status, people: [p.manager], tags: [norm(p.priority).toLowerCase()] },
  }));

  USERS.forEach((u) => push({
    key: `user:${u.email}`, group: 'Users', type: 'User', title: u.name,
    icon: 'user', href: `/user/${u.email}`, data: u,
    fields: [
      { label: 'Title', value: u.title },
      { label: 'Department', value: u.department },
      { label: 'Location', value: u.location },
    ],
    facets: { type: ['user', 'person', 'people'], people: [u.name], tags: [u.department.toLowerCase()] },
    extra: [u.email],
  }));

  REPORTS.forEach((r) => push({
    key: `rpt:${r.id}`, group: 'Reports & Dashboards', type: r.kind, id: r.id, title: r.name,
    icon: r.kind === 'Dashboard' ? 'dashboard' : 'report', href: `/${r.kind.toLowerCase()}/${r.id}`, data: r,
    fields: [
      { label: 'Owner', value: r.owner },
      { label: 'Access', value: r.access },
      { label: 'Updated', value: r.updated },
    ],
    // Private reports belong to their owner alone; `visibleTo` drops them before ranking, so no
    // count, title or hint of their existence ever reaches the UI.
    facets: { type: ['report', 'dashboard'], people: [r.owner], tags: [r.access.toLowerCase()] },
  }));

  // Admin settings — the real 164-card registry the Admin hub renders, so a technician can jump
  // straight to "Business Hours" without knowing which of the 24 sections holds it.
  ADMIN_SECTIONS.forEach((s) => s.cards.forEach((c) => push({
    key: `admin:${s.key}:${c.title}`, group: 'Admin Settings', type: s.title, title: c.title,
    icon: 'admin', page: 'admin', href: c.href,
    fields: [{ label: 'Section', value: s.title }],
    facets: { type: ['admin', 'setting', 'settings'], people: [], tags: [] },
    extra: [c.desc, s.title],
  })));

  DESTINATIONS.forEach((d) => push({
    key: `dest:${d.name}`, group: 'Destinations', type: 'Destination', title: d.name,
    icon: d.icon, page: d.page, href: d.page ? undefined : `/${d.name.toLowerCase().replace(/\s+/g, '-')}`,
    fields: [{ label: '', value: d.hint }],
    facets: { type: ['destination', 'page', 'module'], people: [], tags: [] },
    requesterVisible: d.requesterVisible,
  }));

  return hits;
}

export const searchIndex = (): SearchHit[] => (INDEX ??= buildIndex());

/** Private reports are removed from the searchable universe entirely, not hidden in the UI. */
const visibleTo = (h: SearchHit, role: SearchRole): boolean => {
  if (h.group === 'Reports & Dashboards') {
    const access = h.fields.find((f) => f.label === 'Access')?.value;
    const owner = h.fields.find((f) => f.label === 'Owner')?.value;
    if (access === 'Private' && owner !== CURRENT_USER.name) return false;
    if (access === 'Restricted' && role !== 'technician') return false;
  }
  // A requester's universe is their own requests, the knowledge base, and a few destinations —
  // not a narrower view of the technician's, a different one.
  if (role === 'requester') return !!h.requesterVisible;
  return true;
};

// ── Query language ─────────────────────────────────────────────────────────

export interface ParsedQuery {
  /** Free text with every operator token removed. */
  text: string;
  terms: string[];
  types: string[];
  statuses: string[];
  assignees: string[];
  people: string[];
  tags: string[];
  includeArchived: boolean;
  /** Every operator token, for rendering them back as removable chips. */
  chips: { raw: string; label: string; kind: 'type' | 'status' | 'assignee' | 'person' | 'tag' | 'include' }[];
}

const OPERATOR_RE = /(\w+):("[^"]+"|\S+)|@(\S+)|#(\S+)/g;

export function parseQuery(raw: string): ParsedQuery {
  const q: ParsedQuery = { text: '', terms: [], types: [], statuses: [], assignees: [], people: [], tags: [], includeArchived: false, chips: [] };
  const rest = raw.replace(OPERATOR_RE, (match, key, value, at, hash) => {
    const strip = (v: string) => v.replace(/^"|"$/g, '').toLowerCase();
    if (at) { q.people.push(strip(at)); q.chips.push({ raw: match, label: `@${at}`, kind: 'person' }); return ' '; }
    if (hash) { q.tags.push(strip(hash)); q.chips.push({ raw: match, label: `#${hash}`, kind: 'tag' }); return ' '; }
    const k = String(key).toLowerCase();
    const v = strip(String(value));
    switch (k) {
      case 'type': q.types.push(v); q.chips.push({ raw: match, label: `type: ${v}`, kind: 'type' }); return ' ';
      case 'status': q.statuses.push(v); q.chips.push({ raw: match, label: `status: ${v}`, kind: 'status' }); return ' ';
      case 'assignee': case 'assigned': q.assignees.push(v); q.chips.push({ raw: match, label: `assignee: ${v}`, kind: 'assignee' }); return ' ';
      case 'include': if (v === 'archived') { q.includeArchived = true; q.chips.push({ raw: match, label: 'include: archived', kind: 'include' }); return ' '; } return match;
      default: return match; // not an operator we know — leave it as free text
    }
  });
  q.text = rest.replace(/\s+/g, ' ').trim();
  q.terms = q.text.toLowerCase().split(' ').filter(Boolean);
  return q;
}

/** Identifier patterns this product actually issues. An exact hit is the fastest path there is. */
const ID_RE = /^(inc|sr|req|pbm|prb|chg|rel|ast|swast|non|con|lic|po|ci|ep|pch|pdr|cve|kb|prj|rpt|dsh|bs|rr|ar)-[\w-]+$/i;
export const looksLikeId = (s: string) => ID_RE.test(s.trim());

// ── Ranking ────────────────────────────────────────────────────────────────

function scoreHit(h: SearchHit, q: ParsedQuery): number {
  let score = 0;
  const title = h.title.toLowerCase();
  const id = (h.id ?? '').toLowerCase();

  for (const term of q.terms) {
    if (id === term) score += 1000;
    else if (id.includes(term)) score += 120;
    if (title === term) score += 200;
    else if (title.startsWith(term)) score += 60;
    else if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) score += 40;
    else if (title.includes(term)) score += 24;
    else if (h.haystack.includes(term)) score += 8;
    else return -1; // every term must match somewhere — AND, not OR
  }

  // Destinations and settings are navigation; when someone types a module name they almost
  // always mean "go there", so a close name match outranks records that merely mention it.
  if (h.group === 'Destinations' && q.terms.length && title.startsWith(q.terms[0])) score += 150;
  if (h.group === 'Admin Settings' && q.terms.length && title.startsWith(q.terms[0])) score += 60;

  return score;
}

const matchesFacets = (h: SearchHit, q: ParsedQuery): boolean => {
  if (q.types.length && !q.types.some((t) => h.facets.type.includes(t))) return false;
  if (q.statuses.length) {
    const s = (h.facets.status ?? '').toLowerCase();
    if (!q.statuses.some((want) => s.includes(want))) return false;
  }
  if (q.assignees.length) {
    const people = h.facets.people.map((p) => p.toLowerCase());
    const ok = q.assignees.some((a) => {
      const want = a === 'me' ? CURRENT_USER.name.toLowerCase() : a;
      return people.some((p) => p.includes(want));
    });
    if (!ok) return false;
  }
  if (q.people.length) {
    const people = h.facets.people.map((p) => p.toLowerCase().replace(/\s+/g, ''));
    if (!q.people.some((want) => people.some((p) => p.includes(want.replace(/\s+/g, ''))))) return false;
  }
  if (q.tags.length && !q.tags.every((t) => h.facets.tags.includes(t))) return false;
  if (h.archived && !q.includeArchived) return false;
  return true;
};

export interface GroupResult {
  group: SearchGroup;
  hits: SearchHit[];
  /** Before per-group truncation, so "See all 47" tells the truth. */
  total: number;
  /** Every match in this group, in rank order. Filtering runs over this and re-truncates, so a
   *  filter can surface a record that was previously below the fold. */
  all: SearchHit[];
}

export interface SearchResult {
  parsed: ParsedQuery;
  groups: GroupResult[];
  /** Total across every group, before truncation. */
  total: number;
  /** Promoted above the groups: an exact identifier, or a result far ahead of the rest. */
  dominant: SearchHit | null;
  dominantReason: 'id' | 'relevance' | null;
  /** True when the raw match count exceeded the hard cap, so the UI can say so out loud. */
  capped: boolean;
}

export const PER_GROUP = 4;
const HARD_CAP = 50;

export function runSearch(raw: string, opts: { role?: SearchRole } = {}): SearchResult {
  const role = opts.role ?? getSearchRole();
  const parsed = parseQuery(raw);
  const empty: SearchResult = { parsed, groups: [], total: 0, dominant: null, dominantReason: null, capped: false };
  if (!parsed.terms.length && !parsed.chips.length) return empty;

  const scored: { hit: SearchHit; score: number }[] = [];
  for (const h of searchIndex()) {
    if (!visibleTo(h, role)) continue;
    if (!matchesFacets(h, parsed)) continue;
    // Operators alone are a valid query: "type:incident status:open" needs no free text.
    const score = parsed.terms.length ? scoreHit(h, parsed) : 1;
    if (score < 0) continue;
    scored.push({ hit: h, score });
  }
  scored.sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title));

  const total = scored.length;
  const capped = total > HARD_CAP;

  // An exact identifier is unambiguous — promote it and let Enter fire immediately.
  const idTerm = parsed.terms.find(looksLikeId);
  let dominant: SearchHit | null = null;
  let dominantReason: SearchResult['dominantReason'] = null;
  if (idTerm) {
    const exact = scored.find(({ hit }) => hit.id?.toLowerCase() === idTerm);
    if (exact) { dominant = exact.hit; dominantReason = 'id'; }
  }
  // Otherwise promote only a result that is genuinely ahead of the field. A "top result" that is
  // barely ahead teaches users not to trust Enter.
  if (!dominant && scored.length > 1 && scored[0].score >= 150 && scored[0].score >= scored[1].score * 2) {
    dominant = scored[0].hit;
    dominantReason = 'relevance';
  }

  const groups: GroupResult[] = [];
  for (const g of SEARCH_GROUPS) {
    const inGroup = scored.filter(({ hit }) => hit.group === g && hit !== dominant).map((s) => s.hit);
    if (!inGroup.length) continue;
    groups.push({ group: g, hits: inGroup.slice(0, PER_GROUP), total: inGroup.length, all: inGroup });
  }

  return { parsed, groups, total, dominant, dominantReason, capped };
}

/** Below the global-search threshold: recents, destinations and pinned items only — no
 *  cross-module fan-out for one or two characters. */
export function runLocalSearch(raw: string, opts: { role?: SearchRole } = {}): SearchHit[] {
  const role = opts.role ?? getSearchRole();
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const recent = new Set(recentKeys());
  return searchIndex()
    .filter((h) => (h.group === 'Destinations' || recent.has(h.key)) && visibleTo(h, role))
    .filter((h) => h.title.toLowerCase().includes(q) || (h.id ?? '').toLowerCase().includes(q))
    .slice(0, 8);
}

// ── Recents ────────────────────────────────────────────────────────────────
// Behavioural data, per user, clearable — the same treatment ServiceOps gives other activity
// history. localStorage stands in for the per-user/per-tenant store.

// Keyed by role because history belongs to a user, not a browser: switching between the
// technician and requester views must not show one's activity to the other.
const RECENT_RECORDS_KEY = () => `globalSearch:recentRecords:${currentRole}`;
const RECENT_QUERIES_KEY = () => `globalSearch:recentQueries:${currentRole}`;
const OPEN_COUNTS_KEY = () => `globalSearch:openCounts:${currentRole}`;

const read = <T,>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode — recents just don't persist */ }
};

export const recentKeys = (): string[] => read<string[]>(RECENT_RECORDS_KEY(), []);
export const recentRecords = (role: SearchRole = getSearchRole()): SearchHit[] => {
  const keys = recentKeys();
  const byKey = new Map(searchIndex().map((h) => [h.key, h]));
  return keys.map((k) => byKey.get(k)).filter((h): h is SearchHit => !!h && visibleTo(h, role)).slice(0, 8);
};
export const pushRecentRecord = (key: string) => {
  write(RECENT_RECORDS_KEY(), [key, ...recentKeys().filter((k) => k !== key)].slice(0, 12));
  const counts = read<Record<string, number>>(OPEN_COUNTS_KEY(), {});
  counts[key] = (counts[key] ?? 0) + 1;
  write(OPEN_COUNTS_KEY(), counts);
};

export const recentQueries = (): string[] => read<string[]>(RECENT_QUERIES_KEY(), []);
export const pushRecentQuery = (q: string) => {
  const t = q.trim();
  if (t.length < 2) return;
  write(RECENT_QUERIES_KEY(), [t, ...recentQueries().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6));
};
export const clearSearchHistory = () => {
  write(RECENT_QUERIES_KEY(), []);
  write(RECENT_RECORDS_KEY(), []);
  write(OPEN_COUNTS_KEY(), {});
};

/** Frequently opened records, ranked by open count. Ranking stays explainable: the row says why. */
export const frequentRecords = (role: SearchRole = getSearchRole()): SearchHit[] => {
  const counts = read<Record<string, number>>(OPEN_COUNTS_KEY(), {});
  const byKey = new Map(searchIndex().map((h) => [h.key, h]));
  return Object.entries(counts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => byKey.get(k))
    .filter((h): h is SearchHit => !!h && visibleTo(h, role))
    .slice(0, 4);
};

/** The destinations shown before anything is typed. Stable, not personalised — this is the part
 *  of the panel a user learns the position of. */
export const defaultDestinations = (role: SearchRole = getSearchRole()): SearchHit[] => {
  const wanted = role === 'requester'
    ? ['Requests', 'Knowledge', 'My Tasks', 'Dashboard']
    : ['Requests', 'Problems', 'Changes', 'Releases', 'Hardware Assets', 'CMDB', 'Knowledge', 'Reports', 'My Tasks', 'Admin'];
  const byName = new Map(searchIndex().filter((h) => h.group === 'Destinations').map((h) => [h.title, h]));
  return wanted.map((n) => byName.get(n)).filter((h): h is SearchHit => !!h);
};

// ── Operator help ──────────────────────────────────────────────────────────
// Shown to first-time users and offered as autocomplete, so nobody has to memorise syntax.

export const OPERATOR_HELP: { token: string; desc: string }[] = [
  { token: 'type:', desc: 'Limit to a record type — incident, problem, change, asset, ci, knowledge, patch' },
  { token: 'status:', desc: 'Limit by status — open, pending, closed, resolved' },
  { token: 'assignee:me', desc: 'Only records assigned to you' },
  { token: '@person', desc: 'Records involving a person' },
  { token: '#tag', desc: 'Records carrying a tag' },
  { token: 'include:archived', desc: 'Also search archived and cancelled records' },
];

export const EXAMPLE_QUERIES = [
  'INC-32',
  'type:problem status:open',
  'assignee:me',
  'VPN',
  'business hours',
];

/** Autocomplete for the token currently being typed. */
export function operatorSuggestions(raw: string): { insert: string; label: string; desc: string }[] {
  const token = raw.split(/\s+/).pop() ?? '';
  if (!token) return [];
  const lower = token.toLowerCase();

  // Half-typed value: "type:inc" → offer the matching types.
  const valueMatch = /^(type|status|assignee|include):(.*)$/i.exec(token);
  if (valueMatch) {
    const [, key, partial] = valueMatch;
    const values: Record<string, string[]> = {
      type: ['incident', 'request', 'problem', 'change', 'release', 'asset', 'ci', 'endpoint', 'patch', 'vulnerability', 'knowledge', 'project', 'user', 'report', 'admin'],
      status: ['open', 'in progress', 'pending', 'resolved', 'closed', 'cancelled'],
      assignee: ['me', 'Rohan Mehta', 'Tabrez Khan', 'Neha Raje', 'Unassigned'],
      include: ['archived'],
    };
    return (values[key.toLowerCase()] ?? [])
      .filter((v) => v.toLowerCase().startsWith(partial.toLowerCase()))
      .map((v) => ({ insert: `${key.toLowerCase()}:${v.includes(' ') ? `"${v}"` : v}`, label: `${key.toLowerCase()}:${v}`, desc: '' }))
      // Never suggest what is already typed — a completion that changes nothing reads as broken.
      .filter((s) => s.insert.toLowerCase() !== lower)
      .slice(0, 6);
  }

  // Two characters before offering operators — one letter matches too much to be a suggestion.
  if (lower.length < 2) return [];
  return OPERATOR_HELP
    .filter((o) => o.token.startsWith(lower) && o.token !== lower)
    .map((o) => ({ insert: o.token, label: o.token, desc: o.desc }));
}
