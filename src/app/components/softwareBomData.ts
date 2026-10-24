/* Packages and components for ONE installed software item on an asset.
 *
 * Two different questions about the same software, which is why they are two columns
 * on the Software tab rather than one:
 *   Packages    what the agent found INSTALLED on the host — the MSI / EXE / AppX / pkg
 *               artifacts that put the software there.
 *   Components  what the software is MADE OF — the SBOM libraries inside it.
 *
 * Both are derived from the software name, so a row's count and the drawer it opens can
 * never disagree, and the same software shows the same inventory on every asset.
 *
 * TODO(api): GET /assets/{id}/software/{key}/packages · …/components
 */

import { SBOM_CATALOG, hash } from './bomData';
import type { BomComponent } from './bomData';

export type PackageFormat = 'MSI' | 'EXE' | 'AppX' | 'pkg' | 'deb';

export interface SoftwarePackage {
  /** Package identity as the platform reports it — MSI product code, AppX family name, … */
  packageId: string;
  name: string;
  format: PackageFormat;
  version: string;
  /** Human-readable, already formatted — the column never does arithmetic on it. */
  size: string;
  installSource: string;
  installedDate: string;
}

/* Windows software installs as MSI/EXE/AppX, macOS as pkg, Linux as deb. Reading the
 * format off the software name keeps a Mac asset from listing an MSI. */
const formatsFor = (name: string): PackageFormat[] => {
  if (/\.app\b|macos|safari|xcode/i.test(name)) return ['pkg'];
  if (/^lib|-dev$|ubuntu|debian/i.test(name)) return ['deb'];
  if (/^Microsoft\.[A-Z]/.test(name)) return ['AppX', 'MSI'];
  return ['MSI', 'EXE', 'MSI'];
};

/** Suffixes that turn one software item into its handful of shipped artifacts. */
const PART = ['', 'Update', 'Runtime', 'WebView', 'Helper', 'Redistributable'];
const SOURCES = [
  'Vendor download', 'Software Center', 'ServiceOps deployment',
  'Windows Update', 'Bundled with OS', 'Manual install',
];
const DATES = [
  '11/11/2024', '02/03/2026', '02/05/2026', '30/01/2026', '16/01/2026',
  '22/04/2025', '08/09/2025', '14/12/2025',
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Installer packages for one application, deterministic in the name. When the caller
 *  states a count — the number its grid column shows — that count wins, so the drawer
 *  can never list more or fewer rows than the cell that opened it. */
export function softwarePackages(softwareName: string, softwareVersion = '', count?: number): SoftwarePackage[] {
  const h = hash(`${softwareName}:pkg`);
  const n = count ?? 1 + (h % 4);
  const formats = formatsFor(softwareName);
  const base = slug(softwareName).slice(0, 24) || 'package';

  /* Walk PART from one rotating start rather than hashing each slot: hashing per slot
     let two packages land on the same suffix, and a list showing the same file name
     twice reads as a bug in the scan. Rotating guarantees distinct names. */
  const start = h % PART.length;

  const out: SoftwarePackage[] = [];
  for (let i = 0; i < n; i++) {
    const g = hash(`${softwareName}:pkg:${i}`);
    const part = PART[(start + i) % PART.length];
    const format = formats[i % formats.length];
    // A part shares the parent's version; only the base package carries the exact one.
    const version = i === 0 && softwareVersion
      ? softwareVersion
      : `${1 + (g % 20)}.${g % 40}.${g % 900}`;
    out.push({
      packageId: format === 'AppX'
        ? `${base}_${(g % 9999).toString().padStart(4, '0')}_x64__8wekyb3d8bbwe`
        : `{${(g % 0xffff).toString(16).padStart(4, '0').toUpperCase()}-${((g >>> 8) % 0xffff).toString(16).padStart(4, '0').toUpperCase()}-4A2B-9C31-${(g % 0xffffff).toString(16).padStart(6, '0').toUpperCase()}}`,
      name: `${base}${part ? `-${slug(part)}` : ''}.${format.toLowerCase()}`,
      format,
      version,
      size: g % 3 === 0 ? `${1 + (g % 3)}.${g % 10} GB` : `${8 + (g % 480)} MB`,
      installSource: SOURCES[(g + i) % SOURCES.length],
      installedDate: DATES[(g + i * 2) % DATES.length],
    });
  }
  return out;
}

/** The SBOM components this software ships, sliced from the shared catalog.
 *  Cycles the catalog with a bumped version on each pass, the way bomComponents does,
 *  so a large count stays realistic instead of repeating the same 40 rows verbatim. */
export function softwareComponents(softwareName: string, count?: number): BomComponent[] {
  const h = hash(`${softwareName}:cmp`);
  const n = count ?? 6 + (h % 175);
  const out: BomComponent[] = [];
  for (let i = 0; i < n; i++) {
    const c = SBOM_CATALOG[(h + i) % SBOM_CATALOG.length];
    const pass = Math.floor(((h + i) / SBOM_CATALOG.length) % 6);
    if (pass === 0) { out.push(c); continue; }
    const version = `${c.version}.${pass}`;
    out.push({ ...c, version, purl: c.purl.replace(/@[^@]*$/, `@${version}`) });
  }
  return out;
}

export const softwarePackageCount = (name: string) => softwarePackages(name).length;
export const softwareComponentCount = (name: string) => softwareComponents(name).length;
