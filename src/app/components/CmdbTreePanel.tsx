import { useMemo, useState } from 'react';
import {
  ChevronRight, Search, X,
  Database, Cpu, Server, Monitor, Laptop, Network, HardDrive, Printer, Smartphone,
  BatteryCharging, Box, Rows3, Building2, Workflow, Boxes, Cloud, CloudCog, AppWindow, Globe,
} from 'lucide-react';
import { CMDB_TREE, flattenTree, pathToNode } from './cmdbTree';
import type { CiTypeNode } from './cmdbTree';

/* The CMDB's CI-type tree, down the left of the listing.
 *
 * Two jobs, deliberately kept apart: the CHEVRON expands a branch, the ROW selects it. A branch
 * that could only be opened by selecting it would force you to change what the table shows just
 * to look at what is underneath — the same trap the admin nav avoids by making a section header
 * expand-only. Here selecting a branch is meaningful (it shows the whole subtree), so the row
 * does both jobs' worth of work and the chevron stays a separate target.
 */

const ICONS: Record<string, typeof Database> = {
  Database, Cpu, Server, Monitor, Laptop, Network, HardDrive, Printer, Smartphone,
  BatteryCharging, Box, Rows3, Building2, Workflow, Boxes, Cloud, CloudCog, AppWindow, Globe,
};

interface CmdbTreePanelProps {
  selectedId: string;
  onSelect: (id: string) => void;
  /** How many CIs sit in each node's subtree — shown on the row so a branch states its weight. */
  countFor: (nodeId: string) => number;
}

export function CmdbTreePanel({ selectedId, onSelect, countFor }: CmdbTreePanelProps) {
  const [query, setQuery] = useState('');
  /* Hardware open by default: it is where the estate actually lives, and a tree that opens
     fully collapsed makes the reader click twice before seeing anything. */
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['base-ci', 'hardware']));

  const q = query.trim().toLowerCase();

  /* Searching reveals rather than filters the tree: a matching leaf is useless without the
     branch it hangs off, so a hit forces its whole ancestry open. */
  const matchIds = useMemo(() => {
    if (!q) return null;
    const hits = flattenTree().filter((n) => n.label.toLowerCase().includes(q));
    const keep = new Set<string>();
    hits.forEach((h) => pathToNode(h.id).forEach((id) => keep.add(id)));
    return keep;
  }, [q]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const Row = ({ node, depth }: { node: CiTypeNode; depth: number }) => {
    if (matchIds && !matchIds.has(node.id)) return null;
    const Icon = ICONS[node.icon] ?? Database;
    const kids = node.children ?? [];
    const hasKids = kids.length > 0;
    // A search result opens its own branch, so the reader sees the match in context.
    const isOpen = matchIds ? true : expanded.has(node.id);
    const isSel = selectedId === node.id;
    const count = countFor(node.id);

    return (
      <>
        <div
          className={`group flex items-center rounded transition-colors ${
            isSel ? 'bg-[#3D8BD0] text-white' : 'text-[#364658] hover:bg-[#F1F5F9]'
          }`}
          style={{ paddingLeft: depth * 14 }}
        >
          {/* Its own target, so opening a branch never changes what the table shows. */}
          {hasKids ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
              aria-label={isOpen ? `Collapse ${node.label}` : `Expand ${node.label}`}
              className={`flex size-6 flex-shrink-0 items-center justify-center rounded transition-colors ${
                isSel ? 'hover:bg-white/20' : 'hover:bg-[#E2E8F0]'
              }`}
            >
              <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="size-6 flex-shrink-0" />
          )}
          <button
            onClick={() => onSelect(node.id)}
            className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left"
          >
            <Icon size={15} className={`flex-shrink-0 ${isSel ? 'text-white' : 'text-[#7B8FA5]'}`} />
            <span className="truncate text-[13px] font-medium">{node.label}</span>
            {/* Zero is worth showing: an empty branch is a real answer, and hiding the number
                there would make the reader wonder whether it failed to load. */}
            <span
              className={`ml-auto flex-shrink-0 rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                isSel ? 'bg-white/25 text-white' : count ? 'bg-[#EEF2F6] text-[#64748B]' : 'text-[#CBD5E1]'
              }`}
            >{count}</span>
          </button>
        </div>
        {hasKids && isOpen && kids.map((c) => <Row key={c.id} node={c} depth={depth + 1} />)}
      </>
    );
  };

  const noMatch = matchIds !== null && matchIds.size === 0;

  return (
    <aside className="flex w-[290px] flex-shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
      <div className="border-b border-[#e5e7eb] p-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-9 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#364658]"
            ><X size={15} /></button>
          ) : (
            <Search size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {noMatch ? (
          <p className="px-2 py-6 text-center text-[13px] text-[#9CA3AF]">No CI type matches “{query}”.</p>
        ) : (
          <Row node={CMDB_TREE} depth={0} />
        )}
      </div>
    </aside>
  );
}
