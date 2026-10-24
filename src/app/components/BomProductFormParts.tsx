import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, Search, KeyRound, AlertTriangle, Server, AppWindow, Workflow, Layers, Info, X, Plus, Link2 } from 'lucide-react';
import { BOM_LICENSE_SEATS, seatsLeft, seatsUsed, createService, SERVICE_STATUSES, applicationServices, isCmdbLicensed, bomProducts, endpointIdOf, endpointVersionOf, endpointLastSyncOf, osFamilyOf, manufacturers, manufacturerByName, addManufacturer } from './bomProductsData';
import type { BomAgent, ServiceCi, ServiceType, ServiceStatus, OsFamily, Manufacturer } from './bomProductsData';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

/* Pieces the two "add an Application Service to BOM scope" forms share — Agent and Ingest. They
 * ask the same questions about it, so the controls that answer them are written once: a field
 * that looks different in the two forms would read as two different facts. */

export const INPUT =
  'h-9 w-full rounded border border-[#d1d5db] bg-white px-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]';
export const INPUT_ERR = 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]';

/* Declared at module scope: a component defined inside another is a new type on every render,
   so React throws the subtree away and the field being typed into loses focus. */
export function Field({ label, hint, error, children }: { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[12px] font-medium text-[#7B8FA5]">{label}</label>
      {children}
      {error ? <p className="mt-1 text-[12px] text-[#DC2626]">{error}</p> : hint ? <p className="mt-1 text-[12px] text-[#7B8FA5]">{hint}</p> : null}
    </div>
  );
}

export const Req = () => <span className="text-[#DC2626]">*</span>;
export const Optional = () => <span className="font-normal text-[#9CA3AF]">(optional)</span>;

/** A numbered section inside a form — the reader can see how many questions there are. */
/* A form section. Headers carry a title only (UI review): no step circle, no sub-text — the one
   requirement a section has rides in the muted `aside` ("At least one"). */
export function FormSection({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#F0F2F5] pb-5 pt-5 first:pt-0 last:border-b-0 last:pb-0">
      <h4 className="mb-3 text-[14px] font-semibold text-[#364658]">
        {title}{aside && <span className="ml-1.5 text-[12px] font-normal text-[#7B8FA5]">· {aside}</span>}
      </h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Agent health — the same green/amber dot as the Endpoints listing. */
export const AgentDot = ({ online }: { online: boolean | null | undefined }) =>
  online === null || online === undefined ? null
    : <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: online ? '#22C55E' : '#EAB308' }} title={online ? 'Agent online' : 'Agent offline'} />;

/** An agent, addressed the way the agent listing shows it: health dot + grey AGENT-N id pill. */
/* Shows the ENDPOINT (EP-N) the scan runs on — the agent id stays internal. */
export const AgentIdPill = ({ agent, active, noDot }: { agent: Pick<BomAgent, 'id' | 'agentOnline'> & { endpointId?: string | null }; active?: boolean; noDot?: boolean }) => (
  <span className="inline-flex flex-shrink-0 items-center gap-2">
    {!noDot && <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: agent.agentOnline ? '#22C55E' : '#EAB308' }}
      title={agent.agentOnline ? 'Endpoint online' : 'Endpoint offline'} />}
    <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-semibold ${active ? 'bg-[#E8F4FD] text-[#3D8BD0]' : 'bg-[#E5E7EB] text-[#364658]'}`}>{endpointIdOf({ id: agent.id, endpointId: agent.endpointId ?? null })}</span>
  </span>
);

/** The endpoint pill as a link — opens the Endpoint detail page, the way a CI id opens the CMDB. */
export const EndpointLink = ({ agent, noDot }: { agent: BomAgent; noDot?: boolean }) => (
  <button type="button" title={`Open ${endpointIdOf(agent)} · ${agent.hostName}`}
    onClick={(e) => { e.stopPropagation(); window.__bomStore?.openEndpoint(agent.id); }}
    className="inline-flex items-center rounded transition-opacity hover:opacity-75">
    <AgentIdPill agent={agent} noDot={noDot} />
  </button>
);

/** The icon for a service's type — the same glyphs the CMDB listing uses. */
export const serviceIcon = (t: ServiceType, size = 13) =>
  t === 'Business Service' ? <Workflow size={size} /> : <Layers size={size} />;

/* ── A searchable picker ──────────────────────────────────────────────────
   The list opens IN-FLOW under the field, not floating: these pickers sit at the foot of
   scrolling side panels, where an absolute menu is clipped by the panel. */
function Picker<T extends { id: string }>({ value, onChange, pool, placeholder, invalid, noneLabel, match, renderValue, renderRow, emptyText }: {
  value: T | null;
  onChange: (v: T | null) => void;
  pool: T[];
  placeholder: string;
  invalid?: boolean;
  /** When set, the list offers an explicit "none" row — the field is optional. */
  noneLabel?: string;
  match: (v: T, q: string) => boolean;
  renderValue: (v: T) => React.ReactNode;
  renderRow: (v: T, selected: boolean) => React.ReactNode;
  emptyText: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  useEffect(() => {
    if (!open) { setQ(''); return; }
    const id = requestAnimationFrame(() => listRef.current?.scrollIntoView({ block: 'nearest' }));
    return () => cancelAnimationFrame(id);
  }, [open]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (t ? pool.filter((v) => match(v, t)) : pool).slice(0, 80);
  }, [pool, q, match]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={`${INPUT} flex items-center justify-between gap-2 text-left ${invalid ? INPUT_ERR : ''}`}>
        {value ? <span className="flex min-w-0 items-center gap-2">{renderValue(value)}</span>
          : <span className="truncate text-[#9ca3af]">{noneLabel && !invalid ? noneLabel : placeholder}</span>}
        <ChevronDown size={15} className={`flex-shrink-0 text-[#7B8FA5] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div ref={listRef} className="mt-1 w-full rounded-lg border border-[#DFE5ED] bg-white shadow-sm">
          <div className="border-b border-[#F0F2F5] p-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
                placeholder="Search" className="h-8 w-full rounded border border-[#d1d5db] pl-8 pr-2 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none" />
            </div>
          </div>
          <div className="max-h-[260px] overflow-y-auto py-1">
            {noneLabel && (
              <button type="button" onClick={() => { onChange(null); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${value === null ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'}`}>
                <span>{noneLabel}</span>{value === null && <Check size={14} className="text-[#3D8BD0]" />}
              </button>
            )}
            {shown.map((v) => (
              <button key={v.id} type="button" onClick={() => { onChange(v); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${value?.id === v.id ? 'bg-[#F5FAFF]' : 'hover:bg-[#F9FAFB]'}`}>
                {renderRow(v, value?.id === v.id)}
                {value?.id === v.id && <Check size={14} className="ml-auto flex-shrink-0 text-[#3D8BD0]" />}
              </button>
            ))}
            {!shown.length && <div className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">{q ? `Nothing matches “${q}”.` : emptyText}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const matchAgent = (a: BomAgent, q: string) => [a.id, a.hostName, a.ipAddress, a.os].some((x) => x.toLowerCase().includes(q));
const matchService = (c: ServiceCi, q: string) => [c.id, c.name, c.serviceType, c.status].some((x) => x.toLowerCase().includes(q));

/** Agent machines only — the one thing that can run a scan. */
export function AgentPicker({ value, onChange, pool, invalid, optional }: {
  value: BomAgent | null; onChange: (a: BomAgent | null) => void; pool: BomAgent[]; invalid?: boolean; optional?: boolean;
}) {
  return (
    <Picker
      value={value} onChange={onChange} pool={pool} invalid={invalid}
      placeholder="Select an agent…" noneLabel={optional ? 'No agent' : undefined}
      match={matchAgent} emptyText="No agent machines."
      renderValue={(a) => <><AgentIdPill agent={a} /><span className="truncate text-[12px] text-[#7B8FA5]">{a.hostName}</span></>}
      renderRow={(a, sel) => (
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <AgentIdPill agent={a} active={sel} />
          <span className="truncate text-[12px] text-[#7B8FA5]">{a.hostName}</span>
        </span>
      )}
    />
  );
}

/* ── Application Service ────────────────────────────────────────────────────
   The name an entry in BOM scope goes by. ONE field does both jobs the old form split across two
   sections — naming, and linking to the CMDB:
     typed      the name as typed; nothing in the CMDB is touched
     picked     "Browse CMDB" → an existing Application Service: its name fills the field and the
                entry is linked to it
     new        created in the same drawer; it is added to the CMDB only when the form is SAVED,
                so cancelling never leaves a stray CI behind
   Without a CMDB licence the field keeps its label and takes typed text only. */
export interface AppServiceValue {
  name: string;
  /** Picked from the CMDB. */
  existing: ServiceCi | null;
  /** Created in the drawer, not yet in the CMDB. */
  draft: { name: string; status: ServiceStatus } | null;
}
export const emptyAppService = (): AppServiceValue => ({ name: '', existing: null, draft: null });
export const appServiceError = (v: AppServiceValue) =>
  !v.name.trim() ? 'Enter an application name.' : '';
/** Commit the choice on save — the one point where a new Application Service enters the CMDB. */
export function resolveAppService(v: AppServiceValue): ServiceCi | null {
  if (v.existing) return v.existing;
  if (v.draft) return createService({ name: v.draft.name.trim(), serviceType: 'Application Service', status: v.draft.status }, v.draft.name.trim());
  return null;
}

const STATUS_TONE: Record<ServiceStatus, string> = {
  Operational: '#22C55E', 'Non-Operational': '#EF4444', 'In Maintenance': '#F59E0B', Retired: '#94A3B8',
};
const StatusDot = ({ status }: { status: ServiceStatus }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-[#64748B]">
    <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_TONE[status] }} />{status}
  </span>
);

/** ⓘ beside "Application": the entry is an application of its own, and linking it to a CMDB
    Application Service is optional. Says what applies to this install — with or without a CMDB
    licence — so the hint never offers a link the customer cannot make. */
export function AppLinkInfo({ side = 'top' }: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  const licensed = isCmdbLicensed();
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button type="button" aria-label="About linking this application to the CMDB"
          className="inline-flex items-center text-[#9CA3AF] transition-colors hover:text-[#3D8BD0]"><Info size={13} /></button>
      </TooltipTrigger>
      <TooltipContent side={side} className="z-[10003] max-w-[260px] text-wrap text-left text-[12px] font-normal leading-snug">
        {licensed
          ? <>Name of the application this BOM is for. Optionally, link it to an <b>Application Service</b> in the CMDB.</>
          : <>Name of the application this BOM is for.</>}
      </TooltipContent>
    </Tooltip>
  );
}

export function ApplicationServiceField({ value, onChange, touched, autoFocus, disabled, linkLocked }: {
  value: AppServiceValue;
  onChange: (v: AppServiceValue) => void;
  touched?: boolean;
  autoFocus?: boolean;
  /** Read-only — e.g. after an ingest succeeded; the line still says what it is linked to. */
  disabled?: boolean;
  /** Edit — the name can be typed, but the CMDB link is shown, not changed (no Browse / Unlink). */
  linkLocked?: boolean;
}) {
  const [browsing, setBrowsing] = useState(false);
  const licensed = isCmdbLicensed();
  const err = touched ? appServiceError(value) : '';
  const linked = value.existing ?? null;
  const fixedLink = disabled || linkLocked;

  /* ONE link-state line under the field (UI review): it says whether THIS application is linked,
     instead of a general instruction. Without a CMDB licence there is nothing to link, so no line. */
  const unlink = () => onChange({ name: value.name, existing: null, draft: null });
  const linkBtn = 'text-[12px] font-medium text-[#3D8BD0] hover:underline';
  const stateLine = !licensed ? null
    : linked ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#22A06B]">
        <Link2 size={12} />Linked to CMDB · <span className="font-mono font-semibold">{linked.id}</span>
        {!fixedLink && <button type="button" onClick={unlink} className={`ml-1 ${linkBtn}`}>Unlink</button>}
      </p>
    ) : value.draft ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#364658]">
        <Info size={12} className="text-[#3D8BD0]" />New Application Service · added to the CMDB when you save
        {!fixedLink && <button type="button" onClick={unlink} className={`ml-1 ${linkBtn}`}>Don’t create</button>}
      </p>
    ) : null;

  return (
    <Field label={<span className="inline-flex items-center gap-1">Application <Req /><AppLinkInfo /></span>} error={err}>
      <div className="flex gap-2">
        <input
          value={value.name}
          autoFocus={autoFocus}
          disabled={disabled}
          /* Typing over a picked or new service turns it back into a plain typed name: the field
             can never show one name while being linked to another. */
          onChange={(e) => onChange(linkLocked ? { ...value, name: e.target.value } : { name: e.target.value, existing: null, draft: null })}
          placeholder="e.g. Motadata ServiceOps"
          className={`${INPUT} disabled:cursor-not-allowed disabled:bg-[#F5F7FA] ${err ? INPUT_ERR : ''}`}
        />
        {licensed && !fixedLink && (
          <button type="button" onClick={() => setBrowsing(true)}
            className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded border border-[#3D8BD0] bg-white px-3 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]">
            <Search size={14} /> Browse CMDB
          </button>
        )}
      </div>
      {!err && stateLine}

      {browsing && (
        <AppServiceDrawer
          initialQuery={value.name}
          selectedId={linked?.id ?? null}
          onClose={() => setBrowsing(false)}
          onPick={(ci) => { onChange({ name: ci.name, existing: ci, draft: null }); setBrowsing(false); }}
          onCreate={(d) => { onChange({ name: d.name, existing: null, draft: d }); setBrowsing(false); }}
        />
      )}
    </Field>
  );
}

/* The side drawer behind "Browse CMDB": every Application Service in the CMDB, searchable, and a
   way to add a new one without leaving it. Stacks over whatever opened it (the Add form or an
   entry's page), so it renders above both. */
/* Shared chrome for the two "select one" side drawers (CMDB Application Service, Endpoint): a
   search bar, a grid with a radio column — ONE row can be selected, never several — and a footer
   that commits the choice. Long lists live here rather than in a dropdown. */
const TH = 'px-3 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658] whitespace-nowrap';
const TD = 'px-3 py-2.5 text-[12px] text-[#364658]';
function Radio({ on }: { on: boolean }) {
  return (
    <span className={`flex size-4 items-center justify-center rounded-full border ${on ? 'border-[#3D8BD0]' : 'border-[#CBD5E1] bg-white'}`}>
      {on && <span className="size-2 rounded-full bg-[#3D8BD0]" />}
    </span>
  );
}
function SelectDrawer({ title, width, onClose, top, search, onSearch, head, body, empty, footNote, canSelect, onSelect, z = 'z-[10001]' }: {
  title: React.ReactNode; width: string; onClose: () => void; top?: React.ReactNode;
  search: string; onSearch: (v: string) => void; head: React.ReactNode; body: React.ReactNode; empty?: React.ReactNode;
  footNote: React.ReactNode; canSelect: boolean; onSelect: () => void; z?: string;
}) {
  return (
    <div className={`fixed inset-0 ${z} flex items-center justify-end bg-black/30`} onClick={onClose}>
      <div className={`flex h-full ${width} max-w-[96vw] flex-col bg-white shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="text-[16px] font-semibold text-[#364658]">{title}</h3>
          <button type="button" onClick={onClose} title="Close" className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>
        {top ?? (
          <div className="px-5 pb-2 pt-4">
            <input autoFocus value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Select field to search..."
              className="h-9 w-full rounded border border-[#DFE5ED] bg-white px-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto px-5">
          <table className="w-full">
            <thead className="sticky top-0 z-[1] border-b border-[#e5e7eb] bg-white"><tr>{head}</tr></thead>
            <tbody className="divide-y divide-[#e5e7eb]">{body}</tbody>
          </table>
          {empty}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#DFE5ED] px-5 py-3">
          <span className="min-w-0 truncate text-[12px] text-[#7B8FA5]">{footNote}</span>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
            <button type="button" disabled={!canSelect} onClick={onSelect}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"><Check size={15} />Select</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** CMDB › Application Services, to name this BOM and link it — one row only. "Create New" opens
 *  the CMDB's Create CI form with CI Type fixed to Application Service; the new CI reaches the
 *  CMDB only when the application is saved. */
const SVC_ORIGINS = ['Manual', 'Discovery', 'Manual', 'Manual'];
const svcHash = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
/** Created date and origin of a service CI. A service made from BOM scope carries its own; the
 *  seeded ones are derived from the id so they stay put across reloads. */
const svcCreated = (c: ServiceCi) => {
  if (c.createdFrom) return { date: c.createdFrom.on, origin: 'Manual' };
  const h = svcHash(c.id);
  const d = new Date(2026, 5 + (h % 3), 1 + (h % 27), 9 + (h % 9), h % 60);
  const date = `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return { date, origin: SVC_ORIGINS[h % SVC_ORIGINS.length] };
};

export function AppServiceDrawer({ initialQuery, selectedId, onClose, onPick, onCreate }: {
  initialQuery?: string;
  selectedId: string | null;
  onClose: () => void;
  onPick: (ci: ServiceCi) => void;
  onCreate: (d: { name: string; status: ServiceStatus }) => void;
}) {
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<string | null>(selectedId);
  const [creating, setCreating] = useState(false);
  const all = applicationServices();
  const t = q.trim().toLowerCase();
  const shown = t ? all.filter((c) => matchService(c, t)) : all;
  const chosen = all.find((c) => c.id === pick) ?? null;

  return (
    <>
      <SelectDrawer
        width="w-[980px]"
        onClose={onClose}
        title="Select Application Service"
        top={
          <div className="flex gap-2 px-5 pb-2 pt-4">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Select field to search..."
              className="h-9 min-w-0 flex-1 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
            <button type="button" onClick={() => setCreating(true)}
              className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]">
              <Plus size={14} /> Create New
            </button>
          </div>
        }
        search={q} onSearch={setQ}
        head={<>
          <th className="w-[40px] px-3 py-2.5" />
          <th className={TH}>Name</th><th className={TH}>CI Type</th><th className={TH}>Status</th>
          <th className={TH}>Created Date</th><th className={TH}>Origin</th>
        </>}
        body={shown.map((c) => {
          const on = c.id === pick;
          const meta = svcCreated(c);
          return (
            <tr key={c.id} onClick={() => setPick(c.id)} className={`cursor-pointer transition-colors ${on ? 'bg-[#F5FAFF]' : 'hover:bg-[#f9fafb]'}`}>
              <td className="px-3 py-2.5"><Radio on={on} /></td>
              <td className={TD}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="whitespace-nowrap rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[12px] font-semibold text-[#364658]">{c.id}</span>
                  <span className="truncate font-medium">{c.name}</span>
                </span>
              </td>
              <td className={TD}><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Layers size={14} className="text-[#7B8FA5]" />Application Service</span></td>
              <td className={TD}><StatusDot status={c.status} /></td>
              <td className={`${TD} whitespace-nowrap`}>{meta.date}</td>
              <td className={TD}>{meta.origin}</td>
            </tr>
          );
        })}
        empty={!shown.length && (
          <div className="py-10 text-center text-[13px] text-[#9CA3AF]">
            No Application Service matches “{q}”.
            <button type="button" onClick={() => setCreating(true)}
              className="mt-2 block w-full text-[13px] font-medium text-[#3D8BD0] hover:underline">Create “{q.trim()}”</button>
          </div>
        )}
        footNote={chosen ? <>Selected <b className="font-semibold text-[#364658]">{chosen.id} · {chosen.name}</b></> : `${all.length} Application Services in the CMDB · select one`}
        canSelect={!!chosen}
        onSelect={() => chosen && onPick(chosen)}
      />
      {creating && (
        <CreateAppServiceDrawer
          initialName={q.trim() || initialQuery?.trim() || ''}
          onClose={() => setCreating(false)}
          onCreate={(d) => { setCreating(false); onCreate(d); }}
        />
      )}
    </>
  );
}

/* The CMDB's Create CI form, opened from BOM. CI Type is fixed to Application Service — that is
   the only kind a BOM links to — and the machine fields (Host Name, IP Address) are left out:
   an Application Service is not a machine. */
const CI_OPTIONS = {
  product: ['Motadata ServiceOps', 'Infosys Finacle', 'Temenos Infinity', 'Murex MX.3', 'FICO Falcon', 'Salesforce'],
  group: ['Application Support', 'Core Banking Team', 'Digital Channels', 'Payments Team', 'Infrastructure'],
  managedBy: ['Priya Nair', 'Vikram Sethi', 'Imran Qureshi', 'Neha Raje', 'Karan Malhotra'],
  department: ['IT Operations', 'Retail Banking', 'Treasury', 'Risk & Compliance', 'Human Resources'],
  location: ['Mumbai DC', 'Bengaluru DR', 'Ahmedabad HQ', 'Hyderabad Office'],
  ciGroup: ['Business Critical', 'Customer Facing', 'Internal'],
  usedBy: ['All Branches', 'Retail Customers', 'Treasury Desk', 'HR Team'],
  impact: ['Low', 'Medium', 'High'],
  company: ['Motadata Bank Ltd.', 'Motadata Securities'],
};
function CreateAppServiceDrawer({ initialName, onClose, onCreate }: {
  initialName: string; onClose: () => void; onCreate: (d: { name: string; status: ServiceStatus }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<ServiceStatus>('Operational');
  const [impact, setImpact] = useState('Low');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [touched, setTouched] = useState(false);
  const dupe = applicationServices().find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const err = !name.trim() ? 'Name the Application Service.' : dupe ? `${dupe.id} already has this name — select it instead.` : '';
  const sel = (label: string, opts: string[], value?: string, onChange?: (v: string) => void) => (
    <Field label={label}>
      <select value={value} defaultValue={value === undefined ? '' : undefined} onChange={onChange ? (e) => onChange(e.target.value) : undefined} className={`app-select ${INPUT}`}>
        {value === undefined && <option value="" disabled>Select</option>}
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
  const addTag = () => { const v = tagDraft.trim(); if (v && !tags.includes(v)) setTags([...tags, v]); setTagDraft(''); };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-[860px] max-w-[96vw] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="text-[16px] font-semibold text-[#364658]">Create CI</h3>
          <button type="button" onClick={onClose} title="Close" className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field label={<>Name <Req /></>} error={touched && err}>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={`${INPUT} ${touched && err ? INPUT_ERR : ''}`} />
          </Field>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <Field label={<>CI Type <Req /></>}>
              <div className={`${INPUT} flex cursor-not-allowed items-center gap-2 bg-[#F5F7FA]`} title="A BOM links only to an Application Service">
                <Layers size={14} className="text-[#7B8FA5]" />Application Service
              </div>
            </Field>
            {sel('Product', CI_OPTIONS.product)}
            {sel('Managed By Group', CI_OPTIONS.group)}
            {sel('Managed By', CI_OPTIONS.managedBy)}
            {sel('Department', CI_OPTIONS.department)}
            {sel('Location', CI_OPTIONS.location)}
            {sel('CI Group', CI_OPTIONS.ciGroup)}
            {sel('Used By', CI_OPTIONS.usedBy)}
            <Field label="Assignment Date"><input type="date" className={INPUT} /></Field>
            {sel('Status', SERVICE_STATUSES, status, (v) => setStatus(v as ServiceStatus))}
            {sel('Impact', CI_OPTIONS.impact, impact, setImpact)}
            {sel('Company', CI_OPTIONS.company)}
          </div>
          <Field label="Tags">
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-sm bg-[#F1F5F9] px-2 py-0.5 text-[12px] text-[#364658]">
                  {t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="text-[#7B8FA5] hover:text-[#364658]"><X size={12} /></button>
                </span>
              ))}
              <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                onBlur={addTag} placeholder="+ Add tag" className="h-7 w-[120px] rounded border border-[#DFE5ED] px-2 text-[12px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none" />
            </div>
          </Field>
          <Field label="Description">
            <textarea rows={5} placeholder="Description" className="w-full rounded border border-[#d1d5db] px-3 py-2 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button type="button" onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
          <button type="button" onClick={() => { setTouched(true); if (!err) onCreate({ name: name.trim(), status }); }}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]"><Check size={15} />Create and Select</button>
        </div>
      </div>
    </div>
  );
}

/* ── Endpoint ──────────────────────────────────────────────────────────────
   The machine whose agent scans the application. Only endpoints with an agent can scan, so only
   they are listed. A fleet has hundreds, so the choice is made in a side drawer, not a dropdown. */
const matchEndpoint = (a: BomAgent, q: string) =>
  [endpointIdOf(a), a.hostName, a.ipAddress, a.os, endpointVersionOf(a), endpointLastSyncOf(a)].some((x) => x.toLowerCase().includes(q));

export function EndpointDrawer({ selectedId, pool, onClose, onPick }: {
  selectedId: string | null; pool: BomAgent[]; onClose: () => void; onPick: (a: BomAgent) => void;
}) {
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<string | null>(selectedId);
  const t = q.trim().toLowerCase();
  const shown = t ? pool.filter((a) => matchEndpoint(a, t)) : pool;
  const chosen = pool.find((a) => a.id === pick) ?? null;
  return (
    <SelectDrawer
      width="w-[980px]"
      onClose={onClose}
      title="Select Endpoint"
      search={q} onSearch={setQ}
      head={<>
        <th className="w-[40px] px-3 py-2.5" />
        <th className={TH}>Endpoint ID</th><th className={TH}>Host Name</th><th className={TH}>IP Address</th>
        <th className={TH}>OS Name</th><th className={TH}>Endpoint Version</th><th className={TH}>Last Sync Date</th>
      </>}
      body={shown.map((a) => {
        const on = a.id === pick;
        return (
          <tr key={a.id} onClick={() => setPick(a.id)} className={`cursor-pointer transition-colors ${on ? 'bg-[#F5FAFF]' : 'hover:bg-[#f9fafb]'}`}>
            <td className="px-3 py-2.5"><Radio on={on} /></td>
            <td className={TD}><EndpointIdPill agent={a} /></td>
            <td className={TD}><span className="block max-w-[170px] truncate" title={a.hostName}>{a.hostName}</span></td>
            <td className={`${TD} whitespace-nowrap`}>{a.ipAddress}</td>
            <td className={TD}><span className="block max-w-[210px] truncate" title={a.os}>{a.os}</span></td>
            <td className={`${TD} whitespace-nowrap`}>{endpointVersionOf(a)}</td>
            <td className={`${TD} whitespace-nowrap`}>{endpointLastSyncOf(a)}</td>
          </tr>
        );
      })}
      empty={!shown.length && <div className="py-10 text-center text-[13px] text-[#9CA3AF]">No endpoint matches “{q}”.</div>}
      footNote={chosen ? <>Selected <b className="font-semibold text-[#364658]">{endpointIdOf(chosen)} · {chosen.hostName}</b></> : `${pool.length} endpoints · select one`}
      canSelect={!!chosen}
      onSelect={() => chosen && onPick(chosen)}
    />
  );
}

/** Endpoint, addressed as the Endpoints listing does: agent-health dot + grey EP-N pill. */
export const EndpointIdPill = ({ agent }: { agent: BomAgent }) => (
  <span className="inline-flex flex-shrink-0 items-center gap-2">
    <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: agent.agentOnline ? '#22C55E' : '#EAB308' }}
      title={agent.agentOnline ? 'Agent online' : 'Agent offline'} />
    <span className="whitespace-nowrap rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[12px] font-semibold text-[#364658]">{endpointIdOf(agent)}</span>
  </span>
);

const OS_TONE: Record<OsFamily, string> = { Windows: 'bg-[#EFF6FC] text-[#2F6FA8]', Linux: 'bg-[#FEF7E6] text-[#B54708]', macOS: 'bg-[#F1F5F9] text-[#475467]' };
export const OsChip = ({ family }: { family: OsFamily }) => (
  <span className={`whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${OS_TONE[family]}`}>{family}</span>
);

/** The field: a "Select endpoint" button until one is chosen, then a summary card with Change. */
export function EndpointField({ value, onChange, pool, invalid, locked }: {
  value: BomAgent | null; onChange: (a: BomAgent) => void; pool: BomAgent[]; invalid?: boolean;
  /** Edit mode — the endpoint a BOM is scanned on is fixed once added. */
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {value ? (
        <div className="flex items-center gap-3 rounded border border-[#DFE5ED] bg-[#F9FAFB] px-3 py-2.5">
          <EndpointIdPill agent={value} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[#364658]">{value.hostName}</span>
            <span className="mt-0.5 flex items-center gap-2 text-[12px] text-[#7B8FA5]">
              <span className="truncate">{value.os}</span><span>·</span><span className="whitespace-nowrap">{value.ipAddress}</span>
            </span>
          </span>
          <span className="whitespace-nowrap text-[12px] text-[#7B8FA5]">{osFamilyOf(value.os)}</span>
          {!locked && <button type="button" onClick={() => setOpen(true)} className="text-[12px] font-medium text-[#3D8BD0] hover:underline">Change</button>}
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className={`${INPUT} flex items-center justify-between gap-2 text-left ${invalid ? INPUT_ERR : ''}`}>
          <span className="text-[#9ca3af]">Select an endpoint…</span>
          <Search size={14} className="flex-shrink-0 text-[#7B8FA5]" />
        </button>
      )}
      {open && <EndpointDrawer selectedId={value?.id ?? null} pool={pool} onClose={() => setOpen(false)} onPick={(a) => { onChange(a); setOpen(false); }} />}
    </>
  );
}

/* Scan path syntax follows the endpoint's OS: a Windows path starts with a drive letter, a Linux
   or macOS path with "/". Said up front (placeholder + hint) and checked, so a Linux-style path
   can never be saved against a Windows machine. */
export const PATH_RULE: Record<OsFamily, { example: string; hint: string; ok: (p: string) => boolean }> = {
  Windows: { example: 'C:\\Program Files\\Motadata\\ServiceOps', hint: 'Windows path — starts with a drive letter, e.g. D:\\Apps\\NetBanking', ok: (p) => /^[A-Za-z]:([\\/]|$)/.test(p) },
  Linux:   { example: '/opt/motadata/serviceops', hint: 'Linux path — starts with /, e.g. /opt/murex/mx3', ok: (p) => p.startsWith('/') },
  macOS:   { example: '/Applications/ServiceOps.app', hint: 'macOS path — starts with /, e.g. /Applications/App.app', ok: (p) => p.startsWith('/') },
};

/* ── Manufacturer ──────────────────────────────────────────────────────────
   Picked from the Manufacturer Catalog, or added to it with "+" — the same Name / Description
   drawer as Admin › Supplier Management › Manufacturer Catalog. */
const matchManufacturer = (m: Manufacturer, q: string) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);

export function ManufacturerField({ value, onChange, error, disabled }: {
  value: string; onChange: (name: string) => void; error?: React.ReactNode; disabled?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  /* Re-read after an add so the new entry is in the list. */
  const [, bump] = useState(0);
  const pool = manufacturers();
  const picked = value ? manufacturerByName(value) : null;
  return (
    <Field label={<>Manufacturer <Req /></>} error={error}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {disabled ? (
            <input value={value} disabled className={`${INPUT} cursor-not-allowed bg-[#F5F7FA]`} />
          ) : (
            <Picker<Manufacturer>
              value={picked} onChange={(m) => onChange(m?.name ?? '')} pool={pool}
              placeholder="Select manufacturer" invalid={!!error} match={matchManufacturer}
              renderValue={(m) => <span className="truncate text-[13px] text-[#364658]">{m.name}</span>}
              renderRow={(m) => <span className="truncate text-[13px] text-[#364658]">{m.name}</span>}
              emptyText="No manufacturer yet — add one with +."
            />
          )}
        </div>
        {!disabled && (
          <button type="button" onClick={() => setAdding(true)} title="Add manufacturer" aria-label="Add manufacturer"
            className="flex size-9 flex-shrink-0 items-center justify-center rounded border border-[#3D8BD0] bg-white text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]">
            <Plus size={16} />
          </button>
        )}
      </div>
      {adding && (
        <AddManufacturerDrawer onClose={() => setAdding(false)}
          onAdd={(m) => { onChange(m.name); bump((n) => n + 1); setAdding(false); }} />
      )}
    </Field>
  );
}

function AddManufacturerDrawer({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Manufacturer) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [touched, setTouched] = useState(false);
  const dupe = name.trim() ? manufacturerByName(name) : null;
  const err = !name.trim() ? 'Name the manufacturer.' : dupe ? `${dupe.name} is already in the catalog — select it instead.` : '';
  const add = () => { setTouched(true); if (!err) onAdd(addManufacturer(name, desc)); };
  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-[560px] max-w-[96vw] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <h3 className="text-[16px] font-semibold text-[#364658]">Add Manufacturer</h3>
          <button type="button" onClick={onClose} title="Close" className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field label={<>Name <Req /></>} error={touched && err}>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder="Name" className={`${INPUT} ${touched && err ? INPUT_ERR : ''}`} />
          </Field>
          <Field label="Description">
            <textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description"
              className="w-full rounded border border-[#d1d5db] px-3 py-2 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button type="button" onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
          <button type="button" onClick={add} className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]"><Check size={15} />Add</button>
        </div>
      </div>
    </div>
  );
}

/** What adding costs, said before the form is filled — not discovered at Save. */
/* The licence strip on the Add drawer (UI review). One licence per application covers its SBOM,
   CBOM and AI BOM alike — said up front, because three upload slots on screen would otherwise read
   as three seats. The bar fills with the seats in use and turns red when none are left. */
export function LicenceStrip() {
  const used = seatsUsed();
  const left = seatsLeft();
  const pct = Math.min(100, Math.round((used / BOM_LICENSE_SEATS) * 100));
  const tone = left <= 0 ? '#DC2626' : left / BOM_LICENSE_SEATS <= 0.25 ? '#D97706' : '#22A06B';
  return (
    <div className="relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 pb-3 pt-2.5">
      <KeyRound size={15} className="flex-shrink-0 text-[#7B8FA5]" />
      <span className="min-w-0 flex-1 text-[13px] text-[#364658]">
        {left <= 0
          ? <>All {BOM_LICENSE_SEATS} BOM licences are in use · remove an application to free one</>
          : <>One licence covers <span className="font-semibold">all three BOM types</span></>}
      </span>
      <span className="flex-shrink-0 whitespace-nowrap text-[12px] font-semibold tabular-nums" style={{ color: tone }}>{left} of {BOM_LICENSE_SEATS} free</span>
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#E5E7EB]" aria-hidden="true">
        <span className="block h-full transition-[width] duration-300" style={{ width: `${pct}%`, backgroundColor: tone }} />
      </span>
    </div>
  );
}

export function SeatBanner() {
  const used = seatsUsed();
  const left = seatsLeft();
  const pct = Math.round((used / BOM_LICENSE_SEATS) * 100);
  if (left <= 0) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-[#FCA5A5] bg-[#FEF3F2] px-3.5 py-3">
        <AlertTriangle size={16} className="mt-px flex-shrink-0 text-[#DC2626]" />
        <div className="text-[12px] text-[#7A271A]">
          <p className="text-[13px] font-semibold text-[#B42318]">All {BOM_LICENSE_SEATS} BOM licences are in use</p>
          <p className="mt-0.5">Each application in scope holds one. Remove one in Admin › BOM Management › BOM Scope to free a licence.</p>
        </div>
      </div>
    );
  }
  const low = left / BOM_LICENSE_SEATS <= 0.25;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5">
      <KeyRound size={15} className="flex-shrink-0 text-[#7B8FA5]" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-[#364658]">
          Uses <span className="font-semibold">1 BOM licence</span> · {used} of {BOM_LICENSE_SEATS} in use ·{' '}
          <span className={low ? 'font-semibold text-[#D97706]' : 'font-semibold text-[#22A06B]'}>{left} available</span>
        </p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: low ? '#F59E0B' : '#3D8BD0' }} />
        </div>
      </div>
    </div>
  );
}

/** Agent / Ingest — the one fact that decides what every other field means. */
export function SourcePill({ source }: { source: 'Agent' | 'Ingest' }) {
  return source === 'Agent' ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-[#EFF6FC] px-2 py-0.5 text-[12px] text-[#364658]">
      <Server size={12} className="text-[#7B8FA5]" />Endpoint
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-[#F3ECFB] px-2 py-0.5 text-[12px] text-[#364658]">
      <AppWindow size={12} className="text-[#7B8FA5]" />Ingest
    </span>
  );
}
