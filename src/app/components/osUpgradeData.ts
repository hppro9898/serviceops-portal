/* OS Upgrade (Admin › Patch Management) — the ISO catalogue an admin uploads so endpoints can be
 * upgraded to a newer operating system.
 *
 * One-source discipline, same as bomData: an image declares its PREREQUISITES, the fleet carries
 * raw specs, and compatibility is EVALUATED from the two. Nothing hard-codes "Compatible" — so the
 * Prerequisites card on the Summary tab and the Compatible/Incompatible/Unknown counts on the
 * Computers tab can never contradict each other.
 */

export type OsPlatform = 'Windows' | 'Linux';

/** Upload state of an image's ISO. One vocabulary across the list, the popup and the detail page. */
export type OsUploadStatus = 'Not Uploaded' | 'In Progress' | 'Paused' | 'Uploaded' | 'Failed' | 'Cancelled';

export type PrereqProfile = 'win11' | 'win10' | 'winsrv' | 'linux';

export interface OsImage {
  id: string;
  /** Short label for the listing's Name column. */
  name: string;
  /** Full product title — the detail page heading. */
  title: string;
  platform: OsPlatform;
  edition: string;
  osVersion: string;
  architecture: string;
  language: string;
  /** Human-readable ISO size. Overwritten by the real file size once an upload completes. */
  size: string;
  status: OsUploadStatus;
  /** Blank until an ISO has landed. */
  uploadTime: string;
  eosDate: string;
  referenceUrl: string;
  referenceLabel: string;
  fileName: string;
  prereq: PrereqProfile;
}

// ── Prerequisites ──────────────────────────────────────────────────────────

export type PrereqKey = 'ram' | 'disk' | 'tpm' | 'secureBoot' | 'cpuSpeed' | 'cpuCores' | 'arch' | 'currentOs';

export interface Prereq {
  key: PrereqKey;
  attribute: string;
  operator: '>=' | '=' | 'in';
  /** What the admin reads in the Prerequisites card. */
  value: string;
  /** Numeric threshold used by the evaluator; absent for the equality checks. */
  num?: number;
  /** Rendered as its own column in the Computers grid. Every prerequisite that can REALISTICALLY
   *  fail is a column — otherwise a row could be flagged for a value the reader cannot see. */
  column?: boolean;
  /** Overrides the generated failure sentence where the numeric threshold doesn't read well. */
  fail?: string;
}

export const PREREQUISITES: Record<PrereqProfile, Prereq[]> = {
  win11: [
    { key: 'ram', attribute: 'RAM', operator: '>=', value: '4 GB', num: 4, column: true },
    { key: 'disk', attribute: 'Free Disk', operator: '>=', value: '64 GB', num: 64, column: true },
    { key: 'tpm', attribute: 'TPM Version', operator: '>=', value: '2.0', num: 2, column: true },
    { key: 'secureBoot', attribute: 'Secure Boot', operator: '=', value: 'Enabled', column: true },
    { key: 'cpuSpeed', attribute: 'CPU Speed', operator: '>=', value: '1 GHz', num: 1 },
    { key: 'cpuCores', attribute: 'CPU Cores', operator: '>=', value: '2', num: 2 },
    { key: 'arch', attribute: 'Architecture', operator: '=', value: '64-bit' },
    { key: 'currentOs', attribute: 'Current OS', operator: 'in', value: '[Windows 10 2004+]', num: 2004, fail: 'Current OS build older than 2004' },
  ],
  win10: [
    { key: 'ram', attribute: 'RAM', operator: '>=', value: '2 GB', num: 2, column: true },
    { key: 'disk', attribute: 'Free Disk', operator: '>=', value: '32 GB', num: 32, column: true },
    { key: 'cpuSpeed', attribute: 'CPU Speed', operator: '>=', value: '1 GHz', num: 1 },
    { key: 'cpuCores', attribute: 'CPU Cores', operator: '>=', value: '2', num: 2 },
    { key: 'arch', attribute: 'Architecture', operator: '=', value: '64-bit' },
    { key: 'currentOs', attribute: 'Current OS', operator: 'in', value: '[Windows 10 1809+]', num: 1809, fail: 'Current OS build older than 1809' },
  ],
  winsrv: [
    { key: 'ram', attribute: 'RAM', operator: '>=', value: '8 GB', num: 8, column: true },
    { key: 'disk', attribute: 'Free Disk', operator: '>=', value: '80 GB', num: 80, column: true },
    { key: 'tpm', attribute: 'TPM Version', operator: '>=', value: '2.0', num: 2, column: true },
    { key: 'secureBoot', attribute: 'Secure Boot', operator: '=', value: 'Enabled', column: true },
    { key: 'cpuCores', attribute: 'CPU Cores', operator: '>=', value: '4', num: 4 },
    { key: 'arch', attribute: 'Architecture', operator: '=', value: '64-bit' },
    { key: 'currentOs', attribute: 'Current OS', operator: 'in', value: '[Windows Server 2016+]', num: 2016, fail: 'Current OS older than Windows Server 2016' },
  ],
  linux: [
    { key: 'ram', attribute: 'RAM', operator: '>=', value: '4 GB', num: 4, column: true },
    { key: 'disk', attribute: 'Free Disk', operator: '>=', value: '25 GB', num: 25, column: true },
    { key: 'cpuSpeed', attribute: 'CPU Speed', operator: '>=', value: '2 GHz', num: 2 },
    { key: 'cpuCores', attribute: 'CPU Cores', operator: '>=', value: '2', num: 2 },
    { key: 'arch', attribute: 'Architecture', operator: '=', value: '64-bit' },
    { key: 'currentOs', attribute: 'Current OS', operator: 'in', value: '[Ubuntu 20.04+]', num: 2004, fail: 'Current OS older than Ubuntu 20.04' },
  ],
};

export const prerequisitesFor = (img: OsImage): Prereq[] => PREREQUISITES[img.prereq];

/* ── Reading a rule as a sentence ──────────────────────────────────────────
 *
 * "RAM  >=  4 GB" is builder syntax; a reader wants "RAM — 4 GB or more". The phrasing is derived
 * from the rule rather than written out per profile, so a new OS profile reads correctly for free
 * and the words can never drift from the operator they describe. */

export interface PrereqPhrase {
  /** Muted words before the value ("Turned", "One of"). */
  lead?: string;
  /** The part that carries the number — emphasised. */
  value: string;
  /** Muted words after it ("or more", "or later", "only"). */
  qualifier?: string;
}

export function prereqPhrase(p: Prereq): PrereqPhrase {
  switch (p.key) {
    // "Enabled" is a field value; "Turned on" is how the requirement is spoken.
    case 'secureBoot':
      return { lead: 'Turned', value: 'on' };
    case 'arch':
      return { value: p.value, qualifier: 'only' };
    // '[Windows 10 2004+]' — the brackets are syntax and the '+' is what "or later" already says.
    case 'currentOs':
      return { lead: 'One of', value: p.value.replace(/^\[|\]$/g, '').replace(/\+$/, ''), qualifier: 'or later' };
    case 'tpm':
      return { value: p.value, qualifier: 'or higher' };
    case 'cpuSpeed':
      return { value: p.value, qualifier: 'or faster' };
    // ram / disk / cpuCores — a plain minimum.
    default:
      return { value: p.value, qualifier: 'or more' };
  }
}

// ── The catalogue ──────────────────────────────────────────────────────────

/* Fifteen images so the listing exercises pagination (the shared Pagination hides itself at 10 or
 * fewer), and so every upload state has a row demonstrating it. */
export const OS_IMAGES: OsImage[] = [
  {
    id: 'OSU-1', name: 'Windows 11', title: 'Windows 11 (25H2) Enterprise (x64)', platform: 'Windows',
    edition: 'Enterprise', osVersion: '25H2', architecture: 'x64', language: 'English (US)', size: '5.2 GB',
    status: 'Uploaded', uploadTime: '12 Jul 2026, 10:22 AM', eosDate: '14 Oct 2027',
    referenceUrl: 'https://www.microsoft.com/software-download/windows11', referenceLabel: 'Official Microsoft ISO',
    fileName: 'Win11_25H2_Enterprise_English_x64.iso', prereq: 'win11',
  },
  {
    id: 'OSU-2', name: 'Ubuntu Server', title: 'Ubuntu Server 22.04.4 LTS (x64)', platform: 'Linux',
    edition: 'Server', osVersion: '22.04.4 LTS', architecture: 'x64', language: 'Multi-language', size: '1.8 GB',
    status: 'Uploaded', uploadTime: '09 Jul 2026, 08:15 AM', eosDate: '31 May 2027',
    referenceUrl: 'https://releases.ubuntu.com/22.04/', referenceLabel: 'Ubuntu releases archive',
    fileName: 'ubuntu-22.04.4-live-server-amd64.iso', prereq: 'linux',
  },
  {
    id: 'OSU-3', name: 'Windows 11', title: 'Windows 11 (24H2) Pro (x64)', platform: 'Windows',
    edition: 'Pro', osVersion: '24H2', architecture: 'x64', language: 'English (US)', size: '5.6 GB',
    status: 'Uploaded', uploadTime: '02 Jul 2026, 04:38 PM', eosDate: '13 Oct 2026',
    referenceUrl: 'https://www.microsoft.com/software-download/windows11', referenceLabel: 'Official Microsoft ISO',
    fileName: 'Win11_24H2_Pro_English_x64.iso', prereq: 'win11',
  },
  {
    id: 'OSU-4', name: 'Windows 10', title: 'Windows 10 (22H2) Enterprise (x64)', platform: 'Windows',
    edition: 'Enterprise', osVersion: '22H2', architecture: 'x64', language: 'English (US)', size: '4.7 GB',
    status: 'Uploaded', uploadTime: '18 Jun 2026, 11:04 AM', eosDate: '14 Oct 2025',
    referenceUrl: 'https://www.microsoft.com/software-download/windows10', referenceLabel: 'Official Microsoft ISO',
    fileName: 'Win10_22H2_Enterprise_English_x64.iso', prereq: 'win10',
  },
  {
    id: 'OSU-5', name: 'Windows Server 2022', title: 'Windows Server 2022 Datacenter (x64)', platform: 'Windows',
    edition: 'Datacenter', osVersion: '21H2', architecture: 'x64', language: 'English (US)', size: '5.1 GB',
    status: 'Failed', uploadTime: '', eosDate: '14 Oct 2031',
    referenceUrl: 'https://www.microsoft.com/evalcenter/windows-server-2022', referenceLabel: 'Microsoft Evaluation Center',
    fileName: 'SERVER_EVAL_x64FRE_en-us.iso', prereq: 'winsrv',
  },
  {
    id: 'OSU-6', name: 'Ubuntu Desktop', title: 'Ubuntu Desktop 24.04.1 LTS (x64)', platform: 'Linux',
    edition: 'Desktop', osVersion: '24.04.1 LTS', architecture: 'x64', language: 'Multi-language', size: '6.1 GB',
    status: 'Not Uploaded', uploadTime: '', eosDate: '31 May 2029',
    referenceUrl: 'https://releases.ubuntu.com/24.04/', referenceLabel: 'Ubuntu releases archive',
    fileName: '', prereq: 'linux',
  },
  {
    id: 'OSU-7', name: 'Red Hat Enterprise Linux', title: 'Red Hat Enterprise Linux 9.4 (x64)', platform: 'Linux',
    edition: 'Server', osVersion: '9.4', architecture: 'x64', language: 'Multi-language', size: '9.8 GB',
    status: 'Uploaded', uploadTime: '27 May 2026, 09:47 AM', eosDate: '31 May 2032',
    referenceUrl: 'https://access.redhat.com/downloads', referenceLabel: 'Red Hat customer portal',
    fileName: 'rhel-9.4-x86_64-dvd.iso', prereq: 'linux',
  },
  {
    id: 'OSU-8', name: 'Windows 11', title: 'Windows 11 (23H2) Education (x64)', platform: 'Windows',
    edition: 'Education', osVersion: '23H2', architecture: 'x64', language: 'English (UK)', size: '5.4 GB',
    status: 'Cancelled', uploadTime: '', eosDate: '11 Nov 2026',
    referenceUrl: 'https://www.microsoft.com/software-download/windows11', referenceLabel: 'Official Microsoft ISO',
    fileName: '', prereq: 'win11',
  },
  {
    id: 'OSU-9', name: 'Windows Server 2019', title: 'Windows Server 2019 Standard (x64)', platform: 'Windows',
    edition: 'Standard', osVersion: '1809', architecture: 'x64', language: 'English (US)', size: '4.9 GB',
    status: 'Uploaded', uploadTime: '14 May 2026, 03:12 PM', eosDate: '09 Jan 2029',
    referenceUrl: 'https://www.microsoft.com/evalcenter/windows-server-2019', referenceLabel: 'Microsoft Evaluation Center',
    fileName: '17763.737_x64FRE_en-us.iso', prereq: 'winsrv',
  },
  {
    id: 'OSU-10', name: 'Debian', title: 'Debian 12.6 "Bookworm" (x64)', platform: 'Linux',
    edition: 'Server', osVersion: '12.6', architecture: 'x64', language: 'Multi-language', size: '3.7 GB',
    status: 'Not Uploaded', uploadTime: '', eosDate: '30 Jun 2028',
    referenceUrl: 'https://www.debian.org/distrib/', referenceLabel: 'Debian download mirror',
    fileName: '', prereq: 'linux',
  },
  {
    id: 'OSU-11', name: 'Windows 10', title: 'Windows 10 (21H2) Pro (x64)', platform: 'Windows',
    edition: 'Pro', osVersion: '21H2', architecture: 'x64', language: 'English (US)', size: '4.4 GB',
    status: 'Failed', uploadTime: '', eosDate: '13 Jun 2024',
    referenceUrl: 'https://www.microsoft.com/software-download/windows10', referenceLabel: 'Official Microsoft ISO',
    fileName: 'Win10_21H2_Pro_English_x64.iso', prereq: 'win10',
  },
  {
    id: 'OSU-12', name: 'Ubuntu Server', title: 'Ubuntu Server 24.04.1 LTS (x64)', platform: 'Linux',
    edition: 'Server', osVersion: '24.04.1 LTS', architecture: 'x64', language: 'Multi-language', size: '2.1 GB',
    status: 'Uploaded', uploadTime: '30 Apr 2026, 07:55 AM', eosDate: '31 May 2029',
    referenceUrl: 'https://releases.ubuntu.com/24.04/', referenceLabel: 'Ubuntu releases archive',
    fileName: 'ubuntu-24.04.1-live-server-amd64.iso', prereq: 'linux',
  },
  {
    id: 'OSU-13', name: 'Windows 11', title: 'Windows 11 (25H2) Pro (ARM64)', platform: 'Windows',
    edition: 'Pro', osVersion: '25H2', architecture: 'ARM64', language: 'English (US)', size: '4.8 GB',
    status: 'Not Uploaded', uploadTime: '', eosDate: '14 Oct 2027',
    referenceUrl: 'https://www.microsoft.com/software-download/windows11arm64', referenceLabel: 'Official Microsoft ISO',
    fileName: '', prereq: 'win11',
  },
  {
    id: 'OSU-14', name: 'CentOS Stream', title: 'CentOS Stream 9 (x64)', platform: 'Linux',
    edition: 'Server', osVersion: '9', architecture: 'x64', language: 'Multi-language', size: '8.9 GB',
    status: 'Uploaded', uploadTime: '21 Apr 2026, 02:26 PM', eosDate: '31 May 2027',
    referenceUrl: 'https://www.centos.org/download/', referenceLabel: 'CentOS download mirror',
    fileName: 'CentOS-Stream-9-latest-x86_64-dvd1.iso', prereq: 'linux',
  },
  {
    id: 'OSU-15', name: 'Windows Server 2025', title: 'Windows Server 2025 Datacenter (x64)', platform: 'Windows',
    edition: 'Datacenter', osVersion: '24H2', architecture: 'x64', language: 'English (US)', size: '6.4 GB',
    status: 'Uploaded', uploadTime: '08 Apr 2026, 10:09 AM', eosDate: '10 Oct 2034',
    referenceUrl: 'https://www.microsoft.com/evalcenter/windows-server-2025', referenceLabel: 'Microsoft Evaluation Center',
    fileName: 'WINSERVER-2025-x64FRE-en-us.iso', prereq: 'winsrv',
  },
];

// ── Fleet ──────────────────────────────────────────────────────────────────

export interface OsComputer {
  hostName: string;
  ipAddress: string;
  /** Display string; 'Unknown' when the endpoint has never reported an inventory scan. */
  currentOs: string;
  /** Comparable rank for the Current OS prerequisite. null = never scanned. */
  osRank: number | null;
  ram: number | null;
  disk: number | null;
  tpm: number | null;
  secureBoot: boolean | null;
  cpuSpeed: number | null;
  cpuCores: number | null;
  arch: string | null;
}

export type CompatStatus = 'Compatible' | 'Incompatible' | 'Unknown';

export interface EvaluatedComputer extends OsComputer {
  status: CompatStatus;
  reasons: string[];
}

/** Deterministic string hash — same input, same fleet, every render. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  return h;
}

function failText(p: Prereq): string {
  if (p.fail) return p.fail;
  switch (p.key) {
    case 'ram': return `RAM below ${p.value}`;
    case 'disk': return `Free Disk below ${p.value}`;
    case 'tpm': return `TPM version below ${p.value}`;
    case 'secureBoot': return 'Secure Boot is Disabled';
    case 'cpuSpeed': return `CPU Speed below ${p.value}`;
    case 'cpuCores': return `CPU Cores below ${p.value}`;
    case 'arch': return `Architecture is not ${p.value}`;
    default: return `${p.attribute} does not meet ${p.value}`;
  }
}

/** An endpoint with no inventory data can't be judged either way — that is the Unknown bucket. */
const unscanned = (c: OsComputer) => c.ram === null && c.osRank === null;

export function evaluate(c: OsComputer, prereqs: Prereq[]): EvaluatedComputer {
  if (unscanned(c)) return { ...c, status: 'Unknown', reasons: [] };
  const reasons: string[] = [];
  prereqs.forEach((p) => {
    let ok = true;
    switch (p.key) {
      case 'ram': ok = (c.ram ?? 0) >= (p.num ?? 0); break;
      case 'disk': ok = (c.disk ?? 0) >= (p.num ?? 0); break;
      case 'tpm': ok = (c.tpm ?? 0) >= (p.num ?? 0); break;
      case 'secureBoot': ok = c.secureBoot === true; break;
      case 'cpuSpeed': ok = (c.cpuSpeed ?? 0) >= (p.num ?? 0); break;
      case 'cpuCores': ok = (c.cpuCores ?? 0) >= (p.num ?? 0); break;
      case 'arch': ok = c.arch === p.value; break;
      case 'currentOs': ok = (c.osRank ?? 0) >= (p.num ?? 0); break;
      default: ok = true;
    }
    if (!ok) reasons.push(failText(p));
  });
  return { ...c, status: reasons.length ? 'Incompatible' : 'Compatible', reasons };
}

/* The eight endpoints from the reference design, kept verbatim so the Windows 11 image reads
 * exactly like the source. FIN-LAPTOP-22 fails THREE prerequisites at these numbers (55 GB free
 * disk, TPM 1.2, Secure Boot off) — the evaluator says all three rather than the two the static
 * mock listed, because the grid and the Prerequisites card read from the same rules. */
const WIN11_SEEDS: OsComputer[] = [
  { hostName: 'DESKTOP-5JPPI6F', ipAddress: '192.168.29.100', currentOs: 'Windows 10 22H2', osRank: 2202, ram: 16, disk: 210, tpm: 2, secureBoot: true, cpuSpeed: 2.4, cpuCores: 8, arch: '64-bit' },
  { hostName: 'WIN-400A8KHMR82', ipAddress: '172.16.14.111', currentOs: 'Windows 10 21H2', osRank: 2102, ram: 8, disk: 120, tpm: 2, secureBoot: true, cpuSpeed: 2.1, cpuCores: 4, arch: '64-bit' },
  { hostName: 'FIN-LAPTOP-22', ipAddress: '172.16.14.88', currentOs: 'Windows 10 2004', osRank: 2004, ram: 4, disk: 55, tpm: 1.2, secureBoot: false, cpuSpeed: 1.8, cpuCores: 4, arch: '64-bit' },
  { hostName: 'HR-PC-09', ipAddress: '172.16.14.61', currentOs: 'Windows 10 1909', osRank: 1909, ram: 8, disk: 96, tpm: 2, secureBoot: true, cpuSpeed: 2.0, cpuCores: 4, arch: '64-bit' },
  { hostName: 'SALES-WKS-14', ipAddress: '172.16.14.77', currentOs: 'Windows 10 22H2', osRank: 2202, ram: 4, disk: 40, tpm: 2, secureBoot: true, cpuSpeed: 1.9, cpuCores: 4, arch: '64-bit' },
  { hostName: 'DEV-BOX-03', ipAddress: '172.16.14.19', currentOs: 'Windows 10 22H2', osRank: 2202, ram: 32, disk: 480, tpm: 2, secureBoot: true, cpuSpeed: 3.2, cpuCores: 12, arch: '64-bit' },
  { hostName: 'LEGACY-PC-01', ipAddress: '172.16.14.5', currentOs: 'Unknown', osRank: null, ram: null, disk: null, tpm: null, secureBoot: null, cpuSpeed: null, cpuCores: null, arch: null },
  { hostName: 'REMOTE-EP-42', ipAddress: '10.20.41.9', currentOs: 'Unknown', osRank: null, ram: null, disk: null, tpm: null, secureBoot: null, cpuSpeed: null, cpuCores: null, arch: null },
];

interface FleetShape {
  prefixes: string[];
  /** [display, rank] pairs, newest last. */
  releases: [string, number][];
  /** Releases old enough to fail the Current OS prerequisite. */
  oldReleases: [string, number][];
  ipBase: string;
}

const FLEETS: Record<PrereqProfile, FleetShape> = {
  win11: {
    prefixes: ['DESKTOP', 'WIN', 'FIN-LAPTOP', 'HR-PC', 'SALES-WKS', 'DEV-BOX', 'ENG-LT', 'OPS-DT', 'MKT-LT', 'SUP-DT'],
    releases: [['Windows 10 2004', 2004], ['Windows 10 20H2', 2010], ['Windows 10 21H2', 2102], ['Windows 10 22H2', 2202]],
    oldReleases: [['Windows 10 1809', 1809], ['Windows 10 1903', 1903], ['Windows 10 1909', 1909]],
    ipBase: '172.16',
  },
  win10: {
    prefixes: ['DESKTOP', 'WIN', 'ACC-PC', 'STORE-WKS', 'CALL-DT', 'LAB-PC'],
    releases: [['Windows 10 1903', 1903], ['Windows 10 1909', 1909], ['Windows 10 2004', 2004], ['Windows 10 21H2', 2102]],
    oldReleases: [['Windows 10 1607', 1607], ['Windows 10 1703', 1703]],
    ipBase: '10.42',
  },
  winsrv: {
    prefixes: ['DC1-APP', 'DC1-DB', 'DC2-FILE', 'HQ-PRINT', 'APP-SRV', 'SQL-SRV', 'RDS-HOST'],
    releases: [['Windows Server 2016', 2016], ['Windows Server 2019', 2019], ['Windows Server 2022', 2022]],
    oldReleases: [['Windows Server 2012 R2', 2012], ['Windows Server 2008 R2', 2008]],
    ipBase: '10.20',
  },
  linux: {
    prefixes: ['UBT-SRV', 'APP-NODE', 'DB-NODE', 'WEB-EDGE', 'BUILD-AGT', 'K8S-WRK', 'LOG-NODE'],
    releases: [['Ubuntu 20.04 LTS', 2004], ['Ubuntu 22.04 LTS', 2204], ['Ubuntu 24.04 LTS', 2404]],
    oldReleases: [['Ubuntu 18.04 LTS', 1804], ['Ubuntu 16.04 LTS', 1604]],
    ipBase: '10.60',
  },
};

const RAM_OK = [8, 16, 16, 32, 8, 16];
const DISK_OK = [120, 210, 256, 480, 96, 180];

/* Fleet generator. The i % 20 rota fixes the shape of the estate — roughly 70-80% compatible, the
 * rest blocked on a real prerequisite or never scanned — so the three sub-tab counts stay
 * believable without random numbers that change on every render.
 *
 * Shortfalls are cut FROM THE PROFILE'S OWN thresholds: a 55 GB disk blocks Windows 11 (64 GB) but
 * not Ubuntu (25 GB), so hard-coding Windows numbers would leave the Linux images with an empty
 * Incompatible bucket. Non-column prerequisites (CPU, architecture) always pass — flagging a row
 * for a value the grid doesn't show would be unreadable. */
function generateFleet(profile: PrereqProfile, seed: number, count: number, ramMin: number, diskMin: number): OsComputer[] {
  const shape = FLEETS[profile];
  return Array.from({ length: count }, (_, n): OsComputer => {
    const i = n + seed;
    const prefix = shape.prefixes[i % shape.prefixes.length];
    const hostName = `${prefix}-${String(((i * 17) % 900) + 10).padStart(3, '0')}`;
    const ipAddress = `${shape.ipBase}.${14 + (i % 8)}.${((i * 7) % 240) + 5}`;
    const rel = shape.releases[i % shape.releases.length];
    const old = shape.oldReleases[i % shape.oldReleases.length];
    const base: OsComputer = {
      hostName,
      ipAddress,
      currentOs: rel[0],
      osRank: rel[1],
      ram: RAM_OK[i % RAM_OK.length],
      disk: DISK_OK[i % DISK_OK.length],
      tpm: 2,
      secureBoot: true,
      cpuSpeed: 2 + ((i % 5) * 0.4),
      cpuCores: 4 + (i % 4) * 2,
      arch: '64-bit',
    };
    switch (i % 20) {
      case 13: return { ...base, disk: Math.max(4, diskMin - 24) };
      case 14: return { ...base, disk: Math.max(6, diskMin - 9) };
      case 15: return { ...base, tpm: 1.2, secureBoot: false, ram: Math.max(1, ramMin - 2) };
      case 16: return { ...base, currentOs: old[0], osRank: old[1] };
      case 17: return { ...base, ram: Math.max(1, ramMin - 2) };
      case 18: return { ...base, secureBoot: false, disk: Math.max(6, diskMin - 4) };
      case 19: return {
        hostName, ipAddress, currentOs: 'Unknown', osRank: null, ram: null, disk: null,
        tpm: null, secureBoot: null, cpuSpeed: null, cpuCores: null, arch: null,
      };
      default: return base;
    }
  });
}

/** Every endpoint in scope for this image, already judged against its prerequisites. */
export function computersFor(img: OsImage): EvaluatedComputer[] {
  const h = hash(img.id);
  const count = 148 + (h % 32);
  const prereqs = prerequisitesFor(img);
  const ramMin = prereqs.find((p) => p.key === 'ram')?.num ?? 4;
  const diskMin = prereqs.find((p) => p.key === 'disk')?.num ?? 64;
  const raw = img.prereq === 'win11'
    ? [...WIN11_SEEDS, ...generateFleet(img.prereq, h % 7, count - WIN11_SEEDS.length, ramMin, diskMin)]
    : generateFleet(img.prereq, h % 7, count, ramMin, diskMin);
  return raw.map((c) => evaluate(c, prereqs));
}

export function compatCounts(rows: EvaluatedComputer[]): Record<CompatStatus, number> {
  const counts: Record<CompatStatus, number> = { Compatible: 0, Incompatible: 0, Unknown: 0 };
  rows.forEach((r) => { counts[r.status] += 1; });
  return counts;
}

// ── Upload activity ────────────────────────────────────────────────────────

export type AttemptStatus = 'Uploaded' | 'Failed' | 'Cancelled' | 'In Progress' | 'Paused';

export interface UploadAttempt {
  id: string;
  fileName: string;
  size: string;
  at: string;
  by: string;
  status: AttemptStatus;
  /** Failure reason, or how far a stopped upload got. */
  detail?: string;
}

const UPLOADERS = ['Aarti Shah', 'Rohan Mehta', 'Vikram Sethi', 'Neha Raje'];

/** The history behind an image's current state — what the eye icon opens. */
export function seedAttempts(img: OsImage): UploadAttempt[] {
  const by = UPLOADERS[hash(img.id) % UPLOADERS.length];
  switch (img.status) {
    case 'Uploaded':
      return [
        { id: `${img.id}-A1`, fileName: img.fileName, size: img.size, at: img.uploadTime, by, status: 'Uploaded' },
        // Every other image also carries a first attempt that died, so the panel isn't always a
        // single happy row.
        ...(hash(img.id) % 2 === 0 ? [{
          id: `${img.id}-A0`, fileName: img.fileName, size: img.size, at: img.uploadTime.replace(/\d{2}:\d{2}/, '09:04'),
          by, status: 'Failed' as AttemptStatus, detail: 'Connection to the file server was lost at 61%.',
        }] : []),
      ];
    case 'Failed':
      return [{
        id: `${img.id}-A1`, fileName: img.fileName, size: img.size, at: '05 Aug 2026, 06:31 PM', by,
        status: 'Failed', detail: 'Checksum verification failed — the ISO appears to be corrupted.',
      }];
    case 'Cancelled':
      return [{
        id: `${img.id}-A1`, fileName: 'Win11_23H2_Education_EnglishUK_x64.iso', size: '5.4 GB',
        at: '02 Aug 2026, 12:18 PM', by, status: 'Cancelled', detail: 'Stopped by the uploader at 46%.',
      }];
    default:
      return [];
  }
}

// ── Formatting ─────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(bytes / 1024 ** 3 >= 10 ? 1 : 2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '11 Aug 2026, 10:22 AM' — the one timestamp format this module uses. */
export function formatStamp(d: Date): string {
  const h = d.getHours();
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, `
    + `${String(hh).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** 'in 2 min 40 sec' style remainder for an in-flight upload. */
export function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'less than a minute left';
  if (seconds < 60) return `${Math.ceil(seconds)} sec left`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s ? `${m} min ${s} sec left` : `${m} min left`;
}

/** Maximum ISO the uploader accepts, matching the guideline shown in the popup. */
export const MAX_ISO_BYTES = 10 * 1024 ** 3;

/* Kept to one line each: on the detail page these sit beside the dropzone, and a wrapped bullet
 * pushes the whole ISO section past the fold. */
export const UPLOAD_GUIDELINES = [
  'Supported format: .iso only',
  'Maximum file size: 10 GB',
  'Verify the ISO is not corrupted',
  'Time varies with size and network',
  'Keep the browser open while uploading',
];

/** Rejects a file before any transfer starts; null means it's good to go. */
export function validateIso(file: File): string | null {
  if (!/\.iso$/i.test(file.name)) return 'Unsupported format — only .iso files can be uploaded.';
  if (file.size > MAX_ISO_BYTES) return `File is ${formatBytes(file.size)} — the maximum supported ISO size is 10 GB.`;
  if (file.size === 0) return 'The selected file is empty.';
  return null;
}
