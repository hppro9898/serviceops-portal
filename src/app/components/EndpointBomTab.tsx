import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Columns3, Download, Layers, Check, Search, X, CalendarDays, Info, ScanLine, ArrowRight, Trash2, ShieldAlert, CirclePlus, CircleMinus, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { toast } from 'sonner';
import { BomComponentsPanel } from './BomComponentsPanel';
import { BomCompareVersionsPanel } from './BomCompareVersionsPanel';
import { BomProductsOverview } from './BomProductsOverview';
import { BomManageProductsPanel } from './BomManageProductsPanel';
import { BomScanRunsPanel } from './BomScanRunsPanel';
import { bomForEndpoint, bomVersions, bomComponents, bomAiAssets, componentCount, componentsAtVersion, bomRetention, bomCiId, OS_PRODUCT_KEY, bomVersionStats, BOM_SEVERITIES, SCAN_FORMAT } from './bomData';
import type { BomType, BomVersion, BomScanRun, BomProduct } from './bomData';
import type { ChangeTab } from './BomComponentsPanel';

/* BOM tab of the ENDPOINT detail page.
 *
 * Reading order top to bottom: which KIND of BOM (SBOM / CBOM / AI BOM) → which PRODUCT scope on
 * this host → the version history for that scope. A version only exists where a scan found a
 * change, so the connector between two cards accounts for the scans that found nothing. */

const BOM_TYPES: BomType[] = ['SBOM', 'CBOM', 'AI BOM'];

/** "View components" / "View crypto assets" / "View AI components" — the noun follows the BOM type. */
const viewLabel = (t: BomType) => (t === 'SBOM' ? 'View components' : t === 'CBOM' ? 'View crypto assets' : 'View AI components');

interface DownloadPopoverProps {
  version: BomVersion;
  type: BomType;
  productLabel: string;
  count: number;
  onClose: () => void;
}

/** Format picker — a BOM is generated as CycloneDX and converted on export. */
function DownloadPopover({ version, type, productLabel, count, onClose }: DownloadPopoverProps) {
  /* Offered as the format the scanner wrote (Trivy: CycloneDX 1.7; CBOMkit-theia and AIROM: 1.6).
     SPDX is offered for an SBOM only — it has no fields for crypto assets or AI components. */
  const native = SCAN_FORMAT[type];
  const [format, setFormat] = useState<string>(native);
  const OPTIONS = [
    { id: native, note: 'OWASP standard · what this BOM was generated as' },
    ...(type === 'SBOM' ? [{ id: 'SPDX 2.3', note: 'Linux Foundation standard · converted on export' }] : []),
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full z-50 mt-1 w-[380px] rounded-lg border border-[#DFE5ED] bg-white p-4 shadow-lg">
        <h4 className="text-[14px] font-semibold text-[#364658]">Download {type} v{version.v} — {productLabel}</h4>
        <p className="mt-1 text-[13px] text-[#7B8FA5]">
          {count} component{count === 1 ? '' : 's'} · generated {version.generatedAt} · {version.state === 'Current' ? 'current version' : 'superseded version'}
        </p>
        <div className="mt-3 space-y-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setFormat(o.id)}
              className={`flex w-full items-start gap-2.5 rounded border p-3 text-left transition-colors ${
                format === o.id ? 'border-[#3D8BD0] bg-[#F5FAFF]' : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
              }`}
            >
              <span className={`mt-0.5 flex size-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${format === o.id ? 'border-[#3D8BD0]' : 'border-[#CBD5E1]'}`}>
                {format === o.id && <span className="size-2 rounded-full bg-[#3D8BD0]" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-[#364658]">{o.id}</span>
                <span className="mt-0.5 block text-[12px] text-[#7B8FA5]">{o.note}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button
            onClick={() => { toast.success(`${type} v${version.v} downloaded as ${format}`); onClose(); }}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
          >
            <Download size={15} /> Download
          </button>
        </div>
      </div>
    </>
  );
}

/* Version search — the only thing worth searching a short version rail by is WHEN it was
 * generated, so the box builds a date condition: field → operator → value, the same three-step
 * shape the components drawer uses. */
export type DateFilter =
  | { kind: 'all' }
  | { kind: 'within'; label: string; days: number }
  | { kind: 'before'; date: string }
  | { kind: 'after'; date: string }
  | { kind: 'between'; from: string; to: string };

type DateOperator = 'is within' | 'is before' | 'is after' | 'is between';
const DATE_OPERATORS: DateOperator[] = ['is within', 'is before', 'is after', 'is between'];

const DATE_PRESETS: { label: string; days: number }[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This quarter', days: 90 },
  { label: 'Last 6 months', days: 182 },
  { label: 'This year', days: 365 },
];

const dateFilterOp = (f: DateFilter): string =>
  f.kind === 'all' ? '' : f.kind === 'within' ? 'is within' : f.kind === 'between' ? 'is between' : `is ${f.kind}`;

const dateFilterValue = (f: DateFilter): string => {
  switch (f.kind) {
    case 'all': return '';
    case 'within': return f.label;
    case 'before': case 'after': return f.date;
    case 'between': return `${f.from || '…'} → ${f.to || '…'}`;
  }
};

/** Parse the module's "Jun 16, 2026 08:33 AM" stamps — resolves to LOCAL midnight of that day. */
const parseStamp = (s: string) => new Date(s.split(' ').slice(0, 3).join(' ').replace(',', ''));

/** A yyyy-mm-dd picker value as LOCAL midnight. `new Date('2026-06-12')` would parse as UTC,
 *  which lands mid-morning in +05:30 and lets same-day versions slip past "is before". */
const localDay = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1).getTime();
};

function VersionDateSearch({ value, onChange }: { value: DateFilter; onChange: (f: DateFilter) => void }) {
  // null = closed. {} = picking the field. {field} = picking the operator. {field, op} = value.
  const [step, setStep] = useState<{ field?: 'Date'; op?: DateOperator } | null>(null);
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const active = value.kind !== 'all';

  const close = () => { setStep(null); setD1(''); setD2(''); };
  const apply = (f: DateFilter) => { onChange(f); close(); };

  const dateInput = 'h-8 w-full rounded border border-[#d1d5db] bg-white px-2 text-[12px] text-[#364658] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]';

  return (
    <div className="flex items-center gap-2">
      {/* Applied condition stays visible next to the trigger, so the icon is never a mystery */}
      {active && !step && (
        <span className="inline-flex items-center gap-1 rounded-sm bg-[#EBF5FF] px-1.5 py-0.5 text-[12px] text-[#3D8BD0]">
          <CalendarDays size={12} />
          <span className="font-medium">Date</span>
          <span className="text-[#7B8FA5]">{dateFilterOp(value)}</span>
          <span className="font-medium">{dateFilterValue(value)}</span>
          <button onClick={() => onChange({ kind: 'all' })} className="text-[#3D8BD0]/70 hover:text-[#DC2626]"><X size={12} /></button>
        </span>
      )}
      {step && (
        <span className="inline-flex items-center gap-1 text-[13px] text-[#364658]">
          {step.field && <span className="font-medium">{step.field}</span>}
          {step.field && <ChevronRight size={13} className="text-[#9CA3AF]" />}
          {step.op && <span className="text-[#7B8FA5]">{step.op}</span>}
          {step.op && <ChevronRight size={13} className="text-[#9CA3AF]" />}
        </span>
      )}

      <div className="relative">
        {/* Collapsed it is just an icon; clicking expands it into a field and opens the builder. */}
        <button
          onClick={() => setStep((s) => (s ? null : {}))}
          title="Search versions by date"
          className={`flex h-8 items-center gap-2 rounded border transition-all ${
            step
              ? 'w-[220px] justify-between border-[#3D8BD0] bg-white px-2.5 text-[#7B8FA5]'
              : active
                ? 'size-8 justify-center border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                : 'size-8 justify-center border-[#DFE5ED] bg-white text-[#7B8FA5] hover:bg-[#F5F7FA] hover:text-[#364658]'
          }`}
        >
          {step && <span className="truncate text-[13px] text-[#9ca3af]">Search versions by date...</span>}
          <Search size={16} className="flex-shrink-0" />
        </button>

      {step && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute right-0 top-full z-50 mt-1 w-[320px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
            {/* Step 1 — field */}
            {!step.field && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Filter by field</div>
                <button
                  onClick={() => setStep({ field: 'Date' })}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                >
                  <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-[#7B8FA5]" />Date</span>
                  <ChevronRight size={14} className="text-[#9CA3AF]" />
                </button>
              </>
            )}

            {/* Step 2 — operator */}
            {step.field && !step.op && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Operator</div>
                {DATE_OPERATORS.map((op) => (
                  <button
                    key={op}
                    onClick={() => { setStep({ ...step, op }); setD1(''); setD2(''); }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                  >
                    {op}<ChevronRight size={14} className="text-[#9CA3AF]" />
                  </button>
                ))}
              </>
            )}

            {/* Step 3 — value; quick presets for "is within", a date picker otherwise */}
            {step.field && step.op === 'is within' && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Quick ranges</div>
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => apply({ kind: 'within', label: p.label, days: p.days })}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                      value.kind === 'within' && value.label === p.label ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {p.label}
                    {value.kind === 'within' && value.label === p.label && <Check size={15} className="text-[#3D8BD0]" />}
                  </button>
                ))}
                <div className="my-1 border-t border-[#F0F2F5]" />
                <button
                  onClick={() => setStep({ ...step, op: 'is between' })}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-[#364658] transition-colors hover:bg-[#F9FAFB]"
                >
                  Custom range…<ChevronRight size={14} className="text-[#9CA3AF]" />
                </button>
              </>
            )}

            {step.field && (step.op === 'is before' || step.op === 'is after') && (
              <div className="px-3 pb-2 pt-2">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Date</div>
                <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} className={dateInput} />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button onClick={close} className="inline-flex h-7 items-center rounded border border-[#DFE5ED] bg-white px-2.5 text-[12px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
                  <button
                    onClick={() => d1 && apply(step.op === 'is before' ? { kind: 'before', date: d1 } : { kind: 'after', date: d1 })}
                    disabled={!d1}
                    className="inline-flex h-7 items-center rounded bg-[#3D8BD0] px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#3479b5] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                  >Apply</button>
                </div>
              </div>
            )}

            {step.field && step.op === 'is between' && (
              <div className="px-3 pb-2 pt-2">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Custom range</div>
                <div className="flex items-center gap-2">
                  <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} className={dateInput} />
                  <span className="text-[12px] text-[#9CA3AF]">to</span>
                  <input type="date" value={d2} onChange={(e) => setD2(e.target.value)} className={dateInput} />
                </div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button onClick={close} className="inline-flex h-7 items-center rounded border border-[#DFE5ED] bg-white px-2.5 text-[12px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
                  <button
                    onClick={() => (d1 || d2) && apply({ kind: 'between', from: d1, to: d2 })}
                    disabled={!d1 && !d2}
                    className="inline-flex h-7 items-center rounded bg-[#3D8BD0] px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#3479b5] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                  >Apply</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}

/** Reference text that belongs on the screen but not in the reading path — an info icon whose
 *  hover carries the explanation, so the layout stays clean. */
function InfoHint({ text }: { text: string }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center text-[#9CA3AF] transition-colors hover:text-[#3D8BD0]">
          <Info size={14} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[320px] text-wrap">{text}</TooltipContent>
    </Tooltip>
  );
}

interface EndpointBomTabProps {
  endpointId: string;
  hostName: string;
  /** Which BOM to open on. The Dashboard links to a specific one — a certificate finding is in
   *  the CBOM and a model finding is in the AI BOM, so landing on SBOM would hide the thing the
   *  user clicked. Defaults to SBOM for every other entry point. */
  initialType?: BomType;
  /** Arriving from a component's "Installed on" list: open this host's BOM already looking at
   *  that component, in the scope that actually contains it. Without picking the scope the tab
   *  would land on the OS catch-all and the component would not be in the tree at all. */
  initialComponent?: string;
  /** Lock the tab to ONE scope and render it inline — no products overview, no product drawer.
   *  A Business Application is a single scope by definition (one application, one path), so the
   *  overview that exists to choose between a host's products has nothing to choose between. */
  fixedScope?: BomProduct;
  /** The BOM types this scope may show. An ingested application carries an SBOM only — CBOM and
   *  AI BOM come from the agent — so the type select must not offer what cannot exist. */
  allowedTypes?: BomType[];
  /** Pins the view to ONE BOM type and hides the type select — the product page gives SBOM,
   *  CBOM and AI BOM a tab each, so the tab already says which BOM this is. */
  lockedType?: BomType;
  /** The primary action beside the type select. Defaults to "Scan BOM"; an ingested application
   *  has no agent to scan with, so it passes an upload action instead. */
  primaryAction?: { label: string; icon: React.ReactNode; onClick: () => void };
  /** The versions are uploaded documents, not scans — the connectors say so, and there is no
   *  scan-run history behind them to open. */
  ingested?: boolean;
}


/* The app's severity vocabulary — a soft tint with the word in the matching ink, the same
   pairing the CVE listing and the component drawer use. A solid fill made this band the
   loudest thing on the page, which is the wrong order: it is a summary, not an alarm. */
const SEV_SOLID: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318' },
  High: { bg: '#FFF4ED', text: '#C4320A' },
  Medium: { bg: '#FFFAEB', text: '#B54708' },
  Low: { bg: '#F2F4F7', text: '#475467' },
};

/** The product drawer, and the inset every panel opened FROM it gets. 20px is enough to show the
 *  drawer's edge underneath, which is what tells you the panel is a level deeper rather than a
 *  replacement — the same reading the rule-studio conflict drawer uses. */
const DRAWER_W = typeof window !== 'undefined'
  ? Math.round(Math.min(1400, window.innerWidth * 0.86) * 0.9)
  : 1116;
const STACK_INSET = 20;

export function EndpointBomTab({ endpointId, hostName, initialType, initialComponent, fixedScope, allowedTypes, primaryAction, ingested, lockedType }: EndpointBomTabProps) {
  const record = fixedScope ? { products: [fixedScope] } : bomForEndpoint(endpointId);
  // Products can be added in Manage products, so they live in state rather than being read
  // straight from the record on every render.
  const [products, setProducts] = useState(record.products);
  const defaultKey = (ps: typeof products) => (ps.find((p) => p.isDefault) ?? ps.find((p) => p.key === OS_PRODUCT_KEY) ?? ps[0])?.key ?? OS_PRODUCT_KEY;
  const [type, setType] = useState<BomType>(lockedType ?? initialType ?? 'SBOM');
  /* null = the products overview. Modelled as "no product selected" rather than a separate
     showOverview flag, so the two can never disagree about which screen is up.
     A deep link that names a BOM type (the dashboard's "open the CBOM on CI-408") came for a
     specific thing, so it still lands scoped; a plain visit lands on the overview. */
  const [productKey, setProductKey] = useState<string | null>(() => (fixedScope ? fixedScope.key : initialType ? defaultKey(record.products) : null));
  const [showTypes, setShowTypes] = useState(false);
  const [showPaths, setShowPaths] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  /* A version card's added / updated / removed count opens Compare on that version vs the one before. */
  const [compareAt, setCompareAt] = useState<{ v: number; tab: 'Added' | 'Updated' | 'Removed' } | null>(null);
  const [downloadFor, setDownloadFor] = useState<number | null>(null);
  const [runsPanel, setRunsPanel] = useState<{ title: string; subtitle: string; runs: BomScanRun[] } | null>(null);
  // Version whose component listing is open in the side drawer (null = drawer closed).
  const [componentsFor, setComponentsFor] = useState<number | null>(null);
  // Set when the listing was opened from the CVE metric — that entry point leads with the
  // vulnerable components rather than the changed ones.
  const [componentsCveFirst, setComponentsCveFirst] = useState(false);
  // Which change tab the listing opens on — set by whichever count was clicked, so the number
  // you press is the list you get.
  const [componentsTab, setComponentsTab] = useState<ChangeTab>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: 'all' });

  // A different endpoint means a different set of products — reset the whole tab.
  useEffect(() => {
    const ps = fixedScope ? [fixedScope] : bomForEndpoint(endpointId).products;
    setProducts(ps);
    setProductKey(fixedScope ? fixedScope.key : initialType ? defaultKey(ps) : null);
    setType(initialType ?? 'SBOM'); setComponentsFor(null); setDateFilter({ kind: 'all' });
  }, [endpointId, fixedScope?.key, fixedScope?.status]);

  /* A deep link that names a BOM type came for a specific thing — honour it even when the tab is
     already mounted, which is what happens when the same record is reopened from the dashboard
     for a different BOM. Without this the tab would sit on the overview and ignore the request. */
  useEffect(() => {
    if (!initialType) return;
    setType(initialType);
    setProductKey((k) => k ?? defaultKey(bomForEndpoint(endpointId).products));
  }, [initialType, endpointId]);

  /* Arriving from a component: choose the scope that actually carries it, then open that scope's
     current version straight onto the dependency tree. Landing on the overview or on the OS
     catch-all would answer a question nobody asked. */
  useEffect(() => {
    if (!initialComponent) return;
    const ps = bomForEndpoint(endpointId).products;
    /* Look in the bill the component actually belongs to. An AI component is not in the SBOM, so
       searching `bomComponents` for it would find nothing and land on the OS catch-all. */
    const want = initialType ?? 'SBOM';
    const carries = (key: string) => (want === 'AI BOM'
      ? bomAiAssets(endpointId, key).some((m) => m.name === initialComponent)
      : bomComponents(endpointId, key).some((c) => c.name === initialComponent));
    const owner = ps.find((p) => carries(p.key));
    const key = (owner ?? ps.find((p) => p.key === OS_PRODUCT_KEY) ?? ps[0])?.key;
    if (!key) return;
    setType(want);
    setProductKey(key);
    /* The version whose listing is the host as it stands now — the same one the rail marks
       Current, so the tree is not showing a historical answer. */
    const vs = bomVersions(endpointId, key, want);
    const cur = vs.findIndex((v) => v.state === 'Current');
    setComponentsFor(cur >= 0 ? cur : 0);
    setComponentsTab('All');
    setComponentsCveFirst(false);
  }, [initialComponent, initialType, endpointId]);

  /* Carrying a type across products would land you on a BOM the new scope does not have — the
     rail would be empty and read as "nothing scanned" rather than "not applicable here". If the
     selected type is not one this product carries, fall to the first it does.
     
     It must NOT overrule a deep link. Both effects run in the same commit, and this one saw the
     landing's default scope rather than the one the component actually lives in — so it corrected
     an "AI BOM" request to SBOM a moment before the other effect could point it at the right
     product. An explicitly requested type is left alone. */
  useEffect(() => {
    if (lockedType || !productKey || type === initialType) return;
    const avail = BOM_TYPES.filter((t) => componentCount(endpointId, productKey, t) > 0 && (!allowedTypes || allowedTypes.includes(t)));
    if (avail.length && !avail.includes(type)) setType(avail[0]);
  }, [productKey, endpointId, type, initialType]);

  const onOverview = productKey === null;
  const product = onOverview ? undefined : (products.find((p) => p.key === productKey) ?? products[0]);
  const productLabel = product ? (product.version ? `${product.name} ${product.version}` : product.name) : 'OS / base platform';
  /* The BOMs this scope actually carries. `componentCount` is the same function the overview's
     type chips read, so the drawer and the list cannot disagree about what exists. */
  const availableTypes = product
    ? BOM_TYPES.filter((t) => componentCount(endpointId, product.key, t) > 0 && (!allowedTypes || allowedTypes.includes(t)))
    : BOM_TYPES;
  const versions = product ? bomVersions(endpointId, product.key, type) : [];
  const count = product ? componentCount(endpointId, product.key, type) : 0;
  const retention = bomRetention(endpointId, product?.key ?? OS_PRODUCT_KEY, type);

  // Date filter over the rail. Presets are relative to the newest version, so the demo data
  // stays inside the window instead of ageing out of it.
  const shownVersions = (() => {
    if (dateFilter.kind === 'all' || versions.length === 0) return versions;
    const at = (v: BomVersion) => parseStamp(v.generatedAt).getTime();
    const dayEnd = (d: string) => localDay(d) + 86399999;
    switch (dateFilter.kind) {
      case 'within': {
        // Relative to the NEWEST version, so demo data never ages out of its own filter.
        const cutoff = at(versions[0]) - dateFilter.days * 86400000;
        return versions.filter((v) => at(v) >= cutoff);
      }
      // "before"/"after" exclude the named day itself — a version dated Jun 12 is neither
      // before nor after Jun 12.
      case 'before': return versions.filter((v) => at(v) < localDay(dateFilter.date));
      case 'after': return versions.filter((v) => at(v) > dayEnd(dateFilter.date));
      case 'between': {
        const from = dateFilter.from ? localDay(dateFilter.from) : -Infinity;
        const to = dateFilter.to ? dayEnd(dateFilter.to) : Infinity;
        return versions.filter((v) => at(v) >= from && at(v) <= to);
      }
    }
  })();

  /* A Business Application whose scan is queued has a scope but no document yet. Saying "no BOM
     for this endpoint" would be wrong twice over — it is not an endpoint, and nothing failed. */
  if (fixedScope && fixedScope.status === 'Pending') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-[#F5F7FA]">
          <ScanLine className="size-6 text-[#9CA3AF]" />
        </div>
        <p className="text-[14px] font-medium text-[#364658]">First scan queued</p>
        <p className="mt-1 max-w-[460px] text-[13px] text-[#7B8FA5]">
          The agent on <span className="font-medium text-[#364658]">{hostName}</span> scans
          <span className="font-mono text-[#364658]"> {fixedScope.path} </span>
          on its next check-in. The first SBOM, CBOM and AI BOM appear here as version 1.
        </p>
      </div>
    );
  }

  // No BOM at all on this host — nothing below the header applies.
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-[#F5F7FA]">
          <Layers className="size-6 text-[#9CA3AF]" />
        </div>
        <p className="text-[14px] font-medium text-[#364658]">No BOM generated for this endpoint</p>
        <p className="mt-1 max-w-[440px] text-[13px] text-[#7B8FA5]">
          The agent has not completed a Bill of Materials scan on this host yet. Run
          <span className="font-medium text-[#364658]"> Scan Now </span>
          to generate the first SBOM.
        </p>
      </div>
    );
  }

  /* The landing. Everything below this line is the scoped view, unchanged — the overview is a
     layer in front of it, not a replacement, because versions and diffs are only meaningful
     inside one product. */
  if (onOverview) {
    /* The stacked panels live at the BOTTOM of this component, so returning early here left the
       overview's gear opening nothing at all — it rendered the button and none of the drawer.
       The one it needs comes with it. */
    return (
      <>
        <BomProductsOverview
          endpointId={endpointId}
          products={products}
          onOpen={(k) => { setProductKey(k); setComponentsFor(null); setDateFilter({ kind: 'all' }); }}
          onManagePaths={() => setShowPaths(true)}
          onScan={() => toast.success(`BOM scan queued for ${hostName}`)}
        />
        <BomManageProductsPanel
          isOpen={showPaths}
          onClose={() => setShowPaths(false)}
          endpointId={endpointId}
          hostName={hostName}
          products={products}
          onProductsChange={(next) => { setProducts(next); setShowPaths(false); }}
        />
      </>
    );
  }

  /* The scoped view itself — versions, compare, components. Built once so the host's product drawer
     and a Business Application's inline tab render the same thing rather than two copies of it. */
  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">

      {/* Control bar — BOM type and scope are both selects now, with the scan config and the
          scan action bracketing them. One row, so the versions start higher up the page. */}
      <div className="mb-6 flex items-end gap-2">
        {!lockedType && (
        <div className="flex-shrink-0">
          {/* No label: the control's value IS the category ("SBOM"), so a "BOM type" caption
              above it spent a line saying the same word twice. */}
          <div className="relative">
          <button
            onClick={() => setShowTypes((v) => !v)}
            className="inline-flex h-9 w-[260px] items-center justify-between gap-2 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:border-[#3D8BD0]"
          >
            {type}
            <ChevronDown size={15} className={`flex-shrink-0 text-[#7B8FA5] transition-transform ${showTypes ? 'rotate-180' : ''}`} />
          </button>
          {showTypes && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTypes(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-[260px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                {availableTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setShowTypes(false); setComponentsFor(null); }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                      t === type ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {t}
                    <span className="flex flex-shrink-0 items-center gap-2">
                      {/* What picking it would give you — the reason one BOM is worth opening
                          over another. */}
                      <span className="text-[12px] text-[#7B8FA5] tabular-nums">
                        {componentCount(endpointId, product?.key ?? OS_PRODUCT_KEY, t)}
                      </span>
                      {t === type && <Check size={15} className="text-[#3D8BD0]" />}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          </div>
        </div>
        )}

        {/* The Product picker is gone: this drawer IS one product, and a control that can
            change what a drawer is showing turns it into a second navigation surface. The
            scope is named in the drawer header, and the way to another one is the list
            behind it. */}

        {/* A Business Application carries its action in the drawer header, so the tab does not
            repeat it unless asked to. */}
        {(!fixedScope || primaryAction) && <button
          onClick={primaryAction ? primaryAction.onClick : () => toast.success(`BOM scan queued for ${hostName}`)}
          /* self-start: the row is bottom-aligned for the labelled selects, but the CTA has no
             label above it, so it sits at the top of the row instead of floating down. */
          className="ml-auto inline-flex h-9 flex-shrink-0 self-start items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]"
        >
          {primaryAction ? <>{primaryAction.icon} {primaryAction.label}</> : <><ScanLine size={15} /> Scan BOM</>}
        </button>}
      </div>

      {/* Versions heading + rail controls */}
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[15px] font-semibold text-[#364658]">Versions</h3>
        <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#EEF2F6] px-1.5 text-[12px] font-semibold text-[#64748B]">
          {versions.length}
        </span>
        <InfoHint text="A version appears only when a scan finds a change — the line between two versions shows how many scans ran in that gap." />

        <div className="ml-auto flex items-center gap-2">
          <VersionDateSearch value={dateFilter} onChange={setDateFilter} />
          <button
            onClick={() => { setCompareAt(null); setShowCompare(true); }}
            disabled={versions.length < 2}
            className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded border border-[#3D8BD0] bg-white px-3 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF] disabled:cursor-not-allowed disabled:border-[#DFE5ED] disabled:text-[#9CA3AF] disabled:hover:bg-white"
            title={versions.length < 2 ? 'Needs at least two versions to compare' : undefined}
          >
            <Columns3 size={15} /> Compare versions
          </button>
        </div>
      </div>

      {/* Version timeline */}
      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-[#F5F7FA]">
            <Layers className="size-6 text-[#9CA3AF]" />
          </div>
          <p className="text-[13px] text-[#7B8FA5]">
            No {type} for {productLabel}. Selection is kept — pick another product to compare.
          </p>
        </div>
      ) : (
        <>
          {shownVersions.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#E5E7EB] py-10 text-center text-[13px] text-[#9CA3AF]">
              No versions generated in this period.
            </div>
          )}

          {shownVersions.map((v, i) => (
            <div key={v.v}>
              {/* Version card — the current one is tinted so the head of the chain is obvious */}
              {/* Left block (identity + change dots) and right block (actions) are siblings on one
                  centred row, so the actions sit against the middle of both lines, not the first. */}
              <div className={`group/card flex gap-3 rounded-lg border px-4 py-2.5 ${v.state === 'Current' ? 'items-start border-[#3D8BD0] bg-[#F8FBFF]' : 'items-center border-[#E5E7EB] bg-white'}`}>
                <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-[15px] font-semibold text-[#364658]">v{v.v}</span>
                  <span className="text-[14px] text-[#364658]">{v.generatedAt}</span>
                  {/* Only the head of the chain is called out — "Superseded" on every older card
                      is noise, since being older already says it. */}
                  {v.state === 'Current' && (
                    <span className="rounded-sm bg-[#E8F4FD] px-2 py-0.5 text-[12px] font-medium text-[#3D8BD0]">{v.state}</span>
                  )}
                  {/* How long RETENTION keeps this superseded version. "Expiry" read like the
                      document itself going stale; nothing expires here — a policy deletes it,
                      and saying so points at the setting that decides. The current version is
                      never aged out, so it carries no chip. */}
                  {v.expiresInDays !== null && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span
                          className={`cursor-help text-[12px] ${v.expiresInDays <= 14 ? 'font-medium text-[#EA580C]' : 'text-[#7B8FA5]'}`}
                        >
                          Retained {v.expiresInDays} more day{v.expiresInDays === 1 ? '' : 's'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Retention keeps the latest {retention.keepVersions} versions and deletes
                        anything older than {retention.deleteAfterDays} days. This one is deleted in{' '}
                        {v.expiresInDays} day{v.expiresInDays === 1 ? '' : 's'} unless the policy changes.
                        Change it in Admin › BOM Management › Retention.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                  {/* One band, one way of writing a metric: the number carries the colour and
                      the word stays quiet text beside it. That pairing was already how
                      "19 findings" read; the severities used to be tinted pills instead, which
                      made the breakdown shout louder than the figure it breaks down.

                      THE CURRENT CARD ONLY. It is the one anybody acts on, so it carries the
                      full band: what this scan changed, then what the host is left carrying,
                      as four labelled groups on ONE row — nothing wraps, and if the viewport is
                      genuinely too narrow it scrolls rather than folding.

                      Superseded cards keep the row they always had (CVE count, then added /
                      updated / removed as icon + count). They are history: a reader scanning
                      back through them wants them uniform and small, and the carrying metrics
                      would describe a state that is no longer true anyway. */}
                  {v.state === 'Current' ? (() => {
                    const st = bomVersionStats(endpointId, product?.key ?? OS_PRODUCT_KEY, type, v.v);
                    const open = () => { setComponentsCveFirst(true); setComponentsTab('CVEs'); setComponentsFor(v.v); };
                    const Label = ({ children }: { children: React.ReactNode }) => (
                      <div className="whitespace-nowrap text-[11px] font-semibold text-[#364658]">{children}</div>
                    );
                    const Unit = ({ children }: { children: React.ReactNode }) => (
                      <span className="whitespace-nowrap text-[10px] uppercase tracking-wider text-[#7B8FA5]">{children}</span>
                    );
                    const Rule = () => <span className="h-9 w-px flex-none self-center bg-[#DCEAF7]" />;
                    /* A zero is grey whatever it counts: colour here means "there is something
                       of this here", so spending it on nothing would be a false signal. */
                    const Metric = ({ n, label, tone, onClick, title, size = 15 }: {
                      n: number; label: string; tone: string; onClick?: () => void; title?: string; size?: number;
                    }) => {
                      const body = (
                        <>
                          <span
                            className="font-bold leading-none tabular-nums"
                            style={{ fontSize: `${size}px`, color: n ? tone : '#9CA3AF' }}
                          >{n}</span>
                          <Unit>{label}</Unit>
                        </>
                      );
                      /* Same treatment as Component changes above: underline on hover, and the
                         product's own tooltip rather than the browser's. */
                      return (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            {onClick && n > 0 ? (
                              <button
                                onClick={onClick}
                                className="flex items-baseline gap-1.5 rounded transition-colors hover:underline"
                              >{body}</button>
                            ) : (
                              <span className="flex cursor-help items-baseline gap-1.5">{body}</span>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="top">{title}</TooltipContent>
                        </Tooltip>
                      );
                    };
                    /* overflow-y MUST be stated. CSS will not let one axis scroll while the other
                       stays `visible` — setting overflow-x to auto silently promotes overflow-y to
                       auto as well, and a band whose content is a rounding error taller than its
                       box then grows a vertical scrollbar inside the card. */
                    return (
                      <div className="mt-3 overflow-x-auto overflow-y-hidden">
                        <div className="flex flex-nowrap items-center gap-x-6">
                          {/* What this scan did — first, because it is what the card is about. */}
                          <div className="flex-none">
                            <Label>Component changes</Label>
                            {/* Each count is a way in: clicking opens this version's components
                                already on the matching tab, so the number you clicked is the
                                list you get. */}
                            <div className="mt-1 flex flex-nowrap items-center gap-x-3">
                              {([
                                [CirclePlus, '#22C55E', v.added, 'added', 'Added'],
                                [RefreshCw, '#F59E0B', v.updated, 'updated', 'Updated'],
                                [CircleMinus, '#EF4444', v.removed, 'removed', 'Removed'],
                              ] as const).map(([Icon, color, n, label, tab]) => (
                                <Tooltip key={label} delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    {n > 0 ? (
                                      <button
                                        onClick={() => { setCompareAt({ v: v.v, tab }); setShowCompare(true); }}
                                        className="inline-flex items-center gap-1.5 rounded transition-colors hover:underline"
                                        style={{ color }}
                                      >
                                        <Icon size={15} />
                                        <span className="text-[12px] font-semibold">{n}</span>
                                      </button>
                                    ) : (
                                      <span className="inline-flex cursor-help items-center gap-1.5 text-[#9CA3AF]">
                                        <Icon size={15} />
                                        <span className="text-[12px] font-semibold">{n}</span>
                                      </span>
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {n > 0 ? `View the ${n} component${n === 1 ? '' : 's'} ${label}` : `No components ${label}`}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>

                          <Rule />

                              <div className="flex-none">
                                <Label>Vulnerabilities</Label>
                                <div className="mt-0.5 flex flex-nowrap items-baseline gap-x-3">
                                  <Metric
                                    n={st.cves}
                                    label="findings"
                                    tone="#DC2626"
                                    size={20}
                                    onClick={open}
                                    title={st.cves > 0
                                      ? `View the ${st.cves} vulnerable component${st.cves === 1 ? '' : 's'}`
                                      : 'No findings in this version'}
                                  />
                                  {BOM_SEVERITIES.map((sv) => (
                                    <Metric
                                      key={sv}
                                      n={st.bySeverity[sv]}
                                      label={sv}
                                      tone={SEV_SOLID[sv].text}
                                      onClick={open}
                                      /* A zero has no list to open, so it says what it is
                                         rather than offering a door to an empty room. */
                                      title={st.bySeverity[sv] > 0
                                        ? `View the ${st.bySeverity[sv]} ${sv} CVE${st.bySeverity[sv] === 1 ? '' : 's'}`
                                        : `No ${sv} CVEs in this version`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <Rule />

                              <div className="flex-none">
                                <Label>Packages with findings</Label>
                                <div className="mt-0.5 flex flex-nowrap items-baseline gap-1.5">
                                  <span className={`text-[20px] font-bold leading-none tabular-nums ${st.vulnerablePackages ? 'text-[#DC2626]' : 'text-[#364658]'}`}>{st.vulnerablePackages}</span>
                                  <Unit>/ {st.totalPackages} packages</Unit>
                                </div>
                              </div>

                        </div>
                      </div>
                    );
                  })() : (
                    /* Unchanged from before the current card was rebuilt. CVEs lead (they are
                       the reason to care), then added / updated / removed as icon + count — the
                       labels are carried by the icons and the tooltips, so the row stays
                       scannable at a glance down a stack of old versions. */
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5">
                      {/* With CVEs present the metric is a way in: hovering the card turns the
                          shield into an arrow, and clicking opens this version's components with
                          the vulnerable ones first. With none, it stays a plain read-out. */}
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          {v.cves > 0 ? (
                            <button
                              onClick={() => { setComponentsCveFirst(true); setComponentsTab('CVEs'); setComponentsFor(v.v); }}
                              className="inline-flex items-center gap-1.5 rounded text-[#DC2626] transition-colors hover:underline"
                            >
                              <ShieldAlert size={15} className="group-hover/card:hidden" />
                              <ArrowRight size={15} className="hidden group-hover/card:block" />
                              <span className="text-[12px] font-semibold">{v.cves}</span>
                              <span className="text-[12px]">CVE</span>
                            </button>
                          ) : (
                            <span className="inline-flex cursor-help items-center gap-1.5 text-[#9CA3AF]">
                              <ShieldAlert size={15} />
                              <span className="text-[12px] font-semibold">{v.cves}</span>
                              <span className="text-[12px]">CVE</span>
                            </span>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {/* The metric counts CVEs that arrived WITH this version; the tab it
                              opens lists every vulnerable component on the host. Say both, or the
                              two numbers look like they disagree. */}
                          {v.cves > 0
                            ? `${v.cves} CVE${v.cves === 1 ? '' : 's'} arrived with this version — opens every component carrying a CVE`
                            : 'No CVEs arrived with this version'}
                        </TooltipContent>
                      </Tooltip>

                      {/* Each count is a way in: clicking opens this version's components already
                          on the matching tab, so the number you clicked is the list you get. */}
                      {([
                        [CirclePlus, '#22C55E', v.added, 'added', 'Added'],
                        [RefreshCw, '#F59E0B', v.updated, 'updated', 'Updated'],
                        [CircleMinus, '#EF4444', v.removed, 'removed', 'Removed'],
                      ] as const).map(([Icon, color, n, label, tab]) => (
                        <Tooltip key={label} delayDuration={0}>
                          <TooltipTrigger asChild>
                            {n > 0 ? (
                              <button
                                onClick={() => { setCompareAt({ v: v.v, tab }); setShowCompare(true); }}
                                className="inline-flex items-center gap-1.5 rounded transition-colors hover:underline"
                                style={{ color }}
                              >
                                <Icon size={15} />
                                <span className="text-[12px] font-semibold">{n}</span>
                              </button>
                            ) : (
                              <span className="inline-flex cursor-help items-center gap-1.5 text-[#9CA3AF]">
                                <Icon size={15} />
                                <span className="text-[12px] font-semibold">{n}</span>
                              </span>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {n > 0 ? `View the ${n} component${n === 1 ? '' : 's'} ${label}` : `No components ${label}`}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>

                {/* self-center: the card aligns its two text bands to the top, but the actions
                    belong to the whole card, so they sit against its middle rather than riding
                    up beside the first line. */}
                <div className="flex flex-shrink-0 items-center gap-2 self-center">
                  <div className="relative">
                    <button
                      onClick={() => setDownloadFor(downloadFor === v.v ? null : v.v)}
                      className="flex size-8 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#7B8FA5] transition-colors hover:bg-[#F5F7FA] hover:text-[#364658]"
                      title={`Download v${v.v}`}
                    ><Download size={15} /></button>
                    {downloadFor === v.v && (
                      <DownloadPopover
                        version={v}
                        type={type}
                        productLabel={productLabel}
                        count={count}
                        onClose={() => setDownloadFor(null)}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => { setComponentsCveFirst(false); setComponentsTab('All'); setComponentsFor(v.v); }}
                    className="inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3.5 text-[13px] font-medium text-[#364658] transition-colors hover:border-[#3D8BD0] hover:text-[#3D8BD0]"
                  >
                    {/* What THIS version holds — the list it opens shows that version only. */}
                    {viewLabel(type)} · {product ? componentsAtVersion(endpointId, product.key, type, v.v).length : count}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Connector — the scans that ran in this gap (including the ones that changed
                  nothing). The dotted rule carries the eye from one card to the next. */}
              <div className="relative">
                {/* The rule joins one card to the next, so the last connector has none to draw. */}
                {i < shownVersions.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-[7px] top-0 border-l border-dashed border-[#CBD5E1]"
                  />
                )}
                {ingested ? (
                  <div className="relative flex w-full items-center gap-2 py-5 pl-6 text-left">
                    <span className="absolute left-[3px] size-2 flex-shrink-0 rounded-full border border-[#CBD5E1] bg-white" />
                    <span className="text-[12px] text-[#7B8FA5]">
                      {v.v === 1 ? `First ${type} ingested` : `New ${type} uploaded`}
                    </span>
                  </div>
                ) : <button
                  onClick={() => setRunsPanel({
                    title: v.v === 1 ? 'Scans before v1' : `Scans between v${v.v - 1} and v${v.v}`,
                    subtitle: `${v.runs.length} run${v.runs.length === 1 ? '' : 's'} · the last one produced v${v.v}`,
                    runs: v.runs,
                  })}
                  className="group relative flex w-full items-center gap-2 py-5 pl-6 text-left"
                >
                  {/* White fill breaks the dotted rule so the dot reads as a node on it */}
                  <span className="absolute left-[3px] size-2 flex-shrink-0 rounded-full border border-[#CBD5E1] bg-white" />
                  <span className="text-[12px] text-[#7B8FA5]">
                    <span className="text-[#364658]">{v.gapLabel.split(' ').slice(0, 2).join(' ')}</span>
                    {' '}{v.gapLabel.split(' ').slice(2).join(' ')}
                  </span>
                  <span className="text-[12px] font-medium text-[#3D8BD0] opacity-0 transition-opacity group-hover:opacity-100">View</span>
                </button>}
              </div>
              {i === shownVersions.length - 1 && <div className="h-2" />}
            </div>
          ))}

          {/* Retention already removed the versions older than v1 — they sat before it in time,
              so the note closes the rail rather than opening it. */}
          {retention.deleted > 0 && shownVersions.length > 0 && (
            <div className="flex items-center gap-2 border-t border-dashed border-[#E5E7EB] pt-3 text-[12px] text-[#9CA3AF]">
              <Trash2 size={13} className="flex-shrink-0" />
              <span>
                <span className="font-medium text-[#7B8FA5]">{retention.deleted} older version{retention.deleted === 1 ? '' : 's'}</span>
                {' '}deleted by retention
              </span>
            </div>
          )}
        </>
      )}

      {/* Sub-screens */}
      <BomComponentsPanel
        isOpen={componentsFor !== null}
        onClose={() => setComponentsFor(null)}
        endpointId={endpointId}
        hostName={hostName}
        productKey={product?.key ?? OS_PRODUCT_KEY}
        productLabel={productLabel}
        type={type}
        version={componentsFor ?? 0}
        format={SCAN_FORMAT[type]}
        cveFirst={componentsCveFirst}
        initialTab={componentsTab}
        focusComponent={initialComponent}
        width={DRAWER_W - STACK_INSET}
      />
      <BomCompareVersionsPanel
        isOpen={showCompare}
        onClose={() => { setShowCompare(false); setCompareAt(null); }}
        initialVersion={compareAt?.v}
        initialTab={compareAt?.tab}
        endpointId={endpointId}
        hostName={hostName}
        products={products}
        productKey={product?.key ?? OS_PRODUCT_KEY}
        type={type}
        width={DRAWER_W - STACK_INSET}
      />
      <BomScanRunsPanel
        isOpen={!!runsPanel}
        onClose={() => setRunsPanel(null)}
        title={runsPanel?.title ?? ''}
        subtitle={runsPanel?.subtitle ?? ''}
        runs={runsPanel?.runs ?? []}
      />
    </div>
  );

  /* A fixed scope IS the page: no overview behind it and nothing to close back to. */
  if (fixedScope) return body;

  /* A product opens as a DRAWER over the overview, which stays mounted behind it — the list you
     came from is where you left it, and closing is a dismissal rather than a navigation. */
  return (
    <>
      <BomProductsOverview
        endpointId={endpointId}
        products={products}
        onOpen={(k) => { setProductKey(k); setComponentsFor(null); setDateFilter({ kind: 'all' }); }}
        onManagePaths={() => setShowPaths(true)}
        onScan={() => toast.success(`BOM scan queued for ${hostName}`)}
      />
      <div className="fixed inset-0 z-[9998] flex items-stretch justify-end bg-black/40" onClick={() => { setProductKey(null); setComponentsFor(null); }}>
      <div
        className="flex h-full max-w-[96vw] flex-col bg-white shadow-2xl"
        style={{ width: DRAWER_W }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* The module's drawer header: a band that does not scroll, the product over the path it
          was found at, close on the right. Closing is the only way back — the list is still
          behind this drawer, so a back arrow beside a close button offered the same exit twice. */}
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-[#364658]">{productLabel}</h3>
            <p className="mt-0.5 truncate font-mono text-[13px] text-[#7B8FA5]">{product?.path}</p>
          </div>
        </div>
        <button
          onClick={() => { setProductKey(null); setComponentsFor(null); }}
          className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"
          title="Close"
        ><X size={18} /></button>
      </div>

    {body}
      </div>
      </div>
    </>
  );
}

/** BOM Info group for the endpoint's right-hand properties rail — the facts a compliance
 *  reviewer asks for (format, freshness, signature, CMDB linkage). */
export function BomInfoPanel({ endpointId }: { endpointId: string }) {
  const record = bomForEndpoint(endpointId);
  const product = record.products[0];
  if (!product) return null;
  const versions = bomVersions(endpointId, product.key, 'SBOM');
  const current = versions.find((v) => v.state === 'Current');
  const rows: [string, React.ReactNode][] = [
    ['Format', SCAN_FORMAT.SBOM],
    ['Last Updated Date', record.lastGenerated ?? '—'],
    ['BOM version', current ? `v${current.v} · living SBOM` : '—'],
    ['Components', String(componentCount(endpointId, product.key, 'SBOM'))],
    ['Signed', <span className="inline-flex items-center gap-1 text-[#22A06B]">cosign <Check size={13} /></span>],
  ];
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-2">
        <Layers size={16} className="text-[#7B8FA5]" />
        <h4 className="text-[14px] font-semibold text-[#364658]">BOM Info</h4>
      </div>
      <p className="mt-1 text-[12px] text-[#7B8FA5]">{product.name}{product.version ? ` ${product.version}` : ''} · SBOM</p>
      <div className="mt-3 space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3">
            <span className="text-[13px] text-[#7B8FA5]">{k}</span>
            <span className="text-right text-[13px] font-medium text-[#364658]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
