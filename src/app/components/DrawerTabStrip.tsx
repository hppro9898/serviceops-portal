import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, User } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface TabItem { id: string; /** Shown instead of `id` where a module addresses the record differently (BOM uses CI ids). Selection and closing still key off `id`. */ displayId?: string; subject?: string; status?: string; priority?: string; technician?: string }

const TAB_W = 170;   // fixed tab width (matches the tab styling below)
const MORE_W = 96;   // approx width reserved for the "More (N)" button

// Colored dots for the tab hover card (matches the relation/impact popups).
const statusDotColor = (st?: string) => {
  const s = (st || '').toLowerCase();
  if (s === 'open' || s === 'pending' || s === 'sent for approval' || s === 'generated') return '#D97706';
  if (s === 'in progress' || s === 'ordered' || s === 'partially received') return '#3D8BD0';
  if (s.includes('resolv') || s.includes('close') || s === 'in use' || s === 'completed' || s === 'operational' || s === 'approved' || s === 'received' || s === 'active') return '#22A06B';
  return '#9CA3AF';
};
const priorityDotColor = (pr?: string) => {
  const p = (pr || '').toLowerCase();
  if (p === 'high' || p === 'p1' || p === 'urgent') return '#DC2626';
  if (p === 'medium' || p === 'p2') return '#D97706';
  if (p === 'low' || p === 'p3' || p === 'p4') return '#22A06B';
  return '#9CA3AF';
};

/**
 * Open-item tab strip for the detail drawers. Measures its own width and shows as
 * many fixed-width tabs as fit; the rest collapse behind a "More (N) ▾" dropdown
 * (floating, absolutely positioned) that sits at the end of the strip. The active
 * item is always kept visible.
 */
export function DrawerTabStrip({
  items,
  activeId,
  onSelect,
  onClose,
}: {
  items: TabItem[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  maxVisible?: number;
}) {
  const [showMore, setShowMore] = useState(false);
  const [maxFit, setMaxFit] = useState(items.length);
  // Drag-to-reorder: the tab being dragged + the tab it's hovering over (drop indicator).
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Drop the dragged tab before the target tab, then broadcast the new full order. The host
  // (DrawerStackProvider) listens for `reorder-drawer-tabs` and reorders the open-item stack, so
  // the order survives drawer swaps without threading a prop through all 14 drawers.
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const ids = items.map((i) => i.id).filter((id) => id !== dragId);
    const at = ids.indexOf(targetId);
    if (at < 0) { setDragId(null); setDragOverId(null); return; }
    ids.splice(at, 0, dragId);
    window.dispatchEvent(new CustomEvent('reorder-drawer-tabs', { detail: { order: ids } }));
    setDragId(null);
    setDragOverId(null);
  };

  // Measure available width → how many tabs fit before we need a "More" dropdown.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      if (items.length * TAB_W <= w) setMaxFit(items.length);
      else setMaxFit(Math.max(1, Math.floor((w - MORE_W) / TAB_W)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false); };
    if (showMore) {
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }
  }, [showMore]);

  let visible = items.slice(0, maxFit);
  let overflow = items.slice(maxFit);
  // Keep the active item visible: if it's hidden, swap it into the last visible slot.
  if (activeId && overflow.some((i) => i.id === activeId) && visible.length > 0) {
    const act = overflow.find((i) => i.id === activeId)!;
    const bumped = visible[visible.length - 1];
    visible = [...visible.slice(0, -1), act];
    overflow = [bumped, ...overflow.filter((i) => i.id !== activeId)];
  }
  const activeInOverflow = overflow.some((i) => i.id === activeId);

  return (
    <div ref={rootRef} className="flex items-center flex-1 min-w-0">
      {visible.map((t) => {
        const active = t.id === activeId;
        return (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <div
                draggable
                onDragStart={(e) => { setDragId(t.id); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); if (dragId && dragId !== t.id) setDragOverId(t.id); }}
                onDragLeave={() => setDragOverId((cur) => (cur === t.id ? null : cur))}
                onDrop={(e) => { e.preventDefault(); handleDrop(t.id); }}
                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                className={`relative flex items-center gap-2 px-4 py-2 border-r border-[#e5e7eb] cursor-pointer flex-shrink-0 w-[170px] transition-opacity ${active ? 'bg-white border-b-2 border-b-[#3D8BD0]' : 'hover:bg-white/50'} ${dragId === t.id ? 'opacity-40' : ''} ${dragOverId === t.id ? 'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-[#3D8BD0] before:rounded-full' : ''}`}
                onClick={() => onSelect(t.id)}
              >
                <span className={`text-[12px] font-semibold whitespace-nowrap ${active ? 'text-[#3D8BD0]' : 'text-[#6b7280]'}`}>{t.displayId ?? t.id}</span>
                <span className="text-[12px] text-[#364658] truncate flex-1">{t.subject}</span>
                <button onClick={(e) => { e.stopPropagation(); onClose(t.id); }} className="p-0.5 hover:bg-[#e5e7eb] rounded">
                  <X size={14} className="text-[#6b7280]" />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" sideOffset={4} hideArrow className="p-0 bg-white text-[#364658] border border-[#E5E7EB] shadow-lg max-w-[280px]">
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded bg-[#e8f4fd] px-1.5 py-0.5 text-[11px] font-semibold text-[#3D8BD0] flex-shrink-0">{t.displayId ?? t.id}</span>
                  <span className="text-[12px] font-medium text-[#364658] truncate">{t.subject}</span>
                </div>
                {(t.technician || t.status || t.priority) && (
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#7B8FA5]">
                    {t.technician && <span className="inline-flex items-center gap-1"><User size={11} />{t.technician}</span>}
                    {t.status && <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ backgroundColor: statusDotColor(t.status) }} />{t.status}</span>}
                    {t.priority && <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ backgroundColor: priorityDotColor(t.priority) }} />{t.priority}</span>}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {overflow.length > 0 && (
        <div className="relative flex-shrink-0 border-r border-[#e5e7eb]" ref={moreRef}>
          <button
            onClick={() => setShowMore((s) => !s)}
            className={`flex items-center gap-1 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${activeInOverflow ? 'text-[#3D8BD0]' : 'text-[#6b7280] hover:text-[#364658]'}`}
          >
            More ({overflow.length})
            <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
          {showMore && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg py-1 min-w-[260px] max-h-[340px] overflow-y-auto z-[9999]">
              {overflow.map((t) => {
                const active = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    onClick={() => { onSelect(t.id); setShowMore(false); }}
                    className={`group/mt flex items-center gap-2 px-3 py-2 cursor-pointer ${active ? 'bg-[#EAF2FB]' : 'hover:bg-[#f9fafb]'}`}
                  >
                    <span className={`text-[12px] font-semibold whitespace-nowrap ${active ? 'text-[#3D8BD0]' : 'text-[#6b7280]'}`}>{t.displayId ?? t.id}</span>
                    <span className="text-[12px] text-[#364658] truncate flex-1">{t.subject}</span>
                    <button onClick={(e) => { e.stopPropagation(); onClose(t.id); }} className="p-0.5 hover:bg-[#e5e7eb] rounded opacity-0 group-hover/mt:opacity-100 transition-opacity">
                      <X size={13} className="text-[#6b7280]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
