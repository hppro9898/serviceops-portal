import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { bomDocument } from './bomData';
import type { BomType } from './bomData';

/* Side-by-side diff of the two CycloneDX documents — the literal artefact a download produces,
 * compared line by line the way a config diff is.
 *
 * The active comparison tab spotlights its own change kind: matching rows keep full colour, the
 * rest fade back. The ˄ ˅ pair steps through the spotlighted rows. */

export type DiffKind = 'same' | 'modified' | 'inserted' | 'deleted';

interface Row {
  kind: DiffKind;
  left?: { n: number; text: string };
  right?: { n: number; text: string };
}

const KIND_STYLE: Record<Exclude<DiffKind, 'same'>, { bg: string; bar: string; label: string; swatch: string }> = {
  modified: { bg: '#FEF7E6', bar: '#F59E0B', label: 'Modified', swatch: '#F59E0B' },
  inserted: { bg: '#ECFDF3', bar: '#22C55E', label: 'Inserted', swatch: '#22C55E' },
  deleted: { bg: '#FEF3F2', bar: '#EF4444', label: 'Deleted', swatch: '#EF4444' },
};

/** Longest-common-subsequence line diff, then adjacent delete/insert runs are paired into
 *  "modified" rows so a changed line reads as one change rather than two.
 *  Exported because it is the ONLY thing that knows which line kinds a comparison contains — a
 *  checker that re-implemented it would be testing its own copy, not this one. */
export function diffLines(a: string[], b: string[]): Row[] {
  const n = a.length, m = b.length;
  // Int32Array keeps the table cheap at document scale (~1.5k x 1.5k lines).
  const lcs = new Int32Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[at(i, j)] = a[i] === b[j] ? lcs[at(i + 1, j + 1)] + 1 : Math.max(lcs[at(i + 1, j)], lcs[at(i, j + 1)]);
    }
  }

  const raw: Row[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      raw.push({ kind: 'same', left: { n: i + 1, text: a[i] }, right: { n: j + 1, text: b[j] } });
      i++; j++;
    } else if (lcs[at(i + 1, j)] >= lcs[at(i, j + 1)]) {
      raw.push({ kind: 'deleted', left: { n: i + 1, text: a[i] } });
      i++;
    } else {
      raw.push({ kind: 'inserted', right: { n: j + 1, text: b[j] } });
      j++;
    }
  }
  while (i < n) { raw.push({ kind: 'deleted', left: { n: i + 1, text: a[i] } }); i++; }
  while (j < m) { raw.push({ kind: 'inserted', right: { n: j + 1, text: b[j] } }); j++; }

  // Pair a run of deletions with the insertions that immediately follow — those are edits.
  const out: Row[] = [];
  for (let k = 0; k < raw.length; k++) {
    if (raw[k].kind !== 'deleted') { out.push(raw[k]); continue; }
    let d = k; while (d < raw.length && raw[d].kind === 'deleted') d++;
    let ins = d; while (ins < raw.length && raw[ins].kind === 'inserted') ins++;
    const dels = raw.slice(k, d), adds = raw.slice(d, ins);
    const paired = Math.min(dels.length, adds.length);
    for (let p = 0; p < paired; p++) out.push({ kind: 'modified', left: dels[p].left, right: adds[p].right });
    for (let p = paired; p < dels.length; p++) out.push(dels[p]);
    for (let p = paired; p < adds.length; p++) out.push(adds[p]);
    k = ins - 1;
  }
  return out;
}

interface BomDiffViewProps {
  endpointId: string;
  productKey: string;
  type: BomType;
  older: number;
  newer: number;
  /** Active comparison tab — spotlights the matching change kind. */
  spotlight: DiffKind | null;
}

export function BomDiffView({ endpointId, productKey, type, older, newer, spotlight }: BomDiffViewProps) {
  const [leftQ, setLeftQ] = useState('');
  const [rightQ, setRightQ] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const a = bomDocument(endpointId, productKey, type, older).split('\n');
    const b = bomDocument(endpointId, productKey, type, newer).split('\n');
    return diffLines(a, b);
  }, [endpointId, productKey, type, older, newer]);

  const counts = useMemo(() => {
    const c = { modified: 0, inserted: 0, deleted: 0, same: 0 };
    rows.forEach((r) => { c[r.kind] += 1; });
    return c;
  }, [rows]);

  /* Which change kind the view is showing. Seeded from the active comparison tab, then owned by
   * the select below — the two entry points agree, and changing it here does not fight the tab. */
  const [kind, setKind] = useState<DiffKind | 'all'>(spotlight ?? 'all');
  useEffect(() => { setKind(spotlight ?? 'all'); }, [spotlight]);

  /* Only the kinds this comparison actually contains are offered — a "Deleted 0" swatch and its
     matching option are filters that can only ever empty the document. Changing versions can
     retire the selected one, so the ACTIVE kind is derived rather than trusted. */
  const liveKinds = (['modified', 'inserted', 'deleted'] as const).filter((k) => counts[k] > 0);
  const activeKind: DiffKind | 'all' =
    kind === 'all' || kind === 'same' || counts[kind as Exclude<DiffKind, 'same'>] > 0 ? kind : 'all';

  /* Picking a kind FILTERS the document to those lines rather than only tinting them, so the
   * changes come to the top instead of being hunted for between hundreds of identical lines.
   * Line numbers ride along, so a filtered row still says where it sits in the real document. */
  const shown = useMemo(
    () => (activeKind === 'all' ? rows : rows.filter((r) => r.kind === activeKind)),
    [rows, activeKind],
  );

  const lq = leftQ.trim().toLowerCase();
  const rq = rightQ.trim().toLowerCase();
  const hit = (text: string | undefined, q: string) => !!q && !!text && text.toLowerCase().includes(q);

  const Pane = ({ side }: { side: 'left' | 'right' }) => (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-3 py-2">
        <span className="text-[13px] font-medium text-[#364658]">v{side === 'left' ? older : newer}</span>
        <span className="text-[12px] text-[#7B8FA5]">CycloneDX 1.6</span>
        <div className="relative ml-auto w-[180px]">
          <input
            type="text"
            value={side === 'left' ? leftQ : rightQ}
            onChange={(e) => (side === 'left' ? setLeftQ : setRightQ)(e.target.value)}
            placeholder="Search"
            className="h-7 w-full rounded border border-[#d1d5db] bg-white pl-2.5 pr-7 text-[12px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {(side === 'left' ? leftQ : rightQ) ? (
            <button
              onClick={() => (side === 'left' ? setLeftQ : setRightQ)('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"
            ><X size={13} /></button>
          ) : (
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={13} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Kind selector + counts. The select is the control; the swatches read as its legend. */}
      <div className="flex items-center gap-4 px-5 py-2.5">
        <div className="relative">
          <select
            value={activeKind}
            onChange={(e) => setKind(e.target.value as DiffKind | 'all')}
            className="app-select h-8 rounded border border-[#DFE5ED] bg-white pl-2.5 pr-8 text-[13px] font-medium text-[#364658] focus:border-[#3D8BD0] focus:outline-none"
          >
            <option value="all">All lines ({rows.length})</option>
            {liveKinds.includes('inserted') && <option value="inserted">Inserted ({counts.inserted})</option>}
            {liveKinds.includes('modified') && <option value="modified">Modified ({counts.modified})</option>}
            {liveKinds.includes('deleted') && <option value="deleted">Removed ({counts.deleted})</option>}
          </select>
        </div>
        {liveKinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(activeKind === k ? 'all' : k)}
            className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors ${
              activeKind === k ? 'bg-[#F1F5F9]' : 'hover:bg-[#F9FAFB]'
            }`}
          >
            <span className="size-2 rounded-sm" style={{ backgroundColor: KIND_STYLE[k].swatch }} />
            <span className="text-[12px] text-[#7B8FA5]">{KIND_STYLE[k].label}</span>
            <span className="text-[12px] font-semibold text-[#364658]">{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Pane headers */}
      <div className="mx-5 flex overflow-hidden rounded-t-lg border border-b-0 border-[#E5E7EB] bg-[#F9FAFB]">
        <Pane side="left" />
        <div className="w-px bg-[#E5E7EB]" />
        <Pane side="right" />
      </div>

      {/* Aligned rows — one scroller, so the two sides can never drift apart */}
      <div
        ref={scrollRef}
        className="mx-5 mb-4 min-h-0 flex-1 overflow-auto rounded-b-lg border border-[#E5E7EB] bg-white"
      >
        {!shown.length && (
          <div className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]">
            No {activeKind === 'all' ? '' : `${KIND_STYLE[activeKind as Exclude<DiffKind, 'same'>].label.toLowerCase()} `}lines between v{older} and v{newer}.
          </div>
        )}
        {shown.map((r, i) => {
          const style = r.kind === 'same' ? null : KIND_STYLE[r.kind];
          return (
            <div key={i} className="flex font-mono text-[12px] leading-[1.6]">
              <Half cell={r.left} bg={r.kind === 'inserted' ? '#FAFBFC' : style?.bg} bar={r.kind === 'inserted' ? undefined : style?.bar} q={lq} hit={hit(r.left?.text, lq)} />
              <div className="w-px flex-shrink-0 bg-[#E5E7EB]" />
              <Half cell={r.right} bg={r.kind === 'deleted' ? '#FAFBFC' : style?.bg} bar={r.kind === 'deleted' ? undefined : style?.bar} q={rq} hit={hit(r.right?.text, rq)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** One side of a row: gutter number + the line. An absent cell renders as empty gutter space so
 *  both columns stay aligned. */
function Half({ cell, bg, bar, hit }: { cell?: { n: number; text: string }; bg?: string; bar?: string; q: string; hit: boolean }) {
  return (
    <div className="flex min-w-0 flex-1" style={{ backgroundColor: hit ? '#FEF9C3' : bg }}>
      <span className="w-[52px] flex-shrink-0 select-none border-r border-[#F0F2F5] px-2 text-right text-[11px] text-[#9CA3AF]">
        {cell?.n ?? ''}
      </span>
      {bar && <span className="w-[2px] flex-shrink-0" style={{ backgroundColor: bar }} />}
      <span className="min-w-0 flex-1 whitespace-pre px-2 text-[#364658]">{cell?.text ?? ''}</span>
    </div>
  );
}
