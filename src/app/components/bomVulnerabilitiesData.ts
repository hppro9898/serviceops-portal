/* BOM Vulnerabilities — the estate read by advisory.
 *
 * Software components is one row per component version, Applications one row per application;
 * this is one row per vulnerability ID. Every row is read from the applications' OWN current
 * SBOMs (the same bomComponents() the SBOM tab lists), the applications through the same
 * affectedProducts() the component page uses, and every advisory fact from bomAdvisory() — so
 * a count here cannot disagree with the component or application pages. */

import { bomAdvisory, bomComponents, fixOnBranch } from './bomData';
import type { BomAdvisory, BomSeverity } from './bomData';
import { bomProducts, productKey, productBomTypes, affectedProducts } from './bomProductsData';
import type { ProductRecord, BomAgent } from './bomProductsData';
import { componentByBuild } from './softwareComponentsData';

export type VulnType = 'OS Package' | 'Language Package';

export interface VulnComponent {
  /** The component's own record (CMP-…) when the inventory carries it; null otherwise. */
  componentId: string | null;
  name: string;
  version: string;
  ecosystem: string;
  purl: string;
  license: string;
  vulnType: VulnType;
  /** The fix on THIS build's release branch (Trivy lists one per branch). */
  fixedIn: string | null;
  apps: ProductRecord[];
}

/** One (application, component) pair — where the vulnerable build was found. */
export interface VulnAffected { product: ProductRecord; component: VulnComponent; foundIn: string }

export interface BomVulnerability {
  id: string;
  adv: BomAdvisory | null;
  severity: BomSeverity | null;
  components: VulnComponent[];
  affected: VulnAffected[];
  apps: ProductRecord[];
  /** Reached through the applications — an ingested SBOM has none. */
  endpoints: BomAgent[];
  vulnTypes: VulnType[];
  /** Every affected component has a fix on its own branch. */
  fixAvailable: boolean;
}

const RANK: Record<BomSeverity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function bomVulnerabilities(): BomVulnerability[] {
  /* Every distinct vulnerable build present in some application's current SBOM. */
  const builds = new Map<string, { name: string; version: string; ecosystem: string; purl: string; license: string; cves: string[] }>();
  for (const p of bomProducts()) {
    if (p.scanState === 'Queued' || !productBomTypes(p).includes('SBOM')) continue;
    for (const c of bomComponents(p.id, productKey(p))) {
      if (!c.cves?.length) continue;
      const key = `${c.name}@${c.version}`;
      if (!builds.has(key)) builds.set(key, { name: c.name, version: c.version, ecosystem: c.ecosystem, purl: c.purl, license: c.license, cves: c.cves });
    }
  }

  const byId = new Map<string, { comps: VulnComponent[]; affected: VulnAffected[] }>();
  for (const b of builds.values()) {
    const hits = affectedProducts({ id: '', name: b.name, version: b.version, ecosystem: b.ecosystem });
    const rec = componentByBuild(b.name, b.version);
    for (const cve of b.cves) {
      const comp: VulnComponent = {
        componentId: rec?.id ?? null, name: b.name, version: b.version, ecosystem: b.ecosystem, purl: b.purl, license: b.license,
        vulnType: b.ecosystem === 'Deb' || b.ecosystem === 'RPM' ? 'OS Package' : 'Language Package',
        fixedIn: fixOnBranch(bomAdvisory(cve)?.recommendation ?? null, b.version),
        apps: hits.map((h) => h.product),
      };
      const entry = byId.get(cve) ?? { comps: [], affected: [] };
      entry.comps.push(comp);
      entry.affected.push(...hits.map((h) => ({ product: h.product, component: comp, foundIn: h.foundIn })));
      byId.set(cve, entry);
    }
  }

  return [...byId.entries()].map(([id, { comps, affected }]) => {
    const adv = bomAdvisory(id);
    const apps = [...new Set(affected.map((a) => a.product))];
    const endpoints = [...new Map(apps.filter((p) => p.agent).map((p) => [p.agent!.id, p.agent!])).values()];
    return {
      id, adv, severity: adv?.severity ?? null, components: comps, affected, apps, endpoints,
      vulnTypes: [...new Set(comps.map((c) => c.vulnType))],
      fixAvailable: comps.every((c) => !!c.fixedIn),
    };
  }).filter((v) => v.apps.length > 0)
    .sort((a, b) => (RANK[b.severity ?? 'Low'] - RANK[a.severity ?? 'Low']) || ((b.adv?.cvss ?? 0) - (a.adv?.cvss ?? 0)) || a.id.localeCompare(b.id));
}

export const bomVulnerabilityById = (id: string) => bomVulnerabilities().find((v) => v.id === id) ?? null;

/** Public advisory page for the id — NVD for a CVE, GitHub for a GHSA. */
export const advisoryUrl = (id: string) =>
  id.startsWith('GHSA-') ? `https://github.com/advisories/${id}` : `https://nvd.nist.gov/vuln/detail/${id}`;
