/* Software Catalog entries — the products the asset Software tab lists.
 *
 * NOT CIs. Installed software stays a row on its host's Software tab; promoting each product to
 * a CI would spend a CMDB licence per product, and the CMDB has no Software Application type.
 * An entry can still be opened (packages, components, where it is installed) — as a catalog
 * record, not a configuration item. What holds a BOM is a product in BOM scope
 * (bomProductsData.ts) — also not a CI.
 *
 * Everything else about an application — its packages, its components, its CVEs — is derived
 * from the shared catalogs rather than stored again here, so the CI detail page and the asset
 * Software tab can never disagree about what an application contains.
 */

import { softwarePackages, softwareComponents } from './softwareBomData';
import { mockCis } from './CmdbListPage';

export type AppType = 'Third-Party' | 'OS' | 'System';

export interface SoftwareApplication {
  /** Software Catalog id (SW-###). */
  id: string;
  name: string;
  type: AppType;
  version: string;
  publisher: string;
  /** Counts the asset Software tab shows; the detail page lists exactly this many rows. */
  packages: number;
  components: number;
  category: string;
  softwareType: 'Managed' | 'Discovered' | 'Unmanaged';
  origin: 'Agent' | 'Manual';
  firstSeen: string;
  lastSeen: string;
  /** End of support — the one property with a real deadline attached to it. */
  eosl: string | null;
}

export const SOFTWARE_APPLICATIONS: SoftwareApplication[] = [
  { id: 'SW-501', name: 'Docker Desktop', type: 'Third-Party', version: '4.82.0', publisher: 'Docker Inc.', packages: 1, components: 120, category: 'Developer Tools', softwareType: 'Managed', origin: 'Agent', firstSeen: '12 Feb 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-502', name: 'Firefox', type: 'Third-Party', version: '153.0.4', publisher: 'Mozilla', packages: 1, components: 85, category: 'Browser', softwareType: 'Managed', origin: 'Agent', firstSeen: '28 Apr 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-503', name: '7-Zip', type: 'Third-Party', version: '26.02', publisher: 'Igor Pavlov', packages: 1, components: 12, category: 'Utilities', softwareType: 'Discovered', origin: 'Agent', firstSeen: '09 Nov 2025', lastSeen: 'Jun 15, 2026', eosl: null },
  { id: 'SW-504', name: 'Microsoft .NET Runtime', type: 'OS', version: '8.0.21', publisher: 'Microsoft', packages: 1, components: 40, category: 'Runtime', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 Mar 2026', lastSeen: 'Jun 16, 2026', eosl: 'Nov 10, 2026' },
  { id: 'SW-505', name: 'Microsoft Visual C++ Runtime', type: 'OS', version: '14.x', publisher: 'Microsoft', packages: 1, components: 20, category: 'Runtime', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 Mar 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-506', name: 'Microsoft Edge', type: 'OS', version: '147.0.3912.98', publisher: 'Microsoft', packages: 2, components: 52, category: 'Browser', softwareType: 'Managed', origin: 'Agent', firstSeen: '02 May 2026', lastSeen: 'Jun 16, 2026', eosl: null },
  { id: 'SW-507', name: 'Intel(R) PROSet/Wireless', type: 'System', version: '21.40.1.3406', publisher: 'Intel Corporation', packages: 2, components: 45, category: 'Driver', softwareType: 'Discovered', origin: 'Agent', firstSeen: '11 Nov 2024', lastSeen: 'Jun 14, 2026', eosl: 'Mar 31, 2026' },
  { id: 'SW-508', name: 'Check Point VPN', type: 'Third-Party', version: '98.61.4017', publisher: 'Check Point Software', packages: 1, components: 28, category: 'Security', softwareType: 'Unmanaged', origin: 'Manual', firstSeen: '16 Jan 2026', lastSeen: 'Jun 12, 2026', eosl: null },
];

export const appById = (id: string) => SOFTWARE_APPLICATIONS.find((a) => a.id === id);
export const appByName = (name: string) => SOFTWARE_APPLICATIONS.find((a) => a.name === name);

/* ── Derived detail ──────────────────────────────────────────────────────────
   Counts come from the row so the grid and the drawer agree; the ROWS come from the
   shared generators, which take that count and produce exactly that many. */
export const appPackages = (a: SoftwareApplication) => softwarePackages(a.name, a.version, a.packages);
export const appComponents = (a: SoftwareApplication) => softwareComponents(a.name, a.components);

/** CVEs this application carries, rolled up from the components it ships. */
export function appVulnerabilities(a: SoftwareApplication) {
  const out: { cve: string; component: string; version: string; severity: string }[] = [];
  for (const c of appComponents(a)) {
    for (const cve of c.cves ?? []) {
      if (out.some((x) => x.cve === cve && x.component === c.name)) continue;
      out.push({
        cve, component: c.name, version: c.version,
        // No CVSS in the catalog, so severity is read off the CVE's own year+id rather than
        // invented per render — stable, and never claims a score it does not have.
        severity: ['Critical', 'High', 'Medium'][[...cve].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 3],
      });
    }
  }
  return out;
}

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0);

/** Which CIs this application is installed on — the reason an application is a CI at all.
 *  Only machines can run software, so service and application CIs are never candidates. */
export function affectedCisFor(a: SoftwareApplication) {
  const hosts = mockCis.filter((c) => !['Base CI', 'Application', 'Software Application'].includes(c.ciType));
  const h = hash(a.name);
  const n = Math.max(2, Math.min(hosts.length, 2 + (h % (hosts.length - 1))));
  return hosts
    .filter((_, i) => (h + i * 7) % hosts.length < n)
    .slice(0, n)
    .map((c, i) => ({
      ci: c,
      installedOn: ['11 Nov 2024', '02 Mar 2026', '28 Apr 2026', '09 Nov 2025', '16 Jan 2026'][(h + i) % 5],
      /* Not every machine runs the same build — version drift across the estate is the
         thing this table exists to surface. */
      version: (h + i) % 4 === 0 ? a.version : `${a.version.split('.')[0]}.${(h + i) % 9}.0`,
    }));
}

/** The applications installed on one CI — the inverse of `affectedCisFor`, so the two can
 *  never disagree about who runs what. */
export function appsForCi(ciId: string) {
  return SOFTWARE_APPLICATIONS
    .map((a) => ({ app: a, hit: affectedCisFor(a).find((r) => r.ci.id === ciId) }))
    .filter((x): x is { app: SoftwareApplication; hit: NonNullable<typeof x.hit> } => !!x.hit)
    .map(({ app, hit }) => ({ app, version: hit.version, installedOn: hit.installedOn }));
}
