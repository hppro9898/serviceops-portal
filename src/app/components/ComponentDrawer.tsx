import { useState, useEffect, useRef } from 'react';
import {
  X, RefreshCw, Zap, Flag, ArrowUp, Upload, FileText, Boxes, Shield, Search, ChevronDown, Sparkles, Copy, Check, ListFilter,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDrawerStack } from './DrawerStack';
import { DrawerTabStrip } from './DrawerTabStrip';
import { MinimizedDrawerRail } from './MinimizedDrawerRail';
import { HeaderKpiRow, type HeaderKpiItem } from './HeaderKpiRow';
import { Pagination } from './Pagination';
import type { SoftwareComponent } from './softwareComponentsData';
import { componentCves, LANGUAGE_OF } from './softwareComponentDetail';
import { affectedProducts, useProductsVersion, isCmdbLicensed, endpointIdOf } from './bomProductsData';
import { AgentDot, SourcePill, serviceIcon, EndpointLink, OsChip } from './BomProductFormParts';
import { osFamilyOf } from './bomProductsData';

/* Software Component detail — the same drawer shell as the Endpoint detail page.
 *
 * FOLD 1 is static across every tab: what this component IS (id, name, version, severity,
 * purl, licence, sources, fix) and the two figures that say how much of the estate it
 * reaches. FOLD 2 is the tab body, and it is the only thing that changes.
 *
 * Every figure in fold 1 is the LISTING ROW restated — 23 CIs, 3 CVEs, 31 products — and
 * every fold-2 list is derived from that same row, so the header and the table beneath it
 * cannot quote different numbers. */

interface ComponentDrawerProps {
  openAssets: SoftwareComponent[];
  activeAssetId: string;
  onClose: () => void;
  onCloseTab: (id: string) => void;
  onTabChange: (id: string) => void;
  stackTabs?: { id: string; subject: string }[];
  stackWidth?: number;
  onStackWidthChange?: (w: number) => void;
  stackMinimized?: boolean;
  onStackMinimizedChange?: (m: boolean) => void;
  stackActiveTab?: string;
  onStackActiveTabChange?: (t: string) => void;
}

/* Sources stopped being a tab: it was five facts, and each one belongs with the thing it
   describes. "Reported by" is identity, so it sits in fold 1; the rest are reference
   fields, so they sit in the right rail with everything else you look up rather than act on. */
/* Affected (by application OR by endpoint) · Vulnerabilities. No Overview tab: the header KPIs
   and the right rail already carry every fact it summarised, so the page opens on Affected.
   A component is ONE name + version — one PURL, the way CycloneDX / SPDX and every SBOM tool
   identify it. log4j-core 2.13.0 is a different component from 2.14.1, with its own CVEs and its
   own page, so nothing here mixes builds. The endpoint is reached THROUGH an application (one
   each; none for an ingested SBOM), so it is a view of Affected, not a second list. */
type MainTab = 'cis' | 'vulns';
type FoundView = 'app' | 'endpoint';

const SEV_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318', dot: '#EF4444' },
  High: { bg: '#FFF4ED', text: '#C4320A', dot: '#F59E0B' },
  Medium: { bg: '#FFFAEB', text: '#B54708', dot: '#EAB308' },
  Low: { bg: '#F2F4F7', text: '#475467', dot: '#98A2B3' },
};

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

/** Severity order for the sub-tabs — worst first, matching the table's own ordering. */
const SEV_ORDER = ['Critical', 'High', 'Medium', 'Low'] as const;

function Pill({ tone, children }: { tone: 'crit' | 'warn' | 'neutral'; children: React.ReactNode }) {
  const s = tone === 'crit' ? { backgroundColor: '#FEF3F2', color: '#B42318' }
    : tone === 'warn' ? { backgroundColor: '#FEF7E6', color: '#D97706' }
    : { backgroundColor: '#F1F5F9', color: '#475467' };
  return (
    <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[12px] font-medium" style={s}>
      {children}
    </span>
  );
}


/** The listing's table treatment, reused so the fold-2 grids and the list page agree. */
const TH = 'px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider';
const TD = 'px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]';

export function ComponentDrawer({
  openAssets, activeAssetId, onClose, onCloseTab, onTabChange,
  stackTabs, stackWidth, onStackWidthChange, stackMinimized, onStackMinimizedChange,
  stackActiveTab, onStackActiveTabChange,
}: ComponentDrawerProps) {
  useProductsVersion();
  const c = openAssets.find((x) => x.id === activeAssetId) ?? openAssets[0];

  const [minimizedLocal, setMinimizedLocal] = useState(false);
  const minimized = stackMinimized ?? minimizedLocal;
  const setMinimized = onStackMinimizedChange ?? setMinimizedLocal;
  useEffect(() => { setMinimized(false); }, [activeAssetId]);

  const [tabLocal, setTabLocal] = useState<MainTab>('cis');
  const [foundView, setFoundView] = useState<FoundView>('app');
  const { open: openInStack } = useDrawerStack();
  /* A tab remembered from before the Overview tab was removed falls back to Affected. */
  const activeTab: MainTab = stackActiveTab === 'cis' || stackActiveTab === 'vulns' ? stackActiveTab : tabLocal;
  const setActiveTab = (t: MainTab) => { setTabLocal(t); onStackActiveTabChange?.(t); };

  /* Same width contract as every other drawer: full view is the viewport less the rail, and
     the chosen width is shared through the stack so it survives a tab swap. */
  const [drawerWidth, setDrawerWidth] = useState(stackWidth ?? (typeof window !== 'undefined' ? window.innerWidth - 54 : 1546));
  const [isResizing, setIsResizing] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (onStackWidthChange) onStackWidthChange(drawerWidth); }, [drawerWidth]);
  useEffect(() => {
    if (!isResizing) return;
    const move = (e: MouseEvent) => setDrawerWidth(Math.min(window.innerWidth - 54, Math.max(560, window.innerWidth - e.clientX)));
    const up = () => setIsResizing(false);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
  }, [isResizing]);
  const fullWidth = typeof window !== 'undefined' ? window.innerWidth - 54 : 1546;
  const toggleDrawerView = () => setDrawerWidth((w) => (w > 1080 ? 900 : fullWidth));

  const [copied, setCopied] = useState(false);
  /* Fold-2 state. Each tab is its own list, so they page and filter independently — the
     same shape PatchComputersTab uses for Missing / Installed / Ignored. */
  /* The first filter is where the BOM came from: a component an agent found is on a machine
     now; one in an ingested SBOM may be in something not deployed yet. */
  /* Affected tab filter: BOM source (Applications view) or OS (Endpoints view). */
  const [fSrc, setFSrc] = useState<Set<string>>(new Set());
  const [fOs, setFOs] = useState<Set<string>>(new Set());
  const [affFilterOpen, setAffFilterOpen] = useState(false);
  const affFilterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!affFilterOpen) return;
    const onDown = (e: MouseEvent) => { if (affFilterRef.current && !affFilterRef.current.contains(e.target as Node)) setAffFilterOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [affFilterOpen]);
  const [tabQuery, setTabQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  /* Vulnerabilities tab: a severity SUB-TAB (one at a time — it answers "how bad") plus
     three independent multi-select filters (each answers a different question, so they
     AND together the way the module list pages do). */
  const [sevBucket, setSevBucket] = useState<string>('All');
  const [sevOpen, setSevOpen] = useState(false);
  const sevRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sevOpen) return;
    const onDown = (e: MouseEvent) => {
      if (sevRef.current && !sevRef.current.contains(e.target as Node)) setSevOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sevOpen]);
  const [fType, setFType] = useState<Set<string>>(new Set());
  const [fPatch, setFPatch] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const nFilters = fType.size + fPatch.size;
  const clearFilters = () => { setFType(new Set()); setFPatch(new Set()); };
  useEffect(() => {
    if (!filterOpen) return;
    const onDown = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [filterOpen]);
  useEffect(() => { setCurrentPage(1); setSelected(new Set()); }, [activeTab, tabQuery, activeAssetId, sevBucket, nFilters, fSrc, fOs, foundView]);
  const [fieldQuery, setFieldQuery] = useState('');
  const [fieldsOpen, setFieldsOpen] = useState(true);

  if (!c) return null;
  if (minimized) {
    return (
      <MinimizedDrawerRail
        items={stackTabs ?? [{ id: c.id, subject: c.name }]}
        activeId={activeAssetId}
        onSelect={(id) => { onTabChange(id); setMinimized(false); }}
        onRestore={() => setMinimized(false)}
      />
    );
  }

  /* Where this component lives = the products in BOM scope whose BOM carries it. The agent
     machine is a column, not the row: the product is what someone chose to cover. */
  const affected = affectedProducts(c);
  const allCis = affected.map((r) => ({ ...r, ciId: r.product.id, office: r.product.source as string }));

  /* Component -> the CI carrying it -> that CI's BOM, opened on the dependency tree at this
     component. The asset drawer is the destination (not the endpoint) because the CI id is what
     this table shows, and `bomEndpointId` keeps the BOM keyed to the host that was scanned.
     `bomComponent` is what stops the trail going cold at the CI: without it the user lands on a
     host's whole BOM having asked about one library. */
  /* Component -> the product carrying it -> that product's detail page. */
  const openProduct = (p: (typeof affected)[number]['product']) => openInStack('bom-products', p.id, p.name, p);

  const cves = componentCves(c);
  const wide = drawerWidth > 1080;

  /* Reach — every figure counted from the same rows the Found In tab lists. */
  const endpointsHere = Array.from(new Map(allCis.filter((r) => r.product.agent).map((r) => [r.product.agent!.id, r.product.agent!])).values());
  /* By Endpoint — one row per endpoint, the applications on it that carry the component, and
     the builds they carry. Ingested SBOMs have no endpoint, so they form their own group. */
  const byEndpoint = endpointsHere.map((ag) => {
    const rows = allCis.filter((r) => r.product.agent?.id === ag.id);
    return { ag, rows };
  });

  const tq = tabQuery.trim().toLowerCase();
  /* By endpoint honours the search too — host, OS, IP, endpoint id or an application on it. */
  const epShown = byEndpoint.filter(({ ag }) => fOs.size === 0 || fOs.has(osFamilyOf(ag.os))).filter(({ ag, rows }) => !tq || [ag.hostName, ag.os, ag.ipAddress, ag.endpointId ?? '', ag.id,
    ...rows.map((r) => r.product.name)].join(' ').toLowerCase().includes(tq));
  const cisFiltered = allCis
    .filter((r) => fSrc.size === 0 || fSrc.has(r.office === 'Agent' ? 'Endpoint' : 'Ingest'))
    .filter((r) => !tq || [r.product.id, r.product.name, r.product.publisher, r.product.manufacturer, r.product.source, r.version, r.foundIn,
      r.product.agent?.id ?? '', r.product.agent?.hostName ?? '', r.product.linkedCi?.id ?? ''].join(' ').toLowerCase().includes(tq));
  /* Patch availability is DERIVED from `fixedIn` rather than stored, so the filter and the
     column can never disagree about what "Yes" means. */
  const patchLabel = (v: { fixedIn: string | null }) => (v.fixedIn ? 'Yes' : 'No');
  /* The sub-tab counts are taken BEFORE the severity bucket is applied but AFTER the other
     filters — so a count says how many rows that tab would show if you clicked it, which is
     the only reading that isn't a lie. */
  const cvesScoped = cves.filter((v) =>
    (!tq || [v.id, v.title, v.severity ?? '', v.cwe ?? '', v.vulnType].join(' ').toLowerCase().includes(tq))
    && (fType.size === 0 || fType.has(v.vulnType))
    && (fPatch.size === 0 || fPatch.has(patchLabel(v))));
  const sevCount = (s: string) => (s === 'All' ? cvesScoped.length : cvesScoped.filter((v) => v.severity === s).length);
  const cvesFiltered = cvesScoped.filter((v) => sevBucket === 'All' || v.severity === sevBucket);
  /* Options come from the rows this component actually has, so a picker never offers a
     value that would filter everything out. Status keeps the canonical order. */
  const typeOpts = Array.from(new Set(cves.map((v) => v.vulnType))).sort();
  const patchOpts = ['Yes', 'No'].filter((p) => cves.some((v) => patchLabel(v) === p));
  const rowsFor = activeTab === 'cis' && foundView === 'app' ? cisFiltered : activeTab === 'vulns' ? cvesFiltered : [];
  const totalPages = Math.ceil(rowsFor.length / itemsPerPage) || 1;
  const pageSlice = <T,>(xs: T[]) => xs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const cisPage = pageSlice(cisFiltered);
  const cvesPage = pageSlice(cvesFiltered);

  /* Shared chrome — the search row every detail tab carries above its grid.
     A FUNCTION, not a component: declaring a component inside render gives React a new
     type on every keystroke, which unmounts the input and drops focus mid-word. */
  const tabSearch = (placeholder: string, className = 'relative mb-3') => (
    <div className={className}>
      <input
        value={tabQuery}
        onChange={(e) => setTabQuery(e.target.value)}
        placeholder={placeholder}
        className="h-[36px] w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
      />
      {tabQuery ? (
        <button onClick={() => setTabQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
      ) : (
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
      )}
    </div>
  );

  /* One labelled multi-select block in the Filter popup. A FUNCTION for the same reason
     tabSearch is one — a component declared here would remount its checkboxes on every
     keystroke elsewhere in the drawer. */
  const filterSection = (label: string, opts: readonly string[], sel: Set<string>, setSel: (u: (p: Set<string>) => Set<string>) => void) => (
    opts.length === 0 ? null : (
      <div className="border-b border-[#f1f5f9] px-3 py-2.5 last:border-b-0">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{label}</div>
        {opts.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-[#F5F7FA]">
            <input
              type="checkbox"
              checked={sel.has(o)}
              onChange={(e) => {
                const on = e.target.checked;
                setSel((prev) => { const n = new Set(prev); if (on) n.add(o); else n.delete(o); return n; });
              }}
              className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
            />
            <span className="text-[12px] text-[#364658]">{o}</span>
          </label>
        ))}
      </div>
    )
  );

  /* ── FOLD 1 — the meta line under the heading, identical on all three tabs ── */
  const kpis: HeaderKpiItem[] = [
    /* The primary build, and how many OTHER builds the estate is running. Drift is the
       reason a fix can be applied and the component still be present: upgrading the
       primary leaves the laggards behind. */
    { key: 'version', tip: `Version: ${c.version}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Version</span>
        <span className="text-[12px] font-medium text-[#364658]">{c.version}</span>
      </span>) },
    { key: 'sev', tip: `Severity: ${c.topSeverity === 'None' ? 'no known vulnerabilities' : c.topSeverity}`, node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Severity</span>
        {c.topSeverity === 'None' ? <span className="text-[12px] font-medium text-[#22A06B]">None</span> : (
          <>
            <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV_PILL[c.topSeverity].dot }} />
            <span className="text-[12px] font-semibold" style={{ color: SEV_PILL[c.topSeverity].text }}>{c.topSeverity}</span>
          </>
        )}
      </span>) },
    { key: 'fix', tip: c.fixVersion ? `Fix Version: ${c.fixVersion}` : 'No published fix', node: (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] text-[#7B8FA5]">Fix Version</span>
        <span className={`text-[12px] font-medium ${c.fixVersion ? 'text-[#22A06B]' : 'text-[#9CA3AF]'}`}>{c.fixVersion ?? '---'}</span>
      </span>) },
    { key: 'purl', tip: `PURL: ${c.purl}`, node: (
      <button
        onClick={() => { navigator.clipboard?.writeText(c.purl); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
        title="Copy package URL"
        className="-mx-1 inline-flex max-w-full items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-[#F5F7FA]"
      >
        <span className="flex-shrink-0 text-[11px] text-[#7B8FA5]">PURL</span>
        <span className="truncate text-[12px] font-medium text-[#364658]">{c.purl}</span>
        {copied ? <Check size={13} className="flex-shrink-0 text-[#22A06B]" /> : <Copy size={13} className="flex-shrink-0 text-[#9ca3af]" />}
      </button>) },
  ];

  const FIELDS: { label: string; value: React.ReactNode }[] = [
    { label: 'Component ID', value: c.id },
    { label: 'Name', value: c.name },
    { label: 'Version', value: c.version },
    { label: 'Ecosystem', value: `${c.ecosystem} · ${LANGUAGE_OF[c.ecosystem]}` },
    { label: 'PURL', value: <span className="break-all">{c.purl}</span> },
    { label: 'License', value: c.licenseFlag
        ? <span className="inline-flex items-center gap-1 text-[#D97706]"><Flag size={12} />{c.license}</span>
        : c.license },
    { label: 'License Flagged', value: c.licenseFlag
        ? <span className="inline-flex items-center gap-1 font-medium text-[#D97706]"><Flag size={12} />Yes</span>
        : 'No' },
    { label: 'Fix Version', value: c.fixVersion
        ? <span className="inline-flex items-center gap-1 font-medium text-[#22A06B]"><ArrowUp size={12} />{c.fixVersion}</span>
        : <Dash /> },
    { label: 'Applications', value: String(affected.length) },
    /* The machines are still a fact worth having — counted through the applications, so it is
       never a second, independent estimate. */
    { label: 'Endpoints', value: String(new Set(affected.map((r) => r.product.agent?.id).filter(Boolean)).size) },
    /* KEV is the platform's CISA enrichment, not a Trivy field — the value says where it is from. */
    { label: 'Exploit Status', value: c.kev
        ? <span className="inline-flex items-center gap-1 text-[#B42318]"><Zap size={12} />Yes · CISA KEV</span>
        : 'No' },
  ];
  const fq = fieldQuery.trim().toLowerCase();
  const shownFields = fq ? FIELDS.filter((f) => f.label.toLowerCase().includes(fq)) : FIELDS;

  const TABS: { id: MainTab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'cis', label: 'Affected', count: affected.length, icon: <Boxes size={14} /> },
    { id: 'vulns', label: 'Vulnerabilities', count: c.vulnerabilities, icon: <Shield size={14} /> },
  ];

  return (
    <div
      className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white shadow-2xl ${drawerWidth <= 1080 ? 'border-l border-[#e5e7eb]' : ''}`}
      ref={drawerRef}
      style={{ width: `${drawerWidth}px` }}
      data-drawer
    >
      {/* Resize handle — identical to the other drawers' */}
      <div
        className="group absolute bottom-0 left-0 top-0 z-[100] w-3 cursor-ew-resize"
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }}
      >
        <div className="absolute bottom-0 left-0 top-0 w-px bg-transparent transition-colors group-hover:bg-[#3D8BD0]" />
      </div>

      {/* Open-record tabs + window controls */}
      <div className="flex items-center border-b border-[#e5e7eb] bg-[#f9fafb]">
        <DrawerTabStrip
          items={stackTabs ?? [{ id: c.id, subject: c.name }]}
          activeId={activeAssetId}
          onSelect={onTabChange}
          onClose={onCloseTab}
          maxVisible={wide ? 8 : 3}
        />
        <button onClick={() => setMinimized(true)} title="Minimize panel" className="flex-shrink-0 border-l border-[#e5e7eb] p-2 hover:bg-[#e5e7eb]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button onClick={toggleDrawerView} className="p-2 hover:bg-[#e5e7eb]" title={wide ? 'Switch to small view' : 'Switch to full view'}>
          {wide ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="8" width="12" height="12" rx="1.5" stroke="#364658" strokeWidth="2" />
              <path d="M8 8V6.5A1.5 1.5 0 0 1 9.5 5H18A1.5 1.5 0 0 1 19.5 6.5V15A1.5 1.5 0 0 1 18 16.5H16" stroke="#364658" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="14" height="14" rx="1.5" stroke="#364658" strokeWidth="2" /></svg>
          )}
        </button>
        <button onClick={onClose} className="p-2 hover:bg-[#e5e7eb]"><X size={18} className="text-[#364658]" /></button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── FOLD 1 ─────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-start justify-between border-b border-[#e5e7eb] bg-white px-6 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="flex min-w-0 items-center gap-2 text-[18px] font-semibold text-[#364658]">
              <span className="inline-block size-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: c.topSeverity === 'None' ? '#22C55E' : SEV_PILL[c.topSeverity].dot }} />
              <span className="flex-shrink-0 rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{c.id}</span>
              <span className="truncate">{c.name}</span>
              {c.kev && (
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: '#FEF3F2', color: '#B42318' }} title="On CISA's Known Exploited Vulnerabilities list">
                  <Zap size={11} />KEV
                </span>
              )}
            </h1>
            <HeaderKpiRow items={kpis} />
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              title="Refresh"
              onClick={() => toast.success('Component reconciled from the latest scans')}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#DFE5ED] bg-white hover:bg-[#F5F7FA]"
            >
              <RefreshCw size={16} className="text-[#6b7280]" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: tabs + fold 2 */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white">
              <div className="flex items-center gap-2.5 px-6">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-[14px] font-medium transition-colors ${
                      activeTab === t.id
                        ? 'border-[#3D8BD0] text-[#3D8BD0]'
                        : 'border-transparent text-[#6b7280] hover:border-[#CBD5E1] hover:bg-[#F5F7FA] hover:text-[#364658]'
                    }`}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* -- FOLD 2 ------------------------------------------- */}
            {/* px-6 pb-4 so the sticky pager can span it with -mx-6 -mb-4, exactly as the
                Patch detail tabs do. */}
            <div className="min-h-0 flex-1 overflow-auto bg-white px-6 pb-4 pt-4">
              {activeTab === 'cis' && (
                <>
                  {/* Two tabs — by application or by endpoint — then search and one Filter. */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {([['app', 'Applications', affected.length], ['endpoint', 'Endpoints', endpointsHere.length]] as const).map(([v, label, n]) => (
                      <button key={v} onClick={() => setFoundView(v)}
                        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[13px] font-medium transition-colors ${foundView === v ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'}`}>
                        {label}
                        <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold ${foundView === v ? 'bg-[#3D8BD0] text-white' : 'bg-[#EEF2F6] text-[#64748B]'}`}>{n}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center gap-2.5">
                    {tabSearch('Select field to search...', 'relative min-w-[240px] flex-1')}
                    {(() => {
                      const isApp = foundView === 'app';
                      const sel = isApp ? fSrc : fOs;
                      const setSel = isApp ? setFSrc : setFOs;
                      const opts = isApp
                        ? ['Endpoint', 'Ingest'].filter((o) => allCis.some((r) => (r.office === 'Agent' ? 'Endpoint' : 'Ingest') === o))
                        : [...new Set(endpointsHere.map((ag) => osFamilyOf(ag.os)))].sort();
                      return (
                        <div className="relative" ref={affFilterRef}>
                          <button onClick={() => setAffFilterOpen((o) => !o)}
                            className={`inline-flex h-[36px] flex-shrink-0 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
                              sel.size > 0 ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'}`}>
                            <ListFilter size={14} />
                            Filter
                            {sel.size > 0 && <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#3D8BD0] px-1 text-[11px] font-semibold text-white">{sel.size}</span>}
                            <ChevronDown size={13} className={affFilterOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                          </button>
                          {affFilterOpen && (
                            <div className="absolute right-0 top-full z-50 mt-1 w-[220px] rounded-md border border-[#e5e7eb] bg-white shadow-lg">
                              {filterSection(isApp ? 'BOM Source' : 'OS', opts, sel, setSel)}
                              <div className="flex items-center justify-between border-t border-[#e5e7eb] px-3 py-2">
                                <button onClick={() => setSel(new Set())} disabled={sel.size === 0}
                                  className="text-[12px] text-[#3D8BD0] hover:underline disabled:cursor-default disabled:text-[#9CA3AF] disabled:no-underline">Clear all</button>
                                <button onClick={() => setAffFilterOpen(false)}
                                  className="rounded bg-[#3D8BD0] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#3579b4]">Done</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {foundView === 'endpoint' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead className="border-b border-[#e5e7eb]">
                          <tr>{['Endpoint', 'Host Name', 'OS', 'IP Address', 'Applications'].map((h) => <th key={h} className={`${TH} whitespace-nowrap`}>{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] bg-white">
                          {epShown.map(({ ag, rows }) => (
                            <tr key={ag.id} className="align-top transition-colors hover:bg-[#f9fafb]">
                              <td className={TD}><EndpointLink agent={ag} /></td>
                              <td className={TD}>{ag.hostName}</td>
                              <td className={TD}><span className="inline-flex items-center gap-2"><OsChip family={osFamilyOf(ag.os)} /><span className="max-w-[200px] truncate" title={ag.os}>{ag.os}</span></span></td>
                              <td className={`${TD} font-mono`}>{ag.ipAddress}</td>
                              <td className="px-4 py-3 text-[12px]">
                                <span className="flex flex-wrap gap-1.5">
                                  {rows.map((r) => (
                                    <button key={r.product.id} type="button" onClick={() => openProduct(r.product)} title={`Open ${r.product.name}`}
                                      className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-medium text-[#3D8BD0] hover:bg-[#d0e8f9]">{r.product.name}</button>
                                  ))}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {!epShown.length && (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                              {tq ? <>No endpoint matches “{tabQuery.trim()}”. <button type="button" onClick={() => setTabQuery('')} className="font-medium text-[#3D8BD0] hover:underline">Clear search</button></>
                                : 'Not found on any endpoint in BOM scope.'}
                            </td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (<>

                  {selected.size > 0 && (
                    <div className="mb-3 flex items-center gap-2 text-[13px]">
                      <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-md bg-[#EAF2FB] px-1.5 text-[12px] font-semibold tabular-nums text-[#3D8BD0]">{selected.size}</span>
                      <span className="text-[#64748B]">{selected.size === 1 ? 'record' : 'records'} selected</span>
                      <span className="h-4 w-px bg-[#E3E8EF]" />
                      <button onClick={() => setSelected(new Set())} className="text-[12px] font-medium text-[#3D8BD0] hover:underline">Unselect all</button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                      <thead className="border-b border-[#e5e7eb]">
                        <tr>
                          <th className="w-[40px] px-4 py-2.5 text-left">
                            <input
                              type="checkbox"
                              checked={cisPage.length > 0 && cisPage.every((r) => selected.has(r.ciId))}
                              onChange={(e) => setSelected(e.target.checked ? new Set(cisPage.map((r) => r.ciId)) : new Set())}
                              className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                            />
                          </th>
                          {['ID', 'Application', 'BOM Source', 'Endpoint', ...(isCmdbLicensed() ? ['CI'] : []), 'Path'].map((h) => (
                            <th key={h} className={`${TH} whitespace-nowrap`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb] bg-white">
                        {cisPage.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                            {tq ? <>No application matches “{tabQuery.trim()}”. <button type="button" onClick={() => setTabQuery('')} className="font-medium text-[#3D8BD0] hover:underline">Clear search</button></>
                              : 'No application matches this source.'}
                          </td></tr>
                        ) : cisPage.map((r) => (
                          <tr key={r.ciId} className="hover:bg-[#f9fafb] transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selected.has(r.ciId)}
                                onChange={(e) => setSelected((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(r.ciId); else next.delete(r.ciId);
                                  return next;
                                })}
                                className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => openProduct(r.product)}
                                title={`Open ${r.product.name}`}
                                className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]"
                              >{r.product.id}</button>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => openProduct(r.product)} className="block whitespace-nowrap text-left text-[12px] font-medium text-[#364658] transition-colors hover:text-[#3D8BD0]">{r.product.name}</button>
                              <span className="block text-[11px] text-[#7B8FA5]">{r.product.publisher}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap"><SourcePill source={r.product.source} /></td>
                            <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                              {r.product.agent ? (
                                <span className="inline-flex items-center gap-2">
                                  <EndpointLink agent={r.product.agent} />
                                  <span className="text-[#7B8FA5]">{r.product.agent.hostName}</span>
                                </span>
                              ) : <span className="text-[#9CA3AF]">—</span>}
                            </td>
                            {isCmdbLicensed() && <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                              {r.product.linkedCi ? (
                                <span className="inline-flex items-center gap-1.5" title={r.product.linkedCi.name}>
                                  <span className="text-[#7B8FA5]">{serviceIcon(r.product.linkedCi.serviceType)}</span>
                                  <span className="font-medium text-[#364658]">{r.product.linkedCi.id}</span>
                                  <span className="text-[#7B8FA5]">{r.product.linkedCi.name}</span>
                                </span>
                              ) : <span className="text-[#9CA3AF]">—</span>}
                            </td>}
                            <td className="px-4 py-3 text-[12px]">
                              {r.product.source === 'Ingest' ? <span className="text-[#9CA3AF]">—</span> : <span className="block max-w-[320px] truncate font-mono text-[#364658]" title={r.foundIn}>{r.foundIn}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="sticky bottom-0 z-30 -mx-6 -mb-4 bg-white">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={itemsPerPage}
                      totalItems={cisFiltered.length}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                    />
                  </div>
                  </>)}
                </>
              )}

              {activeTab === 'vulns' && (
                cves.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-[14px] font-medium text-[#364658]">No known vulnerabilities</p>
                    <p className="mt-1 text-[13px] text-[#7B8FA5]">Nothing is published against {c.name} {c.version} today.</p>
                  </div>
                ) : (
                  <>
                    {/* Severity · search · filters. Severity is single-select (a CVE has one
                        rating, so it answers "how bad") while status / type / patch are
                        multi-select filters that AND together. */}
                    <div className="mb-3 flex items-center gap-2.5">
                      {/* Severity as a dropdown, matching the group filter on Installed on:
                          one control, one row, whatever the component's spread of severities
                          happens to be. Only severities this component HAS are listed. */}
                      <div className="relative flex-shrink-0" ref={sevRef}>
                        <button
                          onClick={() => setSevOpen((v) => !v)}
                          className={`inline-flex h-[36px] items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
                            sevBucket !== 'All'
                              ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                              : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
                          }`}
                        >
                          {sevBucket !== 'All'
                            ? <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV_PILL[sevBucket].dot }} />
                            : <Shield size={14} className="text-[#7B8FA5]" />}
                          {sevBucket === 'All' ? 'All severities' : sevBucket}
                          <ChevronDown size={14} className={`transition-transform ${sevOpen ? 'rotate-180' : ''} ${sevBucket !== 'All' ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
                        </button>
                        {sevOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setSevOpen(false)} />
                            <div className="absolute left-0 top-full z-50 mt-1 w-[240px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                              <div className="max-h-[260px] overflow-y-auto">
                                {['All', ...SEV_ORDER.filter((x) => cves.some((v) => v.severity === x))].map((x) => (
                                  <button
                                    key={x}
                                    onClick={() => { setSevBucket(x); setSevOpen(false); }}
                                    className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] transition-colors ${
                                      sevBucket === x ? 'bg-[#F1F5F9] text-[#364658]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                                    }`}
                                  >
                                    <span className="flex min-w-0 items-center gap-2">
                                      {x !== 'All' && <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV_PILL[x].dot }} />}
                                      <span className="truncate">{x === 'All' ? 'All severities' : x}</span>
                                    </span>
                                    <span className="flex flex-shrink-0 items-center gap-2">
                                      <span className="text-[12px] text-[#7B8FA5]">{sevCount(x)}</span>
                                      {sevBucket === x && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <span className="mx-0.5 h-5 w-px bg-[#E3E8EF]" />
                      {/* The search sits on the pill row: the buckets and the query narrow the
                          same list, so they belong on one line. */}
                      {tabSearch('Select field to search...', 'relative min-w-[240px] flex-1')}

                      <div className="relative" ref={filterRef}>
                        <button
                          onClick={() => setFilterOpen((o) => !o)}
                          className={`inline-flex h-[36px] flex-shrink-0 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
                            nFilters > 0
                              ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                              : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
                          }`}
                        >
                          <ListFilter size={14} />
                          Filter
                          {nFilters > 0 && (
                            <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#3D8BD0] px-1 text-[11px] font-semibold text-white">{nFilters}</span>
                          )}
                          <ChevronDown size={13} className={filterOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        </button>
                        {filterOpen && (
                          <div className="absolute right-0 top-full z-50 mt-1 w-[248px] rounded-md border border-[#e5e7eb] bg-white shadow-lg">
                            <div className="max-h-[380px] overflow-y-auto">
                                                            {filterSection('Vulnerability Type', typeOpts, fType, setFType)}
                              {filterSection('Patch Availability', patchOpts, fPatch, setFPatch)}
                            </div>
                            <div className="flex items-center justify-between border-t border-[#e5e7eb] px-3 py-2">
                              <button
                                onClick={clearFilters}
                                disabled={nFilters === 0}
                                className="text-[12px] text-[#3D8BD0] hover:underline disabled:cursor-default disabled:text-[#9CA3AF] disabled:no-underline"
                              >
                                Clear all
                              </button>
                              <button
                                onClick={() => setFilterOpen(false)}
                                className="rounded bg-[#3D8BD0] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#3579b4]"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* How the match was made — a CVE list is only as trustworthy as the
                        thing it was matched on, so it sits with the table it qualifies. */}

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1180px]">
                        <thead className="border-b border-[#e5e7eb]">
                          <tr>
                            <th className="w-[40px] px-4 py-2.5 text-left">
                              <input
                                type="checkbox"
                                checked={cvesPage.length > 0 && cvesPage.every((v) => selected.has(v.id))}
                                onChange={(e) => setSelected(e.target.checked ? new Set(cvesPage.map((v) => v.id)) : new Set())}
                                className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                              />
                            </th>
                            {['CVE ID', 'Description', 'Exploit Status', 'Severity', 'Vulnerability Type', 'Patch Availability'].map((h) => (
                              <th key={h} className={`${TH} whitespace-nowrap`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] bg-white">
                          {cvesPage.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No vulnerabilities match.</td></tr>
                          ) : cvesPage.map((v) => {
                            return (
                            <tr key={v.id} className="hover:bg-[#f9fafb] transition-colors">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selected.has(v.id)}
                                  onChange={(e) => setSelected((prev) => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(v.id); else next.delete(v.id);
                                    return next;
                                  })}
                                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                                />
                              </td>
                              <td className={TD}>
                                {/* Opens the vulnerability's own page (BOM › Vulnerabilities). */}
                                <button type="button" onClick={() => openInStack('bom-vulnerabilities', v.id, v.title, { id: v.id })}
                                  className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]">{v.id}</button>
                              </td>
                              {/* Trivy has no title, so the line is the description's first sentence
                                  (full text on hover); under it what the advisory itself carries. */}
                              <td className="px-4 py-3">
                                <div className="max-w-[420px] truncate text-[12px] font-medium text-[#364658]" title={v.description}>{v.title}</div>
                                <div className="mt-0.5 whitespace-nowrap text-[12px] text-[#7B8FA5]">
                                  {[v.cvss != null ? `CVSS ${v.cvss.toFixed(1)}` : null, v.cwe, v.published ? `Published ${v.published}` : null].filter(Boolean).join(' · ') || 'Not reported'}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {v.exploited
                                  ? <Pill tone="crit"><Zap size={11} />Yes · CISA KEV</Pill>
                                  : <span className="text-[12px] text-[#64748B]">No</span>}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {v.severity ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] font-medium" title={v.ratedBy ? `Rated by ${v.ratedBy}` : undefined}
                                        style={{ backgroundColor: SEV_PILL[v.severity].bg, color: SEV_PILL[v.severity].text }}>
                                    <span className="size-1.5 rounded-full" style={{ backgroundColor: SEV_PILL[v.severity].dot }} />
                                    {v.severity}
                                  </span>
                                ) : <span className="text-[12px] text-[#9CA3AF]">Not rated</span>}
                              </td>
                              <td className={TD}>{v.vulnType}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                                {v.fixedIn
                                  ? <span className="inline-flex items-center gap-1 font-medium text-[#22A06B]"><Check size={13} />Yes · {v.fixedIn}</span>
                                  : <span className="text-[12px] text-[#64748B]">No</span>}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="sticky bottom-0 z-30 -mx-6 -mb-4 bg-white">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={cvesFiltered.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                      />
                    </div>
                  </>
                )
              )}

            </div>
          </div>

          {/* Right: properties rail — the same shape as Endpoint Properties */}
          <div className="flex w-[360px] flex-shrink-0 flex-col border-l border-[#e5e7eb] bg-white">
            <div className="px-5 pb-3 pt-4">
              <h2 className="text-[16px] font-semibold text-[#364658]">Component Properties</h2>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={15} />
                <input
                  value={fieldQuery}
                  onChange={(e) => setFieldQuery(e.target.value)}
                  placeholder="Search fields..."
                  className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-9 pr-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 pb-4">
              <div className="rounded-lg border border-[#E5E7EB]">
                <button
                  onClick={() => setFieldsOpen((o) => !o)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#364658]">
                    <FileText size={15} className="text-[#6b7280]" />Component Fields
                  </span>
                  <ChevronDown size={16} className={`text-[#6b7280] transition-transform ${fieldsOpen ? '' : '-rotate-90'}`} />
                </button>
                {fieldsOpen && (
                  <div className="border-t border-[#E5E7EB] px-4 py-2">
                    {shownFields.length === 0 ? (
                      <p className="py-4 text-[13px] text-[#9CA3AF]">No field matches “{fieldQuery}”.</p>
                    ) : shownFields.map((f) => (
                      <div key={f.label} className="grid grid-cols-[130px_1fr] items-start gap-3 py-2.5">
                        <span className="text-[13px] text-[#7B8FA5]">{f.label}</span>
                        <span className="text-[13px] text-[#364658]">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#e5e7eb] p-3">
              <button
                onClick={() => toast('Ask AI is not wired up in this prototype')}
                className="flex w-full items-center gap-2 rounded-lg border-2 border-[#C084FC] px-3 py-2.5 text-left text-[13px] text-[#7B8FA5] transition-colors hover:bg-[#FAF5FF]"
              >
                <Sparkles size={16} className="text-[#A855F7]" />
                Ask AI for insights, summaries, and actions...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
