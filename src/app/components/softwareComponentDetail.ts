import type { SoftwareComponent, ComponentSeverity, Ecosystem } from './softwareComponentsData';
import { bomAdvisory, fixOnBranch } from './bomData';
/* The estate's group list, imported rather than retyped: the Patch detail tab filters on
   exactly these names, and two copies would drift the first time one is edited. */
import { REMOTE_OFFICES } from './PatchComputersTab';

/* Everything the component detail page shows, DERIVED from the listing row.
 *
 * The header restates the row — 23 CIs, 31 products, 3 CVEs — so the two must come from one
 * place or they will drift the first time a number is edited. Nothing here is stored: each
 * list is generated from the component's own id, so it is stable across renders and reloads
 * while still summing to exactly what the row claims. */

/** Deterministic per-component stream: same component, same fleet, every time. */
function rng(seed: string) {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

export type CiType = 'Hardware' | 'Infrastructure';
export type Origin = 'Agent scan' | 'Vendor SBOM';

export interface AffectedCi {
  ciId: string;
  endpointId: string;
  hostname: string;
  ip: string;
  ciType: CiType;
  os: string;
  /** The remote office this CI belongs to — the same groups Patch filters by. */
  office: string;
  /** The build THIS endpoint carries. Not every CI runs the same one — see version drift. */
  version: string;
  origin: Origin;
  products: number;
}

const WORKSTATION_OS = ['Microsoft Windows 10 Pro', 'Microsoft Windows 11 Pro', 'Microsoft Windows 10 Enterprise'];
const SERVER_OS = ['Microsoft Windows Server 2019', 'Microsoft Windows Server 2022', 'Microsoft Windows Server 2025'];
const HOST_PREFIX = ['DESKTOP', 'WIN', 'LT', 'SRV'];

/* ── version drift ───────────────────────────────────────────
   A component is rarely one build across an estate: some endpoints lag, so the same
   component sits at several versions at once. The listing row names the PRIMARY build
   (the one most endpoints carry); the drift is everything else, and it matters because
   a fix applies per version — upgrading the primary leaves the laggards exposed.

   Older builds are derived from the primary rather than invented, so they sort correctly
   and read as the same product's history. */
function olderThan(v: string, n: number, r: () => number): string[] {
  const parts = v.split('.').map((p) => parseInt(p, 10));
  if (parts.some((x) => Number.isNaN(x))) return [];
  const out: string[] = [];
  let cur = parts.slice();
  for (let i = 0; i < n; i++) {
    const next = cur.slice();
    const last = next.length - 1;
    const step = 1 + Math.floor(r() * 2);
    /* Borrow from the segment above rather than giving up: 2.14.1 must be able to reach
       2.13.x, or a component whose patch number is already 0 or 1 would report no drift
       at all — which looked like "everything is on one build" when it isn't. */
    if (next[last] >= step) next[last] -= step;
    else if (next.length > 1 && next[last - 1] > 0) { next[last - 1] -= 1; next[last] = 1 + Math.floor(r() * 3); }
    else if (next[last] > 0) next[last] = 0;
    else break;
    if (next.some((x) => x < 0)) break;
    cur = next;
    out.push(cur.join('.'));
  }
  return out;
}

/** How many builds this component sits at. A wider estate drifts further. */
const driftCount = (cis: number) => Math.max(1, Math.min(4, 1 + Math.floor(cis / 6)));

/** Every build present, primary first. */
export function versionSpread(c: SoftwareComponent): string[] {
  const r = rng(c.id + ':ver');
  return [c.version, ...olderThan(c.version, driftCount(c.cis) - 1, r)];
}
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Exactly `c.cis` rows, and their product counts sum to exactly `c.products`. */
export function affectedCis(c: SoftwareComponent): AffectedCi[] {
  const r = rng(c.id + ':cis');
  const versions = versionSpread(c);
  const rows: AffectedCi[] = [];
  for (let i = 0; i < c.cis; i++) {
    const infra = r() < 0.45;
    const tag = Array.from({ length: 8 }, () => CHARS[Math.floor(r() * CHARS.length)]).join('');
    rows.push({
      ciId: `CI-${i + 1}`,
      endpointId: `EP-${c.cis - i}`,
      hostname: `${HOST_PREFIX[Math.floor(r() * HOST_PREFIX.length)]}-${tag}`,
      ip: `172.16.${12 + Math.floor(r() * 3)}.${10 + Math.floor(r() * 240)}`,
      ciType: infra ? 'Infrastructure' : 'Hardware',
      office: REMOTE_OFFICES[Math.floor(r() * REMOTE_OFFICES.length)],
      /* Roughly half the estate on the primary build, the rest spread evenly over the
         older ones — so every version in the spread has at least one CI behind it and
         the counts always add back up to the row's CI total. */
      version: (() => {
        const primaryShare = Math.ceil(c.cis / 2);
        if (versions.length === 1 || i < primaryShare) return versions[0];
        return versions[1 + ((i - primaryShare) % (versions.length - 1))];
      })(),
      os: infra ? SERVER_OS[Math.floor(r() * SERVER_OS.length)] : WORKSTATION_OS[Math.floor(r() * WORKSTATION_OS.length)],
      /* A CI can only be attested by a source the component actually has. */
      origin: c.sources.length === 1
        ? (c.sources[0] === 'agent' ? 'Agent scan' : 'Vendor SBOM')
        : (r() < 0.5 ? 'Agent scan' : 'Vendor SBOM'),
      products: 1,
    });
  }
  /* Every CI carries the component through at least one product; spread the remainder so the
     column adds up to the `products` figure the listing and the header both quote. */
  let spare = Math.max(0, c.products - c.cis);
  for (let i = 0; spare > 0; i = (i + 1) % rows.length) {
    const add = Math.min(spare, 1 + Math.floor(r() * 2));
    rows[i].products += add;
    spare -= add;
  }
  return rows;
}

export interface ComponentCve {
  /** CVE or GHSA id — Trivy reports both, so screens say "Vulnerability ID", not "CVE ID". */
  id: string;
  /** The description's first sentence — Trivy has no title field. */
  title: string;
  description: string;
  /** Picked by precedence (NVD → GHSA → vendor); null when no rating is held — never guessed. */
  severity: Exclude<ComponentSeverity, 'None'> | null;
  ratedBy: string | null;
  cvss: number | null;
  cwe: string | null;
  published: string | null;
  /** On CISA KEV — platform enrichment, not in the Trivy document. */
  exploited: boolean;
  /** From Trivy's package class: os-pkgs → OS Package, lang-pkgs → Language Package. */
  vulnType: 'OS Package' | 'Language Package';
  /** The fix on THIS install's release branch (Trivy lists one per branch). */
  fixedIn: string | null;
}

/** The row's advisories, read from the same advisory table the application SBOM screens use. */
export function componentCves(c: SoftwareComponent): ComponentCve[] {
  const vulnType = c.ecosystem === 'Deb' || c.ecosystem === 'RPM' ? 'OS Package' : 'Language Package';
  return c.cves.map((id) => {
    const a = bomAdvisory(id);
    return {
      id,
      title: a?.title ?? 'No description reported',
      description: a?.description ?? '',
      severity: a?.severity ?? null,
      ratedBy: a?.ratedBy ?? null,
      cvss: a?.cvss ?? null,
      cwe: a?.cwe ?? null,
      published: a?.published ?? null,
      exploited: !!a?.kev,
      vulnType,
      fixedIn: fixOnBranch(a?.recommendation ?? null, c.version),
    };
  });
}

export interface ComponentSourceRecord {
  kind: Origin;
  detail: string;
  cis: number;
  lastSeen: string;
  document: string | null;
}

/** One record per source on the row, and their CI counts sum to the row's CI total. */
export function componentSources(c: SoftwareComponent): ComponentSourceRecord[] {
  const rows = affectedCis(c);
  return c.sources.map((s) => {
    const kind: Origin = s === 'agent' ? 'Agent scan' : 'Vendor SBOM';
    const n = rows.filter((x) => x.origin === kind).length;
    return {
      kind,
      detail: s === 'agent'
        ? 'Discovered on disk by the ServiceOps agent during a scheduled BOM scan.'
        : 'Declared in a CycloneDX document ingested against the CI.',
      cis: n,
      lastSeen: s === 'agent' ? 'Jun 16, 2026' : 'Jun 09, 2026',
      document: s === 'agent' ? null : `${c.name}-${c.version}.cdx.json`,
    };
  });
}

/* ── evidence ────────────────────────────────────────────────
   "Why do we believe this is here": who reported it, in what document, and the file the package
   was read from. Only what the document carries is shown — Trivy's CycloneDX has no supplier and
   no package hash, so neither is offered. */
export interface ComponentEvidence {
  formats: string[];
  /** The tool that produced each document. */
  detectedBy: string[];
  /** The file Trivy names as the package's parent — lock file, manifest, jar or package DB. */
  foundIn: string[];
}

const PARENT_FILE: Record<Ecosystem, (n: string, v: string) => string> = {
  Maven: (n, v) => `opt/payments/WEB-INF/lib/${n}-${v}.jar`,
  Npm: () => 'opt/portal/package-lock.json',
  Deb: () => 'var/lib/dpkg/status',
  RPM: () => 'var/lib/rpm/rpmdb.sqlite',
  Golang: () => 'opt/gateway/go.mod',
  PyPI: (n, v) => `opt/analytics/venv/lib/python3.11/site-packages/${n}-${v}.dist-info/METADATA`,
  NuGet: () => 'inetpub/wwwroot/packages.lock.json',
};

export function componentEvidence(c: SoftwareComponent): ComponentEvidence {
  const formats: string[] = [];
  const detectedBy: string[] = [];
  if (c.sources.includes('agent')) { formats.push('CycloneDX 1.7'); detectedBy.push('Trivy 0.72.0'); }
  if (c.sources.includes('vendor')) formats.push('SPDX 2.3');
  return { formats, detectedBy, foundIn: [PARENT_FILE[c.ecosystem](c.name, c.version)] };
}

/** Every build present with the number of CIs on it — counted from the rows themselves,
 *  so the right rail and the Affected CIs table can never quote different numbers. */
export function componentVersions(c: SoftwareComponent): { version: string; cis: number }[] {
  const rows = affectedCis(c);
  return versionSpread(c)
    .map((v) => ({ version: v, cis: rows.filter((r) => r.version === v).length }))
    .filter((x) => x.cis > 0);
}

/** Maven means Java — the ecosystem already says which language, so it is not stored twice. */
export const LANGUAGE_OF: Record<Ecosystem, string> = {
  Maven: 'Java', Npm: 'JavaScript', Generic: 'Native', Deb: 'Native', RPM: 'Native',
  Golang: 'Go', PyPI: 'Python', NuGet: '.NET',
};

/** Business services touched, derived from the spread of CIs rather than invented separately. */
export const businessServices = (c: SoftwareComponent) =>
  Math.max(1, Math.min(9, Math.round(c.cis / 5) + (c.internetFacing ? 1 : 0)));

export const firstSeen = (c: SoftwareComponent) => (c.sources.includes('vendor') ? 'Jun 09, 2026' : 'Jun 12, 2026');
export const lastSeen = () => 'Jun 16, 2026';
