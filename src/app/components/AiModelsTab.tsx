import { useMemo, useRef, useState, useEffect } from 'react';
import { TriangleAlert, ExternalLink, ShieldAlert, Search, X, ChevronDown, Check } from 'lucide-react';
import { useDrawerStack } from './DrawerStack';
import { KpiCard, KPI_NUM, ListActions } from './SoftwareComponentsKpis';
import { aiAssets, aiSummary, pastEol, eolSoon, AI_KIND_TITLE, aiIdentity, hasIdentity, hasProvider } from './aiModelsData';
import { useProductsVersion } from './bomProductsData';
import type { AiAssetRow, AiKind } from './aiModelsData';

/* The AI Components tab of BOM Inventory — the AI BOM read fleet-wide.
 *
 * Columns are the fields AIROM fills in 100% or the majority of cases (measured over aibom.json
 * and this device's scans — see AiComponentDrawer): name, CycloneDX type, kind, model id (models)
 * / version (packages), provider, plus the counts and findings we derive. Detection
 * confidence is not shown (see AiComponentDrawer). There is NO
 * Lifecycle column: AIROM reports lifecycle for 6% of components, so the column read "Not tracked"
 * on almost every row. Retired / deprecated models are still caught by the KPI card above.
 * Licence and provenance are not shown — AIROM does not report them. */
const KIND_LABEL = AI_KIND_TITLE;

export type AiFocus = 'eol' | 'hosted' | 'findings' | null;
const FOCUS_FN: Record<Exclude<AiFocus, null>, (r: AiAssetRow) => boolean> = {
  eol: (r) => pastEol(r) || eolSoon(r),
  hosted: (r) => r.hosted,
  findings: (r) => r.cves.length > 0 || r.risks.length > 0,
};
const FOCUS_LABEL: Record<Exclude<AiFocus, null>, string> = {
  eol: 'Retired or deprecated',
  hosted: 'Sends data to a hosted API',
  findings: 'Has CVEs or risks',
};

const KINDS: AiKind[] = ['hosted-llm', 'embedding-model', 'local-model-file', 'service', 'rag-pipeline', 'prompt',
  'vector-db', 'framework', 'library', 'dataset', 'ai-config', 'infra'];


const SEV_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#FEF3F2', text: '#B42318' }, high: { bg: '#FFF4ED', text: '#C4320A' },
  medium: { bg: '#FFFAEB', text: '#B54708' }, low: { bg: '#F1F5F9', text: '#475467' },
};

export function AiModelsTab({ onOpen }: { onOpen?: (row: AiAssetRow) => void }) {
  /* Rebuilt when BOM scope changes — the register is rolled up from the applications in it. */
  const pv = useProductsVersion();
  const all = useMemo(() => aiAssets(), [pv]);
  const sum = useMemo(() => aiSummary(), [pv]);
  /* AIROM marks what it found in tests, fixtures and vendored code `scope: excluded`. Those are
     not the application's AI usage, so they are never listed or counted. */
  const rows = all.filter((r) => !r.excluded);
  const [focus, setFocus] = useState<AiFocus>(null);
  const [kind, setKind] = useState<AiKind | ''>('');
  const [kindOpen, setKindOpen] = useState(false);
  const [q, setQ] = useState('');
  const kindRef = useRef<HTMLDivElement>(null);
  const { open: openInStack } = useDrawerStack();

  useEffect(() => {
    if (!kindOpen) return;
    const onDown = (e: MouseEvent) => {
      if (kindRef.current && !kindRef.current.contains(e.target as Node)) setKindOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [kindOpen]);

  const focused = focus ? rows.filter(FOCUS_FN[focus]) : rows;
  const byKind = kind ? focused.filter((r) => r.kind === kind) : focused;
  const kindCount = (k: AiKind) => focused.filter((r) => r.kind === k).length;
  const query = q.trim().toLowerCase();
  const shown = !query ? byKind : byKind.filter((r) =>
    [r.id, r.ref, r.name, r.version ?? '', r.modelId ?? '', r.provider, r.kind, KIND_LABEL[r.kind]].some((v) => v.toLowerCase().includes(query)));

  const th = 'whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]';
  const td = 'whitespace-nowrap px-4 py-3 text-[13px] text-[#364658]';


  return (
    <>
      {/* Everything above the table lives in ONE scroll container: the readings scroll away,
          the control row pins to the top of it. Two containers is what made them permanent. */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
      <div className="bg-white px-6 pb-4 pt-4">
        {/* The SAME card the Software Components tab uses — imported, not reproduced. Two copies
            is how the two tabs ended up different heights in the first place. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            icon={<TriangleAlert size={15} />} title="Retired or deprecated"
            info="Hosted models the provider has retired or announced a shutdown for (airom:eol.state) — calls will start failing."
            active={focus === 'eol'} onToggle={() => setFocus(focus === 'eol' ? null : 'eol')}
            cta="Review lifecycle"
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className={`${KPI_NUM} ${sum.pastEol + sum.eolSoon ? 'text-[#B42318]' : 'text-[#364658]'}`}>{sum.pastEol + sum.eolSoon}</span>
            </div>
          </KpiCard>

          <KpiCard
            icon={<ExternalLink size={15} />} title="Hosted model APIs"
            info="Call-sites that send prompts and payloads to a model provider outside the estate."
            active={focus === 'hosted'} onToggle={() => setFocus(focus === 'hosted' ? null : 'hosted')}
            cta="Review egress"
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className={`${KPI_NUM} ${sum.hosted ? 'text-[#B45309]' : 'text-[#364658]'}`}>{sum.hosted}</span>
            </div>
          </KpiCard>

          {/* CVEs (osv.dev) and AIROM-RISK findings — the vulnerabilities[] AIROM reports. */}
          <KpiCard
            icon={<ShieldAlert size={15} />} title="With vulnerabilities"
            info={`Of ${sum.total} components, these carry CVEs (osv.dev) or an AIROM risk found in the artefact itself (unsafe pickle, Keras Lambda, unsafe load).`}
            active={focus === 'findings'} onToggle={() => setFocus(focus === 'findings' ? null : 'findings')}
            cta="Review findings"
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className={`${KPI_NUM} ${sum.vulnerable ? 'text-[#B42318]' : 'text-[#364658]'}`}>{sum.vulnerable}</span>
            </div>
          </KpiCard>
        </div>
      </div>

      {/* One control row, the same shape Software Components uses — and the one thing that
          stays on screen: you filter at any depth in a list. */}
      <div className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-[#E5E7EB] bg-white px-6 pb-3 pt-2">
        {/* A card's filter rides INSIDE the search box, the same as the register's — both are
            ways of narrowing this list, so they read as one control. */}
        <div className="relative flex flex-1 items-center gap-2 rounded border border-[#d1d5db] bg-white pl-2 pr-10 focus-within:border-[#3D8BD0] focus-within:ring-1 focus-within:ring-[#3D8BD0]">
          {focus && (
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-[#EBF5FF] px-2 py-0.5 text-[13px] text-[#3D8BD0]">
              {FOCUS_LABEL[focus]}
              <button onClick={() => setFocus(null)} aria-label={`Clear the ${FOCUS_LABEL[focus]} filter`}
                      className="text-[#3D8BD0]/70 transition-colors hover:text-[#DC2626]"><X size={13} /></button>
            </span>
          )}
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={focus ? 'Search within this…' : 'Search ID, bom-ref, name, model ID, version, provider or kind...'}
            className="h-[34px] min-w-0 flex-1 bg-transparent text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:outline-none"
          />
          {q ? (
            <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          )}
        </div>
        <div className="relative flex-shrink-0" ref={kindRef}>
          <button
            onClick={() => setKindOpen((v) => !v)}
            className={`inline-flex h-[34px] items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
              kind ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
            }`}
          >
            {kind ? KIND_LABEL[kind] : 'All component types'}
            <ChevronDown size={14} className={`transition-transform ${kindOpen ? 'rotate-180' : ''} ${kind ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
          </button>
          {kindOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setKindOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-[260px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Component type</div>
                <div className="max-h-[300px] overflow-y-auto">
                {(['' as const] as (AiKind | '')[]).concat(KINDS).map((o) => (
                  <button
                    key={o || 'any'}
                    onClick={() => { setKind(o); setKindOpen(false); }}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] transition-colors ${
                      kind === o ? 'bg-[#F1F5F9] text-[#364658]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <span className="truncate">{o ? KIND_LABEL[o] : 'All component types'}</span>
                    <span className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-[12px] text-[#7B8FA5]">{o ? kindCount(o) : focused.length}</span>
                      {kind === o && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
                    </span>
                  </button>
                ))}
                </div>
              </div>
            </>
          )}
        </div>
        <ListActions />
      </div>

        <table className="w-full min-w-[1280px]">
          <thead className="border-b border-[#e5e7eb]">
            <tr className="bg-white">
              {['ID', 'Component', 'Component Type', 'Model ID / Version', 'Provider', 'Applications', 'Endpoints', 'Vulnerabilities'].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {shown.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No assets match your filters.</td></tr>
            ) : shown.map((r) => {
              const n = r.cves.length + r.risks.length;
              return (
                <tr
                  key={r.id}
                  onClick={() => (onOpen ? onOpen(r) : openInStack('ai-components', r.id, r.name, r))}
                  className="cursor-pointer transition-colors hover:bg-[#f9fafb]"
                >
                  <td className={td}>
                    <span className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{r.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-[13px] font-semibold text-[#364658]">{r.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-[#9CA3AF]">
                      {r.type}
                      {r.purl && !r.purl.startsWith('pkg:generic/') && <span className="truncate">· {r.purl.replace(/@.*$/, '')}</span>}
                    </div>
                  </td>
                  <td className={`${td} text-[12px] text-[#64748B]`}>{KIND_LABEL[r.kind]}</td>
                  <td className={`${td} font-mono text-[12px]`}>{hasIdentity(r.kind) ? (aiIdentity(r) ?? <span className="font-sans text-[#9CA3AF]">Not reported</span>) : <span className="text-[#9CA3AF]">—</span>}</td>
                  <td className={td}>{hasProvider(r.kind) ? (r.provider || <span className="text-[#9CA3AF]">Not reported</span>) : <span className="text-[#9CA3AF]">—</span>}</td>
                  <td className={`${td} tabular-nums`}>{r.apps}</td>
                  <td className={`${td} tabular-nums`}>{r.endpoints}</td>
                  <td className={td}>
                    {n === 0 ? <span className="text-[#9CA3AF]">—</span> : (
                      <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[12px] font-medium"
                        style={{ backgroundColor: SEV_STYLE[r.worst!].bg, color: SEV_STYLE[r.worst!].text }}>
                        {n} · {r.worst}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
