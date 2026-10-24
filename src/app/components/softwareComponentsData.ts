/* Software Components — the fleet rolled up the other way round.
 *
 * Configuration Items answers "what is on this CI". This answers "where does this component live",
 * which is the question you ask once a CVE lands: one row per component VERSION, with the
 * blast radius (how many CIs, how many products) beside it.
 *
 * Rows are reconciled from two sources — what the agent scanned and what arrived in an
 * ingested vendor SBOM — so a component can be attested by both, and `sources` says which. */

import { bomAdvisory, componentFix, bomComponents } from './bomData';
import type { BomComponent } from './bomData';
import { bomProducts, productKey, productBomTypes, productsVersion, affectedProducts } from './bomProductsData';

/* Trivy's package types (from the PURL): it never emits pkg:generic, so there is no "Generic". */
export type Ecosystem = 'Maven' | 'Npm' | 'Deb' | 'RPM' | 'Golang' | 'PyPI' | 'NuGet';
export type ComponentSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
export type ComponentSource = 'agent' | 'vendor';

export interface SoftwareComponent {
  id: string;
  name: string;
  ecosystem: Ecosystem;
  version: string;
  purl: string;
  /** CIs carrying this exact version, and the products on them that pull it in. A component
   *  reaches a CI through a product, so products is never below cis. */
  cis: number;
  products: number;
  /** The advisory ids Trivy matched to this exact name@version (CVE or GHSA). */
  cves: string[];
  vulnerabilities: number;
  /** The worst RATED severity among them (NVD → GHSA → vendor). 'None' when there are none —
   *  a clean component must not borrow a severity colour. */
  topSeverity: ComponentSeverity;
  /** On CISA's Known Exploited Vulnerabilities list — the platform's KEV enrichment, not a
   *  field of the Trivy document. */
  kev: boolean;
  /** Reachable from outside on at least one CI — the same finding is worse here. */
  internetFacing: boolean;
  /** The nearest version that clears every vulnerability on the row; null when there is none. */
  fixVersion: string | null;
  license: string;
  /** Copyleft or dual-licensed — the flag is a "legal should look", not a defect. */
  licenseFlag: boolean;
  sources: ComponentSource[];
}

/* Licence policy — ONE rule for the Dashboard's licence card and this list's Flagged licenses. */
export type LicencePolicy = 'denied' | 'restricted' | 'undeclared' | 'allowed';

/** Strong copyleft is denied outright: linking it into a distributed product forces the whole
 *  work under the same terms. Weak copyleft is restricted — usable, but only under review. */
const DENIED = /^(AGPL|GPL-3)/i;
const RESTRICTED = /^(LGPL|MPL|EPL|GPL-2|CDDL|CPL)/i;
const UNDECLARED = /^(unknown|undeclared|noassertion|)$/i;

export const licencePolicy = (licence: string | undefined): LicencePolicy => {
  const l = (licence ?? '').trim();
  if (UNDECLARED.test(l)) return 'undeclared';
  if (DENIED.test(l)) return 'denied';
  if (RESTRICTED.test(l)) return 'restricted';
  return 'allowed';
};

/** A licence that needs a legal read before shipping: denied or restricted by the policy above. */
export const licenceFlagged = (l: string) => { const p = licencePolicy(l); return p === 'denied' || p === 'restricted'; };

/* Ordered worst-first, which is the order the table opens on. */
type Authored = Omit<SoftwareComponent, 'vulnerabilities' | 'topSeverity' | 'kev' | 'fixVersion'>;

const RANK: Record<ComponentSeverity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1, None: 0 };
/* Count, top severity, KEV and fix are DERIVED from the advisories, never typed per row: a row
   that said "Critical" for a build whose real advisories are Medium was the drift this removes. */
const withAdvisories = (c: Authored): SoftwareComponent => {
  const adv = c.cves.map(bomAdvisory);
  return {
    ...c,
    vulnerabilities: c.cves.length,
    topSeverity: adv.reduce<ComponentSeverity>((top, a) => (a && RANK[a.severity] > RANK[top] ? a.severity : top), 'None'),
    kev: adv.some((a) => a?.kev),
    fixVersion: c.cves.length ? componentFix(c.cves, c.version) : null,
  };
};

const AUTHORED: Authored[] = [
  {
    id: 'CMP-000412', name: 'log4j-core', ecosystem: 'Maven', version: '2.14.1',
    purl: 'pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1',
    cis: 23, products: 31, cves: ['CVE-2021-44228', 'CVE-2021-45046', 'CVE-2021-44832'],
    internetFacing: true,
    license: 'Apache-2.0', licenseFlag: false, sources: ['agent', 'vendor'],
  },
  {
    id: 'CMP-000604', name: 'openssl', ecosystem: 'Deb', version: '3.0.1',
    purl: 'pkg:deb/ubuntu/openssl@3.0.1',
    cis: 142, products: 142, cves: ['CVE-2022-3602', 'CVE-2022-3786', 'CVE-2023-0286'],
    internetFacing: true,
    license: 'Apache-2.0', licenseFlag: false, sources: ['agent', 'vendor'],
  },
  {
    id: 'CMP-000617', name: 'jackson-databind', ecosystem: 'Maven', version: '2.12.3',
    purl: 'pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.12.3',
    cis: 44, products: 58, cves: ['CVE-2022-42003', 'CVE-2022-42004', 'CVE-2020-36518'],
    internetFacing: false,
    license: 'Apache-2.0', licenseFlag: false, sources: ['vendor'],
  },
  {
    id: 'CMP-000503', name: 'spring-core', ecosystem: 'Maven', version: '5.3.18',
    purl: 'pkg:maven/org.springframework/spring-core@5.3.18',
    cis: 31, products: 44, cves: ['CVE-2022-22968', 'CVE-2022-22970'],
    internetFacing: true,
    license: 'Apache-2.0', licenseFlag: false, sources: ['vendor'],
  },
  {
    id: 'CMP-000702', name: 'lodash', ecosystem: 'Npm', version: '4.17.20',
    purl: 'pkg:npm/lodash@4.17.20',
    cis: 67, products: 91, cves: ['CVE-2021-23337', 'CVE-2020-28500'],
    internetFacing: true,
    license: 'MIT', licenseFlag: false, sources: ['agent', 'vendor'],
  },
  {
    id: 'CMP-000418', name: 'xz-utils', ecosystem: 'Deb', version: '5.6.0',
    purl: 'pkg:deb/debian/xz-utils@5.6.0',
    cis: 8, products: 8, cves: ['CVE-2024-3094'],
    internetFacing: false,
    license: 'GPL-2.0-or-later', licenseFlag: true, sources: ['agent', 'vendor'],
  },
  {
    id: 'CMP-000511', name: 'commons-text', ecosystem: 'Maven', version: '1.9',
    purl: 'pkg:maven/org.apache.commons/commons-text@1.9',
    cis: 19, products: 23, cves: ['CVE-2022-42889'],
    internetFacing: false,
    license: 'Apache-2.0', licenseFlag: false, sources: ['agent', 'vendor'],
  },
  {
    id: 'CMP-000745', name: 'golang.org/x/crypto', ecosystem: 'Golang', version: '0.16.0',
    purl: 'pkg:golang/golang.org/x/crypto@0.16.0',
    cis: 28, products: 34, cves: ['CVE-2023-48795'],
    internetFacing: false,
    license: 'BSD-3-Clause', licenseFlag: false, sources: ['vendor'],
  },
  {
    id: 'CMP-000810', name: 'node-forge', ecosystem: 'Npm', version: '1.2.1',
    purl: 'pkg:npm/node-forge@1.2.1',
    cis: 12, products: 12, cves: ['CVE-2022-24771', 'CVE-2022-24772', 'CVE-2022-24773'],
    internetFacing: true,
    license: 'BSD-3-Clause OR GPL-2.0', licenseFlag: true, sources: ['agent'],
  },
  {
    id: 'CMP-000826', name: 'zlib', ecosystem: 'Deb', version: '1.2.11',
    purl: 'pkg:deb/ubuntu/zlib@1.2.11',
    cis: 156, products: 168, cves: ['CVE-2018-25032'],
    internetFacing: false,
    license: 'Zlib', licenseFlag: false, sources: ['agent', 'vendor'],
  },
  /* Two clean rows: a component with nothing against it must render every column's empty
     state honestly — no severity pill, no fix arrow — rather than only ever being seen
     in its alarming form. */
  {
    id: 'CMP-000933', name: 'requests', ecosystem: 'PyPI', version: '2.31.0',
    purl: 'pkg:pypi/requests@2.31.0',
    cis: 54, products: 61, cves: [],
    internetFacing: false,
    license: 'Apache-2.0', licenseFlag: false, sources: ['agent'],
  },
  {
    id: 'CMP-000957', name: 'Newtonsoft.Json', ecosystem: 'NuGet', version: '13.0.3',
    purl: 'pkg:nuget/Newtonsoft.Json@13.0.3',
    cis: 37, products: 45, cves: [],
    internetFacing: false,
    license: 'MIT', licenseFlag: false, sources: ['vendor'],
  },
];
export const SOFTWARE_COMPONENTS: SoftwareComponent[] = AUTHORED.map(withAdvisories);

/** Scope tabs. "Vulnerable" and "Known exploited" are the two questions this listing exists
 *  to answer quickly, so they are scopes rather than something to rebuild with a search. */
export const isVulnerable = (c: SoftwareComponent) => c.vulnerabilities > 0;
export const isKev = (c: SoftwareComponent) => c.kev;

/* ── The register: every component build any application's current SBOM carries ──────────────
 *
 * The authored rows above carry hand-checked facts; every other build is derived here from the
 * applications' SBOMs, so the Software components list, the application's component list and
 * the component page all address one component by ONE id. Rebuilt when BOM scope changes. */

/** Stable id for a build without an authored record — the same id the BOM Dashboard uses. */
export const derivedComponentId = (key: string) => {
  let h = 7;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `CMP-9${String(h % 99999).padStart(5, '0')}`;
};
const ECOSYSTEM_OF: Record<string, Ecosystem> = { maven: 'Maven', npm: 'Npm', deb: 'Deb', rpm: 'RPM', golang: 'Golang', pypi: 'PyPI', nuget: 'NuGet' };

let REGISTER: SoftwareComponent[] | null = null;
let REGISTER_V = -1;
export function allSoftwareComponents(): SoftwareComponent[] {
  if (REGISTER && REGISTER_V === productsVersion()) return REGISTER;
  const authored = new Map(SOFTWARE_COMPONENTS.map((c) => [`${c.name}@${c.version}`, c]));
  const builds = new Map<string, BomComponent>();
  for (const p of bomProducts()) {
    if (p.scanState === 'Queued' || !productBomTypes(p).includes('SBOM')) continue;
    for (const c of bomComponents(p.id, productKey(p))) {
      const key = `${c.name}@${c.version}`;
      if (!builds.has(key)) builds.set(key, c);
    }
  }
  REGISTER = [...builds.entries()].map(([key, c]) => {
    const known = authored.get(key);
    if (known) return { ...known, licenseFlag: licenceFlagged(known.license) };
    const hits = affectedProducts({ id: '', name: c.name, version: c.version, ecosystem: c.ecosystem });
    const sources = [...new Set(hits.map((h) => (h.product.source === 'Agent' ? 'agent' : 'vendor')))] as ComponentSource[];
    return withAdvisories({
      id: derivedComponentId(key), name: c.name, version: c.version,
      ecosystem: ECOSYSTEM_OF[c.ecosystem.toLowerCase()] ?? 'Deb', purl: c.purl,
      cis: new Set(hits.map((h) => h.product.agent?.id).filter(Boolean)).size, products: hits.length,
      cves: c.cves ?? [], internetFacing: false,
      license: c.license, licenseFlag: licenceFlagged(c.license), sources: sources.length ? sources : ['agent'],
    });
  });
  REGISTER_V = productsVersion();
  return REGISTER;
}
/** The register record for one build, or null when no application carries it. */
export const componentByBuild = (name: string, version: string) =>
  allSoftwareComponents().find((c) => c.name === name && c.version === version) ?? null;
