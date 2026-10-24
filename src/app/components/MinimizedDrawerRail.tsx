import { ChevronLeft } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface MinimizedItem { id: string; subject?: string }

/**
 * Thin right-edge rail shown when a detail drawer is minimized (DevRev-style).
 * Stays narrow so the top-right profile icon remains visible; widens slightly on
 * hover. The expand handle restores the drawer; when several items are open they
 * stack as compact vertical chips (active highlighted) — clicking one restores
 * the drawer to that item. While minimized, the list page behind stays usable.
 */
export function MinimizedDrawerRail({
  items,
  activeId,
  onSelect,
  onRestore,
}: {
  items: MinimizedItem[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onRestore: () => void;
}) {
  const MAX = 8;
  const shown = items.slice(0, MAX);
  const overflow = items.length - shown.length;

  return (
    <div
      onClick={onRestore}
      title="Expand panel"
      className="group fixed right-0 top-0 h-screen w-7 hover:w-9 bg-white border-l border-[#e5e7eb] z-50 flex flex-col items-center transition-[width] duration-200 cursor-pointer"
      style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.06)' }}
      data-drawer-minimized
    >
      {/* Expand handle */}
      <span className="w-full py-3 flex items-center justify-center text-[#9ca3af] group-hover:text-[#3D8BD0] transition-colors flex-shrink-0 border-b border-[#f0f2f5]">
        <ChevronLeft size={16} />
      </span>

      {/* Open items (stacked vertical chips) */}
      <div className="flex-1 w-full flex flex-col items-center justify-start gap-1 py-3 overflow-y-auto">
        {shown.map((it) => {
          const active = it.id === activeId;
          return (
            <Tooltip key={it.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(it.id); }}
                  className={`w-[calc(100%-8px)] mx-auto flex items-center justify-center py-2 rounded-sm transition-colors ${active ? 'bg-[#EAF2FB]' : 'hover:bg-[#f3f4f6]'}`}
                >
                  <span
                    className={`[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold tracking-wide truncate transition-colors ${active ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`}
                    style={{ maxHeight: '32vh' }}
                  >
                    {it.id}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[280px]">
                <span className="font-semibold">{it.id}</span>{it.subject ? ` — ${it.subject}` : ''}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {overflow > 0 && (
          <span className="mt-1 text-[10px] font-medium text-[#9ca3af]" title={`${overflow} more`}>+{overflow}</span>
        )}
      </div>
    </div>
  );
}
