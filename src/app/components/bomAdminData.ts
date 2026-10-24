/* BOM Management (Admin) — mock data.
 *
 * Mirrors the BOM Administration prototype: which CIs are enrolled for BOM generation, the rules
 * that enrol them automatically, the schedules that scan them, and how long their versions are
 * kept. Licensing is the gate — every other screen counts against "enrolled CIs".
 */

export type CiOrigin = 'Agent' | 'Manual ingest' | 'Auto-enrolled';
export type EnrolKind = 'manual' | 'auto';

export interface AdminCi {
  id: string;
  hostName: string;
  osName: string;
  ciType: string;
  ipAddress: string;
  origin: CiOrigin;
  status: 'Active' | 'Inactive';
  lastSeen: string;
  enrolment: EnrolKind;
}

/** Seats are the whole point of the Licensing screen — enrolment consumes them. */
export const LICENSE_SEATS_TOTAL = 8;

export const ADMIN_CIS: AdminCi[] = [
  { id: 'CI-1', hostName: 'WIN-GONKABA3FFG', osName: 'Microsoft Windows Server 2025', ciType: 'Windows Server', ipAddress: '172.16.12.239', origin: 'Auto-enrolled', status: 'Active', lastSeen: 'Wed, Jul 15, 09:12', enrolment: 'auto' },
  { id: 'CI-2', hostName: 'DESKTOP-G4S7FTB', osName: 'Microsoft Windows 10 Enterprise', ciType: 'Windows Desktop', ipAddress: '172.16.12.222', origin: 'Auto-enrolled', status: 'Active', lastSeen: 'Wed, Jul 15, 09:10', enrolment: 'auto' },
  { id: 'CI-3', hostName: 'WIN-9IGL1TLLAKN', osName: 'Microsoft Windows Server 2022', ciType: 'Windows Server', ipAddress: '172.16.12.228', origin: 'Auto-enrolled', status: 'Active', lastSeen: 'Wed, Jul 15, 09:14', enrolment: 'auto' },
  { id: 'CI-4', hostName: 'WIN-6SA2JMQEV36', osName: 'Microsoft Windows Server 2019', ciType: 'Windows Server', ipAddress: '172.16.13.48', origin: 'Auto-enrolled', status: 'Active', lastSeen: 'Tue, Jul 14, 23:41', enrolment: 'auto' },
  { id: 'CI-5', hostName: 'WIN-S89SRH2KET7', osName: 'Microsoft Windows Server 2025', ciType: 'Windows Server', ipAddress: '172.16.13.45', origin: 'Agent', status: 'Active', lastSeen: 'Wed, Jul 15, 09:15', enrolment: 'manual' },
  { id: 'CI-6', hostName: 'DESKTOP-G4S7FTB', osName: 'Microsoft Windows 10 Enterprise', ciType: 'Windows Desktop', ipAddress: '172.16.12.246', origin: 'Manual ingest', status: 'Inactive', lastSeen: 'Wed, Jun 12, 09:08', enrolment: 'manual' },
];

/** CIs the estate knows about but which are not enrolled — what "Add manually" offers. */
export const UNENROLLED_CIS: AdminCi[] = [
  { id: 'CI-7', hostName: 'ACIWSUSV-01', osName: 'Microsoft Windows Server 2022', ciType: 'Windows Server', ipAddress: '192.168.1.13', origin: 'Agent', status: 'Active', lastSeen: 'Wed, Jul 15, 08:55', enrolment: 'manual' },
  { id: 'CI-8', hostName: 'DC1-DB-01', osName: 'Microsoft Windows Server 2022 Datacenter', ciType: 'Windows Server', ipAddress: '10.20.40.33', origin: 'Agent', status: 'Active', lastSeen: 'Wed, Jul 15, 08:40', enrolment: 'manual' },
  { id: 'CI-9', hostName: 'FIN-LT-0188', osName: 'Microsoft Windows 11 Pro', ciType: 'Windows Desktop', ipAddress: '10.20.22.188', origin: 'Agent', status: 'Active', lastSeen: 'Wed, Jul 15, 07:20', enrolment: 'manual' },
];

export interface AutoEnrolRule {
  id: string;
  name: string;
  enabled: boolean;
  /** How many enrolled CIs this rule brought in. */
  matches: number;
  summary: string;
}

export const AUTO_ENROL_RULES: AutoEnrolRule[] = [
  { id: 'AR-1', name: 'All Windows Servers', enabled: true, matches: 3, summary: 'CI Type is Windows Server' },
  { id: 'AR-2', name: 'Finance workstations', enabled: false, matches: 1, summary: 'CI Type is Windows Desktop AND Location is Mumbai Office' },
];

export interface SchedulePolicy {
  id: string;
  name: string;
  coverage: number;
  trigger: string;
  triggerTime: string;
  nextRun: string;
  nextRunTime: string;
  status: 'Active' | 'Disabled';
}

export const SCHEDULE_POLICIES: SchedulePolicy[] = [
  { id: 'BS-1', name: 'Nightly — all servers', coverage: 4, trigger: 'Daily', triggerTime: '02:00 IST', nextRun: 'Tomorrow', nextRunTime: '02:00 IST', status: 'Active' },
  { id: 'BS-2', name: 'Weekly — workstations + host', coverage: 3, trigger: 'Weekly · Sun', triggerTime: '01:00 IST', nextRun: '16 Aug', nextRunTime: '01:00 IST', status: 'Active' },
  { id: 'BS-3', name: 'Payments host — daily', coverage: 1, trigger: 'Daily', triggerTime: '23:30 UTC', nextRun: '—', nextRunTime: 'Paused', status: 'Disabled' },
];

export interface RetentionException {
  id: string;
  name: string;
  appliesTo: number;
  appliesToKind: 'Fixed List' | 'Dynamic';
  keepVersions: number;
  deleteAfterDays: number;
  status: 'Active' | 'Disabled';
}

export const RETENTION_EXCEPTIONS: RetentionException[] = [
  { id: 'RR-1', name: 'Payments host', appliesTo: 1, appliesToKind: 'Fixed List', keepVersions: 5, deleteAfterDays: 30, status: 'Active' },
];

export const RETENTION_DEFAULT = { keepVersions: 10, deleteAfterDays: 90 };

export const VERSION_OPTIONS = [3, 5, 10, 20, 50].map((n) => `${n} versions`);
export const DAY_OPTIONS = [30, 60, 90, 180, 365].map((n) => `${n} days`);

export const SCHEDULE_TYPES = ['Recurring', 'One time'];
export const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];
export const TIMEZONES = ['Asia/Kolkata (IST)', 'UTC', 'America/New_York (EST)', 'Europe/London (GMT)'];

/** Fields a CI can be matched on when building an auto-include condition. */
export const CONDITION_FIELDS = ['CI Type', 'Operating System', 'IP Address', 'Location', 'Origin', 'Status', 'Tag'];
export const CONDITION_OPERATORS = ['is', 'is not', 'contains', 'does not contain', 'starts with'];
export const CONDITION_VALUES: Record<string, string[]> = {
  'CI Type': ['Windows Server', 'Windows Desktop', 'Linux Server', 'Mac Laptop', 'Network Device'],
  'Operating System': ['Microsoft Windows Server 2025', 'Microsoft Windows Server 2022', 'Microsoft Windows Server 2019', 'Microsoft Windows 11 Pro', 'Microsoft Windows 10 Enterprise'],
  'IP Address': ['172.16.12.*', '172.16.13.*', '10.20.*'],
  Location: ['Ahmedabad HQ', 'Mumbai Office', 'Bengaluru Campus', 'Pune Development Center'],
  Origin: ['Agent', 'Manual ingest', 'Auto-enrolled'],
  Status: ['Active', 'Inactive'],
  Tag: ['production', 'critical', 'finance', 'server'],
};

// ── Derived counts, so no two cards can disagree ───────────────────────────

export const enrolledCount = (cis: AdminCi[]) => cis.length;
export const seatsAvailable = (cis: AdminCi[]) => Math.max(0, LICENSE_SEATS_TOTAL - cis.length);
export const inactiveCount = (cis: AdminCi[]) => cis.filter((c) => c.status === 'Inactive').length;
export const agentScanned = (cis: AdminCi[]) => cis.filter((c) => c.origin !== 'Manual ingest').length;
export const manuallyIngested = (cis: AdminCi[]) => cis.filter((c) => c.origin === 'Manual ingest').length;
export const byRule = (cis: AdminCi[]) => cis.filter((c) => c.enrolment === 'auto').length;
export const byHand = (cis: AdminCi[]) => cis.filter((c) => c.enrolment === 'manual').length;
