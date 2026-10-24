import { useState } from 'react';
import { X, UserPlus, Filter, Check, Plus, Copy, Trash2, Search, ChevronDown } from 'lucide-react';
import { ADMIN_CIS, CONDITION_FIELDS, CONDITION_OPERATORS, CONDITION_VALUES } from './bomAdminData';
import type { AdminCi } from './bomAdminData';

/* "Which CIs does this apply to?" — shared by the schedule and retention drawers, because the
 * question is identical in both: pick a fixed list by hand, or write conditions that keep
 * matching as new CIs are enrolled. Both can be used at once. */

export interface ConditionRow { id: string; field: string; op: string; value: string }
export interface ConditionGroup { id: string; rows: ConditionRow[] }

export interface Targeting {
  ciIds: string[];
  groups: ConditionGroup[];
  conditionsOn: boolean;
}

export const emptyTargeting = (): Targeting => ({ ciIds: [], groups: [], conditionsOn: true });

/** A condition only counts once it is complete — a half-written rule must match nothing, or a
 *  draft would silently target the whole estate. */
const rowComplete = (r: ConditionRow) => !!r.field && !!r.op && !!r.value;

export const matchedByConditions = (t: Targeting, cis: AdminCi[]): AdminCi[] => {
  if (!t.conditionsOn) return [];
  const groups = t.groups.filter((g) => g.rows.some(rowComplete));
  if (!groups.length) return [];
  const test = (ci: AdminCi, r: ConditionRow) => {
    const actual = String(
      r.field === 'CI Type' ? ci.ciType
        : r.field === 'Operating System' ? ci.osName
          : r.field === 'IP Address' ? ci.ipAddress
            : r.field === 'Origin' ? ci.origin
              : r.field === 'Status' ? ci.status
                : '',
    ).toLowerCase();
    const v = r.value.toLowerCase().replace(/\*/g, '');
    switch (r.op) {
      case 'is': return actual === v;
      case 'is not': return actual !== v;
      case 'contains': return actual.includes(v);
      case 'does not contain': return !actual.includes(v);
      case 'starts with': return actual.startsWith(v);
      default: return false;
    }
  };
  // Rows within a group are AND; a CI matching ANY group is included.
  return cis.filter((ci) => groups.some((g) => g.rows.filter(rowComplete).every((r) => test(ci, r))));
};

/** Everything the targeting resolves to, deduped across both mechanisms. */
export const targetedCis = (t: Targeting, cis: AdminCi[] = ADMIN_CIS): AdminCi[] => {
  const byHand = cis.filter((c) => t.ciIds.includes(c.id));
  const byRule = matchedByConditions(t, cis);
  const seen = new Set<string>();
  return [...byHand, ...byRule].filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
};

/** Plain-English description of what a targeting selects, so a rule created in the UI reads the
 *  same way as a seeded one ("CI Type is Windows Server", not "Custom condition"). */
export const targetingSummary = (t: Targeting): string => {
  const parts: string[] = [];
  if (t.ciIds.length) parts.push(`${t.ciIds.length} CI${t.ciIds.length === 1 ? '' : 's'} chosen by hand`);
  if (t.conditionsOn) {
    const groups = t.groups
      .map((g) => g.rows.filter(rowComplete).map((r) => `${r.field} ${r.op} ${r.value}`).join(' AND '))
      .filter(Boolean);
    // Groups are OR'd; parenthesise only when there is more than one, so the common single-group
    // case stays clean.
    if (groups.length === 1) parts.push(groups[0]);
    else if (groups.length > 1) parts.push(groups.map((g) => `(${g})`).join(' OR '));
  }
  return parts.join(' · ') || 'No conditions yet';
};

const btnSecondary = 'inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]';
const btnPrimary = 'inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]';

/** Small select used across the condition rows. */
function MiniSelect({ value, placeholder, options, onChange, width = 'w-[190px]' }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void; width?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`relative ${width} flex-shrink-0`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded border border-[#DFE5ED] bg-white px-3 text-left text-[13px] transition-colors hover:border-[#3D8BD0]"
      >
        <span className={`truncate ${value ? 'text-[#364658]' : 'text-[#9ca3af]'}`}>{value || placeholder}</span>
        <ChevronDown size={15} className={`flex-shrink-0 text-[#7B8FA5] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-[240px] w-full overflow-y-auto rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                  o === value ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                }`}
              >
                <span className="truncate">{o}</span>
                {o === value && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Choose CIs (fixed list) ────────────────────────────────────────────────

export function ChooseCisDrawer({ isOpen, onClose, selected, onApply }: {
  isOpen: boolean; onClose: () => void; selected: string[]; onApply: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [q, setQ] = useState('');
  if (!isOpen) return null;
  const query = q.trim().toLowerCase();
  const rows = ADMIN_CIS.filter((c) => !query || c.hostName.toLowerCase().includes(query) || c.id.toLowerCase().includes(query) || c.ciType.toLowerCase().includes(query));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-end bg-black/40">
      <div className="flex h-full w-[720px] max-w-[95vw] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div>
            <h3 className="text-[16px] font-semibold text-[#364658]">Choose CIs</h3>
            <p className="mt-0.5 text-[13px] text-[#7B8FA5]">Pick from the CIs already enrolled for BOM generation.</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"><X size={18} /></button>
        </div>

        <div className="px-5 pt-3">
          <div className="relative">
            <input
              type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search enrolled CIs..."
              className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                <th className="w-[40px] px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && rows.every((r) => picked.includes(r.id))}
                    onChange={(e) => setPicked(e.target.checked ? Array.from(new Set([...picked, ...rows.map((r) => r.id)])) : picked.filter((id) => !rows.some((r) => r.id === id)))}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                  />
                </th>
                {['CI ID', 'Host Name', 'CI Type', 'IP Address'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {rows.map((c) => (
                <tr key={c.id} className="cursor-pointer transition-colors hover:bg-[#f9fafb]" onClick={() => toggle(c.id)}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox" checked={picked.includes(c.id)} onChange={() => toggle(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[13px] font-medium text-[#364658]">{c.id}</td>
                  <td className="px-3 py-3">
                    <div className="text-[13px] text-[#364658]">{c.hostName}</div>
                    <div className="text-[12px] text-[#7B8FA5]">{c.osName}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="rounded-sm bg-[#F1F5F9] px-2 py-0.5 text-[12px] text-[#475467]">{c.ciType}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[13px] text-[#364658]">{c.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#DFE5ED] px-5 py-3">
          <span className="text-[13px] text-[#7B8FA5]"><span className="font-semibold text-[#364658]">{picked.length}</span> of {ADMIN_CIS.length} CIs selected</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className={btnSecondary}>Cancel</button>
            <button onClick={() => { onApply(picked); onClose(); }} className={btnPrimary}><Check size={15} /> Apply selection</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Build conditions (dynamic) ─────────────────────────────────────────────

export function ConditionsDrawer({ isOpen, onClose, value, onApply }: {
  isOpen: boolean; onClose: () => void; value: Targeting; onApply: (groups: ConditionGroup[], on: boolean) => void;
}) {
  const [groups, setGroups] = useState<ConditionGroup[]>(value.groups.length ? value.groups : [{ id: 'g1', rows: [{ id: 'r1', field: '', op: '', value: '' }] }]);
  const [on, setOn] = useState(value.conditionsOn);
  if (!isOpen) return null;

  const uid = () => Math.random().toString(36).slice(2, 8);
  const patch = (gid: string, rid: string, p: Partial<ConditionRow>) =>
    setGroups((gs) => gs.map((g) => (g.id !== gid ? g : { ...g, rows: g.rows.map((r) => (r.id === rid ? { ...r, ...p } : r)) })));

  const matched = matchedByConditions({ ...value, groups, conditionsOn: on }, ADMIN_CIS);

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-end bg-black/40">
      <div className="flex h-full w-[820px] max-w-[95vw] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div>
            <h3 className="text-[16px] font-semibold text-[#364658]">Auto-include conditions</h3>
            <p className="mt-0.5 text-[13px] text-[#7B8FA5]">Conditions in a group must all match. A CI matching any group is included.</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"><X size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] p-3.5">
            <button
              onClick={() => setOn((v) => !v)}
              className={`mt-0.5 flex h-5 w-9 flex-shrink-0 items-center rounded-full px-0.5 transition-colors ${on ? 'bg-[#3D8BD0]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`size-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} />
            </button>
            <div>
              <div className="text-[13px] font-medium text-[#364658]">Auto-include is {on ? 'on' : 'off'}</div>
              <p className="mt-0.5 text-[12px] text-[#7B8FA5]">CIs matching the conditions below join this rule automatically — now, and as new CIs are enrolled.</p>
            </div>
          </div>

          {groups.map((g, gi) => (
            <div key={g.id} className="mb-3 rounded-lg border border-[#E5E7EB] bg-white p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#364658]">Condition group {gi + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setGroups((gs) => [...gs, { ...g, id: uid(), rows: g.rows.map((r) => ({ ...r, id: uid() })) }])}
                    className="inline-flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"
                  ><Copy size={13} /> Duplicate group</button>
                  <button
                    onClick={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
                    disabled={groups.length === 1}
                    className="inline-flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium text-[#7B8FA5] transition-colors hover:bg-[#FEF3F2] hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#7B8FA5]"
                  ><Trash2 size={13} /> Remove group</button>
                </div>
              </div>

              {g.rows.map((r, ri) => (
                <div key={r.id} className="mb-2 flex items-center gap-2">
                  <span className="w-[46px] flex-shrink-0 text-[12px] text-[#7B8FA5]">{ri === 0 ? 'Where' : 'and'}</span>
                  <MiniSelect value={r.field} placeholder="Choose field" options={CONDITION_FIELDS} onChange={(v) => patch(g.id, r.id, { field: v, value: '' })} />
                  <MiniSelect value={r.op} placeholder="Choose" options={CONDITION_OPERATORS} onChange={(v) => patch(g.id, r.id, { op: v })} width="w-[150px]" />
                  <MiniSelect value={r.value} placeholder="Choose value" options={CONDITION_VALUES[r.field] ?? []} onChange={(v) => patch(g.id, r.id, { value: v })} width="w-[230px]" />
                  <button
                    onClick={() => setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, rows: x.rows.filter((y) => y.id !== r.id) } : x)))}
                    disabled={g.rows.length === 1}
                    className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#FEF3F2] hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  ><X size={15} /></button>
                </div>
              ))}

              <button
                onClick={() => setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, rows: [...x.rows, { id: uid(), field: '', op: '', value: '' }] } : x)))}
                className="mt-1 inline-flex h-7 items-center gap-1.5 rounded px-2 text-[12px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"
              ><Plus size={13} /> Add Condition</button>
            </div>
          ))}

          <button
            onClick={() => setGroups((gs) => [...gs, { id: uid(), rows: [{ id: uid(), field: '', op: '', value: '' }] }])}
            className={btnSecondary}
          ><Plus size={15} /> Add Condition Group</button>

          <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F7F9FC] p-3.5">
            <div className="text-[13px] font-medium text-[#364658]">
              Matches <span className="font-semibold">{matched.length}</span> of {ADMIN_CIS.length} enrolled CIs right now
            </div>
            {matched.length === 0 && (
              <p className="mt-1 text-[12px] text-[#7B8FA5]">
                Nothing matches yet. An incomplete condition matches nothing — so a half-written rule never
                targets the whole estate by accident.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button onClick={onClose} className={btnSecondary}>Cancel</button>
          <button onClick={() => { onApply(groups, on); onClose(); }} className={btnPrimary}><Check size={15} /> Apply conditions</button>
        </div>
      </div>
    </div>
  );
}

// ── The two-card block both drawers embed ──────────────────────────────────

export function TargetingCards({ value, onChange, dynamicCopy }: {
  value: Targeting;
  onChange: (t: Targeting) => void;
  dynamicCopy: string;
}) {
  const [chooseOpen, setChooseOpen] = useState(false);
  const [condOpen, setCondOpen] = useState(false);
  const matched = matchedByConditions(value, ADMIN_CIS);
  const completeGroups = value.groups.filter((g) => g.rows.some((r) => r.field && r.op && r.value)).length;

  const Card = ({ icon, title, badge, desc, count, sub, cta, onClick }: {
    icon: React.ReactNode; title: string; badge?: string; desc: string; count: number; sub: string; cta: string; onClick: () => void;
  }) => (
    <div className="min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-white p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EBF5FF] text-[#3D8BD0]">{icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#364658]">{title}</span>
            {badge && <span className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">{badge}</span>}
          </div>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#7B8FA5]">{desc}</p>
        </div>
      </div>
      <div className="mt-3 border-t border-[#F0F2F5] pt-2.5">
        <div className="text-[13px] text-[#364658]"><span className="text-[15px] font-semibold">{count}</span> of {ADMIN_CIS.length} CIs</div>
        <div className="mt-0.5 text-[12px] text-[#7B8FA5]">{sub}</div>
        <button onClick={onClick} className={`${btnSecondary} mt-2.5`}>{cta}</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Card
          icon={<UserPlus size={16} />}
          title="Add CIs by hand"
          badge="Fixed"
          desc="Pick specific enrolled CIs. The list stays fixed — new CIs are not added automatically."
          count={value.ciIds.length}
          sub={value.ciIds.length ? `${value.ciIds.length} chosen` : 'No CIs chosen yet'}
          cta="Choose CIs"
          onClick={() => setChooseOpen(true)}
        />
        <Card
          icon={<Filter size={16} />}
          title="Auto-include by condition"
          badge="Dynamic"
          desc={dynamicCopy}
          count={matched.length}
          sub={completeGroups ? `${completeGroups} condition group${completeGroups === 1 ? '' : 's'}` : 'No conditions built yet'}
          cta="Build conditions"
          onClick={() => setCondOpen(true)}
        />
      </div>

      <ChooseCisDrawer
        isOpen={chooseOpen}
        onClose={() => setChooseOpen(false)}
        selected={value.ciIds}
        onApply={(ids) => onChange({ ...value, ciIds: ids })}
      />
      <ConditionsDrawer
        isOpen={condOpen}
        onClose={() => setCondOpen(false)}
        value={value}
        onApply={(groups, on) => onChange({ ...value, groups, conditionsOn: on })}
      />
    </>
  );
}
