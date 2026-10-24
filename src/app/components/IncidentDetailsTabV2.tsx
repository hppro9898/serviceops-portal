import { useEffect, useRef, useState } from 'react';
import { X, Plus, Search, Filter, Check } from 'lucide-react';
import {
  statusOptions, priorityOptions, assigneeOptions, techGroupOptions, urgencyOptions, impactOptions,
  categoryOptions, departmentOptions, sourceOptions, locationOptions, vendorOptions, supportLevelOptions,
  projectNameOptions, costCenterOptions, buildingOptions, requestChannelOptions, getFilteredAdditionalFields,
} from './TicketDrawerUtils';
import { DEMO_CUSTOM_FORM_FIELDS } from './demoCustomFields';
import { SystemFieldsRenderer } from './SystemFieldsRenderer';

/* V2-ONLY (Ticket detail page 2nd option, INC-33 / TicketDrawerV2).
 *
 * The "Incident Details" content tab. In V2 the right panel keeps only 7 quick fields
 * (Status / Priority / Assignee / Technician Group / Urgency / Impact / Tags) and has NO
 * Additional Fields accordion — everything moves HERE as a full-width form:
 *   1. Request Fields — the SAME 7 quick fields (shown in BOTH places; the drawer owns their
 *      state, so an edit here updates the right panel instantly and vice versa)
 *   2. Classification — the request fields moved out of the right panel
 *   3. Additional Fields — the built-in form fields + Description + the 50+ grouped custom fields
 *   4. System Fields — the read-only system values (shared SystemFieldsRenderer)
 * Field option lists are imported from TicketDrawerUtils so V2 stays in sync with V1's data.
 * Moved-field edits are local mock state (prototype behavior, same as the drawers). */

interface IncidentDetailsTabV2Props {
  ticketId?: string;
  // The 7 quick fields — controlled by the drawer so the tab and right panel stay in sync.
  selectedStatus: string; setSelectedStatus: (v: string) => void;
  selectedPriority: string; setSelectedPriority: (v: string) => void;
  selectedAssignee: string; setSelectedAssignee: (v: string) => void;
  selectedTechGroup: string; setSelectedTechGroup: (v: string) => void;
  selectedUrgency: string; setSelectedUrgency: (v: string) => void;
  selectedImpact: string; setSelectedImpact: (v: string) => void;
  tags: string[]; setTags: (tags: string[]) => void;
}

const inputCls = 'w-full px-3 py-2 text-[13px] text-[#364658] border border-[#DFE5ED] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3D8BD0] focus:border-transparent';
const selectCls = `app-select ${inputCls}`;

export function IncidentDetailsTabV2({
  ticketId,
  selectedStatus, setSelectedStatus,
  selectedPriority, setSelectedPriority,
  selectedAssignee, setSelectedAssignee,
  selectedTechGroup, setSelectedTechGroup,
  selectedUrgency, setSelectedUrgency,
  selectedImpact, setSelectedImpact,
  tags, setTags,
}: IncidentDetailsTabV2Props) {
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };
  // Sub-tab pills (Relations-tab design, no counts) are SCROLL ANCHORS, not switches: both
  // sections render in one continuous scroll; clicking a pill smooth-scrolls to its section,
  // and a scroll-spy keeps the active pill in sync while the user scrolls freely.
  const [activeSection, setActiveSection] = useState<'ticket' | 'additional'>('ticket');
  const ticketSecRef = useRef<HTMLDivElement>(null);
  const additionalSecRef = useRef<HTMLDivElement>(null);
  const scrollToSection = (id: 'ticket' | 'additional') => {
    setActiveSection(id);
    (id === 'ticket' ? ticketSecRef : additionalSecRef).current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  // Field search — filters the labels of whichever sub-tab is active.
  const [fieldSearch, setFieldSearch] = useState('');
  const fq = fieldSearch.trim().toLowerCase();
  const matches = (label: string) => !fq || label.toLowerCase().includes(fq);

  // Field filter (same dropdown as the right panel's search row) — unlike the panel's, this one
  // actually filters: Empty/Filled test the field's current value, Required keeps the core set.
  const [fieldFilter, setFieldFilter] = useState<'all' | 'empty' | 'filled' | 'required'>('all');
  const [showFieldFilter, setShowFieldFilter] = useState(false);
  const REQUIRED_FIELDS = ['Status', 'Priority', 'Assignee', 'Technician Group', 'Urgency', 'Impact'];
  const isEmptyVal = (v: string | undefined) => !v || !v.trim() || v.trim() === '---';
  const passesFilter = (label: string, value: string) =>
    fieldFilter === 'empty' ? isEmptyVal(value)
      : fieldFilter === 'filled' ? !isEmptyVal(value)
        : fieldFilter === 'required' ? REQUIRED_FIELDS.includes(label)
          : true;
  /** Search + filter combined — the single gate every field goes through. */
  const show = (label: string, value: string) => matches(label) && passesFilter(label, value);
  // Moved request fields (defaults mirror the V1 drawer's initial state).
  const [vals, setVals] = useState<Record<string, string>>({
    'Category': 'Hardware',
    'Department': 'IT',
    'Source': 'Email',
    'Location': 'New York, NY',
    'Vendor': 'Dell Inc.',
    'Support Level': 'Level 1',
    'Project Name': 'Network Infrastructure',
    'Cost Center': 'CC-1001',
    'Business Unit': 'Motadata',
    'Building': 'Main Office - Building A',
    'Request Channel': 'Portal',
  });
  const val = (label: string, fallback = '') => vals[label] ?? fallback;
  const setVal = (label: string, value: string) => setVals((p) => ({ ...p, [label]: value }));

  // Custom-field edits (fall back to each field's mock default).
  const [customVals, setCustomVals] = useState<Record<string, string>>({});
  const customVal = (label: string, fallback: string) => customVals[label] ?? fallback;
  const [description, setDescription] = useState('');

  /** Externally-controlled select (the 7 quick fields — state lives in the drawer).
   *  Returns null when the field search doesn't match its label. */
  const controlledSelect = (label: string, value: string, onChange: (v: string) => void, options: { label: string; color?: string }[]) => {
    if (!show(label, value)) return null;
    const current = options.find((o) => o.label === value);
    const hasDot = options.some((o) => o.color);
    return (
      <div key={label}>
        <label className="mb-1.5 block text-[13px] text-[#364658]">{label}</label>
        <div className="relative">
          {hasDot && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full" style={{ backgroundColor: current?.color || '#CBD5E1' }} />
          )}
          <select value={value} onChange={(e) => onChange(e.target.value)} className={`${selectCls} ${hasDot ? 'pl-7' : ''}`}>
            {options.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  /** Select with an optional color dot (same look as the Additional-Fields expand popup).
   *  Returns null when the field search doesn't match its label. */
  const selectField = (label: string, options: { label: string; color?: string }[]) => {
    if (!show(label, val(label))) return null;
    const current = options.find((o) => o.label === val(label));
    const hasDot = options.some((o) => o.color);
    return (
      <div key={label}>
        <label className="mb-1.5 block text-[13px] text-[#364658]">{label}</label>
        <div className="relative">
          {hasDot && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full" style={{ backgroundColor: current?.color || '#CBD5E1' }} />
          )}
          <select value={val(label)} onChange={(e) => setVal(label, e.target.value)} className={`${selectCls} ${hasDot ? 'pl-7' : ''}`}>
            {options.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // The 50+ custom fields, grouped by their admin separator (same grouping as the popup).
  // The search + filter drop non-matching fields — and any group left empty loses its header.
  const customGroups: { title: string; fields: typeof DEMO_CUSTOM_FORM_FIELDS }[] = [];
  for (const f of DEMO_CUSTOM_FORM_FIELDS) {
    if (!show(f.label, customVal(f.label, f.value))) continue;
    const last = customGroups[customGroups.length - 1];
    if (!last || last.title !== (f.group || '')) customGroups.push({ title: f.group || '', fields: [f] });
    else last.fields.push(f);
  }

  // System fields surviving the search (getFilteredAdditionalFields filters by label) and the
  // filter: these two rows are the only '---' values; none are user-required.
  const EMPTY_SYSTEM_FIELDS = ['First Response Date', 'Last Approved Date'];
  const sysFields = getFilteredAdditionalFields([], fieldSearch.trim()).filter((f) =>
    fieldFilter === 'empty' ? EMPTY_SYSTEM_FIELDS.includes(f)
      : fieldFilter === 'filled' ? !EMPTY_SYSTEM_FIELDS.includes(f)
        : fieldFilter !== 'required'
  );

  // Per-sub-tab "does anything match" — drives the empty state while searching/filtering.
  const quickVals: Record<string, string> = {
    'Status': selectedStatus, 'Priority': selectedPriority, 'Assignee': selectedAssignee,
    'Technician Group': selectedTechGroup, 'Urgency': selectedUrgency, 'Impact': selectedImpact,
  };
  const valueFor = (label: string) =>
    label === 'Tags' ? tags.join(',') : label === 'Description' ? description : quickVals[label] ?? val(label);
  const TICKET_LABELS = ['Status', 'Priority', 'Assignee', 'Technician Group', 'Urgency', 'Impact', 'Tags', 'Category', 'Department', 'Source', 'Location', 'Vendor', 'Support Level'];
  const ADDITIONAL_LABELS = ['Project Name', 'Cost Center', 'Business Unit', 'Building', 'Request Channel', 'Description'];
  const anyTicketMatch = TICKET_LABELS.some((l) => show(l, valueFor(l))) || sysFields.length > 0;
  const anyAdditionalMatch = ADDITIONAL_LABELS.some((l) => show(l, valueFor(l))) || customGroups.length > 0;

  const noMatches = (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-10 text-center text-[13px] text-[#9CA3AF]">
      No fields match your search or filter.
    </div>
  );

  // Scroll-spy: highlight whichever section the user has scrolled to (the drawer's content
  // area is the nearest scrollable ancestor). 150px threshold ≈ the sticky strip + toolbar.
  useEffect(() => {
    const target = additionalSecRef.current;
    if (!target) return;
    let parent: HTMLElement | null = target.parentElement;
    while (parent && parent.scrollHeight <= parent.clientHeight + 4) parent = parent.parentElement;
    if (!parent) return;
    const scroller = parent;
    const onScroll = () => {
      const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      setActiveSection(offset <= 150 ? 'additional' : 'ticket');
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [anyTicketMatch, anyAdditionalMatch]);

  return (
    // @container: the System Fields rows stack label-over-value when the DRAWER is narrow
    // (container query — responds to the drawer width, not the viewport).
    // NOTE: no space-y on this root — the toolbar is sticky, and Tailwind space-y margins
    // make a sticky child pin shy of its offset (see the sticky gotcha in CLAUDE.md).
    <div className="@container px-6 pb-6" key={ticketId}>
      {/* Toolbar — sub-tab pills left (Relations-tab design, no counts), search + filter right.
          Sticky under the ~48px main tab strip while the field form scrolls (same treatment as
          the Conversation sub-tab row). */}
      <div className="sticky top-[48px] z-30 -mx-6 flex flex-wrap items-center gap-2 bg-white px-6 py-3">
        {([['ticket', 'Request Fields'], ['additional', 'Additional Fields']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={`inline-flex items-center px-2.5 py-1.5 rounded border text-[13px] font-medium transition-colors ${activeSection === id ? 'bg-[#EBF5FF] border-[#3D8BD0] text-[#3D8BD0]' : 'bg-white border-[#DFE5ED] text-[#364658] hover:bg-[#F5F7FA] hover:border-[#3D8BD0]'}`}
          >
            {label}
          </button>
        ))}
        <div className="relative ml-auto w-[280px]">
          <input
            type="text"
            value={fieldSearch}
            onChange={(e) => setFieldSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setFieldSearch(''); e.currentTarget.blur(); } }}
            placeholder="Search fields..."
            className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-9 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {fieldSearch ? (
            <button onClick={() => setFieldSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFieldFilter((v) => !v)}
            className={`flex h-8 w-8 items-center justify-center rounded border transition-colors ${fieldFilter !== 'all' ? 'border-[#3D8BD0] bg-[#F0F8FF]' : 'border-[#DFE5ED] bg-white hover:bg-[#F5F7FA]'}`}
          >
            <Filter size={16} className={fieldFilter !== 'all' ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'} />
          </button>
          {showFieldFilter && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFieldFilter(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                {([['all', 'All fields'], ['empty', 'Empty fields'], ['filled', 'Filled fields'], ['required', 'Required fields']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    className={`flex w-full items-center justify-between px-4 py-2 text-[13px] transition-colors hover:bg-[#F9FAFB] ${fieldFilter === id ? 'text-[#3D8BD0]' : 'text-[#364658]'}`}
                    onClick={() => { setFieldFilter(id); setShowFieldFilter(false); }}
                  >
                    <span>{label}</span>
                    {fieldFilter === id && <Check size={14} className="text-[#3D8BD0]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content — spacing lives HERE (not on the sticky toolbar's parent, see note above) */}
      <div className="space-y-5 pt-2">
      {/* Request Fields — ONE card: the same 7 quick fields as the right panel (drawer-owned
          state, so both stay in sync) PLUS the fields moved out of the panel (Category /
          Department / Source / Location / Vendor / Support Level). Tags spans the full width.
          scroll-mt clears the sticky tab strip + toolbar when a pill anchors here. */}
      {!anyTicketMatch && !anyAdditionalMatch && noMatches}
      {anyTicketMatch && (
      <div ref={ticketSecRef} className="scroll-mt-[112px] rounded-lg border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-[16px] font-semibold text-[#364658]">Request Fields</h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {controlledSelect('Status', selectedStatus, setSelectedStatus, statusOptions)}
          {controlledSelect('Priority', selectedPriority, setSelectedPriority, priorityOptions)}
          {controlledSelect('Assignee', selectedAssignee, setSelectedAssignee, assigneeOptions)}
          {controlledSelect('Technician Group', selectedTechGroup, setSelectedTechGroup, techGroupOptions)}
          {controlledSelect('Urgency', selectedUrgency, setSelectedUrgency, urgencyOptions)}
          {controlledSelect('Impact', selectedImpact, setSelectedImpact, impactOptions)}
          {/* Tags — chip editor, same interaction as the right panel; full-width row right
              under Impact (mirrors the right panel's field order) */}
          {show('Tags', tags.join(',')) && (
          <div className="col-span-2">
            <label className="mb-1.5 block text-[13px] text-[#364658]">Tags</label>
            {/* Clicking anywhere in the box (or "+ Add tag") focuses the inline input, so the
                affordance always leads somewhere: type → Enter/comma commits the chip. */}
            <div
              onClick={() => tagInputRef.current?.focus()}
              className="flex min-h-[38px] cursor-text flex-wrap items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-[#3D8BD0]"
            >
              {tags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2 py-0.5 text-[12px] text-[#364658]">
                  {tag}
                  <button onClick={(e) => { e.stopPropagation(); setTags(tags.filter((_, x) => x !== i)); }} className="text-[#7B8FA5] transition-colors hover:text-[#364658]"><X size={12} /></button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                onBlur={addTag}
                placeholder={tags.length ? '' : 'Add tag...'}
                className="min-w-[90px] flex-1 border-none bg-transparent text-[13px] text-[#364658] outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                onClick={(e) => { e.stopPropagation(); if (tagInput.trim()) addTag(); tagInputRef.current?.focus(); }}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[#3D8BD0] hover:underline"
              ><Plus size={12} /> Add tag</button>
            </div>
          </div>
          )}
          {selectField('Category', categoryOptions)}
          {selectField('Department', departmentOptions)}
          {selectField('Source', sourceOptions)}
          {selectField('Location', locationOptions)}
          {selectField('Vendor', vendorOptions)}
          {selectField('Support Level', supportLevelOptions)}
        </div>

        {/* System Fields — same card, split by a hairline (same separator treatment as the
            Additional Fields card's group sections). Hidden when the search matches none. */}
        {sysFields.length > 0 && (
        <div className="mt-8 border-t border-[#EEF1F4] pt-6">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1E293B]">System Fields</div>
          <SystemFieldsRenderer
            fields={sysFields}
            showMore
            hideShowMore
            twoColumn
            hidePin
            onToggleShowMore={() => {}}
            pinnedFields={[]}
            onTogglePin={() => {}}
          />
        </div>
        )}
      </div>
      )}

      {/* Additional Fields — built-in form fields + Description + grouped custom fields.
          Rendered in the SAME scroll as Request Fields; the pill anchors here. */}
      {anyAdditionalMatch && (
      <div ref={additionalSecRef} className="scroll-mt-[112px] rounded-lg border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-4 text-[16px] font-semibold text-[#364658]">Additional Fields</h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {selectField('Project Name', projectNameOptions)}
          {selectField('Cost Center', costCenterOptions)}
          {show('Business Unit', val('Business Unit')) && (
          <div>
            <label className="mb-1.5 block text-[13px] text-[#364658]">Business Unit</label>
            <input type="text" value={val('Business Unit')} onChange={(e) => setVal('Business Unit', e.target.value)} className={inputCls} />
          </div>
          )}
          {selectField('Building', buildingOptions)}
          {selectField('Request Channel', requestChannelOptions)}
          {show('Description', description) && (
          <div className="col-span-2">
            <label className="mb-1.5 block text-[13px] text-[#364658]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className={`${inputCls} min-h-[84px] resize-y placeholder:text-[#9CA3AF]`}
            />
          </div>
          )}
        </div>

        {customGroups.map((g) => (
          <div key={g.title} className="mt-8 border-t border-[#EEF1F4] pt-6">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1E293B]">{g.title}</div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {g.fields.map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-[13px] text-[#364658]">{f.label}</label>
                  <div className="relative">
                    {f.color && (
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full" style={{ backgroundColor: f.color }} />
                    )}
                    <input
                      type="text"
                      value={customVal(f.label, f.value)}
                      onChange={(e) => setCustomVals((p) => ({ ...p, [f.label]: e.target.value }))}
                      className={`${inputCls} ${f.color ? 'pl-7' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
      </div>
    </div>
  );
}
