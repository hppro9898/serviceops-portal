import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Check, Upload, Server, AppWindow, Package, ShieldCheck, Bot, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { addProduct, updateProduct, bomAgents, isRootPath, seatsLeft, osFamilyOf } from './bomProductsData';
import type { BomAgent, ProductRecord, ProductSource } from './bomProductsData';
import type { BomType } from './bomData';
import {
  EndpointField, PATH_RULE, Field, FormSection, INPUT, INPUT_ERR, Req, LicenceStrip,
  ApplicationServiceField, ManufacturerField, emptyAppService, resolveAppService, appServiceError,
} from './BomProductFormParts';
import type { AppServiceValue } from './BomProductFormParts';
import { INGEST_SLOTS, readBomFile, validateFor, unitOf } from './bomIngestFile';
import type { SlotState } from './bomIngestFile';

/* Add Application — the one way into BOM scope, with two flows.
 *
 *   Endpoint  the agent scans one path on one endpoint. Endpoint + path are MANDATORY.
 *   Ingest    someone uploads BOM files. There is no endpoint — the BOM is the document.
 *
 * Both start with the same question: which application is this BOM for? One field answers it —
 * type a name, or Browse the CMDB's Application Services (picking one fills the name and links it),
 * or create a new one there (added to the CMDB on save).
 *
 * Ingest (UI review, Oct 2026): three labelled slots — SBOM, CBOM, AI BOM — each read in the
 * browser, so the user sees the format and item count before anything is ingested, and a file
 * dropped in the wrong slot is caught and offered a one-click Move. One licence covers all three.
 * Success is shown INSIDE the drawer (the licence strip moves with it) instead of closing it. */

/* Edit reuses this form, filled in. Only the application name, version and manufacturer can change.
   The CMDB link, BOM source, endpoint, scan path and ingested files are shown read-only — the BOM's
   history belongs to them, so a different one is a new entry. */

export const SLOT_ICON: Record<BomType, React.ReactNode> = {
  SBOM: <Package size={18} />,
  CBOM: <ShieldCheck size={18} />,
  'AI BOM': <Bot size={18} />,
};
const blankSlots = (): Record<BomType, SlotState> => ({ SBOM: { status: 'empty' }, CBOM: { status: 'empty' }, 'AI BOM': { status: 'empty' } });
const plural = (n: number) => (n === 1 ? '' : 's');
const LINK = 'text-[12px] font-medium text-[#3D8BD0] hover:underline';

export function BomAddProductPanel({ isOpen, initialMode, editing = null, onClose, onAdded, onSaved }: {
  isOpen: boolean;
  initialMode: ProductSource;
  editing?: ProductRecord | null;
  onClose: () => void;
  onAdded: (p: ProductRecord) => void;
  onSaved?: (p: ProductRecord) => void;
}) {
  const [mode, setMode] = useState<ProductSource>(initialMode);
  const [service, setService] = useState<AppServiceValue>(emptyAppService);
  const [version, setVersion] = useState('');
  const [publisher, setPublisher] = useState('');
  const [agent, setAgent] = useState<BomAgent | null>(null);
  const [path, setPath] = useState('');
  const [slots, setSlots] = useState<Record<BomType, SlotState>>(blankSlots);
  const [dragSlot, setDragSlot] = useState<BomType | null>(null);
  const [touched, setTouched] = useState(false);
  /** The ingest that just succeeded — the drawer shows it until Close or Ingest another. */
  const [done, setDone] = useState<{ rec: ProductRecord; n: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickFor = useRef<BomType | null>(null);
  /* A slot's read is async: replacing or removing the file mid-read must win over the stale result. */
  const readToken = useRef<Record<BomType, number>>({ SBOM: 0, CBOM: 0, 'AI BOM': 0 });

  const reset = () => {
    setSlots(blankSlots()); setTouched(false); setDone(null);
    setService(emptyAppService()); setVersion(''); setPublisher(''); setAgent(null); setPath('');
  };

  useEffect(() => {
    if (!isOpen) return;
    setSlots(blankSlots()); setTouched(false); setDone(null);
    if (editing) {
      setMode(editing.source);
      setService({ name: editing.name, existing: editing.linkedCi, draft: null });
      setVersion(editing.version === '—' ? '' : editing.version); setPublisher(editing.publisher);
      setAgent(editing.agent); setPath(editing.scanPath ?? '');
      return;
    }
    setMode(initialMode); reset();
  }, [isOpen, initialMode, editing]);

  const agents = useMemo(() => bomAgents(), []);
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (done) doneRef.current?.focus(); }, [done]);

  if (!isOpen) return null;

  const isAgent = mode === 'Agent';
  const isEdit = !!editing;
  const locked = !!done;
  /* Editing does not take a new licence — the entry already holds one. */
  const noSeat = !isEdit && !done && seatsLeft() <= 0;
  /* The scan path is written in the endpoint's own path syntax. */
  const family = agent ? osFamilyOf(agent.os) : null;
  const rule = family ? PATH_RULE[family] : null;
  const root = isAgent && isRootPath(path);

  const states = INGEST_SLOTS.map((s) => slots[s.type]);
  const nOk = states.filter((s) => s.status === 'ok').length;
  const nBad = states.filter((s) => s.status === 'error').length;
  const nReading = states.filter((s) => s.status === 'reading').length;

  const errs = {
    name: appServiceError(service),
    publisher: !publisher.trim() ? 'Select a manufacturer.' : '',
    agent: isAgent && !agent ? 'Select an endpoint.' : '',
    path: !isAgent || !agent ? '' : !path.trim() ? 'Enter a scan path.'
      : rule && !rule.ok(path.trim()) ? `Enter a ${family} path, e.g. ${rule.example}`
      /* No full-machine scans: a BOM describes one application, so the path must be its folder. */
      : root ? `Enter the application folder, not the root, e.g. ${rule!.example}` : '',
  };

  /* Readiness, checked in order: name → manufacturer → reading → problems → at least one BOM. Not
     shown as text — it only decides whether the submit goes through. */
  let status: { text: string; tone: '' | 'ready' | 'bad' };
  if (noSeat) status = { text: 'No licence available', tone: 'bad' };
  else if (done) status = { text: 'Done', tone: 'ready' };
  else if (!service.name.trim()) status = { text: 'Add an application name', tone: '' };
  else if (!publisher.trim()) status = { text: 'Select a manufacturer', tone: '' };
  else if (isAgent) {
    const miss = isEdit ? '' : errs.agent || errs.path;
    status = miss ? { text: miss, tone: '' } : { text: isEdit ? 'Ready to save' : 'Ready · the first scan is queued on save', tone: 'ready' };
  } else if (isEdit) status = { text: 'Ready to save', tone: 'ready' };
  else if (nReading) status = { text: 'Reading file…', tone: '' };
  else if (nBad) status = { text: `Fix or remove ${nBad} file${plural(nBad)} with a problem`, tone: 'bad' };
  else if (!nOk) status = { text: 'Add at least one BOM', tone: '' };
  else status = { text: `${nOk} BOM${plural(nOk)} ready`, tone: 'ready' };
  const ready = status.tone === 'ready' && !done;

  /* ---- slots ---- */
  const setSlot = (t: BomType, s: SlotState) => setSlots((cur) => ({ ...cur, [t]: s }));
  const takeFile = async (t: BomType, file: File | undefined) => {
    if (!file || locked) return;
    const token = ++readToken.current[t];
    setSlot(t, { status: 'reading', file: file.name });
    const next = await readBomFile(t, file);
    if (readToken.current[t] === token) setSlot(t, next);
  };
  const removeSlot = (t: BomType) => { readToken.current[t]++; setSlot(t, { status: 'empty' }); };
  const pick = (t: BomType) => { pickFor.current = t; fileRef.current?.click(); };
  /* Move re-judges the SAME parsed result against the slot it belongs in (its version check still
     applies there) and empties the slot it came from. */
  const moveSlot = (from: BomType) => {
    const src = slots[from];
    if (src.status !== 'error' || !src.result) return;
    const to = src.result.kind;
    readToken.current[from]++; readToken.current[to]++;
    setSlots((cur) => ({ ...cur, [from]: { status: 'empty' }, [to]: validateFor(to, src.result!, src.file) }));
  };

  const submit = () => {
    setTouched(true);
    if (!ready || noSeat) return;
    if (editing) {
      /* The store stamps Last Updated and writes the audit trail — only when something changed. */
      updateProduct(editing.id, {
        name: service.name.trim(),
        version: version.trim() || '—',
        publisher: publisher.trim(),
        manufacturer: publisher.trim(),
        /* Read-only in Edit — written back unchanged. */
        scanPath: editing.scanPath,
        /* The CMDB link is managed here and only here: pick, create or unlink in the Application field. */
        linkedCi: resolveAppService(service),
      });
      onSaved?.({ ...editing, name: service.name.trim() });
      return;
    }
    const ingested: ProductRecord['ingested'] = {};
    for (const s of INGEST_SLOTS) {
      const st = slots[s.type];
      if (st.status === 'ok') ingested[s.type] = { file: st.file, format: st.format, count: st.count, rows: st.rows, tool: st.tool };
    }
    /* sbomFile / sbomFormat stay the record's primary document: the SBOM when there is one,
       otherwise the first BOM that was ingested. */
    const primary = ingested.SBOM ?? ingested.CBOM ?? ingested['AI BOM'];
    const rec = addProduct({
      name: service.name.trim(),
      version: version.trim() || '—',
      publisher: publisher.trim(),
      /* One Manufacturer field; the record's publisher carries the same value. */
      manufacturer: publisher.trim(),
      source: mode,
      agent: isAgent ? agent : null,
      scanPath: isAgent ? path.trim() : null,
      sbomFile: isAgent ? null : primary!.file,
      sbomFormat: isAgent ? null : primary!.format,
      ingested: isAgent ? undefined : ingested,
      linkedCi: resolveAppService(service),
    });
    if (!rec) return;
    if (isAgent) { onAdded(rec); return; }
    setDone({ rec, n: nOk });
    onAdded(rec);
  };

  const headIcon = isAgent ? <Server size={17} /> : <AppWindow size={17} />;
  const title = isEdit ? `Edit Application · ${editing!.id}` : isAgent ? 'Add Application · Endpoint' : 'Add Application · Ingest';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/50" onClick={onClose}>
      <div className="flex h-full w-[640px] max-w-[96vw] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Title only — the flow was chosen in the Add menu, so the title says which one this is. */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="flex min-w-0 items-center gap-2 text-[16px] font-semibold text-[#364658]">
            <span className="text-[#3D8BD0]">{headIcon}</span><span className="truncate">{title}</span>
          </h3>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]" title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {done && (
            <div tabIndex={-1} ref={doneRef} className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#A6E9C5] bg-[#ECFDF3] px-3.5 py-3 outline-none">
              <CheckCircle2 size={17} className="mt-px flex-shrink-0 text-[#22A06B]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#14532D]">Ingested {done.n} BOM{plural(done.n)} for {done.rec.name}.</p>
                <p className="mt-0.5 text-[12px] text-[#3F6B52]">Listed under BOM Inventory as <span className="font-mono">{done.rec.id}</span>.</p>
              </div>
              <button type="button" onClick={reset} className={`flex-shrink-0 ${LINK}`}>Ingest another</button>
            </div>
          )}

          {!isEdit && <div className="mb-5"><LicenceStrip /></div>}

          <FormSection title="Application">
            <ApplicationServiceField value={service} onChange={setService} touched={touched} autoFocus disabled={locked} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Version">
                <input value={version} onChange={(e) => setVersion(e.target.value)} disabled={locked} placeholder="e.g. 9.2.1"
                  className={`${INPUT} disabled:cursor-not-allowed disabled:bg-[#F5F7FA]`} />
              </Field>
              <ManufacturerField value={publisher} onChange={setPublisher} disabled={locked} error={touched && errs.publisher} />
            </div>
          </FormSection>

          {isAgent ? (
            <FormSection title="Endpoint">
              <Field label={<>Endpoint <Req /></>} error={touched && errs.agent}>
                <EndpointField value={agent} onChange={setAgent} pool={agents} invalid={touched && !!errs.agent} locked={isEdit} />
              </Field>
              <Field
                label={<>Scan path <Req /></>}
                error={!isEdit && (touched || root || (!!path.trim() && !!rule && !rule.ok(path.trim()))) && errs.path}>
                <input value={path} onChange={(e) => setPath(e.target.value)} disabled={!agent || isEdit}
                  placeholder={rule ? `e.g. ${rule.example}` : 'Select an endpoint first'}
                  className={`${INPUT} font-mono disabled:cursor-not-allowed disabled:bg-[#F5F7FA] ${errs.path && (touched || root || (!!path.trim() && rule && !rule.ok(path.trim()))) ? INPUT_ERR : ''}`} />
              </Field>
            </FormSection>
          ) : isEdit ? (
            /* The ingested files are the BOM's history — read-only here. */
            <FormSection title="Bills of materials">
              <div className="space-y-2">
                {INGEST_SLOTS.map((s) => {
                  const f = editing!.ingested?.[s.type] ?? (s.type === 'SBOM' && !editing!.ingested && editing!.sbomFile
                    ? { file: editing!.sbomFile, format: editing!.sbomFormat ?? '—', count: undefined as number | undefined } : null);
                  return (
                    <div key={s.type} className="flex items-center gap-3 rounded-lg border border-[#DFE5ED] bg-[#F9FAFB] px-3.5 py-2.5">
                      <span className="text-[#7B8FA5]">{SLOT_ICON[s.type]}</span>
                      <span className="w-[56px] flex-shrink-0 text-[13px] font-semibold text-[#364658]">{s.type}</span>
                      {f ? (
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-[12px] text-[#364658]" title={f.file}>{f.file}</span>
                          <span className="block text-[11px] text-[#7B8FA5]">{f.format}{f.count !== undefined && ` · ${f.count.toLocaleString()} ${unitOf(s.type, f.count)}`}</span>
                        </span>
                      ) : <span className="flex-1 text-[12px] text-[#9CA3AF]">Not ingested</span>}
                    </div>
                  );
                })}
              </div>
            </FormSection>
          ) : (
            <FormSection title="Bills of materials" aside="At least one">
              <div className="space-y-2">
                {INGEST_SLOTS.map((s) => (
                  <IngestSlotRow key={s.type} type={s.type} what={s.what} fmt={s.fmt} st={slots[s.type]}
                    canMoveTo={(t) => slots[t].status !== 'ok'}
                    drag={dragSlot === s.type} locked={locked}
                    onDrag={(on) => setDragSlot(on ? s.type : null)}
                    onDrop={(f) => { setDragSlot(null); takeFile(s.type, f); }}
                    onPick={() => pick(s.type)} onRemove={() => removeSlot(s.type)} onMove={() => moveSlot(s.type)} />
                ))}
              </div>
              <input ref={fileRef} type="file" accept=".json,.xml,.spdx,.cdx,application/json,text/xml" className="hidden"
                onChange={(e) => { const t = pickFor.current; if (t) takeFile(t, e.target.files?.[0]); e.target.value = ''; }} />
            </FormSection>
          )}
        </div>

        {/* No status line in the footer: a missing field is shown on the field itself when Add is
            clicked, and a file problem on its slot. */}
        <div className="flex items-center justify-end gap-3 border-t border-[#DFE5ED] px-5 py-3">
          <div className="flex flex-shrink-0 items-center gap-2">
            <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">
              {done ? 'Close' : 'Cancel'}
            </button>
            {!done && (
              <button
                onClick={submit}
                /* Clickable while fields are missing — the click marks them. Ingest still waits for a usable file. */
                disabled={noSeat || (!isAgent && !isEdit && (!!nReading || !!nBad || !nOk))}
                title={noSeat ? 'All BOM licences are in use' : undefined}
                className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8] disabled:cursor-not-allowed disabled:bg-[#A9C6E3]"
              >
                <Check size={15} /> {isEdit ? 'Save' : isAgent ? 'Add' : nOk ? `Ingest ${nOk} BOM${plural(nOk)}` : 'Ingest'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* One BOM slot — empty (dashed), reading, parsed (green), or error (red). The whole row is a drop
   target; the type is judged from the file's contents, not from the row it was dropped on. */
/** One BOM slot — shared by the Add drawer and the Ingest BOM drawer on an existing application. */
export function IngestSlotRow({ type, what, fmt, st, canMoveTo, drag, locked, onDrag, onDrop, onPick, onRemove, onMove, pickLabel = 'Choose file', highlight }: {
  type: BomType; what: string; fmt: string; st: SlotState;
  /** The empty slot's button — "Upload new version" when the type already has one. */
  pickLabel?: string;
  /** Ring the slot the drawer was opened for. */
  highlight?: boolean;
  canMoveTo: (t: BomType) => boolean;
  drag: boolean; locked: boolean;
  onDrag: (on: boolean) => void; onDrop: (f: File | undefined) => void;
  onPick: () => void; onRemove: () => void; onMove: () => void;
}) {
  const tone = drag ? 'border-dashed border-[#3D8BD0] bg-[#F5FAFF]'
    : st.status === 'ok' ? 'border-solid border-[#A6E9C5] bg-[#ECFDF3]'
    : st.status === 'error' ? 'border-solid border-[#FCA5A5] bg-[#FEF3F2]'
    : st.status === 'reading' ? 'border-solid border-[#DFE5ED] bg-white'
    : 'border-dashed border-[#CBD5E1] bg-white';
  const tile = st.status === 'ok' ? 'bg-[#D1FADF] text-[#22A06B]' : st.status === 'error' ? 'bg-[#FEE4E2] text-[#DC2626]' : 'bg-[#F1F5F9] text-[#7B8FA5]';
  const moveTo = st.status === 'error' && st.result && canMoveTo(st.result.kind) ? st.result.kind : null;
  const removeBtn = (
    <button type="button" onClick={onRemove} aria-label={`Remove ${type} file`} title="Remove"
      className="flex size-7 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-black/5 hover:text-[#364658]"><X size={15} /></button>
  );
  const pill = 'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-px text-[11px] font-medium tabular-nums';

  return (
    <div data-slot={type}
      onDragOver={(e) => { if (locked) return; e.preventDefault(); if (!drag) onDrag(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onDrag(false); }}
      onDrop={(e) => { if (locked) return; e.preventDefault(); onDrop(e.dataTransfer.files?.[0]); }}
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3.5 py-3 transition-colors ${tone} ${highlight && st.status === 'empty' ? 'ring-2 ring-[#3D8BD0]/30' : ''}`}>
      <span className={`flex size-9 flex-shrink-0 items-center justify-center rounded-lg ${tile}`}>{SLOT_ICON[type]}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-[#364658]">{type}</span>
          {st.status === 'reading' && <span className={`${pill} border-[#DFE5ED] bg-white text-[#7B8FA5]`}><Loader2 size={11} className="animate-spin" />Reading…</span>}
          {st.status === 'ok' && <span className={`${pill} border-[#A6E9C5] bg-white text-[#22A06B]`}><Check size={11} />{st.format} · {st.count.toLocaleString()} {st.unit ?? unitOf(type, st.count)}</span>}
          {st.status === 'error' && <span className={`${pill} border-[#FCA5A5] bg-white text-[#DC2626]`}>Can’t use this file</span>}
        </div>
        {st.status === 'empty'
          ? <p className="mt-0.5 text-[12px] text-[#7B8FA5]">{what} · {fmt}</p>
          : <p className="mt-0.5 truncate font-mono text-[12px] text-[#364658]" title={st.file}>{st.file}</p>}
        {st.status === 'error' && (
          <p role="alert" className="mt-1 flex items-start gap-1.5 text-[12px] text-[#B42318]"><AlertCircle size={13} className="mt-px flex-shrink-0" />{st.message}</p>
        )}
      </div>
      {!locked && (
        <div className="flex flex-shrink-0 items-center gap-2">
          {st.status === 'empty' && (
            <button type="button" onClick={onPick}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[12px] font-medium text-[#364658] transition-colors hover:border-[#3D8BD0] hover:text-[#3D8BD0]">
              <Upload size={14} />{pickLabel}
            </button>
          )}
          {st.status === 'ok' && <><button type="button" onClick={onPick} className={LINK}>Replace</button>{removeBtn}</>}
          {st.status === 'error' && (
            <>
              {moveTo && (
                <button type="button" onClick={onMove}
                  className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-3 text-[12px] font-medium text-[#364658] transition-colors hover:border-[#3D8BD0] hover:text-[#3D8BD0]">
                  Move to {moveTo}
                </button>
              )}
              <button type="button" onClick={onPick} className={LINK}>Choose another</button>
              {removeBtn}
            </>
          )}
        </div>
      )}
    </div>
  );
}
