import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import type { SearchGroup, SearchHit } from './globalSearchData';
import { CURRENT_USER } from './globalSearchData';
import {
  DATE_PRESETS, chipLabel, fieldFor, filterSetFor, optionsFor, activeCount,
} from './globalSearchFilters';
import type { ActiveFilter, FilterField } from './globalSearchFilters';

/* Tier 1 chips, their value pickers, and the Tier 2 "+ Filter" picker.
 *
 * Filters are always shown as belonging to ONE group ("Requests filters"), never as a floating
 * chip that looks like it affects everything — hidden scope is the main way a filter UI misleads.
 */

const POP = 'absolute z-[60] mt-1 rounded-lg border border-[#DFE5ED] bg-white shadow-lg';

/** Dismisses a popup on outside click and on Escape, without stealing Escape from the overlay
 *  when nothing is open. */
function useDismiss(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    };
    // Capture phase so the overlay's own Escape handler does not also fire and close everything.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, close]);
}

// ══ Value picker ═══════════════════════════════════════════════════════════

function ValuePicker({ group, field, values, hits, onChange, onClose }: {
  group: SearchGroup;
  field: FilterField;
  values: string[];
  hits: SearchHit[];
  onChange: (values: string[]) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useDismiss(true, onClose);
  useEffect(() => { requestAnimationFrame(() => inputRef.current?.focus()); }, []);

  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };

  // Each field type gets the control that fits it — one generic text box for everything is how a
  // filter UI stops being usable.
  if (field.kind === 'date') {
    const custom = values.find((v) => v.startsWith('custom:'));
    return (
      <div className={`${POP} left-0 w-[268px] p-1.5`}>
        {DATE_PRESETS.filter((p) => p !== 'Custom range').map((p) => (
          <button
            key={p}
            onClick={() => toggle(p)}
            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[13px] transition-colors ${
              values.includes(p) ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
            }`}
          >
            {p}
            {values.includes(p) && <Check size={14} className="text-[#3D8BD0]" />}
          </button>
        ))}
        <div className="mt-1 border-t border-[#F0F2F5] px-2.5 pb-1 pt-2">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Custom range</div>
          <div className="flex items-center gap-1.5">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 min-w-0 flex-1 rounded border border-[#DFE5ED] px-2 text-[12px] text-[#364658] focus:border-[#3D8BD0] focus:outline-none" />
            <span className="text-[12px] text-[#9CA3AF]">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 min-w-0 flex-1 rounded border border-[#DFE5ED] px-2 text-[12px] text-[#364658] focus:border-[#3D8BD0] focus:outline-none" />
          </div>
          <button
            disabled={!customFrom && !customTo}
            onClick={() => {
              onChange([...values.filter((v) => !v.startsWith('custom:')), `custom:${customFrom}..${customTo}`]);
              onClose();
            }}
            className="mt-2 h-7 w-full rounded bg-[#3D8BD0] text-[12px] font-medium text-white transition-colors hover:bg-[#3479b5] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            {custom ? 'Update range' : 'Apply range'}
          </button>
        </div>
      </div>
    );
  }

  if (field.kind === 'text') {
    return (
      <div className={`${POP} left-0 w-[248px] p-2`}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { onChange([q.trim()]); onClose(); } }}
          placeholder={`${field.label} contains…`}
          className="h-8 w-full rounded border border-[#DFE5ED] px-2.5 text-[13px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-[#3D8BD0] focus:outline-none"
        />
        <button
          disabled={!q.trim()}
          onClick={() => { onChange([q.trim()]); onClose(); }}
          className="mt-2 h-7 w-full rounded bg-[#3D8BD0] text-[12px] font-medium text-white transition-colors hover:bg-[#3479b5] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
        >
          Apply
        </button>
      </div>
    );
  }

  const options = optionsFor(group, field, hits);
  const shown = q ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : options;

  return (
    <div className={`${POP} left-0 w-[248px]`}>
      {options.length > 6 && (
        <div className="border-b border-[#F0F2F5] p-1.5">
          <div className="relative">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={field.kind === 'person' ? 'Search people…' : 'Search…'}
              className="h-7 w-full rounded border border-[#DFE5ED] pl-7 pr-2 text-[12px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-[#3D8BD0] focus:outline-none"
            />
          </div>
        </div>
      )}
      <div className="max-h-[236px] overflow-y-auto p-1.5">
        {shown.map((o) => {
          const on = values.includes(o);
          const isMe = field.kind === 'person' && o === CURRENT_USER.name;
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
                on ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
              }`}
            >
              <span className={`flex size-4 flex-shrink-0 items-center justify-center rounded-[3px] border ${on ? 'border-[#3D8BD0] bg-[#3D8BD0] text-white' : 'border-[#CBD5E1]'}`}>
                {on && <Check size={11} strokeWidth={3} />}
              </span>
              {field.dots?.[o] && <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: field.dots[o] }} />}
              <span className="truncate">{o}{isMe && <span className="ml-1 text-[#7B8FA5]">(Me)</span>}</span>
            </button>
          );
        })}
        {!shown.length && <div className="px-2 py-3 text-center text-[12px] text-[#9CA3AF]">No matching values</div>}
      </div>
      {values.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#F0F2F5] px-2.5 py-1.5">
          <button onClick={() => onChange([])} className="text-[12px] text-[#7B8FA5] transition-colors hover:text-[#DC2626]">Clear</button>
          <button onClick={onClose} className="text-[12px] font-medium text-[#3D8BD0]">Done</button>
        </div>
      )}
    </div>
  );
}

// ══ Tier 2 picker ══════════════════════════════════════════════════════════

const SECTION_LABEL: Record<string, string> = {
  common: 'Common',
  module: 'Module-Specific',
  custom: 'Custom Fields',
};

function Tier2Picker({ group, active, onPick, onClose }: {
  group: SearchGroup;
  active: ActiveFilter[];
  onPick: (fieldId: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useDismiss(true, onClose);
  useEffect(() => { requestAnimationFrame(() => inputRef.current?.focus()); }, []);

  const set = filterSetFor(group);
  const matches = useMemo(() => {
    const all = set?.fields ?? [];
    return q ? all.filter((f) => f.label.toLowerCase().includes(q.toLowerCase())) : all;
  }, [set, q]);

  useEffect(() => { setCursor(0); }, [q]);

  const sections: { key: string; fields: FilterField[] }[] = ['common', 'module', 'custom']
    .map((key) => ({ key, fields: matches.filter((f) => f.section === key) }))
    .filter((s) => s.fields.length);

  // Flat order for keyboard travel, matching the visual order exactly.
  const flat = sections.flatMap((s) => s.fields);

  return (
    <div
      className={`${POP} right-0 w-[288px]`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (flat.length ? (c + 1) % flat.length : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (flat.length ? (c - 1 + flat.length) % flat.length : 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); const f = flat[cursor]; if (f) { onPick(f.id); onClose(); } }
      }}
    >
      <div className="border-b border-[#F0F2F5] p-1.5">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search filters..."
            className="h-7 w-full rounded border border-[#DFE5ED] pl-7 pr-2 text-[12px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-[#3D8BD0] focus:outline-none"
          />
        </div>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1.5">
        {sections.map((s) => (
          <div key={s.key}>
            <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              {SECTION_LABEL[s.key]}
            </div>
            {s.fields.map((f) => {
              const on = active.some((a) => a.fieldId === f.id);
              const i = flat.indexOf(f);
              return (
                <button
                  key={f.id}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => { onPick(f.id); onClose(); }}
                  className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
                    i === cursor ? 'bg-[#EBF5FF]' : 'hover:bg-[#F9FAFB]'
                  } ${on ? 'text-[#3D8BD0]' : 'text-[#364658]'}`}
                >
                  <span className="truncate">{f.label}</span>
                  {on && <Check size={14} className="flex-shrink-0 text-[#3D8BD0]" />}
                </button>
              );
            })}
          </div>
        ))}
        {!flat.length && <div className="px-2 py-4 text-center text-[12px] text-[#9CA3AF]">No filter matches “{q}”</div>}
      </div>
    </div>
  );
}

// ══ Group filter bar ═══════════════════════════════════════════════════════

interface GroupFilterBarProps {
  group: SearchGroup;
  filters: ActiveFilter[];
  /** Every hit in this group BEFORE filtering, so option lists show real values. */
  hits: SearchHit[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onChange: (next: ActiveFilter[], meta?: { fieldId?: string; tier?: 1 | 2; removed?: boolean; cleared?: boolean }) => void;
}

/** The chip row for one group. Collapsed it is a single control; expanded it shows the module's
 *  Tier 1 fields plus "+ Filter". Active chips stay visible either way — a filter you cannot see
 *  is a filter you cannot trust. */
export function GroupFilterBar({ group, filters, hits, expanded, onToggleExpanded, onChange }: GroupFilterBarProps) {
  const [openField, setOpenField] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const set = filterSetFor(group);
  if (!set) return null;

  const active = filters.filter((f) => f.values.length);
  const byId = new Map(filters.map((f) => [f.fieldId, f]));

  // Tier 1 fields, plus any Tier 2 field the user has pulled in.
  const shownIds = [...set.tier1, ...filters.map((f) => f.fieldId).filter((id) => !set.tier1.includes(id))];

  const setValues = (fieldId: string, values: string[]) => {
    const next = [...filters.filter((f) => f.fieldId !== fieldId), ...(values.length ? [{ fieldId, values }] : [])];
    onChange(next, { fieldId, tier: set.tier1.includes(fieldId) ? 1 : 2 });
  };
  const remove = (fieldId: string) => {
    onChange(filters.filter((f) => f.fieldId !== fieldId), { fieldId, removed: true });
  };

  const chip = (fieldId: string, dense: boolean) => {
    const field = fieldFor(group, fieldId);
    if (!field) return null;
    const values = byId.get(fieldId)?.values ?? [];
    const on = values.length > 0;
    return (
      <div key={fieldId} className="relative">
        <div className={`flex items-center rounded border transition-colors ${
          on ? 'border-[#3D8BD0] bg-[#EBF5FF]' : 'border-[#DFE5ED] bg-white hover:border-[#3D8BD0]'
        }`}>
          <button
            title={chipLabel(field, values)}
            onClick={() => setOpenField(openField === fieldId ? null : fieldId)}
            className={`flex max-w-[190px] items-center gap-1 py-0.5 pl-2 text-[12px] ${on ? 'pr-1 font-medium text-[#3D8BD0]' : 'pr-2 text-[#64748B]'}`}
          >
            <span className="truncate">{chipLabel(field, values)}</span>
            {!on && <ChevronDown size={11} className="flex-shrink-0 text-[#9CA3AF]" />}
          </button>
          {on && (
            <button
              aria-label={`Remove ${field.label} filter`}
              onClick={() => remove(fieldId)}
              className="flex size-5 flex-shrink-0 items-center justify-center rounded-r text-[#3D8BD0] transition-colors hover:bg-[#DBEAFE]"
            >
              <X size={11} />
            </button>
          )}
        </div>
        {openField === fieldId && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setOpenField(null)} />
            <ValuePicker
              group={group}
              field={field}
              values={values}
              hits={hits}
              onChange={(v) => setValues(fieldId, v)}
              onClose={() => setOpenField(null)}
            />
          </>
        )}
      </div>
    );
  };

  // Collapsed: only the active chips and the control, so a filtered group always shows why it is
  // filtered without the full field row taking up space.
  if (!expanded) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1.5">
        {active.map((f) => chip(f.fieldId, true))}
        <button
          onClick={onToggleExpanded}
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] transition-colors ${
            active.length ? 'text-[#3D8BD0] hover:bg-[#EBF5FF]' : 'text-[#7B8FA5] hover:bg-[#F3F4F6]'
          }`}
        >
          <SlidersHorizontal size={11} />
          {active.length ? 'Edit filters' : 'Filter'}
        </button>
        {active.length > 0 && (
          <button
            onClick={() => onChange([], { cleared: true })}
            className="rounded px-1.5 py-0.5 text-[12px] text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#DC2626]"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-3 mb-1.5 rounded border border-[#EEF2F6] bg-[#FCFDFE] px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        {/* Scope is stated, never implied — these filters affect this group and nothing else. */}
        <span className="text-[11px] font-medium text-[#7B8FA5]">{group} filters</span>
        <div className="flex items-center gap-1">
          {active.length > 0 && (
            <button
              onClick={() => onChange([], { cleared: true })}
              className="rounded px-1.5 py-0.5 text-[11px] text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#DC2626]"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onToggleExpanded}
            aria-label="Hide filters"
            className="flex size-5 items-center justify-center rounded text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {shownIds.map((id) => chip(id, false))}
        <div className="relative">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1 rounded border border-dashed border-[#CBD5E1] px-2 py-0.5 text-[12px] text-[#64748B] transition-colors hover:border-[#3D8BD0] hover:text-[#3D8BD0]"
          >
            <Plus size={11} /> Filter
          </button>
          {showPicker && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setShowPicker(false)} />
              <Tier2Picker
                group={group}
                active={filters}
                onPick={(fieldId) => {
                  if (!byId.has(fieldId)) onChange([...filters, { fieldId, values: [] }], { fieldId, tier: 2 });
                  // Open its value picker straight away — picking a field is only half the job.
                  setOpenField(fieldId);
                }}
                onClose={() => setShowPicker(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { activeCount };
