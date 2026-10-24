import { useState, useEffect } from 'react';
import {
  X, Minus, Square, SquarePen, Info, ScanLine, Upload, History, Search, FileText, ChevronDown, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { DrawerTabStrip } from './DrawerTabStrip';
import { MinimizedDrawerRail } from './MinimizedDrawerRail';
import {
  productBomSummary, productById, isRootPath, endpointIdOf, useProductsVersion, BOM_LICENSE_SEATS, OPEN_CI_EVENT, OPEN_EDIT_EVENT, logAudit, fmtStamp, CURRENT_USER,
  isCmdbLicensed, endpointOfficeOf,
} from './bomProductsData';
import type { BomType } from './bomData';
import type { ProductRecord, ServiceCi } from './bomProductsData';
import { BOM_TABS, BOM_TAB_IDS, ProductBomTypeView, bomTypeIcon, bomTabFor } from './BomTypeTabs';
import { BomProductOverview } from './BomProductOverview';
import { BomAuditTrail } from './BomAuditTrail';
import type { BomTabId } from './BomTypeTabs';
import { SourcePill, EndpointLink } from './BomProductFormParts';
import { BomIngestMorePanel } from './BomIngestMorePanel';

/* Application Service detail — one entry in BOM scope.
 *
 * Opened from BOM › Application Services, from a component's "Affected application services" and
 * from Admin › BOM Scope. Full page, like every other module's detail page. Tabs:
 *   Overview              what needs attention, the headline figures and the evidence behind them
 *   SBOM · CBOM · AI BOM  one tab per BOM type, each its own version history (BomTypeTabs)
 * and, like every other module's detail page, a right PROPERTIES PANEL: the application's own
 * fields (identity, source, CMDB link, the endpoint it is scanned on or the files it was ingested
 * from), searchable. Those fields used to be cards at the top of the Overview.
 *
 * An INGESTED application takes more BOMs after it was added — a new version of a type it has, or
 * the first CBOM / AI BOM — through the Ingest BOM drawer (BomIngestMorePanel), opened from the
 * header's Ingest button, the same place an endpoint application has Scan BOM.
 *
 * A product is not a CMDB record, so this is its own drawer — not a CmdbDrawer variant. When it
 * is linked to a service, the service's CI id opens that CMDB page, which shows the same BOMs. */

type Tab = 'overview' | BomTabId | 'audit';

/** Opens a linked service's CMDB page on its BOM tab — handled by BomProductHost, which lives
 *  inside the drawer host (an event, so this drawer need not import the host that imports it). */
const openCi = (id: string) => window.dispatchEvent(new CustomEvent(OPEN_CI_EVENT, { detail: { id } }));

/** A linked service's CI id as a link to its CMDB page. */
function CiLink({ ci, className = '' }: { ci: ServiceCi; className?: string }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); openCi(ci.id); }} title={`Open ${ci.id} · ${ci.name} in CMDB`}
      className={`flex-shrink-0 whitespace-nowrap rounded bg-[#e8f4fd] px-1.5 py-0.5 text-[11px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9] hover:underline ${className}`}>
      {ci.id}
    </button>
  );
}

interface Props {
  openAssets: ProductRecord[];
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


const TH = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <th className={`whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658] ${className}`}>{children}</th>
);
const Dash = () => <span className="text-[#9CA3AF]">—</span>;

export function BomProductDrawer({
  openAssets, activeAssetId, onClose, onCloseTab, onTabChange,
  stackTabs, stackWidth, onStackWidthChange, stackMinimized, onStackMinimizedChange,
  stackActiveTab, onStackActiveTabChange,
}: Props) {
  useProductsVersion();
  /* Re-read from the store: the record may have changed (a new SBOM uploaded) since it was opened. */
  const opened = openAssets.find((x) => x.id === activeAssetId) ?? openAssets[0];
  const a = (opened && productById(opened.id)) ?? opened;

  const [tabLocal, setTabLocal] = useState<Tab>(() => {
    const l = (opened as (ProductRecord & { landOn?: string }) | undefined)?.landOn;
    return l && BOM_TAB_IDS.includes(l) ? l as Tab : 'overview';
  });
  const activeTab = (stackActiveTab && ['overview', ...BOM_TAB_IDS].includes(stackActiveTab) ? stackActiveTab as Tab : tabLocal);
  const setTab = (t: Tab) => { setTabLocal(t); onStackActiveTabChange?.(t); };

  const [minimizedLocal, setMinimizedLocal] = useState(false);
  const minimized = stackMinimized ?? minimizedLocal;
  const setMinimized = (m: boolean) => { setMinimizedLocal(m); onStackMinimizedChange?.(m); };
  /* Full page by default (viewport less the product rail), 1080 in small view — the same two
     sizes every other module's detail page uses, so switching tabs between them keeps the view. */
  const fullWidth = () => window.innerWidth - 54;
  const [widthLocal, setWidthLocal] = useState(stackWidth ?? fullWidth());
  const drawerWidth = stackWidth ?? widthLocal;
  const toggleWidth = () => { const next = drawerWidth > 1080 ? 1080 : fullWidth(); setWidthLocal(next); onStackWidthChange?.(next); };

  /* The Ingest BOM drawer: null = closed; otherwise the slot to ring ('' = none in particular). */
  const [ingestFor, setIngestFor] = useState<BomType | '' | null>(null);
  const [fieldQuery, setFieldQuery] = useState('');
  const [fieldsOpen, setFieldsOpen] = useState(true);
  useEffect(() => { setIngestFor(null); setFieldQuery(''); }, [activeAssetId]);

  /* A caller may ask for a landing tab (the Dashboard opens a certificate on CBOM, a model on
     AI BOM) by passing `landOn` with the record; otherwise a fresh product opens on Overview. */
  const landOn = (opened as (ProductRecord & { landOn?: string }) | undefined)?.landOn;
  useEffect(() => {
    if (!a) return;
    if (landOn && BOM_TAB_IDS.includes(landOn)) { setTab(landOn as Tab); return; }
    if (!stackActiveTab) setTabLocal('overview');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.id, landOn]);

  if (!a) return null;
  if (minimized) {
    return (
      <MinimizedDrawerRail
        items={stackTabs ?? [{ id: a.id, subject: a.name }]}
        activeId={activeAssetId}
        onSelect={(id) => { onTabChange(id); setMinimized(false); }}
        onRestore={() => setMinimized(false)}
      />
    );
  }

  const sum = productBomSummary(a);
  const ingested = a.source === 'Ingest';
  const full = isRootPath(a.scanPath);
  /* An ingest can carry SBOM, CBOM and AI BOM files — the header names the types and the files. */
  const files = ingested
    ? (a.ingested ? (['SBOM', 'CBOM', 'AI BOM'] as const).filter((t) => a.ingested![t]).map((t) => ({ type: t, ...a.ingested![t]! }))
      : a.sbomFile ? [{ type: 'SBOM' as const, file: a.sbomFile, format: a.sbomFormat ?? '—' }] : [])
    : [];

  const TABS: { id: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
    ...BOM_TABS.map((t) => ({ id: t.id as Tab, label: t.label, icon: bomTypeIcon(t.type) })),
    { id: 'audit', label: 'Audit Trail', icon: <History size={14} /> },
  ];

  const kpi = (label: string, value: React.ReactNode) => (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[11px] text-[#7B8FA5]">{label}</span>
      <span className="text-[12px] font-medium text-[#364658]">{value}</span>
    </span>
  );
  const sep = <span className="h-3 w-px bg-[#E5E7EB]" />;

  /* One header action in the same place for both sources: Scan BOM for an endpoint application,
     Ingest for an ingested one. Ingest opens on the BOM type of the tab in view, if any. */
  const primaryAction = ingested
    ? { label: 'Ingest', icon: <Upload size={15} />, onClick: () => setIngestFor(BOM_TABS.find((t) => t.id === activeTab)?.type ?? '') }
    : { label: 'Scan BOM', icon: <ScanLine size={15} />, onClick: () => {
        logAudit(a.id, { at: fmtStamp(new Date()), by: CURRENT_USER, action: 'BOM scan requested', detail: `${a.agent ? endpointIdOf(a.agent) : ''} · ${a.scanPath ?? ''}` });
        toast.success(`BOM scan queued for ${a.name} on ${a.agent?.hostName}`);
      } };

  /* ── Right properties panel ────────────────────────────────────────────────
     The application's own fields, the way every other module's detail page shows them: identity,
     source and CMDB link for every application; then the endpoint it is scanned on, or the files
     it was ingested from — each with its current version and an upload action. */
  type Field = { label: string; value: React.ReactNode };
  const muted = (t: string) => <span className="text-[#9CA3AF]">{t}</span>;
  const linkBtn = 'text-[12px] font-medium text-[#3D8BD0] hover:underline';
  const ci = a.linkedCi;
  const common: Field[] = [
    { label: 'Application ID', value: a.id },
    { label: 'Name', value: a.name },
    { label: 'Version', value: a.version !== '—' ? <span className="font-mono text-[12px]">{a.version}</span> : muted('Not set') },
    { label: 'Manufacturer', value: a.publisher || muted('Not set') },
    { label: 'BOM source', value: <SourcePill source={a.source} /> },
    ...(isCmdbLicensed() ? [{ label: 'CMDB link', value: (
      <span className="block">
        {ci ? <CiLink ci={ci} /> : muted('Not linked')}
      </span>) }] : []),
    { label: 'Created By', value: a.addedBy },
    { label: 'Created Date', value: a.createdAt ?? a.addedOn },
    { label: 'Last Updated Date', value: a.updatedAt ?? a.createdAt ?? a.addedOn },
  ];
  const ag = a.agent;
  const sourceFields: Field[] = ingested
    ? (['SBOM', 'CBOM', 'AI BOM'] as BomType[]).map((t) => {
        /* Ingested or not — formats can differ between versions, so none is named here. */
        const f = files.find((x) => x.type === t);
        return { label: t, value: f ? 'Ingested' : muted('Not ingested') };
      })
    : [
        { label: 'Endpoint ID', value: ag ? <EndpointLink agent={ag} noDot /> : muted('—') },
        { label: 'Host name', value: ag?.hostName ?? muted('—') },
        { label: 'OS', value: ag?.os ?? muted('—') },
        { label: 'IP address', value: ag ? <span className="font-mono text-[12px]">{ag.ipAddress}</span> : muted('—') },
        { label: 'Remote office', value: ag ? endpointOfficeOf(ag) : muted('—') },
        { label: 'Scan path', value: <span className="break-all font-mono text-[12px]">{a.scanPath ?? '—'}</span> },
      ];
  const fq = fieldQuery.trim().toLowerCase();
  const shownCommon = common.filter((f) => !fq || f.label.toLowerCase().includes(fq));
  const shownSource = sourceFields.filter((f) => !fq || f.label.toLowerCase().includes(fq));
  const fieldRow = (f: Field) => (
    <div key={f.label} className="grid grid-cols-[130px_1fr] items-start gap-3 py-2.5">
      <span className="text-[13px] text-[#7B8FA5]">{f.label}</span>
      <span className="min-w-0 break-words text-[13px] text-[#364658]">{f.value}</span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50" onClick={onClose} />
      <aside data-drawer className="fixed inset-y-0 right-0 z-[9999] flex flex-col bg-white shadow-2xl" style={{ width: drawerWidth }}>
        <div className="flex items-center border-b border-[#DFE5ED] bg-white pl-2">
          <DrawerTabStrip items={stackTabs ?? [{ id: a.id, subject: a.name }]} activeId={activeAssetId} onSelect={onTabChange} onClose={onCloseTab} />
          <div className="ml-auto flex items-center border-l border-[#DFE5ED]">
            <button onClick={() => setMinimized(true)} title="Minimize panel" className="p-2 text-[#7B8FA5] hover:text-[#364658]"><Minus size={16} /></button>
            <button onClick={toggleWidth} title={drawerWidth > 1080 ? 'Switch to small view' : 'Switch to full view'} className="p-2 text-[#7B8FA5] hover:text-[#364658]"><Square size={15} /></button>
            <button onClick={onClose} title="Close" className="p-2 text-[#7B8FA5] hover:text-[#364658]"><X size={16} /></button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-[#DFE5ED] px-6 py-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{a.id}</span>
                <h1 className="truncate text-[18px] font-semibold text-[#364658]">{a.name}</h1>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5"><span className="text-[11px] text-[#7B8FA5]">Source</span><SourcePill source={a.source} /></span>{sep}
                {/* Ingested: no document or file here — each version carries its own, shown on its BOM tab. */}
                {!ingested && <>{kpi('Endpoint', a.agent ? <button type="button" onClick={() => window.__bomStore?.openEndpoint(a.agent!.id)} title={`Open ${endpointIdOf(a.agent)} · ${a.agent.hostName}`} className="text-[12px] font-medium text-[#3D8BD0] hover:underline">{endpointIdOf(a.agent)} · {a.agent.hostName}</button> : '—')}{sep}</>}
                {kpi('Manufacturer', a.publisher)}
                {isCmdbLicensed() && <>{sep}{kpi('CMDB', a.linkedCi ? <CiLink ci={a.linkedCi} /> : 'Not linked')}</>}
                {!ingested && <>{sep}{kpi('Scan Path', <span className="font-mono text-[12px]">{a.scanPath ?? '—'}</span>)}</>}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {/* Edit opens the same form Admin › BOM Scope uses — name, CMDB link, version,
                  publisher and scan path change; the endpoint and BOM source stay locked. */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EDIT_EVENT, { detail: { id: a.id } }))}
                title="Edit application"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#7B8FA5] transition-colors hover:text-[#3D8BD0]"
              ><SquarePen size={15} /></button>
              {primaryAction && <button
                onClick={primaryAction.onClick}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]"
              >{primaryAction.icon}{primaryAction.label}</button>}
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex items-center gap-2.5 overflow-x-clip border-b border-[#e5e7eb] px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium transition-colors ${
                activeTab === t.id ? 'border-[#3D8BD0] text-[#3D8BD0]' : 'border-transparent text-[#6b7280] hover:border-[#CBD5E1] hover:bg-[#F5F7FA] hover:text-[#364658]'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white">
          {activeTab === 'overview' && <BomProductOverview p={a} onGo={setTab} wide={drawerWidth - 360 > 1080} />}
          {BOM_TABS.map((t) => activeTab === t.id && (
            <ProductBomTypeView key={`${t.id}:${a.updatedAt ?? ''}`} p={a} type={t.type} />
          ))}
          {activeTab === 'audit' && <BomAuditTrail p={a} />}
        </div>
        </div>

        {/* Right: properties panel — same shape as the component pages'. */}
        <div className="flex w-[360px] flex-shrink-0 flex-col border-l border-[#e5e7eb] bg-white">
          <div className="px-5 pb-3 pt-4">
            <h2 className="text-[16px] font-semibold text-[#364658]">Application Properties</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={15} />
              <input value={fieldQuery} onChange={(e) => setFieldQuery(e.target.value)} placeholder="Search fields..."
                className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-9 pr-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-5 pb-4">
            <div className="rounded-lg border border-[#E5E7EB]">
              <button onClick={() => setFieldsOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#364658]"><FileText size={15} className="text-[#6b7280]" />Application Fields</span>
                <ChevronDown size={16} className={`text-[#6b7280] transition-transform ${fieldsOpen ? '' : '-rotate-90'}`} />
              </button>
              {fieldsOpen && (
                <div className="border-t border-[#E5E7EB] px-4 py-2">
                  {shownCommon.length + shownSource.length === 0 ? (
                    <p className="py-4 text-[13px] text-[#9CA3AF]">No field matches “{fieldQuery}”.</p>
                  ) : <>
                    {shownCommon.map(fieldRow)}
                    {shownSource.length > 0 && <>
                      <div className="mt-2 border-t border-[#F0F2F5] pb-1 pt-3 text-[12px] font-semibold uppercase tracking-wider text-[#364658]">{ingested ? 'Ingest Details' : 'Endpoint Details'}</div>
                      {shownSource.map(fieldRow)}
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
      </aside>

      {ingestFor !== null && (
        <BomIngestMorePanel app={a} focusType={ingestFor || null}
          onClose={() => setIngestFor(null)}
          onIngested={(t) => setTab(bomTabFor(t))} />
      )}
    </>
  );
}
