import { useState, useEffect } from 'react';
import {
  ChevronDown, Search, X, FileText, Sparkles, RefreshCw, Boxes,
  Building2,
} from 'lucide-react';
import { BomDropdown } from './BomDropdown';
import { toast } from 'sonner';
import { useDrawerStack } from './DrawerStack';
import { DrawerTabStrip } from './DrawerTabStrip';
import { MinimizedDrawerRail } from './MinimizedDrawerRail';
import { Pagination } from './Pagination';
import { HeaderKpiRow, type HeaderKpiItem } from './HeaderKpiRow';
import { AI_KIND_TITLE, highestFix } from './aiModelsData';
import type { AiAssetRow } from './aiModelsData';
import type { AiromFinding } from './aiBomCatalog';
import { AIROM_SCAN } from './aiBomCatalog';
import { aiAffectedProducts, isCmdbLicensed, osFamilyOf, useProductsVersion } from './bomProductsData';
import { EndpointLink, OsChip, SourcePill } from './BomProductFormParts';

/* One AI component's page — built ONLY from what AIROM reports for it (see aiBomCatalog.ts):
 *
 *   Affected         the applications in BOM scope whose AI BOM carries it, by application or by
 *                    endpoint (an endpoint is reached through an application).
 *   Vulnerabilities  CVEs (osv.dev) and AIROM-RISK findings in the artefact itself, with the
 *                    action that clears them.
 *
 * No Risk signals tab. Measured over aibom.json + this device's scans, only data egress (and
 * detection confidence, which is not shown) had data on every component; the rest were sparse (lifecycle 6%, a version to check CVEs against 17%, unsafe-load 3%), so most
 * components showed two "Pass" rows repeating the header. Each signal now lives where its data is:
 *   lifecycle (retired / deprecated)  → header warning
 *   data egress (hosted API)          → header warning, action in its tooltip
 *   known CVEs · unsafe load          → Vulnerabilities tab, with the fixing action
 *
 * No Overview tab: the AIROM facts and the evidence (file, line and code AIROM found it in) sit in
 * the right rail, lifecycle warnings in the header, so the page opens on Affected.
 *
 * Detection confidence (airom:confidence) is NOT shown anywhere on the AI component screens — it
 * is AIROM's uncalibrated certainty that the component exists, not a fact about it, and it
 * read as a risk score. Component type and CycloneDX type identify what the component is.
 *
 * Licence, provenance, model card and "used for" are NOT shown: AIROM does not report them. */

const SEV_STYLE: Record<AiromFinding['severity'], { bg: string; text: string; dot: string }> = {
  critical: { bg: '#FEF3F2', text: '#B42318', dot: '#EF4444' },
  high: { bg: '#FFF4ED', text: '#C4320A', dot: '#F97316' },
  medium: { bg: '#FFFAEB', text: '#B54708', dot: '#F59E0B' },
  low: { bg: '#F1F5F9', text: '#475467', dot: '#98A2B3' },
};
const LIFE_STYLE = { retired: { bg: '#FEF3F2', text: '#DC2626' }, deprecated: { bg: '#FFFAEB', text: '#B45309' }, supported: { bg: '#ECFDF3', text: '#22A06B' } };
const SEV_ORDER = ['critical', 'high', 'medium', 'low'];

const fmtBytes = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} KB` : `${n} B`);

interface AiComponentDrawerProps {
  openAssets: AiAssetRow[];
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

type MainTab = 'cis' | 'vulns';
type FoundView = 'app' | 'endpoint';

export function AiComponentDrawer({
  openAssets, activeAssetId, onClose, onCloseTab, onTabChange,
  stackTabs, stackWidth, onStackWidthChange, stackMinimized, onStackMinimizedChange,
  stackActiveTab, onStackActiveTabChange,
}: AiComponentDrawerProps) {
  useProductsVersion();
  const c = openAssets.find((x) => x.id === activeAssetId) ?? openAssets[0];

  const [minimizedLocal, setMinimizedLocal] = useState(false);
  const minimized = stackMinimized ?? minimizedLocal;
  const setMinimized = onStackMinimizedChange ?? setMinimizedLocal;
  useEffect(() => { setMinimized(false); }, [activeAssetId]);

  const [tabLocal, setTabLocal] = useState<MainTab>('cis');
  const [foundView, setFoundView] = useState<FoundView>('app');
  const [source, setSource] = useState<'all' | 'Agent' | 'Ingest'>('all');
  const { open: openInStack } = useDrawerStack();
  /* A tab remembered from before the Overview tab was removed falls back to Affected. */
  const activeTab: MainTab = stackActiveTab === 'cis' || stackActiveTab === 'vulns' ? stackActiveTab : tabLocal;
  const setActiveTab = (t: MainTab) => { setTabLocal(t); onStackActiveTabChange?.(t); };

  const [drawerWidth, setDrawerWidth] = useState(stackWidth ?? (typeof window !== 'undefined' ? window.innerWidth - 54 : 1546));
  const [isResizing, setIsResizing] = useState(false);
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
  const wide = drawerWidth > 1080;
  const toggleDrawerView = () => setDrawerWidth((w) => (w > 1080 ? 900 : fullWidth));

  const [tabQuery, setTabQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [fieldQuery, setFieldQuery] = useState('');
  const [fieldsOpen, setFieldsOpen] = useState(true);
  useEffect(() => { setCurrentPage(1); }, [activeTab, foundView, tabQuery, activeAssetId]);

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

  const affected = aiAffectedProducts(c.ref, c.name);
  /* The two actions the Vulnerabilities tab leads with. */
  const fixTo = highestFix(c.cves);
  /* osv.dev is queried by package URL (ecosystem + version), so only a package PURL can be looked
     up — not a model snapshot date like gpt-4o-mini's "2024-07-18", and not a pkg:generic model
     file. */
  const lookupable = !!c.purl && !c.purl.startsWith('pkg:generic/');
  /* …and only when the scan ran with CVE lookup on (metadata airom:assurance.cve.enabled). An
     offline scan never asked osv.dev, so an empty list there is not a clean result. */
  const cveLookup = lookupable && AIROM_SCAN.cveLookup;
  /* AIROM's UNSAFE-LOAD finding carries no symbol — only airom:risk.evidence, the call site. */
  const unsafeLoad = c.risks.find((r) => r.id === 'AIROM-RISK-UNSAFE-LOAD');
  const findings = [...c.cves, ...c.risks];
  const endpointsHere = Array.from(new Map(affected.filter((r) => r.product.agent).map((r) => [r.product.agent!.id, r.product.agent!])).values());
  const byEndpoint = endpointsHere.map((ag) => ({ ag, rows: affected.filter((r) => r.product.agent?.id === ag.id) }));
  const openProduct = (p: (typeof affected)[number]['product']) => openInStack('bom-products', p.id, p.name, p);

  const tq = tabQuery.trim().toLowerCase();
  const epShown = byEndpoint.filter(({ ag, rows }) => !tq || [ag.hostName, ag.os, ag.ipAddress, ag.endpointId ?? '', ag.id,
    ...rows.map((r) => r.product.name)].join(' ').toLowerCase().includes(tq));
  const appsFiltered = affected.filter((r) => source === 'all' || r.product.source === source).filter((r) => !tq || [r.product.id, r.product.name, r.product.publisher, r.product.agent?.hostName ?? '',
    r.product.agent?.endpointId ?? '', r.product.linkedCi?.id ?? '', r.foundIn].join(' ').toLowerCase().includes(tq));
  const totalPages = Math.ceil(appsFiltered.length / itemsPerPage) || 1;
  const appsPage = appsFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const lifePill = c.eolState
    ? <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: LIFE_STYLE[c.eolState].bg, color: LIFE_STYLE[c.eolState].text }}>{c.lifecycleLabel}</span>
    : <span className="text-[#9CA3AF]">Not tracked</span>;

  /* Header KPI strip — the same chip pattern as the software component page. The first three
     have a value on EVERY AI component: CycloneDX type and evidence are on 100% of components in
     the real AI BOMs, and top severity is derived from the findings (None when there are none).
     Lifecycle and hosted egress are warnings, so they join the strip only when they apply. */
  const kpiLabel = (t: string) => <span className="text-[11px] text-[#7B8FA5]">{t}</span>;
  const firstEv = c.evidence[0];
  const evText = firstEv ? `${firstEv.file.split(/[\\/]/).pop()}${firstEv.line ? `:${firstEv.line}` : ''}` : '';
  const kpis: HeaderKpiItem[] = [
    { key: 'cdx', tip: `CycloneDX type: ${c.type}`, node: (
      <span className="inline-flex items-center gap-1.5">{kpiLabel('CycloneDX type')}<span className="font-mono text-[12px] font-medium text-[#364658]">{c.type}</span></span>) },
    { key: 'sev', tip: `Severity: ${c.worst ?? 'none'}`, node: (
      <span className="inline-flex items-center gap-1.5">{kpiLabel('Severity')}
        {c.worst
          ? <><span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV_STYLE[c.worst].dot }} /><span className="text-[12px] font-semibold capitalize" style={{ color: SEV_STYLE[c.worst].text }}>{c.worst}</span></>
          : <span className="text-[12px] font-medium text-[#22A06B]">None</span>}
      </span>) },
    { key: 'found', tip: `Found in: ${c.evidence.map((e) => `${e.file}${e.line ? `:${e.line}` : ''}`).join(', ')}`, node: (
      <span className="inline-flex items-center gap-1.5" title={c.evidence.map((e) => `${e.file}${e.line ? `:${e.line}` : ''}`).join('\n')}>{kpiLabel('Found in')}
        <span className="font-mono text-[12px] font-medium text-[#364658]">{evText}</span>
        {c.evidence.length > 1 && <span className="rounded-sm bg-[#F1F5F9] px-1 text-[11px] text-[#475467]">+{c.evidence.length - 1}</span>}
      </span>) },
    ...((c.eolState === 'retired' || c.eolState === 'deprecated') ? [{ key: 'life', tip: `Lifecycle: ${c.lifecycleLabel}${c.eol?.replacement ? ` — move to ${c.eol.replacement}` : ''}`, node: (
      <span className="inline-flex items-center gap-1.5">{kpiLabel('Lifecycle')}{lifePill}
        {c.eol?.replacement && <span className="text-[12px] text-[#7B8FA5]">move to <span className="font-mono text-[#364658]">{c.eol.replacement}</span></span>}
      </span>) }] : []),
    ...(c.excluded ? [{ key: 'excluded', tip: 'AIROM marked this scope: excluded — found only in tests, fixtures or vendored code. Not counted.', node: (
      <span className="cursor-help rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[12px] font-medium text-[#475467]"
        title="AIROM marked this scope: excluded — found only in tests, fixtures or vendored code. It is not counted in the AI BOM.">Excluded by AIROM</span>) }] : []),
    ...(c.hosted ? [{ key: 'egress', tip: `Calls ${c.provider}'s hosted API — prompts and payloads leave the estate`, node: (
      <span className="cursor-help rounded-sm bg-[#FFFAEB] px-1.5 py-0.5 text-[12px] font-medium text-[#B45309]"
        title={`Calls ${c.provider}'s hosted API — prompts and payloads leave the estate. Review what is sent, and to whom.`}>Hosted API · data leaves the estate</span>) }] : []),
  ];


  /* Fields DERIVED from what AIROM actually emits, measured over two real AI BOMs — aibom.json
     (221 components, AIROM 0.4.6, a source-repo scan) and this device's motadata-ai / motadata-mcp
     scans (14 components, AIROM 0.3.7, installed software):
       · COMMON — filled on 100% of components of every kind: name, airom:kind, CycloneDX type,
         bom-ref, evidence location (file:line + code on ~80%). (airom:confidence is also 100%
         but deliberately not shown — see the header comment.)
       · PER KIND — a field is shown for a kind only when that kind carries it in the majority of
         cases (≥80%), and then it is shown for EVERY component of that kind.
     Dropped as too sparse to be a field: lifecycle / EOL (6% overall, 23% of hosted LLMs),
     temperature (7%) and max_tokens (17%) of hosted LLMs, pickle risk (25% of model files — a
     pickle risk is reported as a finding on the Vulnerabilities tab instead), SDK "uses" (9%),
     version on models (3%). Lifecycle still surfaces where it matters: the header warning (retired /
     deprecated) and the register's KPI card. Version / PURL on frameworks and SDKs is 28–42% in a source scan but 100%
     in an installed-software scan — which is what the endpoint agent runs — so it is kept. */
  const NR = <span className="text-[#9CA3AF]">Not reported</span>;
  const mono = (v?: string, size = 'text-[12px]') => (v ? <span className={`font-mono ${size}`}>{v}</span> : NR);
  const evidence = c.evidence.length ? (
    <span className="block space-y-2">
      {c.evidence.map((e, i) => (
        <span key={i} className="block">
          <span className="block break-all font-mono text-[12px]">{e.file}{e.line ? <span className="text-[#7B8FA5]">:{e.line}</span> : null}</span>
          {e.snippet && <span className="mt-1 block overflow-x-auto whitespace-pre rounded bg-[#F8FAFC] px-2 py-1 font-mono text-[11px] text-[#475467]">{e.snippet}</span>}
        </span>
      ))}
    </span>) : NR;

  type Field = { label: string; value: React.ReactNode };
  const common: Field[] = [
    { label: 'Component ID', value: c.id },
    { label: 'Name', value: <span className="font-mono">{c.name}</span> },
    { label: 'Component type', value: AI_KIND_TITLE[c.kind] },
    { label: 'CycloneDX type', value: mono(c.type) },
    { label: 'Applications', value: String(affected.length) },
    { label: 'Endpoints', value: String(endpointsHere.length) },
    { label: 'Found in', value: evidence },
    { label: 'bom-ref', value: mono(c.ref) },
    /* What wrote it — the register is rolled up from endpoint scans, so it is the scan's tool. */
    { label: 'Detected by', value: <span className="inline-flex items-center gap-1 rounded-sm bg-[#EFF6FC] px-1.5 py-0.5 text-[12px] text-[#3D8BD0]">{AIROM_SCAN.tool}</span> },
    { label: 'Format', value: AIROM_SCAN.format },
  ];
  const provider: Field = { label: 'Provider', value: c.provider || NR };
  const purl: Field = { label: 'PURL', value: c.purl ? <span className="break-all font-mono text-[12px]">{c.purl}</span> : NR };
  /* Measured presence per kind (aibom.json + device) is noted on each block. */
  const KIND_FIELDS: Partial<Record<AiAssetRow['kind'], () => Field[]>> = {
    /* provider 98% · model id 100% */
    'hosted-llm': () => [provider, { label: 'Model ID', value: mono(c.modelId) }],
    /* provider 100% · model id 100% */
    'embedding-model': () => [provider, { label: 'Model ID', value: mono(c.modelId) }],
    /* provider · format · SHA-256 · PURL all 100% */
    'local-model-file': () => [
      provider,
      { label: 'Model format', value: c.file?.format ?? NR },
      { label: 'SHA-256', value: c.file ? <span className="block break-all font-mono text-[11px]">{c.file.sha256}</span> : NR },
      purl,
    ],
    /* provider 97–100% · version + PURL 100% on an installed scan */
    framework: () => [provider, { label: 'Version', value: mono(c.version) }, purl],
    /* provider 96% · version + PURL 100% on an installed scan */
    library: () => [provider, { label: 'Version', value: mono(c.version) }, purl],
    /* provider 100% */
    'vector-db': () => [provider],
    service: () => [provider],
    /* provider 80% */
    infra: () => [provider],
    /* data type + size 83% */
    dataset: () => [
      { label: 'Data type', value: c.dataset?.type ?? NR },
      { label: 'Size', value: c.dataset ? fmtBytes(c.dataset.size) : NR },
    ],
    /* rel.contains + rel.embeds-with 100% */
    'rag-pipeline': () => [{ label: 'Linked components', value: c.uses?.length
      ? <span className="flex flex-wrap gap-1">{c.uses.map((u) => <span key={u} className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] text-[#475467]">{u}</span>)}</span>
      : NR }],
    /* prompt and ai-config: nothing beyond the common fields reaches a majority. */
  };
  const kindFields = KIND_FIELDS[c.kind]?.() ?? [];
  const fq = fieldQuery.trim().toLowerCase();
  const match = (f: Field) => !fq || f.label.toLowerCase().includes(fq);
  const shownCommon = common.filter(match);
  const shownKind = kindFields.filter(match);
  const fieldRow = (f: Field) => (
    <div key={f.label} className="grid grid-cols-[130px_1fr] items-start gap-3 py-2.5">
      <span className="text-[13px] text-[#7B8FA5]">{f.label}</span>
      <span className="min-w-0 break-words text-[13px] text-[#364658]">{f.value}</span>
    </div>
  );

  const TH = 'whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658]';
  const TD = 'whitespace-nowrap px-4 py-3 text-[13px] text-[#364658]';
  const sevPill = (s: AiromFinding['severity']) => (
    <span className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] font-medium capitalize" style={{ backgroundColor: SEV_STYLE[s].bg, color: SEV_STYLE[s].text }}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: SEV_STYLE[s].dot }} />{s}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50" data-drawer-backdrop>
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col bg-white shadow-2xl ${drawerWidth <= 1080 ? 'border-l border-[#e5e7eb]' : ''}`}
        style={{ width: `${drawerWidth}px` }}
        data-drawer
      >
        <div className="group absolute bottom-0 left-0 top-0 z-[100] w-3 cursor-ew-resize"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }}>
          <div className="absolute bottom-0 left-0 top-0 w-px bg-transparent transition-colors group-hover:bg-[#3D8BD0]" />
        </div>

        <div className="flex items-center border-b border-[#e5e7eb] bg-[#f9fafb]">
          <DrawerTabStrip items={stackTabs ?? [{ id: c.id, subject: c.name }]} activeId={activeAssetId} onSelect={onTabChange} onClose={onCloseTab} maxVisible={wide ? 8 : 3} />
          <button onClick={() => setMinimized(true)} title="Minimize panel" className="flex-shrink-0 border-l border-[#e5e7eb] p-2 hover:bg-[#e5e7eb]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <button onClick={toggleDrawerView} className="p-2 hover:bg-[#e5e7eb]" title={wide ? 'Switch to small view' : 'Switch to full view'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#364658" strokeWidth="2" /></svg>
          </button>
          <button onClick={onClose} className="border-l border-[#e5e7eb] p-2 hover:bg-[#e5e7eb]" title="Close"><X size={16} className="text-[#6b7280]" /></button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col overflow-auto">
            {/* Header — identity, then the AIROM facts that decide what to do about it. */}
            <div className="border-b border-[#e5e7eb] px-6 pb-3 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.worst ? SEV_STYLE[c.worst].dot : c.eolState === 'retired' ? '#EF4444' : c.eolState === 'deprecated' ? '#F59E0B' : '#22A06B' }} />
                    <span className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{c.id}</span>
                    <h2 className="truncate font-mono text-[20px] font-semibold text-[#364658]">{c.name}</h2>
                    <span className="flex-shrink-0 rounded-md border border-[#DFE5ED] bg-[#F8FAFC] px-2 py-0.5 text-[12px] text-[#64748B]">{AI_KIND_TITLE[c.kind]}</span>
                  </div>
                  <HeaderKpiRow items={kpis} />
                </div>
                <button onClick={() => toast.success(`Re-scan queued for ${c.name}`)} title="Re-scan"
                  className="flex size-9 flex-shrink-0 items-center justify-center rounded border border-[#DFE5ED] text-[#7B8FA5] transition-colors hover:bg-[#F5F7FA]"><RefreshCw size={16} /></button>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                {([['cis', 'Affected'], ['vulns', 'Vulnerabilities']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-2.5 text-[14px] font-medium transition-colors ${
                      activeTab === id ? 'border-[#3D8BD0] text-[#3D8BD0]' : 'border-transparent text-[#6b7280] hover:text-[#364658]'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0 flex-1 p-6">
              {activeTab === 'cis' && (
                <div>
                  {/* ONE toolbar line, the same pattern as the software component's Affected tab. */}
                  <div className="mb-3 flex flex-wrap items-center gap-2.5">
                    <BomDropdown<FoundView>
                      ariaLabel="View" prefix="View:" icon={<Boxes size={14} />} menuWidth={220}
                      value={foundView}
                      onChange={(v) => { setFoundView(v); if (v === 'endpoint' && source === 'Ingest') setSource('all'); }}
                      options={[
                        { value: 'app', label: 'By application', text: 'By application', count: affected.length },
                        { value: 'endpoint', label: 'By endpoint', text: 'By endpoint', count: endpointsHere.length },
                      ]}
                    />
                    <BomDropdown<'all' | 'Agent' | 'Ingest'>
                      ariaLabel="Source" icon={<Building2 size={14} />} menuWidth={240}
                      value={source} onChange={setSource}
                      options={[
                        { value: 'all', label: 'All sources', text: 'All sources', count: foundView === 'endpoint' ? endpointsHere.length : affected.length },
                        { value: 'Agent', label: 'Endpoint scan', text: 'Endpoint scan', count: foundView === 'endpoint' ? endpointsHere.length : affected.filter((r) => r.product.source === 'Agent').length },
                        { value: 'Ingest', label: 'Ingest', text: 'Ingest', count: affected.filter((r) => r.product.source === 'Ingest').length,
                          disabled: foundView === 'endpoint', reason: 'Ingested BOMs have no endpoint' },
                      ]}
                    />
                    <div className="relative min-w-[240px] flex-1 basis-[240px]">
                      <input value={tabQuery} onChange={(e) => setTabQuery(e.target.value)} placeholder="Select field to search..."
                        className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
                      {tabQuery
                        ? <button onClick={() => setTabQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
                        : <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />}
                    </div>
                  </div>

                  {foundView === 'endpoint' ? (
                    <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
                      <table className="w-full min-w-[900px]">
                        <thead className="border-b border-[#e5e7eb]">
                          <tr>{['Endpoint', 'Host Name', 'OS', 'IP Address', 'Applications'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e7eb] bg-white">
                          {epShown.length ? epShown.map(({ ag, rows }) => (
                            <tr key={ag.id} className="align-top transition-colors hover:bg-[#f9fafb]">
                              <td className={TD}><EndpointLink agent={ag} /></td>
                              <td className={TD}>{ag.hostName}</td>
                              <td className={TD}><span className="inline-flex items-center gap-2"><OsChip family={osFamilyOf(ag.os)} /><span className="max-w-[200px] truncate" title={ag.os}>{ag.os}</span></span></td>
                              <td className={`${TD} font-mono text-[12px]`}>{ag.ipAddress}</td>
                              <td className="px-4 py-3 text-[12px]">
                                <span className="flex flex-wrap gap-1.5">
                                  {rows.map((r) => (
                                    <button key={r.product.id} type="button" onClick={() => openProduct(r.product)} title={`Open ${r.product.name}`}
                                      className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-medium text-[#3D8BD0] hover:bg-[#d0e8f9]">{r.product.name}</button>
                                  ))}
                                </span>
                              </td>
                            </tr>
                          )) : <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                            {tq ? <>No endpoint matches “{tabQuery.trim()}”. <button type="button" onClick={() => setTabQuery('')} className="font-medium text-[#3D8BD0] hover:underline">Clear search</button></>
                              : 'Not found on any endpoint in BOM scope.'}
                          </td></tr>}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#E5E7EB] bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                          <thead className="border-b border-[#e5e7eb]">
                            <tr>{['ID', 'Application', 'BOM Source', 'Endpoint', ...(isCmdbLicensed() ? ['CI'] : []), 'Found at'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-[#e5e7eb] bg-white">
                            {appsPage.length === 0 ? (
                              <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                                {tq ? <>No application matches “{tabQuery.trim()}”. <button type="button" onClick={() => setTabQuery('')} className="font-medium text-[#3D8BD0] hover:underline">Clear search</button></>
                                  : affected.length ? 'No application matches this source.' : 'Not found in any application in BOM scope.'}
                              </td></tr>
                            ) : appsPage.map((r) => {
                              const win = osFamilyOf(r.product.agent?.os ?? '') === 'Windows';
                              const root = r.product.scanPath ?? '';
                              const ev = c.evidence[0];
                              const at = ev ? (win ? `${root}\\${ev.file.replace(/\//g, '\\')}` : `${root.replace(/\/$/, '')}/${ev.file}`) : root;
                              return (
                                <tr key={r.product.id} className="transition-colors hover:bg-[#f9fafb]">
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <button onClick={() => openProduct(r.product)} title={`Open ${r.product.name}`}
                                      className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]">{r.product.id}</button>
                                  </td>
                                  <td className="px-4 py-3">
                                    <button onClick={() => openProduct(r.product)} className="block whitespace-nowrap text-left text-[13px] font-medium text-[#364658] hover:text-[#3D8BD0]">{r.product.name}</button>
                                    <span className="block text-[11px] text-[#7B8FA5]">{r.product.publisher}</span>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3"><SourcePill source={r.product.source} /></td>
                                  <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                                    {r.product.agent ? <span className="inline-flex items-center gap-2"><EndpointLink agent={r.product.agent} /><span className="text-[#7B8FA5]">{r.product.agent.hostName}</span></span> : <span className="text-[#9CA3AF]">—</span>}
                                  </td>
                                  {isCmdbLicensed() && <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                                    {r.product.linkedCi ? <span className="inline-flex items-center gap-1.5"><span className="font-medium text-[#364658]">{r.product.linkedCi.id}</span><span className="text-[#7B8FA5]">{r.product.linkedCi.name}</span></span> : <span className="text-[#9CA3AF]">—</span>}
                                  </td>}
                                  <td className="px-4 py-3 text-[12px]">
                                    <span className="block max-w-[340px] truncate font-mono text-[#364658]" title={at}>{at}{ev?.line ? `:${ev.line}` : ''}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={appsFiltered.length}
                        onPageChange={setCurrentPage} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'vulns' && (
                findings.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-[14px] font-medium text-[#364658]">No vulnerabilities reported</p>
                    {/* Say what was actually checked: CVEs are looked up by package version, and
                        load-time risks are only checked on model files. An empty list for a
                        component with nothing to check is not a clean result. */}
                    <p className="mx-auto mt-1 max-w-[560px] text-[13px] text-[#7B8FA5]">
                      {cveLookup
                        ? <>AIROM looked up <span className="font-mono">{c.purl}</span> on osv.dev and found no CVE.</>
                        : lookupable
                          ? <>CVE lookup was off for this scan (offline), so <span className="font-mono">{c.purl}</span> was not checked on osv.dev.</>
                        : c.file
                          ? <>AIROM found no load-time risk in this {c.file.format} file. A model file has no package to look up on osv.dev, so CVEs don't apply.</>
                          : <>Nothing to check: AIROM looks up CVEs by package URL (PURL) and checks load-time risk only in model files. AIROM reported no PURL for this {AI_KIND_TITLE[c.kind]} component, and it is not a model file.</>}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                  {/* What to do about them — the action each finding type calls for. */}
                  {(c.cves.length > 0 || c.risks.length > 0) && (
                    <div className="space-y-1.5 rounded-lg border border-[#FEDF89] bg-[#FFFCF5] px-4 py-3 text-[13px] text-[#364658]">
                      {c.cves.length > 0 && (
                        <p><span className="font-semibold">Upgrade {c.name}{fixTo ? <> to <span className="font-mono">{fixTo}</span> or later</> : ''}.</span>{' '}
                          <span className="text-[#7B8FA5]">{fixTo ? `Clears every CVE below that has a published fix (${c.cves.filter((v) => v.fixedVersion).length} of ${c.cves.length}).` : 'No fixed version is published yet.'}</span></p>
                      )}
                      {/* A risk IN a model file is fixed in the file; a risk at a call site (an unsafe
                          torch.load in a framework's code) is fixed in that code. */}
                      {c.risks.length > 0 && (c.file ? (
                        <p><span className="font-semibold">Load it in isolation, or re-export it in a safe format (safetensors / ONNX).</span>{' '}
                          <span className="text-[#7B8FA5]">Loading this file can run code before any model is produced.</span></p>
                      ) : (
                        <p><span className="font-semibold">Change the flagged call site{unsafeLoad?.evidence ? <> (<span className="font-mono">{unsafeLoad.evidence}</span>)</> : ''} to a safe loader{unsafeLoad && c.name === 'torch' ? <> — <span className="font-mono">torch.load(…, weights_only=True)</span></> : ''}.</span>{' '}
                          <span className="text-[#7B8FA5]">The call deserializes a model through an unsafe path; a malicious file would run code on load.</span></p>
                      ))}
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white">
                    <table className="w-full min-w-[960px]">
                      <thead className="border-b border-[#e5e7eb]">
                        <tr>{['ID', 'Type', 'Severity', 'CVSS', 'Fixed in', 'Description'].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e7eb]">
                        {[...findings].sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity)).map((f) => (
                          <tr key={f.id} className="align-top">
                            <td className={`${TD} font-mono text-[12px] font-semibold`}>{f.id}</td>
                            <td className={TD}><span className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[12px] text-[#475467]">{f.id.startsWith('CVE-') ? 'CVE · osv.dev' : 'AIROM risk'}</span></td>
                            <td className={TD}>{sevPill(f.severity)}</td>
                            <td className={`${TD} tabular-nums`}>{f.score ?? <span className="text-[#9CA3AF]">—</span>}</td>
                            <td className={`${TD} font-mono text-[12px]`}>{f.fixedVersion ? <span className="text-[#22A06B]">{f.fixedVersion}</span> : <span className="text-[#9CA3AF]">—</span>}</td>
                            <td className="px-4 py-3 text-[13px] text-[#364658]">
                              {f.description}
                              {f.symbol && <span className="ml-1.5 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 font-mono text-[11px] text-[#B42318]">{f.symbol}</span>}
                              {f.evidence && <span className="mt-1 block font-mono text-[11px] text-[#7B8FA5]">at {f.evidence}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )
              )}

            </div>
          </div>

          {/* Right: properties rail. */}
          <div className="flex w-[360px] flex-shrink-0 flex-col border-l border-[#e5e7eb] bg-white">
            <div className="px-5 pb-3 pt-4">
              <h2 className="text-[16px] font-semibold text-[#364658]">Component Properties</h2>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={15} />
                <input value={fieldQuery} onChange={(e) => setFieldQuery(e.target.value)} placeholder="Search fields..."
                  className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-9 pr-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 pb-4">
              <div className="rounded-lg border border-[#E5E7EB]">
                <button onClick={() => setFieldsOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#364658]"><FileText size={15} className="text-[#6b7280]" />Component Fields</span>
                  <ChevronDown size={16} className={`text-[#6b7280] transition-transform ${fieldsOpen ? '' : '-rotate-90'}`} />
                </button>
                {fieldsOpen && (
                  <div className="border-t border-[#E5E7EB] px-4 py-2">
                    {shownCommon.length + shownKind.length === 0 ? (
                      <p className="py-4 text-[13px] text-[#9CA3AF]">No field matches “{fieldQuery}”.</p>
                    ) : <>
                      {shownCommon.map(fieldRow)}
                      {shownKind.length > 0 && <>
                        {/* Same subsection treatment as System Fields elsewhere. */}
                        <div className="mt-2 border-t border-[#F0F2F5] pb-1 pt-3 text-[12px] font-semibold uppercase tracking-wider text-[#364658]">{AI_KIND_TITLE[c.kind]} fields</div>
                        {shownKind.map(fieldRow)}
                      </>}
                    </>}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-[#e5e7eb] p-3">
              <button onClick={() => toast('Ask AI is not wired up in this prototype')}
                className="flex w-full items-center gap-2 rounded-lg border-2 border-[#C084FC] px-3 py-2.5 text-left text-[13px] text-[#7B8FA5] transition-colors hover:bg-[#FAF5FF]">
                <Sparkles size={16} className="text-[#A855F7]" />Ask AI for insights, summaries, and actions...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
