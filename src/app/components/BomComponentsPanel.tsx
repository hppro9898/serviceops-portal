import { useState, useEffect, useRef } from 'react';
import { X, Search, Download, Filter, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from './Pagination';
import { BomFilterSearch, matches } from './BomFilterSearch';
import type { Condition } from './BomFilterSearch';
import { bomComponents, bomCryptoAssets, bomAiInScope, bomCiId, bomDependencies, cryptoWhere, componentsAtVersion } from './bomData';
import { KIND_TITLE, AI_KIND_TITLE, aiIdentity, hasIdentity, hasProvider, aiAssets } from './aiModelsData';
import { componentByBuild } from './softwareComponentsData';
import { useDrawerStack } from './DrawerStack';
import { aiComponentByName, aiComponentByRef } from './aiBomCatalog';
import { BomDependencyTree } from './BomDependencyTree';
import type { BomType } from './bomData';

/* Side drawer listing every record in ONE BOM scope — opened from "View components / crypto
 * assets / models · N" on a version card. Columns differ per BOM type; filtering is a single
 * search box that builds field → operator → value conditions, so adding a column never adds
 * another select to the toolbar. */

/* CBOM posture. An exposed secret is the red one — it is usable today; a quantum-vulnerable
   algorithm is a migration item, so it is not painted the same alarm colour. */
const POSTURE_STYLE: Record<string, { bg: string; text: string }> = {
  Compliant: { bg: '#ECFDF3', text: '#22A06B' },
  Deprecated: { bg: '#FEF7E6', text: '#D97706' },
  'Quantum-vulnerable': { bg: '#EEF2FF', text: '#4F46E5' },
  'Exposed secret': { bg: '#FEF3F2', text: '#DC2626' },
};
function TintPill({ value, map }: { value: string; map: Record<string, { bg: string; text: string }> }) {
  const s = map[value] ?? { bg: '#F1F5F9', text: '#64748B' };
  return (
    <span className="inline-block rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
      {value}
    </span>
  );
}



/** How this version's listing can be narrowed: by what it changed, or by what carries a CVE. */
export type ChangeTab = 'All' | 'CVEs';
// CVEs sits second — it is the cut a reviewer makes most often, and it is not a change kind.
const CHANGE_TABS: ChangeTab[] = ['All', 'CVEs'];

interface BomComponentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  endpointId: string;
  hostName: string;
  productKey: string;
  productLabel: string;
  type: BomType;
  version: number;
  format: string;
  /** Opened from a version's CVE metric — lead with the vulnerable components. */
  cveFirst?: boolean;
  /** Which change tab to open on — set by whichever count the user clicked. */
  initialTab?: ChangeTab;
  /** Opened from a component's "Installed on" list: land on the dependency tree, already looking
   *  at that component. The question that got the user here is "why is this on this host", and
   *  the flat list cannot answer it. */
  focusComponent?: string;
  /** Rendered width. A caller that opened this from its own drawer passes a smaller one so the
   *  level underneath stays visible. */
  width?: number;
  /** Names what dismissing this returns to. Set when it is stacked on another drawer. */
}

export function BomComponentsPanel({
  isOpen, onClose, endpointId, hostName, productKey, productLabel, type, version, format,
  cveFirst = false, initialTab = 'All', focusComponent, width,
}: BomComponentsPanelProps) {
  const [tab, setTab] = useState<ChangeTab>(initialTab);
  const { open: openInStack } = useDrawerStack();
  /* Two views of the same BOM. The list says WHAT is installed; the tree says why it is here.
     Only SBOM has a graph — a crypto asset or a model has no manifest to resolve. */
  const [view, setView] = useState<'components' | 'dependencies'>(focusComponent && type === 'SBOM' ? 'dependencies' : 'components');
  const [conditions, setConditions] = useState<Condition[]>([]);
  /* Search is hidden until asked for: on a screen whose first move is almost always a tab,
     a permanently open filter bar spends a row on the second-most-likely action. */
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);


  useEffect(() => { setCurrentPage(1); }, [conditions]);
  // A different BOM type / scope / version means different columns — start clean.
  useEffect(() => {
    if (!isOpen) return;
    setConditions([]); setSearchOpen(false); setCurrentPage(1);
  }, [isOpen, type, productKey, version]);
  // Each opening honours the count that was clicked, so re-opening on a different metric lands
  // on that metric's tab rather than wherever the panel was last left.
  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab); setCurrentPage(1);
    /* Only an SBOM resolves a graph. Landing an AI BOM on 'dependencies' would show a
       view its own tab strip does not even offer. */
    setView(focusComponent && type === 'SBOM' ? 'dependencies' : 'components');
  }, [isOpen, initialTab, version, focusComponent, type]);

  if (!isOpen) return null;

  const graph = bomDependencies(endpointId, productKey);
  const title = type === 'SBOM' ? 'Software components' : type === 'CBOM' ? 'Cryptographic assets' : 'AI components';
  const noun = type === 'SBOM' ? 'components' : type === 'CBOM' ? 'crypto assets' : 'AI components';

  const PROVENANCE_STYLE: Record<string, { bg: string; text: string }> = {
    Verified: { bg: '#ECFDF3', text: '#22A06B' },
    Unverified: { bg: '#FEF3F2', text: '#DC2626' },
    Internal: { bg: '#F1F5F9', text: '#64748B' },
  };
  /* Lifecycle is a phrase, not an enum, so the pill is keyed on what the phrase SAYS: anything
     already past gets the red, anything ahead gets amber, and "Unknown" stays grey rather than
     being coloured as though it were an answer. */
  const lifecycleStyle = (label: string) => (label === 'Unknown'
    ? { bg: '#F1F5F9', text: '#94A3B8' }
    : label.includes('ago') ? { bg: '#FEF3F2', text: '#DC2626' } : { bg: '#FFFAEB', text: '#B45309' });

  // Every row is a field map (drives filtering) plus the cells to render.
  type Cell = string | { pill: string; map: Record<string, { bg: string; text: string }> } | { cves: string[] } | { open: string; onOpen: () => void }
    | { two: [string, string]; tone?: 'LOW' | 'MEDIUM' | 'HIGH' };
  interface Row { id: string; fields: Record<string, string>; cells: Cell[]; mono: number[]; link?: number; cveCount?: number }

  let headers: string[] = [];
  let rows: Row[] = [];


  if (type === 'SBOM') {
    headers = ['Component ID', 'Component', 'Version', 'Vulnerabilities', 'Type', 'Ecosystem', 'PURL', 'License'];
    rows = bomComponents(endpointId, productKey).map((c, i) => {
      /* The same id the Software components list and the component page use. */
      const rec = componentByBuild(c.name, c.version);
      return {
        id: `${c.name}@${c.version}#${i}`,
        fields: { 'Component ID': rec?.id ?? '—', Component: c.name, Version: c.version, Vulnerabilities: c.cves?.length ? 'Yes' : 'No', Type: c.type, Ecosystem: c.ecosystem, PURL: c.purl, License: c.license },
        cells: [rec ? { open: rec.id, onOpen: () => openInStack('software-components', rec.id, `${rec.name} ${rec.version}`, rec) } : '—',
          c.name, c.version, { cves: c.cves ?? [] }, c.type, c.ecosystem, c.purl, c.license],
        mono: [1, 2, 6],
        link: 6,
        cveCount: c.cves?.length ?? 0,
      };
    });
  } else if (type === 'CBOM') {
    // CBOM columns are what CBOMkit-theia reports for a folder scan: the asset, its type
    // (certificate / key / secret / algorithm), the public-key algorithm and KEY size, a
    // certificate's signature algorithm and issuer, where it was found (file:line) and its expiry.
    // No Protocol column — a folder scan reports none (only an OpenSSL config would).
    headers = ['Asset', 'Type', 'Algorithm', 'Key Length', 'Signature', 'Issuer', 'Location', 'Expiry', 'Posture'];
    rows = bomCryptoAssets(endpointId, productKey).map((c, i) => ({
      id: `${c.name}#${i}`,
      fields: {
        Asset: c.name, Type: c.primitive, Algorithm: c.algorithm, 'Key Length': c.keyLength, Signature: c.signature ?? '—',
        Issuer: c.issuer ?? '—', Location: cryptoWhere(c), 'Valid From': c.validFrom ?? '—', Expiry: c.expiry ?? '—', Posture: c.posture,
        ...(c.oid ? { OID: c.oid } : {}),
      },
      cells: [c.name, c.primitive, c.algorithm, c.keyLength, c.signature ?? '—', c.issuer ?? '—', cryptoWhere(c), c.expiry ?? '—', { pill: c.posture, map: POSTURE_STYLE }],
      mono: [2, 3, 4, 6],
    }));
  } else {
    /* The fields AIROM fills in 100% or the majority of cases (see AiComponentDrawer): kind,
       model id (models) / version (packages), provider (for the kinds that carry one), and CVEs /
       AIROM risks. Detection confidence is not shown. No Lifecycle column — AIROM reports it for 6% of
       components; licence and provenance are not reported at all. */
    headers = ['Component ID', 'Component', 'Component type', 'Model ID / Version', 'Provider', 'Vulnerabilities'];
    const aiRows = aiAssets();
    /* Every AI component that counts (AIROM's `scope: excluded` left out) — the same list the tab
       badge and the version card count. Matched to the catalogue by bom-ref, not name: names
       repeat (openai on PyPI and on npm). */
    rows = bomAiInScope(endpointId, productKey).map((m, i) => {
      const a = m.ref ? aiComponentByRef(m.ref) : aiComponentByName(m.name);
      const n = a?.findings?.length ?? 0;
      /* A catalogued component follows the per-kind rule; a row read straight from an ingested
         file keeps what that file carried. */
      const ver = a ? (hasIdentity(a.kind) ? (aiIdentity(a) ?? 'Not reported') : '—') : m.version;
      const prov = a ? (hasProvider(a.kind) ? (a.provider || 'Not reported') : '—') : m.provider;
      /* The same id the AI Components list and the AI component page use. */
      const rec = aiRows.find((x) => (m.ref ? x.ref === m.ref : x.name === m.name)) ?? null;
      return {
        id: `${m.name}#${i}`,
        fields: {
          'Component ID': rec?.id ?? '—', Component: m.name, 'Component type': a ? AI_KIND_TITLE[a.kind] : (m.kind ?? 'model'), 'Model ID / Version': ver, Provider: prov,
          Vulnerabilities: String(n),
        },
        cells: [
          rec ? { open: rec.id, onOpen: () => openInStack('ai-components', rec.id, rec.name, rec) } : '—',
          m.name,
          { two: [a ? AI_KIND_TITLE[a.kind] : KIND_TITLE[(m.kind ?? 'local-model-file') as keyof typeof KIND_TITLE], a?.type ?? ''] },
          ver,
          prov,
          n ? { pill: `${n} finding${n === 1 ? '' : 's'}`, map: { [`${n} finding${n === 1 ? '' : 's'}`]: { bg: '#FEF3F2', text: '#B42318' } } } : '—',
        ],
        mono: [1, 3],
      };
    });
  }

  /* This list shows ONE version, nothing compared: rows are cut to what that version contains, and
     a component the version had but the current BOM no longer does is added back with what the
     version recorded. Changes between versions live in Compare versions. */
  /* The component's NAME column — 'Component' where an id column leads, else the first column. */
  const nameKey = headers.includes('Component') ? 'Component' : headers[0];
  // SBOM and AI BOM rows carry a Version column that pins a component to one build; CBOM does not.
  const verKey = headers.includes('Version') ? 'Version' : undefined;
  const keyOf = (name: string, ver?: string) => `${name}@${verKey ? ver ?? '' : ''}`;
  const inVersion = componentsAtVersion(endpointId, productKey, type, version);
  const wanted = new Set(inVersion.map((c) => keyOf(c.name, c.version)));
  rows = rows.filter((r) => wanted.has(keyOf(String(r.fields[nameKey] ?? ''), verKey ? String(r.fields[verKey] ?? '') : undefined)));
  const have = new Set(rows.map((r) => keyOf(String(r.fields[nameKey] ?? ''), verKey ? String(r.fields[verKey] ?? '') : undefined)));
  inVersion.forEach((c, i) => {
    if (have.has(keyOf(c.name, c.version))) return;
    const rec = type === 'SBOM' ? componentByBuild(c.name, c.version) : null;
    const cells: Cell[] = headers.map((h) => (h === nameKey ? c.name
      : h === 'Component ID' ? (rec ? { open: rec.id, onOpen: () => openInStack('software-components', rec.id, `${rec.name} ${rec.version}`, rec) } : '—')
      : verKey && h === verKey ? c.version : h === 'License' ? c.license ?? '—' : h === 'PURL' ? c.purl ?? '—' : '—'));
    rows.push({
      id: `v${version}:${c.name}#${i}`,
      fields: { ...Object.fromEntries(headers.map((h) => [h, '—'])), [nameKey]: c.name, ...(verKey ? { [verKey]: c.version } : {}), ...(rec ? { 'Component ID': rec.id } : {}) },
      cells,
      mono: [headers.indexOf(nameKey)],
    });
  });

  // Arriving from a version's CVE metric, the vulnerable components lead — most CVEs first.
  if (cveFirst) rows = [...rows].sort((a, b) => (b.cveCount ?? 0) - (a.cveCount ?? 0));

  const fieldNames = (rows.length ? Object.keys(rows[0].fields) : headers).filter((h) => h !== 'Excluded Paths');
  const valuesFor = (field: string) => Array.from(new Set(rows.map((r) => r.fields[field]).filter(Boolean))).sort();

  // Counts come from the unfiltered set, so a tab badge always says how many exist rather than
  // how many survive the current search.
  const inTab = (r: Row, t: ChangeTab) =>
    t === 'All' ? true : (r.cveCount ?? 0) > 0;
  const tabCount = (t: ChangeTab) => rows.filter((r) => inTab(r, t)).length;
  // Only SBOM rows carry vulnerabilities, so the CVEs tab is offered only where it can mean
  // something rather than sitting permanently at zero.
  const shownTabs = CHANGE_TABS.filter((t) => t !== 'CVEs' || rows.some((r) => (r.cveCount ?? 0) > 0));
  /* The version card counts CVEs; this tab counts the COMPONENTS carrying them, because a tab
   * badge has to match the number of rows behind it. One component can carry several, so the two
   * legitimately differ — the tooltip says so rather than leaving it looking like a bug. */
  const totalCves = rows.reduce((n, r) => n + (r.cveCount ?? 0), 0);

  const filtered = rows
    .filter((r) => inTab(r, tab))
    .filter((r) => conditions.every((c) => matches(r.fields[c.field] ?? '', c)));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pageRows = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export acts on the selection when there is one, otherwise on everything filtered.
  /* Everything on the current cut, always — there is nothing to select, so there is no second
     answer to "what would this export?". */
  const exportCount = filtered.length;

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-end bg-black/40">
      {/* `width` lets a caller inset this panel inside the drawer that opened it, so the drawer
          underneath stays visible as the level it came from. Default unchanged. */}
      <div className="flex h-full max-w-[96vw] flex-col bg-white shadow-xl" style={{ width: width ?? 1240 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold text-[#364658]">{productLabel}</h3>
              <p className="mt-0.5 truncate text-[13px] text-[#7B8FA5]">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        {/* Components vs Dependencies — a different QUESTION, not a different filter, so it
            sits above the change tabs rather than beside them.

            Components leads, and matches what the panel opens on: the list is what the title and
            every count in this panel refer to, so the first tab is the thing you were already
            looking at. Dependencies answers "why is this here", which is the follow-up question,
            not the opening one. (This order was the other way round; a tab strip whose first tab
            is not the default view reads as though something has been skipped.)

            Both use the product's content-tab treatment (2px underline, count badge), the same
            one the change tabs below and the Software Components listing use. A segmented pill
            box here made two levels of tab look like two different KINDS of control. */}
        {type === 'SBOM' && (
          <div className="flex items-center gap-2.5 border-b border-[#EEF2F6] px-5">
            {([
              ['components', 'Components', rows.length],
              ['dependencies', 'Dependencies', graph.edges],
            ] as const).map(([id, label, n]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-[14px] font-medium transition-colors ${
                  view === id
                    ? 'border-[#3D8BD0] text-[#3D8BD0]'
                    : 'border-transparent text-[#6b7280] hover:border-[#CBD5E1] hover:bg-[#F5F7FA] hover:text-[#364658]'
                }`}
              >
                {label}
                <span className={`rounded px-1 py-0.5 text-[12px] font-medium tabular-nums ${
                  view === id ? 'bg-[#E8F4FD] text-[#3D8BD0]' : 'bg-[#E5E7EB] text-[#364658]'
                }`}>{n.toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}

        {view === 'dependencies' ? (
          <BomDependencyTree
            key={focusComponent ?? 'all'}
            initialQuery={focusComponent ?? ''}
            graph={graph}
            /* The tree hands off rather than duplicating the list: picking a node returns to
               Components already filtered to it, so there is one place that renders a row. */
            onInspect={(name) => {
              setView('components');
              setTab('All');
              setConditions([{ field: nameKey, op: 'is', value: name }]);
              setCurrentPage(1);
            }}
          />
        ) : (
        <>

        {/* What this version changed. The tab is the first cut a reviewer makes — "show me only
            what came in" — so it sits above the search rather than inside it.

            SECONDARY treatment (bordered pills), not the underline the Components/Dependencies
            row above uses: two levels of tab drawn identically read as one level repeated. */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF2F6] px-5 py-2.5">
          {shownTabs.map((t) => {
            const n = tabCount(t);
            const on = tab === t;
            // CVEs is a risk cut, not a change kind — its badge stays red so it never reads as
            // one more category of edit.
            const risk = t === 'CVEs' && n > 0;
            return (
              <button
                key={t}
                onClick={() => { setTab(t); setCurrentPage(1); }}
                aria-pressed={on}
                title={t === 'CVEs' ? `${n} component${n === 1 ? '' : 's'} carrying ${totalCves} CVE${totalCves === 1 ? '' : 's'}` : undefined}
                className={`inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
                  on
                    ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                    : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
                }`}
              >
                {t === 'CVEs' && <ShieldAlert size={13} className={risk ? 'text-[#DC2626]' : on ? 'text-[#3D8BD0]' : 'text-[#9CA3AF]'} />}
                {t}
                <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                  risk ? 'bg-[#FEF3F2] text-[#DC2626]' : on ? 'bg-[#3D8BD0] text-white' : 'bg-[#EEF2F6] text-[#64748B]'
                }`}>{n}</span>
              </button>
            );
          })}

          {/* Far right of the SAME row: what to take away, and the way to narrow it. */}
          <div className="ml-auto flex flex-shrink-0 items-center gap-2">
            {conditions.length > 0 && (
              <button
                onClick={() => setConditions([])}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-2.5 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]"
              >
                <Filter size={14} className="text-[#7B8FA5]" /> Clear all
              </button>
            )}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-pressed={searchOpen}
              title={searchOpen ? 'Hide search' : 'Search and filter'}
              className={`flex size-8 items-center justify-center rounded border transition-colors ${
                searchOpen || conditions.length > 0
                  ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]'
                  : 'border-[#DFE5ED] bg-white text-[#7B8FA5] hover:bg-[#F5F7FA] hover:text-[#364658]'
              }`}
            ><Search size={16} /></button>
            {/* Export sits with the controls that decide WHAT gets exported — the tab and the
                search — rather than up in the title bar away from both. */}
            <button
              onClick={() => toast.success(`${exportCount} ${noun} exported`)}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {/* Search that builds filters — one control instead of a select per column. Its own
            line, full width, so a long stack of filter chips has room to wrap without squeezing
            the buttons it used to sit beside. */}
        {searchOpen && (
        <div className="flex items-start gap-2 border-b border-[#EEF2F6] px-5 py-3">
          <BomFilterSearch
            fields={fieldNames}
            valuesFor={valuesFor}
            conditions={conditions}
            onChange={(next) => { setConditions(next); setCurrentPage(1); }}
          />
        </div>
        )}

        {/* Grid */}
        <div className="min-h-0 flex-1 overflow-auto px-5">
          {/* SBOM carries a long PURL column, so it needs more room than the other two. */}
          <table className={`w-full ${type === 'SBOM' ? 'min-w-[1320px]' : 'min-w-[1180px]'}`}>
            <thead className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {pageRows.length === 0 ? (
                <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No {noun} match your filters.</td></tr>
              ) : pageRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-[#f9fafb]">
                  {r.cells.map((c, ci) => (
                    <td key={ci} className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">
                      {typeof c === 'string' ? (
                        <span
                          className={`block max-w-[300px] truncate ${r.mono.includes(ci) ? 'font-mono' : ''} ${r.link === ci ? 'text-[#3D8BD0]' : ''}`}
                          title={c}
                        >{c}</span>
                      ) : 'two' in c ? (
                        /* A value over its qualifier: "Framework / ML framework", "MIT / Low".
                           Two columns would have been two half-empty ones. */
                        <span className="block">
                          <span className="block max-w-[220px] truncate text-[12px] text-[#364658]" title={c.two[0]}>{c.two[0]}</span>
                          {c.tone ? (
                            <span
                              className="mt-0.5 inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
                              style={c.tone === 'HIGH'
                                ? { backgroundColor: '#FEF3F2', color: '#B42318' }
                                : c.tone === 'MEDIUM'
                                  ? { backgroundColor: '#FFFAEB', color: '#B54708' }
                                  : { backgroundColor: '#ECFDF3', color: '#22A06B' }}
                            >{c.two[1] === 'LOW' ? 'Low' : c.two[1] === 'MEDIUM' ? 'Medium' : 'High'}</span>
                          ) : (
                            <span className="mt-0.5 block max-w-[220px] truncate text-[11px] text-[#9CA3AF]" title={c.two[1]}>{c.two[1]}</span>
                          )}
                        </span>
                      ) : 'open' in c ? (
                        <button type="button" onClick={c.onOpen}
                          className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]">{c.open}</button>
                      ) : 'cves' in c ? (
                        c.cves.length ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[11px] font-semibold text-[#DC2626]"
                            title={c.cves.join(', ')}
                          >
                            <ShieldAlert size={11} />{c.cves.length} CVE
                          </span>
                        ) : <span className="text-[12px] text-[#9ca3af]">—</span>
                      ) : (
                        <TintPill value={c.pill} map={c.map} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-[#E5E7EB] bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
          />
        </div>
        </>
        )}
      </div>
    </div>
  );
}
