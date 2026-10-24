import { useEffect, useRef, useState } from 'react';
import { X, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { BomType } from './bomData';
import { bomVersions, inventorySignature, rowsSignature } from './bomData';
import { ingestIntoProduct, productBomTypes, productKey } from './bomProductsData';
import type { ProductRecord } from './bomProductsData';
import { FormSection } from './BomProductFormParts';
import { IngestSlotRow } from './BomAddProductPanel';
import { INGEST_SLOTS, readBomFile, validateFor, unitOf } from './bomIngestFile';
import type { SlotState } from './bomIngestFile';

/* Ingest BOM — into an application that ALREADY exists (UI review follow-up).
 *
 * An ingested application is not frozen at the files it was added with. From its detail page this
 * drawer takes, per BOM type:
 *   · a NEW VERSION of a type it already has  → appended as v(n+1), diffed against v(n);
 *   · the FIRST file of a type it lacks        → e.g. the CBOM / AI BOM that arrived after the SBOM.
 * The three slots, the in-browser parsing, the type detection, Move to, the version and size checks
 * are the SAME as the Add drawer's (bomIngestFile) — one set of rules for every upload. One extra
 * rule here: a file whose components are identical to the current version is refused, because a
 * new version that changes nothing is noise in the history. One licence still covers the
 * application, so nothing here touches the licence count. */

const EMPTY: Record<BomType, SlotState> = { SBOM: { status: 'empty' }, CBOM: { status: 'empty' }, 'AI BOM': { status: 'empty' } };
const plural = (n: number) => (n === 1 ? '' : 's');

export function BomIngestMorePanel({ app, focusType, onClose, onIngested }: {
  app: ProductRecord;
  /** The slot to ring — the tab the drawer was opened from. */
  focusType?: BomType | null;
  onClose: () => void;
  /** After a successful ingest, with the first type that landed — the page opens its tab. */
  onIngested: (first: BomType) => void;
}) {
  const [slots, setSlots] = useState<Record<BomType, SlotState>>(EMPTY);
  const [dragSlot, setDragSlot] = useState<BomType | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickFor = useRef<BomType | null>(null);
  const readToken = useRef<Record<BomType, number>>({ SBOM: 0, CBOM: 0, 'AI BOM': 0 });
  useEffect(() => { setSlots(EMPTY); }, [app.id]);

  const key = productKey(app);
  const has = productBomTypes(app);
  const current = (t: BomType) => (has.includes(t) ? bomVersions(app.id, key, t)[0] : undefined);

  /* Same judgement as the Add drawer, plus: not identical to the current version. */
  const judge = (t: BomType, st: SlotState): SlotState => {
    if (st.status !== 'ok' || !has.includes(t) || !st.rows?.length) return st;
    if (rowsSignature(t, st.rows) === inventorySignature(app.id, key, t)) {
      return { status: 'error', file: st.file, message: `Same ${unitOf(t, 2)} as the current v${current(t)?.v} — there is nothing new to ingest.` };
    }
    return st;
  };
  const setSlot = (t: BomType, s: SlotState) => setSlots((cur) => ({ ...cur, [t]: s }));
  const takeFile = async (t: BomType, file: File | undefined) => {
    if (!file) return;
    const token = ++readToken.current[t];
    setSlot(t, { status: 'reading', file: file.name });
    const next = judge(t, await readBomFile(t, file));
    if (readToken.current[t] === token) setSlot(t, next);
  };
  const removeSlot = (t: BomType) => { readToken.current[t]++; setSlot(t, { status: 'empty' }); };
  const pick = (t: BomType) => { pickFor.current = t; fileRef.current?.click(); };
  const moveSlot = (from: BomType) => {
    const src = slots[from];
    if (src.status !== 'error' || !src.result) return;
    const to = src.result.kind;
    readToken.current[from]++; readToken.current[to]++;
    setSlots((cur) => ({ ...cur, [from]: { status: 'empty' }, [to]: judge(to, validateFor(to, src.result!, src.file)) }));
  };

  const ok = INGEST_SLOTS.filter((s) => slots[s.type].status === 'ok').map((s) => s.type);
  const bad = INGEST_SLOTS.filter((s) => slots[s.type].status === 'error').length;
  const reading = INGEST_SLOTS.some((s) => slots[s.type].status === 'reading');
  /* "SBOM → v4 · CBOM → v1": say what each file will become before it is ingested. */
  const plan = ok.map((t) => `${t} → v${(current(t)?.v ?? 0) + 1}`).join(' · ');
  const status = reading ? { text: 'Reading file…', tone: 'muted' }
    : bad ? { text: `Fix or remove ${bad} file${plural(bad)} with a problem`, tone: 'bad' }
    : !ok.length ? { text: 'Add at least one BOM', tone: 'muted' }
    : { text: `${ok.length} BOM${plural(ok.length)} ready · ${plan}`, tone: 'ready' };
  const ready = status.tone === 'ready';

  const submit = () => {
    if (!ready) return;
    const uploads = Object.fromEntries(ok.map((t) => {
      const st = slots[t] as Extract<SlotState, { status: 'ok' }>;
      return [t, { file: st.file, format: st.format, count: st.count, rows: st.rows, tool: st.tool }];
    })) as Parameters<typeof ingestIntoProduct>[1];
    const landed = ingestIntoProduct(app.id, uploads);
    toast.success(`Ingested ${ok.map((t) => `${t} v${landed[t]}`).join(', ')} for ${app.name}`);
    onIngested(ok[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/50" onClick={onClose}>
      <div className="flex h-full w-[640px] max-w-[96vw] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="flex min-w-0 items-center gap-2 text-[16px] font-semibold text-[#364658]">
            <span className="text-[#3D8BD0]"><Upload size={18} /></span><span className="truncate">Ingest BOM</span>
          </h3>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {/* Which application — read-only: this drawer adds to it, it does not edit it. */}
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5">
            <span className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{app.id}</span>
            <span className="truncate text-[13px] font-semibold text-[#364658]">{app.name}</span>
            {app.version !== '—' && <span className="font-mono text-[12px] text-[#7B8FA5]">{app.version}</span>}
            <span className="ml-auto text-[12px] text-[#7B8FA5]">{app.publisher}</span>
          </div>

          <FormSection title="Bills of materials" aside="At least one">
            <div className="space-y-3">
              {INGEST_SLOTS.map((s) => {
                const cur = current(s.type);
                return (
                  <div key={s.type}>
                    <p className="mb-1.5 text-[12px]">
                      {cur
                        ? <span className="rounded-sm bg-[#ECFDF3] px-1.5 py-px text-[11px] font-semibold text-[#22A06B]">Current v{cur.v}</span>
                        : <span className="rounded-sm bg-[#F1F5F9] px-1.5 py-px text-[11px] font-semibold text-[#475467]">Not ingested</span>}
                    </p>
                    <IngestSlotRow type={s.type} what={s.what} fmt={s.fmt} st={slots[s.type]}
                      pickLabel={cur ? 'Upload new version' : `Add ${s.type}`}
                      highlight={focusType === s.type}
                      canMoveTo={(t) => slots[t].status !== 'ok'}
                      drag={dragSlot === s.type} locked={false}
                      onDrag={(on) => setDragSlot(on ? s.type : null)}
                      onDrop={(file) => { setDragSlot(null); takeFile(s.type, file); }}
                      onPick={() => pick(s.type)} onRemove={() => removeSlot(s.type)} onMove={() => moveSlot(s.type)} />
                  </div>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept=".json,.xml,.spdx,.cdx,application/json,text/xml" className="hidden"
              onChange={(e) => { const t = pickFor.current; if (t) takeFile(t, e.target.files?.[0]); e.target.value = ''; }} />
          </FormSection>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#DFE5ED] px-5 py-3">
          <span aria-live="polite" className="min-w-0 truncate text-[12px] font-medium text-[#DC2626]">{status.tone === 'bad' ? status.text : ''}</span>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
            <button onClick={submit} disabled={!ready}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8] disabled:cursor-not-allowed disabled:bg-[#A9C6E3]">
              <Check size={15} /> {ok.length ? `Ingest ${ok.length} BOM${plural(ok.length)}` : 'Ingest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
