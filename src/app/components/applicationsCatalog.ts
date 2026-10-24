import { useSyncExternalStore } from 'react';
/* The applications installed on a host — the ONE source three screens read.
 *
 * They disagreed before this file existed: the Software tab listed eight applications from a
 * hardcoded array, the BOM tab built its scopes from an unrelated APP_PRODUCTS pool (Payments
 * Web, Ledger API …) sized `hash % 3`, and the dependency map took a third deterministic
 * subset. Same host, three answers, none of them wrong on its own terms.
 *
 * Deliberately dependency-free. bomData needs this list, and softwareApplicationsData imports
 * softwareBomData which imports bomData — so anything richer here would close an import cycle.
 * The richer per-application record lives in softwareApplicationsData and is built from this.
 */

export interface AppRecord {
  /** Software Catalog id. Installed software is a row on its host's Software tab, not a CI. */
  id: string;
  name: string;
  type: 'Third-Party' | 'OS' | 'System';
  version: string;
  publisher: string;
  /** Where the agent scans it. This IS the BOM scope path. */
  path: string;
  packages: number;
  components: number;
  category: string;
  softwareType: 'Managed' | 'Discovered' | 'Unmanaged';
  origin: 'Agent' | 'Manual';
  firstSeen: string;
  lastSeen: string;
  eosl: string | null;
}

/** Scope key used by the BOM engine — stable, derived from the name once. */
export const appKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const BASE_APPLICATIONS: AppRecord[] = [
  { id: 'SW-501', name: 'Docker Desktop', type: 'Third-Party', version: '4.82.0', publisher: 'Docker Inc.', path: 'C:\\Program Files\\Docker\\Docker', packages: 1, components: 120, category: 'Developer Tools', softwareType: 'Managed', origin: 'Agent', firstSeen: '12 Feb 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-502', name: 'Firefox', type: 'Third-Party', version: '153.0.4', publisher: 'Mozilla', path: 'C:\\Program Files\\Mozilla Firefox', packages: 1, components: 85, category: 'Browser', softwareType: 'Managed', origin: 'Agent', firstSeen: '28 Apr 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-503', name: '7-Zip', type: 'Third-Party', version: '26.02', publisher: 'Igor Pavlov', path: 'C:\\Program Files\\7-Zip', packages: 1, components: 12, category: 'Utilities', softwareType: 'Discovered', origin: 'Agent', firstSeen: '09 Nov 2025', lastSeen: 'Jun 15, 2026', eosl: null },
  { id: 'SW-504', name: 'Microsoft .NET Runtime', type: 'OS', version: '8.0.21', publisher: 'Microsoft', path: 'C:\\Program Files\\dotnet', packages: 1, components: 40, category: 'Runtime', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 Mar 2026', lastSeen: 'Jun 16, 2026', eosl: 'Nov 10, 2026' },
  { id: 'SW-505', name: 'Microsoft Visual C++ Runtime', type: 'OS', version: '14.x', publisher: 'Microsoft', path: 'C:\\Windows\\System32', packages: 1, components: 20, category: 'Runtime', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 Mar 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-506', name: 'Microsoft Edge', type: 'OS', version: '147.0.3912.98', publisher: 'Microsoft', path: 'C:\\Program Files (x86)\\Microsoft\\Edge', packages: 2, components: 52, category: 'Browser', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 May 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-507', name: 'Intel(R) PROSet/Wireless', type: 'System', version: '21.40.1.3406', publisher: 'Intel Corporation', path: 'C:\\Program Files\\Intel', packages: 2, components: 45, category: 'Driver', softwareType: 'Discovered', origin: 'Agent', firstSeen: '11 Nov 2024', lastSeen: 'Jun 14, 2026', eosl: 'Mar 31, 2026' },
  { id: 'SW-508', name: 'Check Point VPN', type: 'Third-Party', version: '98.61.4017', publisher: 'Check Point Software', path: 'C:\\Program Files\\CheckPoint\\VPN', packages: 1, components: 28, category: 'Security', softwareType: 'Unmanaged', origin: 'Manual', firstSeen: '16 Jan 2026', lastSeen: 'Jun 12, 2026', eosl: null },
];

/* ── Ingested applications ───────────────────────────────────────────────────
   An ingested BOM introduces an application the agent never found. It belongs on the host it
   was mapped to, in the Software tab AND in the BOM tab, marked Manual — otherwise ingesting
   produces a document nobody can see from the machine it describes. */

/** An application pinned to one host — ingested from a document, or declared by hand. */
export interface HostApp extends AppRecord { hostId: string }
export type IngestedApp = HostApp;

let ingested: HostApp[] = [];

/* ── Declared applications ───────────────────────────────────────────────────
   "Add product" in the BOM tab's Manage products drawer. Someone declares a path the agent
   should scan as its own product — that is software ON this host, so it belongs on the Software
   tab exactly as an ingested document does. Without it the drawer listed a product and the
   Software tab, describing the same machine, did not: the same disagreement this file exists
   to end, arriving through a different door.

   A declared product is NOT an ingest, and the difference is load-bearing: `bomForEndpoint`
   flips a host from Not Generated to Generated when it sees `origin: 'Manual'` AND
   `category: 'Ingested'`. A declared scope carries no document until the agent scans it, so it
   keeps its own category and cannot trip that flip. */
let declared: HostApp[] = [];

/** Declared products are Software Catalog entries too — they continue the SW-501…508 band. */
let declaredSeq = 508;

/* A counter rather than a list length: re-declaring a product supersedes it in place, which
   leaves the length untouched and would strand every subscriber on a stale render. */
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version += 1; listeners.forEach((l) => l()); };

/** Hosts are addressed as CI-### on BOM screens and EP-### by the agent — same machine. */
export const hostKey = (id: string) => (id || '').replace(/^(CI|EP)-/, '');

export function addIngestedApplication(a: {
  hostId: string; name: string; version: string; publisher?: string;
  path?: string; components: number; packages?: number;
}): IngestedApp {
  const rec: IngestedApp = {
    id: `SW-9${(ingested.length + 1).toString().padStart(2, '0')}`,
    hostId: hostKey(a.hostId),
    name: a.name,
    /* Ingested software is third-party by definition — an OS component would have come from
       the agent scanning the machine, not from a document someone uploaded. */
    type: 'Third-Party',
    version: a.version,
    publisher: a.publisher || 'Ingested',
    path: a.path || '—',
    packages: a.packages ?? 1,
    components: a.components,
    category: 'Ingested',
    softwareType: 'Unmanaged',
    origin: 'Manual',
    firstSeen: 'Just now',
    lastSeen: 'Just now',
    eosl: null,
  };
  // Re-ingesting the same product on the same host supersedes it rather than stacking.
  ingested = [rec, ...ingested.filter((x) => !(x.hostId === rec.hostId && x.name === rec.name))];
  emit();
  return rec;
}

/** A product declared by hand on a host — "Add product" in Manage products.
 *  `components` is passed in rather than computed: this module stays dependency-free, and the
 *  count belongs to bomData's scan model, which imports THIS file. */
export function addDeclaredApplication(a: {
  hostId: string; name: string; version?: string; path?: string;
  components?: number; packages?: number; publisher?: string; firstSeen?: string;
}): HostApp {
  const k = hostKey(a.hostId);
  const prior = declared.find((x) => x.hostId === k && x.name === a.name);
  const rec: HostApp = {
    // Keep the id across a re-declare, so anything already pointing at this CI still resolves.
    id: prior?.id ?? `SW-${++declaredSeq}`,
    hostId: k,
    name: a.name,
    /* Declared software is third-party by definition — an OS component would have come from the
       agent scanning the machine, not from a path someone typed into a form. */
    type: 'Third-Party',
    version: a.version || '—',
    publisher: a.publisher || '—',
    path: a.path || '—',
    packages: a.packages ?? 1,
    /* Nothing has been scanned yet, so zero is the honest count rather than a guess. */
    components: a.components ?? 0,
    category: 'Declared',
    softwareType: 'Unmanaged',
    origin: 'Manual',
    firstSeen: prior?.firstSeen ?? a.firstSeen ?? 'Just now',
    lastSeen: 'Just now',
    eosl: null,
  };
  // Re-declaring the same product on the same host supersedes it rather than stacking.
  declared = [rec, ...declared.filter((x) => !(x.hostId === k && x.name === a.name))];
  emit();
  return rec;
}

export const subscribeApplications = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const ingestedApplications = () => ingested;
export const declaredApplications = () => declared;

/** Every application on one host: the base estate plus anything ingested onto it.
 *  Every host runs the base set — which is exactly what the Software tab has always shown,
 *  and now what the BOM tab and the dependency map show too. */
export function applicationsOnHost(hostId: string): AppRecord[] {
  const k = hostKey(hostId);
  return [
    ...ingested.filter((i) => i.hostId === k),
    ...declared.filter((d) => d.hostId === k),
    ...BASE_APPLICATIONS,
  ];
}

/** Re-render hook: bumps whenever an application is ingested. Components that read
 *  `applicationsOnHost` call it so the list they show cannot go stale. */
export function useApplicationsVersion(): number {
  return useSyncExternalStore(subscribeApplications, () => version, () => version);
}
