import { useSyncExternalStore } from 'react';
import { mockEndpoints } from './endpointsData';
import { componentCount, bomVersions, bomVersionStats, bomCiId, hash, bomAiAssets, registerScopeStart, registerScopeOs, bomComponents, registerIngestCounts, registerIngestRows, registerFresh, addIngestVersions } from './bomData';
import type { IngestUpload } from './bomData';
import type { IngestRow } from './bomData';
import type { BomProduct as BomScope, BomStatus, BomType } from './bomData';

/* BOM scope — what a BOM is about, and what holds a BOM licence.
 *
 * Each entry is an APPLICATION SERVICE: named by the person adding it — typed, or picked from the
 * CMDB's Application Services (which fills the name AND links it), or created there on save — plus
 * version, publisher and manufacturer. Its BOM arrives one of two ways:
 *   Agent  — the agent scans ONE path on ONE agent machine. The agent is MANDATORY: nothing else
 *            can run a scan.
 *   Ingest — someone uploads an SBOM. There is NO agent: the BOM is the document.
 *
 * Agents are addressed by their agent id — AGENT-N — never by a CMDB id. An entry mentions the
 * CMDB only when its name was picked from (or created as) an Application Service there. That new
 * Application Service is the only CMDB record BOM scope ever creates.
 *
 * Without a CMDB licence the field is still "Application Service" — the name is typed and nothing
 * is linked or created. `cmdbLicensed` is that switch (a demo toggle in this prototype).
 *
 * Exposed on `window.__bomStore` as well: Admin › BOM Management › BOM Scope is a vanilla-JS
 * prototype in a same-origin iframe, and it reads and writes THIS store rather than a copy. */

export type ProductSource = 'Agent' | 'Ingest';

/** A machine with the agent on it — the only thing that can run a BOM scan. Addressed by its
 *  agent id (AGENT-N). */
export interface BomAgent {
  id: string;
  hostName: string;
  ipAddress: string;
  os: string;
  /** Server / laptop — what kind of machine, for the CMDB listing only. */
  deviceType: string;
  agentOnline: boolean;
  endpointId: string | null;
  /** INTERNAL: the machine's own CMDB record, used only to put the agent-health dot on the CMDB
   *  listing. Never shown on a BOM screen — BOM addresses the agent, not the CI. */
  cmdbId: string;
}

/** What a product can be linked to in the CMDB. */
export type ServiceType = 'Business Service' | 'Application Service';
export const SERVICE_TYPES: ServiceType[] = ['Business Service', 'Application Service'];

export type ServiceStatus = 'Operational' | 'Non-Operational' | 'In Maintenance' | 'Retired';
export const SERVICE_STATUSES: ServiceStatus[] = ['Operational', 'Non-Operational', 'In Maintenance', 'Retired'];

/** A Business Service or Application Service CI. */
export interface ServiceCi {
  id: string;
  name: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  /** Set when the service was created from BOM scope rather than found in the CMDB. */
  createdFrom?: { productName: string; on: string };
}

export interface ProductRecord {
  /** Not a CI id — an entry in BOM scope (APS-N). */
  id: string;
  /** The Application Service name the BOM is listed under — typed, or the linked CI's name. */
  name: string;
  version: string;
  publisher: string;
  manufacturer: string;
  source: ProductSource;
  /** Mandatory for Agent; always null for Ingest. */
  agent: BomAgent | null;
  /** Agent only — the application's own folder (full-machine scans are not supported). */
  scanPath: string | null;
  /** Ingest only — the documents uploaded, per BOM type (file, format, parsed item count). One
   *  licence covers all three. Older entries carry only `sbomFile`. */
  ingested?: Partial<Record<BomType, { file: string; format: string; count: number; rows?: IngestRow[]; tool?: string }>>;
  /** Ingest only — the SBOM document the BOM came from. */
  sbomFile: string | null;
  sbomFormat: string | null;
  /** Set when the name was picked from (or created as) an Application Service in the CMDB. */
  linkedCi: ServiceCi | null;
  addedBy: string;
  addedOn: string;
  /** 'Aug 04, 2026 10:37 AM' — when the entry was added. */
  createdAt?: string;
  /** Set when the entry is edited — 'Oct 06, 2026 03:12 PM'. */
  updatedAt?: string;
  /** A freshly added agent product has not produced a BOM yet. */
  scanState: 'Scanned' | 'Queued';
}

/** The licence pool. Every product in scope holds exactly one. */
export const BOM_LICENSE_SEATS = 10;

export const isRootPath = (p: string | null | undefined) => {
  const t = (p ?? '').trim();
  return t === '/' || /^[A-Za-z]:\\?$/.test(t);
};

/* ── Agent machines ─────────────────────────────────────────────────────────
   The application servers the examples run on, plus the endpoint fleet. Agent machines only —
   a machine without the agent can never scan a product. */
const SERVER_AGENTS: BomAgent[] = [
  { id: 'AGENT-1', hostName: 'SOPS-APP-01', ipAddress: '10.20.40.61', os: 'Ubuntu 22.04.4 LTS', deviceType: 'Server', agentOnline: true, endpointId: null, cmdbId: 'CI-911' },
  { id: 'AGENT-2', hostName: 'PAY-GW-01', ipAddress: '10.20.40.72', os: 'Red Hat Enterprise Linux 9.4', deviceType: 'Server', agentOnline: true, endpointId: null, cmdbId: 'CI-912' },
  { id: 'AGENT-3', hostName: 'NETBANK-WEB-01', ipAddress: '10.20.40.84', os: 'Microsoft Windows Server 2022', deviceType: 'Server', agentOnline: false, endpointId: null, cmdbId: 'CI-913' },
  { id: 'AGENT-4', hostName: 'DC1-APP-01', ipAddress: '10.20.40.21', os: 'Red Hat Enterprise Linux 8.10', deviceType: 'Server', agentOnline: true, endpointId: null, cmdbId: 'CI-904' },
  { id: 'AGENT-5', hostName: 'DC1-DB-01', ipAddress: '10.20.40.33', os: 'Oracle Linux 8.9', deviceType: 'Server', agentOnline: true, endpointId: null, cmdbId: 'CI-883' },
];

/** Servers that are new to the CMDB seed — appended to the CMDB listing so the machine an agent
 *  runs on exists there too. */
const NEW_SERVER_CMDB_IDS = ['CI-911', 'CI-912', 'CI-913'];
export const newServerRows = () => SERVER_AGENTS.filter((h) => NEW_SERVER_CMDB_IDS.includes(h.cmdbId));

let AGENT_CACHE: BomAgent[] | null = null;
export const bomAgents = (): BomAgent[] => (AGENT_CACHE ??= [
  ...SERVER_AGENTS,
  ...mockEndpoints.map((e, i) => ({
    id: `AGENT-${SERVER_AGENTS.length + i + 1}`, hostName: e.hostName, ipAddress: e.ipAddress, os: e.osName,
    deviceType: /server/i.test(e.osName) ? 'Server' : 'Windows Laptop', agentOnline: e.agentOnline, endpointId: e.id,
    cmdbId: bomCiId(e.id),
  })),
]);
export const agentById = (id: string) => bomAgents().find((a) => a.id === id) ?? null;
/** The endpoint an agent runs on, addressed the way Patch and Vulnerability address it (EP-N).
 *  Server agents seeded here have no Endpoints-listing record, so they take their agent number. */
export const endpointIdOf = (a: Pick<BomAgent, 'id' | 'endpointId'>) => a.endpointId ?? `EP-${a.id.replace(/^AGENT-/, '')}`;
/** Remote office from the Endpoints listing; the seeded servers sit in the data centre. */
export const endpointOfficeOf = (a: BomAgent) =>
  (a.endpointId && mockEndpoints.find((e) => e.id === a.endpointId)?.remoteOffice) || (a.endpointId ? '—' : 'Data Center');
/* Endpoint (agent) build and last sync, as the Endpoint Scopes listing shows them. No record holds
   either, so both are derived from the agent id — stable across reloads. An online agent synced
   within the last few hours; an offline one, days ago. Anchored to the admin screens' "today". */
const AGENT_BUILDS = ['8.7.800', '8.7.701', '8.7.601', '8.7.503', '8.7.500', '8.7.409'];
const SYNC_NOW = new Date(2026, 9, 6, 18, 0);
export const endpointVersionOf = (a: BomAgent) => AGENT_BUILDS[hash(`${a.id}:ver`) % AGENT_BUILDS.length];
export const endpointLastSyncOf = (a: BomAgent) => {
  const h = hash(`${a.id}:sync`);
  const mins = a.agentOnline ? 5 + h % 300 : (2 + h % 12) * 1440 + h % 600;
  const d = new Date(SYNC_NOW.getTime() - mins * 60000);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};
export type OsFamily = 'Windows' | 'Linux' | 'macOS';
/** Which path syntax a machine uses — the scan path is typed in that syntax. */
export const osFamilyOf = (os: string): OsFamily => /windows/i.test(os) ? 'Windows' : /mac\s?os|darwin/i.test(os) ? 'macOS' : 'Linux';
/** CMDB listing only — the agent on the machine a CMDB row describes. */
export const agentByCmdbId = (cmdbId: string) => bomAgents().find((a) => a.cmdbId === cmdbId) ?? null;

/* ── Services a product can link to ──────────────────────────────────────────
   Business Services (what the business consumes) and Application Services (the technical
   service that delivers it). Grows when the Add product form creates one. */
let services: ServiceCi[] = [
  { id: 'CI-801', name: 'Retail Banking', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-802', name: 'Payments & Settlements', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-803', name: 'IT Service Management', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-804', name: 'Treasury Operations', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-805', name: 'Human Resources', serviceType: 'Business Service', status: 'In Maintenance' },
  { id: 'CI-806', name: 'Lending', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-807', name: 'Fraud & Risk Management', serviceType: 'Business Service', status: 'Operational' },
  { id: 'CI-811', name: 'Motadata ServiceOps', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-812', name: 'Finacle Core Banking', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-813', name: 'Online Banking Portal', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-814', name: 'Payment Gateway Switch', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-815', name: 'FICO Falcon Fraud Manager', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-816', name: 'Darwinbox HRMS Connector', serviceType: 'Application Service', status: 'Operational' },
  /* In the CMDB but not in BOM scope yet — what "Browse CMDB" has to offer beyond the linked ones. */
  { id: 'CI-817', name: 'Murex MX.3 Treasury', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-818', name: 'Temenos Infinity', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-819', name: 'Salesforce CRM Integration', serviceType: 'Application Service', status: 'Operational' },
  { id: 'CI-820', name: 'Customer KYC Gateway', serviceType: 'Application Service', status: 'In Maintenance' },
];
let serviceSeq = 820;
export const serviceCis = () => services;
export const serviceById = (id: string) => services.find((c) => c.id === id) ?? null;
/** The Application Services in the CMDB — the only service type an entry's name is picked from. */
export const applicationServices = () => services.filter((c) => c.serviceType === 'Application Service');

/* ── CMDB licence ────────────────────────────────────────────────────────────
   With it, the Application Service field can browse the CMDB, link, and create. Without it the
   field keeps its name and only takes typed text. */
let cmdbLicensed = true;
export const isCmdbLicensed = () => cmdbLicensed;
export function setCmdbLicensed(v: boolean) { cmdbLicensed = v; emit(); }

export interface NewService { name: string; serviceType: ServiceType; status: ServiceStatus }
/** Creates the service in the CMDB — the one CMDB record BOM scope can create. */
export function createService(n: NewService, productName: string): ServiceCi {
  const ci: ServiceCi = { ...n, id: `CI-${++serviceSeq}`, createdFrom: { productName, on: today() } };
  services = [...services, ci];
  emit();
  return ci;
}

/* ── Seed ───────────────────────────────────────────────────────────────────
   Eight of ten licences used. Every state the rules allow is present: agent at an app path,
   agent full scan, agent with the first scan queued, agent with a typed (unlinked) name, ingest
   linked to an Application Service, ingest with a typed name. */
const A = (id: string) => SERVER_AGENTS.find((h) => h.id === id)!;
const S = (id: string) => services.find((c) => c.id === id)!;
const SEED: ProductRecord[] = [
  { id: 'APS-001', name: 'Motadata ServiceOps', version: '9.2.1', publisher: 'Motadata', manufacturer: 'Mindarray Systems', source: 'Agent', agent: A('AGENT-1'), scanPath: '/opt/motadata/serviceops', sbomFile: null, sbomFormat: null, linkedCi: S('CI-811'), addedBy: 'Priya Nair', addedOn: 'Aug 04, 2026', scanState: 'Scanned' },
  { id: 'APS-002', name: 'Finacle Core Banking', version: '10.2.25', publisher: 'Infosys Finacle', manufacturer: 'Infosys Ltd.', source: 'Agent', agent: A('AGENT-4'), scanPath: '/u01/app/finacle', sbomFile: null, sbomFormat: null, linkedCi: S('CI-812'), addedBy: 'Vikram Sethi', addedOn: 'Aug 11, 2026', scanState: 'Scanned' },
  { id: 'APS-003', name: 'Online Banking Portal', version: '4.8.0', publisher: 'Bank IT', manufacturer: 'Bank IT (in-house)', source: 'Agent', agent: A('AGENT-3'), scanPath: 'D:\\Apps\\NetBanking', sbomFile: null, sbomFormat: null, linkedCi: S('CI-813'), addedBy: 'Priya Nair', addedOn: 'Aug 19, 2026', scanState: 'Scanned' },
  { id: 'APS-004', name: 'Payment Gateway Switch', version: '3.1.4', publisher: 'Bank IT', manufacturer: 'Bank IT (in-house)', source: 'Agent', agent: A('AGENT-2'), scanPath: '/opt/paygw/switch', sbomFile: null, sbomFormat: null, linkedCi: S('CI-814'), addedBy: 'Imran Qureshi', addedOn: 'Aug 22, 2026', scanState: 'Scanned' },
  { id: 'APS-005', name: 'Murex MX.3 Treasury', version: '3.1.42', publisher: 'Murex', manufacturer: 'Murex S.A.S.', source: 'Agent', agent: A('AGENT-4'), scanPath: '/opt/murex/mx3', sbomFile: null, sbomFormat: null, linkedCi: S('CI-817'), addedBy: 'Vikram Sethi', addedOn: 'Sep 30, 2026', scanState: 'Scanned' },
  { id: 'APS-006', name: 'Darwinbox HRMS Connector', version: '2.4.0', publisher: 'Darwinbox', manufacturer: 'Darwinbox Digital Solutions', source: 'Ingest', agent: null, scanPath: null, sbomFile: 'darwinbox-connector-2.4.0.cdx.json', sbomFormat: 'CycloneDX 1.6', linkedCi: S('CI-816'), addedBy: 'Neha Raje', addedOn: 'Sep 02, 2026', scanState: 'Scanned' },
  { id: 'APS-007', name: 'Loan Origination System', version: '0.9.0-rc2', publisher: 'Bank IT', manufacturer: 'Bank IT (in-house)', source: 'Ingest', agent: null, scanPath: null, sbomFile: 'los-build-1184.spdx.json', sbomFormat: 'SPDX 2.3', linkedCi: null, addedBy: 'Karan Malhotra', addedOn: 'Sep 15, 2026', scanState: 'Scanned' },
  { id: 'APS-008', name: 'FICO Falcon Fraud Manager', version: '6.5.2', publisher: 'FICO', manufacturer: 'Fair Isaac Corporation', source: 'Ingest', agent: null, scanPath: null, sbomFile: 'falcon-6.5.2-vendor-sbom.cdx.json', sbomFormat: 'CycloneDX 1.5', linkedCi: S('CI-815'), addedBy: 'Farah Sheikh', addedOn: 'Sep 24, 2026', scanState: 'Scanned' },
];

/* ── Store ────────────────────────────────────────────────────────────────── */
/* Seeded entries get their created / last-updated times here, once — the BOM Scope grid and the
   audit trail both read these. */
let products: ProductRecord[] = SEED.map((p) => { const t = seedTimes(p); return t ? { ...p, createdAt: fmtStamp(t.created), updatedAt: fmtStamp(t.updated) } : p; });
let seq = SEED.length;
/** The entries as first seeded — the audit trail's history is built from these, not from whatever
 *  they have been edited into since. */
const INITIAL = new Map(products.map((p) => [p.id, p]));
/* Each application's BOM history starts after it was added (see registerScopeStart in bomData). */
products.forEach((p) => { registerScopeStart(p.id, p.createdAt ?? p.addedOn); registerScopeOs(p.id, p.agent?.os ?? null); });
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version += 1; listeners.forEach((l) => l()); };

export const bomProducts = () => products;
export const productById = (id: string) => products.find((p) => p.id === id) ?? null;
export const seatsUsed = () => products.length;
export const seatsLeft = () => Math.max(0, BOM_LICENSE_SEATS - products.length);

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export type NewProduct = Omit<ProductRecord, 'id' | 'addedOn' | 'scanState' | 'addedBy'>;

/** Add a product to scope. Returns null when no licence is left — the caller says why. */
export function addProduct(p: NewProduct): ProductRecord | null {
  if (seatsLeft() <= 0) return null;
  /* The rule the forms enforce, enforced again where it cannot be bypassed. */
  if (p.source === 'Agent' && (!p.agent || !p.scanPath)) return null;
  const rec: ProductRecord = {
    ...p,
    /* An ingest has no agent — the BOM is the document. */
    agent: p.source === 'Ingest' ? null : p.agent,
    id: `APS-${String(++seq).padStart(3, '0')}`,
    addedBy: CURRENT_USER,
    addedOn: today(),
    createdAt: fmtStamp(new Date()),
    /* An ingest arrives with its document, so it is generated at once; a scan waits for the agent. */
    scanState: p.source === 'Ingest' ? 'Scanned' : 'Queued',
  };
  registerScopeStart(rec.id, rec.createdAt ?? rec.addedOn);
  registerScopeOs(rec.id, rec.agent?.os ?? null);
  if (rec.source === 'Ingest' && rec.ingested) {
    registerIngestCounts(rec.id, Object.fromEntries(Object.entries(rec.ingested).map(([t, v]) => [t, v!.count])));
    registerIngestRows(rec.id, Object.fromEntries(Object.entries(rec.ingested).filter(([, v]) => v!.rows?.length).map(([t, v]) => [t, v!.rows!])));
  }
  /* Added now: one version, dated now — not a generated history. */
  registerFresh(rec.id, rec.createdAt!, rec.ingested ? Object.fromEntries(Object.entries(rec.ingested).map(([t, v]) => [t, v!.format])) : {});
  products = [rec, ...products];
  emit();
  return rec;
}

/* ── Manufacturer catalog ──────────────────────────────────────────────────
   The Manufacturer field picks from Admin › Supplier Management › Manufacturer Catalog (MCAT-N)
   or adds to it. Seeded with catalog names plus every manufacturer an entry already carries, so
   an existing entry's value is always in the list. */
export interface Manufacturer { id: string; name: string; description: string }
let MCAT_SEQ = 7872;
let MANUFACTURERS: Manufacturer[] | null = null;
const CATALOG_NAMES = ['Tenable', 'Mstrix Comsec Pvt. Ltd.', 'TCS', 'HCL', 'JetBrains', 'Atlassian', 'Mozilla Corporation',
  'Qualys, Inc.', 'Canonical Ltd', 'Intel', 'Microsoft Corporation', 'Oracle Corporation', 'Red Hat, Inc.', 'IBM'];
export const manufacturers = (): Manufacturer[] => (MANUFACTURERS ??= [...new Set([
  ...products.map((p) => p.publisher).filter(Boolean), ...CATALOG_NAMES,
])].map((name) => ({ id: `MCAT-${MCAT_SEQ--}`, name, description: '' })));
export const manufacturerByName = (name: string) =>
  manufacturers().find((m) => m.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;
export function addManufacturer(name: string, description: string): Manufacturer {
  const m = { id: `MCAT-${7873 + manufacturers().length}`, name: name.trim(), description: description.trim() };
  MANUFACTURERS = [m, ...manufacturers()];
  return m;
}

/** Remove a product from scope — its licence is freed and all of its BOM data is deleted. */
export function removeProduct(id: string) {
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length !== before) emit();
}

/** A new SBOM for an ingested product is a new version, not a new licence. */
export function updateProduct(id: string, patch: Partial<ProductRecord>) {
  const before = productById(id);
  /* Every real change is written to the entry's audit trail, and stamps its Last Updated time —
     one place, so the edit form, the CI card and an SBOM upload all record the same way. */
  const changes = before ? diffForAudit(before, patch) : [];
  const stamp = changes.length ? { updatedAt: fmtStamp(new Date()) } : {};
  products = products.map((p) => (p.id === id ? { ...p, ...patch, ...stamp } : p));
  if (before && changes.length) logAudit(id, { at: stamp.updatedAt!, by: CURRENT_USER, action: 'Details updated', changes });
  emit();
}

/** Ingest more BOMs into an ingested application: a new version of a type it has, or a type it
 *  did not have yet (its first CBOM / AI BOM). Never a new licence — one covers all three types.
 *  Returns the version number each type landed on. */
export function ingestIntoProduct(id: string, uploads: Partial<Record<BomType, IngestUpload>>): Partial<Record<BomType, number>> {
  const p = productById(id);
  if (!p || p.source !== 'Ingest') return {};
  const at = fmtStamp(new Date());
  const existing = productBomTypes(p);
  const landed = addIngestVersions(p.id, productKey(p), existing, uploads, at, CURRENT_USER);
  /* The record lists the CURRENT file per type; an SBOM-only seed is promoted to the per-type map. */
  const files: NonNullable<ProductRecord['ingested']> = { ...(p.ingested ?? (p.sbomFile ? { SBOM: { file: p.sbomFile, format: p.sbomFormat ?? '—', count: componentCount(p.id, productKey(p), 'SBOM') } } : {})) };
  (Object.entries(uploads) as [BomType, IngestUpload][]).forEach(([t, u]) => { files[t] = { file: u.file, format: u.format, count: u.count, rows: u.rows, tool: u.tool }; });
  const sb = uploads.SBOM;
  products = products.map((x) => (x.id === id ? { ...x, ingested: files, ...(sb ? { sbomFile: sb.file, sbomFormat: sb.format } : {}), updatedAt: at } : x));
  logAudit(id, {
    at, by: CURRENT_USER, action: 'BOM ingested',
    detail: (Object.entries(uploads) as [BomType, IngestUpload][])
      .map(([t, u]) => `${t} ${existing.includes(t) ? `v${landed[t]} (new version)` : 'v1 (first)'} · ${u.file} · ${u.format}`).join(' · '),
  });
  return landed;
}

/* ── Audit trail ─────────────────────────────────────────────────────────────
   What happened to an entry, newest first: added, edited (field: old → new), linked or unlinked
   in the CMDB, a new SBOM uploaded, a scan requested. Seeded entries reuse the SAME created /
   updated times the BOM Scope grid shows, so the two screens tell one story. */
export const CURRENT_USER = 'Admin Sharma';
export interface AuditChange { field: string; from: string; to: string }
export interface AuditEntry { at: string; by: string; action: string; detail?: string; changes?: AuditChange[] }
const auditLog = new Map<string, AuditEntry[]>();
const TRACKED: [keyof ProductRecord, string, (v: any) => string][] = [
  ['name', 'Application', (v) => v ?? '—'],
  ['version', 'Version', (v) => v ?? '—'],
  ['publisher', 'Manufacturer', (v) => v ?? '—'],
  ['scanPath', 'Scan Path', (v) => v ?? '—'],
  ['linkedCi', 'CI', (v) => (v ? `${v.id} · ${v.name}` : 'Not linked')],
  ['sbomFile', 'SBOM file', (v) => v ?? '—'],
];
function diffForAudit(p: ProductRecord, patch: Partial<ProductRecord>): AuditChange[] {
  return TRACKED.flatMap(([k, label, f]) =>
    k in patch && f((patch as any)[k]) !== f((p as any)[k]) ? [{ field: label, from: f((p as any)[k]), to: f((patch as any)[k]) }] : []);
}
/* Function declarations, not consts: the seed above calls them before this point. */
export function fmtStamp(d: Date) {
  return `${d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}
function stampHash(v: string) { return [...v].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7); }
/** Seeded entries only store the day they were added; the time of day and the last edit are
 *  derived from the id — stable, never before creation, never after today. */
function seedTimes(p: ProductRecord): { created: Date; updated: Date } | null {
  const c = new Date(p.addedOn);
  if (isNaN(c.getTime())) return null;
  const h = stampHash(p.id); c.setHours(9 + (h % 8), h % 60, 0, 0);
  if (p.scanState === 'Queued') return { created: c, updated: c };
  const h2 = stampHash(p.id + ':u');
  let u = new Date(c.getTime() + (1 + (h2 % 20)) * 864e5 + (h2 % 300) * 6e4);
  const today = new Date(2026, 9, 6, 18, 0);
  if (u > today) u = new Date(Math.max(c.getTime(), today.getTime() - (h2 % 600) * 6e4));
  return { created: c, updated: u };
}
export function logAudit(id: string, e: AuditEntry) {
  auditFor(id); // make sure the seed is in place first
  auditLog.set(id, [e, ...(auditLog.get(id) ?? [])]);
  emit();
}
export function auditFor(id: string): AuditEntry[] {
  const existing = auditLog.get(id);
  if (existing) return existing;
  const p = INITIAL.get(id) ?? productById(id);
  if (!p) return [];
  const created = p.createdAt ?? p.addedOn;
  const seed: AuditEntry[] = [{
    at: created, by: p.addedBy, action: 'Application added to BOM scope',
    detail: p.source === 'Agent'
      ? `BOM source Endpoint · ${p.agent ? endpointIdOf(p.agent) : '—'} · ${p.scanPath ?? '—'}`
      : `BOM source Ingest · ${p.ingested ? Object.entries(p.ingested).map(([t, v]) => `${t} ${v!.file}`).join(' · ') : (p.sbomFile ?? '—')}`,
  }];
  if (p.linkedCi) seed.unshift({ at: created, by: p.addedBy, action: 'Linked to the CMDB', changes: [{ field: 'CI', from: 'Not linked', to: `${p.linkedCi.id} · ${p.linkedCi.name}` }] });
  /* The seeded "last updated" moment gets the edit that caused it: the version moved on. */
  const prev = p.version.replace(/(\d+)(?!.*\d)/, (n) => (Number(n) > 0 ? String(Number(n) - 1) : n));
  if (INITIAL.has(id) && p.updatedAt && p.updatedAt !== created && prev !== p.version)
    seed.unshift({ at: p.updatedAt, by: p.addedBy, action: 'Details updated', changes: [{ field: 'Version', from: prev, to: p.version }] });
  auditLog.set(id, seed);
  return seed;
}

export const subscribeProducts = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
/** The store's change counter — lets derived views (the BOM Dashboard) memoise against it. */
export const productsVersion = () => version;
export function useProductsVersion(): number {
  return useSyncExternalStore(subscribeProducts, () => version, () => version);
}

/* ── The BOM of one entry ───────────────────────────────────────────────────
   The BOM engine is keyed (endpointId, productKey). Both come from the entry's own id — never its
   name — because the name can change (picking an Application Service renames the entry), and a
   rename must not invent a different BOM history. */
export const productKey = (p: ProductRecord) => p.id.toLowerCase();

/** An ingest is an SBOM. CBOM and AI BOM come from the agent. */
export const productBomTypes = (p: ProductRecord): BomType[] =>
  p.source === 'Ingest'
    ? (p.ingested ? (['SBOM', 'CBOM', 'AI BOM'] as BomType[]).filter((t) => !!p.ingested![t]) : ['SBOM'])
    : (['SBOM', 'CBOM', 'AI BOM'] as BomType[]).filter((t) => componentCount(p.id, productKey(p), t) > 0);

/** The one scope the BOM tab shows for this product. */
export function productScope(p: ProductRecord): BomScope {
  const key = productKey(p);
  return {
    key,
    name: p.name,
    version: p.version,
    path: p.source === 'Ingest' ? (p.sbomFile ?? 'Ingested SBOM') : (p.scanPath ?? '—'),
    source: p.source === 'Ingest' ? 'manual · file upload' : 'agent · directory scan',
    status: p.scanState === 'Queued' ? 'Pending' : 'Scanned',
    lastScan: p.scanState === 'Queued' ? 'Queued' : (bomVersions(p.id, key, 'SBOM')[0]?.generatedAt ?? '—'),
    findings: hash(`${p.id}:${key}:find`) % 6,
    excludePaths: [],
    isDefault: true,
  };
}

export interface ProductBomSummary {
  /** Endpoint applications only: the last scan's outcome. Null for an ingested application — nothing is scanned. */
  status: BomStatus | null;
  components: number;
  vulnerabilities: number;
  cryptoAssets: number;
  /** AI components in the current AI BOM (AIROM's excluded ones left out) — the tab badge's number. */
  aiComponents: number;
  lastGenerated: string | null;
}

export function productBomSummary(p: ProductRecord): ProductBomSummary {
  if (p.scanState === 'Queued') {
    return { status: p.source === 'Ingest' ? null : 'In Progress', components: 0, vulnerabilities: 0, cryptoAssets: 0, aiComponents: 0, lastGenerated: null };
  }
  const key = productKey(p);
  const types = productBomTypes(p);
  const n = (t: BomType) => (types.includes(t) ? componentCount(p.id, key, t) : 0);
  const cur = bomVersions(p.id, key, 'SBOM').find((v) => v.state === 'Current');
  /* Components and vulnerable components are read off the CURRENT SBOM version — the same
     `bomVersionStats` the SBOM tab and the Overview use — so the listing, the Overview and the
     tab can never quote different numbers for one entry. */
  const stats = cur ? bomVersionStats(p.id, key, 'SBOM', cur.v) : null;
  const lastRun = bomVersions(p.id, key, 'SBOM')[0]?.runs[0];
  return {
    status: p.source === 'Ingest' ? null : lastRun?.result === 'Failed' ? 'Failed' : 'Success',
    components: stats?.totalPackages ?? n('SBOM'),
    vulnerabilities: stats?.vulnerablePackages ?? 0,
    cryptoAssets: n('CBOM'),
    aiComponents: n('AI BOM'),
    lastGenerated: cur ? cur.generatedAt.split(' ').slice(0, 3).join(' ') : null,
  };
}

/* Path helpers for "where a component lives" below. */
const isWindows = (h: BomAgent | null) => !!h && /windows/i.test(h.os);
/** Where a full-scanned product actually lives — the folder its own components came from. */
const deriveProductPath = (p: ProductRecord) =>
  (isWindows(p.agent) ? `C:\\Program Files\\${p.name}` : `/opt/${productKey(p)}`);

/* ── Products linked to a CMDB service ──────────────────────────────────────
   The reverse of a product's CMDB link — what the CMDB detail page shows on its BOM tab. */
/* Business Service → the Application Services it runs on (the CMDB "depends on" relation). A
   Business Service holds no BOM of its own; its BOM tab shows the applications linked to those
   Application Services. */
const BUSINESS_APPS: Record<string, string[]> = {
  'CI-801': ['CI-812', 'CI-813', 'CI-820'],   // Retail Banking → Finacle, Online Banking Portal, KYC Gateway
  'CI-802': ['CI-814'],                       // Payments & Settlements → Payment Gateway Switch
  'CI-803': ['CI-811'],                       // IT Service Management → Motadata ServiceOps
  'CI-804': ['CI-817'],                       // Treasury Operations → Murex MX.3
  'CI-805': ['CI-816'],                       // Human Resources → Darwinbox HRMS Connector
  'CI-806': ['CI-812', 'CI-813'],             // Lending → Finacle, Online Banking Portal
  'CI-807': ['CI-815', 'CI-814'],             // Fraud & Risk → FICO Falcon, Payment Gateway Switch
};
export const appServicesOf = (businessCiId: string) => BUSINESS_APPS[businessCiId] ?? [];
/** Applications in BOM scope behind a CMDB CI — linked to it directly (an Application Service),
 *  or through the Application Services a Business Service depends on. */
export const linkedProductsFor = (ciId: string) => {
  const ids = new Set([ciId, ...appServicesOf(ciId)]);
  return products.filter((p) => !!p.linkedCi && ids.has(p.linkedCi.id));
};
/** Applications scanned on an endpoint (EP-N). One endpoint can host several. */
export const productsOnEndpoint = (endpointId: string) =>
  products.filter((p) => !!p.agent && endpointIdOf(p.agent) === endpointId);

/** A linked service as a CMDB listing row — what the CMDB detail page is opened with. */
export function serviceCiRow(c: ServiceCi) {
  return {
    id: c.id, name: c.name, ciType: c.serviceType as string,
    status: (c.status === 'Operational' ? 'Operational' : 'Select') as 'Operational' | 'Select',
    hostName: '---', ipAddress: '---', usedBy: null as string | null,
    managedByGroup: c.serviceType === 'Business Service' ? 'Service Owners' : 'Application Support',
    managedBy: null as { name: string; initials?: string; color?: string } | null,
  };
}

/* ── Where a component lives ────────────────────────────────────────────────
   The reverse of a product's BOM: which products carry a given component. Deterministic from
   (product, component); a product whose first scan is queued has reported nothing yet. */
export interface AffectedProduct {
  product: ProductRecord;
  /** The build of the component inside THIS product — drift is per product. */
  version: string;
  /** A path for a scan, the document for an ingest. */
  foundIn: string;
}

/* The file Trivy names as the package's parent in its dependency graph — the lock file,
   manifest, jar or package database it read the package from. Trivy reports no per-package
   install folder, so none is invented. */
const COMPONENT_FILE: Record<string, (n: string, v: string) => string> = {
  Maven: (n, v) => `lib/${n}-${v}.jar`,
  Npm: () => 'package-lock.json',
  PyPI: (n, v) => `site-packages/${n}-${v}.dist-info/METADATA`,
  Golang: () => 'go.mod',
  NuGet: () => 'packages.lock.json',
  Deb: () => '/var/lib/dpkg/status',
  RPM: () => '/var/lib/rpm/rpmdb.sqlite',
};

/** The applications whose AI BOM carries this AI component — read from the SAME AI BOM the
 *  application's own AI BOM tab lists, so the two can never disagree. Matched by bom-ref (names
 *  repeat: openai on PyPI and on npm), by name only when there is no ref. AI BOMs come from an
 *  endpoint scan only, so every hit has an endpoint. "Found at" is the application's scan path
 *  joined with where AIROM found it (evidence location, :line when AIROM gives one). */
export function aiAffectedProducts(ref: string | undefined, name: string): AffectedProduct[] {
  return products
    .filter((p) => p.source === 'Agent' && p.scanState !== 'Queued')
    .flatMap((p) => {
      const key = productKey(p);
      const hit = bomAiAssets(p.id, key).find((m) => (ref && m.ref ? m.ref === ref : m.name === name));
      if (!hit) return [];
      const root = (p.scanPath ?? '').replace(/[\\/]$/, '');
      const rel = hit.usage && hit.usage !== '—' ? hit.usage : '';
      const foundIn = !rel ? root : isWindows(p.agent) ? `${root}\\${rel.replace(/\//g, '\\')}` : `${root}/${rel}`;
      return [{ product: p, version: hit.version, foundIn }];
    });
}

export function affectedProducts(
  c: { id: string; name: string; version: string; ecosystem: string; cis?: number },
  otherVersions: string[] = [],
): AffectedProduct[] {
  void otherVersions;
  /* Read from the applications' OWN current SBOMs: an application is affected only if its SBOM
     really lists this exact name@version — so the component page, the application's SBOM tab
     and the dashboard can never disagree. */
  const hits = products.filter((p) => p.scanState !== 'Queued' && productBomTypes(p).includes('SBOM')
    && bomComponents(p.id, productKey(p)).some((x) => x.name === c.name && x.version === c.version));
  return hits.map((p) => {
    const v = c.version;
    const file = (COMPONENT_FILE[c.ecosystem] ?? COMPONENT_FILE.Deb)(c.name, v);
    let foundIn: string;
    if (p.source === 'Ingest') foundIn = `${p.sbomFile ?? 'Ingested SBOM'} · components[]`;
    else if (file.startsWith('/')) foundIn = file;
    else {
      const root = isRootPath(p.scanPath) ? deriveProductPath(p) : (p.scanPath ?? '');
      foundIn = isWindows(p.agent) ? `${root}\\${file.replace(/\//g, '\\')}` : `${root.replace(/\/$/, '')}/${file}`;
    }
    return { product: p, version: v, foundIn };
  });
}

/* ── Bridge for the Admin iframe ─────────────────────────────────────────── */
declare global {
  interface Window {
    __bomStore?: {
      list: () => ProductRecord[];
      seats: () => { total: number; used: number; left: number };
      remove: (id: string) => void;
      subscribe: (l: () => void) => () => void;
      /** Opens the shared Add product form in the app shell. */
      openAdd: (mode: 'agent' | 'ingest') => void;
      openDetail: (id: string) => void;
      /** Opens the Add form in edit mode for an existing entry. */
      openEdit: (id: string) => void;
      /** Asks, in a centred dialog in the app shell, before removing an entry. */
      confirmRemove: (id: string) => void;
      /** Opens the Endpoint detail page for an application's agent (by agent id). */
      openEndpoint: (agentId: string) => void;
      /** Opens a linked service's CMDB page, landing on its BOM tab. */
      openCi: (id: string) => void;
      summary: (id: string) => ProductBomSummary | null;
      cmdbLicensed: () => boolean;
    };
  }
}

/** Requests from anywhere (the BOM listing, the Admin iframe) land on one host component. */
export const OPEN_ADD_EVENT = 'bom:add-product';
export const OPEN_DETAIL_EVENT = 'bom:open-product';
export const OPEN_EDIT_EVENT = 'bom:edit-product';
export const OPEN_REMOVE_EVENT = 'bom:remove-product';
/** Opens the endpoint an application is scanned on, as its real Endpoint detail page. */
export const OPEN_ENDPOINT_EVENT = 'bom:open-endpoint';
export const OPEN_CI_EVENT = 'bom:open-ci';

if (typeof window !== 'undefined') {
  window.__bomStore = {
    list: () => products,
    seats: () => ({ total: BOM_LICENSE_SEATS, used: seatsUsed(), left: seatsLeft() }),
    remove: removeProduct,
    subscribe: subscribeProducts,
    openAdd: (mode) => window.dispatchEvent(new CustomEvent(OPEN_ADD_EVENT, { detail: { mode } })),
    openDetail: (id) => window.dispatchEvent(new CustomEvent(OPEN_DETAIL_EVENT, { detail: { id } })),
    openEdit: (id) => window.dispatchEvent(new CustomEvent(OPEN_EDIT_EVENT, { detail: { id } })),
    confirmRemove: (id) => window.dispatchEvent(new CustomEvent(OPEN_REMOVE_EVENT, { detail: { id } })),
    openEndpoint: (agentId) => window.dispatchEvent(new CustomEvent(OPEN_ENDPOINT_EVENT, { detail: { agentId } })),
    openCi: (id) => window.dispatchEvent(new CustomEvent(OPEN_CI_EVENT, { detail: { id } })),
    summary: (id) => { const p = productById(id); return p ? productBomSummary(p) : null; },
    cmdbLicensed: () => cmdbLicensed,
  };
}
