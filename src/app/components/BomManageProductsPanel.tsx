import { useState, useEffect } from 'react';
import { X, Search, Plus, ChevronRight, ShieldCheck, Clock, TriangleAlert, Check, Pencil, Trash2, Boxes } from 'lucide-react';
import { toast } from 'sonner';
import { BomExcludedPaths } from './BomExcludedPaths';
import { BomProductFormPanel } from './BomProductFormPanel';
import type { ProductFormValue } from './BomProductFormPanel';
import { componentCount } from './bomData';
import type { BomProduct } from './bomData';

/* Manage products — the host's scan configuration, as a collapsed list.
 *
 * It replaces a nine-column table that was already tight at three products and unreadable at
 * forty: every row carried path, exclusions, source, status, last scan and two action buttons at
 * once, so nothing in it was scannable. Here a row is a name and a findings count until you ask
 * for more, and the detail opens underneath it.
 *
 * WHAT IS SHOWN. The agent-discovered scopes are already the whole BOM tab behind this drawer, so
 * repeating all forty here said nothing new twice. They collapse into ONE group, shut by default;
 * what stands open is the short list of scopes somebody declared by hand, which is the only thing
 * this drawer can actually change. Searching opens the group, because a search that silently
 * skipped forty products would be lying about its results.
 *
 * The detail is READ-ONLY by request — no edit, no delete. Adding is the only mutation, and it
 * runs the same BomProductFormPanel flow the previous panel used.
 */

const STATUS_STYLE: Record<BomProduct['status'], { bg: string; text: string; icon: typeof ShieldCheck }> = {
  Scanned: { bg: '#ECFDF3', text: '#22A06B', icon: ShieldCheck },
  Pending: { bg: '#FEF7E6', text: '#D97706', icon: Clock },
  Failed: { bg: '#FEF3F2', text: '#DC2626', icon: TriangleAlert },
};

/** One labelled fact in the expanded detail. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</div>
      <div className="mt-0.5 min-w-0 text-[13px] text-[#364658]">{children}</div>
    </div>
  );
}

/** One product row: collapsed to a name and a findings count, expanding to the detail the old
 *  nine-column table used to show all at once. Module scope, because two lists render it.
 *
 *  Three levels have to stay legible here — group, product, detail. They are separated by INDENT
 *  and by weight, not by colour: the row indents past its group header's chevron, and the detail
 *  hangs off a rule dropped from the row's own chevron. Before that, all three started at the
 *  same x and read as one flat list.
 */
function ProductRow({ r, endpointId, isOpen, onToggle, onEdit, onDelete }: {
  r: BomProduct; endpointId: string; isOpen: boolean; onToggle: (key: string) => void;
  /* Only hand-declared products get these — the agent's list is its own record. */
  onEdit?: (r: BomProduct) => void; onDelete?: (r: BomProduct) => void;
}) {
  const s = STATUS_STYLE[r.status];
  const Icon = s.icon;
  const comps = componentCount(endpointId, r.key, 'SBOM');
  return (
    <div>
      <button
        onClick={() => onToggle(r.key)}
        aria-expanded={isOpen}
        className={`group flex w-full items-center gap-2.5 py-2.5 pl-8 pr-4 text-left transition-colors ${isOpen ? 'bg-[#F9FAFB]' : 'hover:bg-[#F9FAFB]'}`}
      >
        <ChevronRight
          size={14}
          className={`flex-shrink-0 text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#364658]">
          {r.name}
          {r.version && <span className="ml-1.5 font-normal text-[#7B8FA5]">{r.version}</span>}
        </span>
        {/* Edit / Delete, on hover — a row that can be changed says so when you reach for it,
            rather than carrying two buttons down the whole list. */}
        {(onEdit || onDelete) && (
          <span className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <span
                role="button"
                tabIndex={0}
                title={`Edit ${r.name}`}
                onClick={(e) => { e.stopPropagation(); onEdit(r); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); onEdit(r); } }}
                className="flex size-7 cursor-pointer items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#EBF5FF] hover:text-[#3D8BD0]"
              ><Pencil size={14} /></span>
            )}
            {onDelete && (
              <span
                role="button"
                tabIndex={0}
                title={`Delete ${r.name}`}
                onClick={(e) => { e.stopPropagation(); onDelete(r); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); onDelete(r); } }}
                className="flex size-7 cursor-pointer items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#FEF3F2] hover:text-[#DC2626]"
              ><Trash2 size={14} /></span>
            )}
          </span>
        )}
        {/* Scanned is the state every row is in, so it is not stated. Pending and Failed are. */}
        {r.status !== 'Scanned' && (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
            <Icon size={12} />{r.status}
          </span>
        )}
        <span
          className={`inline-flex h-[20px] min-w-[20px] flex-shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
            r.findings > 0 ? 'bg-[#FEF7E6] text-[#D97706]' : 'bg-[#EEF2F6] text-[#94A3B8]'
          }`}
          title={r.findings > 0 ? `${r.findings} vulnerable component${r.findings === 1 ? '' : 's'}` : 'No findings'}
        >{r.findings}</span>
      </button>

      {/* The detail hangs off a rule dropped from this row's chevron, so it reads as belonging to
          THIS row rather than floating inside the group. */}
      {isOpen && (
        <div className="border-t border-[#F0F2F5] bg-[#FCFDFE] py-3">
          <div className="ml-[39px] mr-4 border-l border-[#E5E7EB] pl-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Scan path">
                <span className="block truncate font-mono" title={r.path}>{r.path}</span>
              </Field>
              <Field label="Source">
                <span className="block truncate" title={r.source}>{r.source}</span>
              </Field>
              <Field label="Last scan">{r.lastScan}</Field>
              <Field label="Components">
                {r.status === 'Pending' ? <span className="text-[#9CA3AF]">Not scanned yet</span> : comps.toLocaleString()}
              </Field>
              <div className="col-span-2 min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Excluded paths</div>
                <div className="mt-1"><BomExcludedPaths paths={r.excludePaths} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BomManageProductsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  endpointId: string;
  hostName: string;
  products: BomProduct[];
  /** Lets the BOM tab follow along when a product is added or the default scope moves. */
  onProductsChange?: (products: BomProduct[]) => void;
}

export function BomManageProductsPanel({ isOpen, onClose, endpointId, hostName, products, onProductsChange }: BomManageProductsPanelProps) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<BomProduct[]>(products);
  /* null = closed, a product = editing that one, 'new' = adding. One piece of state, so the
     form cannot be open in two modes at once. */
  const [form, setForm] = useState<BomProduct | 'new' | null>(null);
  /** Which rows are expanded. Everything starts collapsed — the list is the view, not the detail. */
  const [open, setOpen] = useState<Set<string>>(new Set());
  /** The agent-discovered group. Shut by default: the BOM tab behind this drawer is already that
   *  list, and showing it twice is what made the old panel feel like a wall. */
  const [showFound, setShowFound] = useState(false);

  // Re-seed from the host each time the panel opens (edits are local to the session).
  useEffect(() => {
    if (!isOpen) return;
    setRows(products); setSearch(''); setForm(null); setOpen(new Set()); setShowFound(false);
  }, [isOpen, endpointId]);

  if (!isOpen) return null;

  /* One save for both modes. Editing keeps the row's scan history — a change of path or
     excludes does not un-scan what the agent already found. */
  const editing = form !== 'new' ? form : null;
  const saveProduct = (v: ProductFormValue) => {
    const wasEditing = !!editing;
    setRows((prev) => {
      if (editing) {
        return prev.map((r) => (r.key === editing.key
          ? { ...r, key: v.key, name: v.name, version: v.version || null, path: v.path, excludePaths: v.excludePaths }
          : r));
      }
      return [
        {
          key: v.key, name: v.name, version: v.version || null, path: v.path,
          source: 'agent · directory scan', status: 'Pending', lastScan: '—', findings: 0,
          excludePaths: v.excludePaths,
          // Declared here, so it belongs to the list this drawer keeps open.
          addedManually: true,
        },
        ...prev.filter((r) => r.key !== v.key),
      ];
    });
    setForm(null);
    // Opened straight away, so the thing just saved is the thing on screen.
    setOpen((prev) => new Set(prev).add(v.key));
    toast.success(wasEditing
      ? `${v.name} updated`
      : `${v.name} added — it will be scanned on the next agent check-in`);
  };

  /* Staged, not immediate: the drawer's own Cancel is the undo, which is why this asks nothing
     first. Nothing leaves the host until Save changes. */
  const deleteProduct = (r: BomProduct) => {
    setRows((prev) => prev.filter((x) => x.key !== r.key));
    setOpen((prev) => { const n = new Set(prev); n.delete(r.key); return n; });
    toast.success(`${r.name} removed — Save changes to apply it`);
  };

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) =>
    !q || r.name.toLowerCase().includes(q) || r.path.toLowerCase().includes(q) ||
    r.excludePaths.some((p) => p.toLowerCase().includes(q)));

  /* Hand-declared first, then everything the agent found. A search opens the group: results the
     user cannot see are worse than no search at all. */
  const manual = visible.filter((r) => r.addedManually);
  const found = visible.filter((r) => !r.addedManually);
  const foundOpen = showFound || q.length > 0;

  const toggle = (key: string) => setOpen((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50">
      <div className="flex h-full w-[720px] max-w-[96vw] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-[#364658]">Manage products</h3>
            <p className="mt-0.5 font-mono text-[13px] text-[#7B8FA5]">{hostName}</p>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Search + add, above the list */}
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
              />
              {search ? (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
              )}
            </div>
            <button
              onClick={() => setForm('new')}
              className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
            >
              <Plus size={15} /> Add product
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
              <div className="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
                <Boxes size={20} className="text-[#CBD5E1]" />
                <span className="text-[13px] text-[#7B8FA5]">No products match your search.</span>
              </div>
            </div>
          ) : (
            <>
              {/* Declared by hand — the only thing this drawer can change, so it stands open. */}
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-2.5 border-b border-[#F0F2F5] bg-[#FCFDFE] py-2 pl-8 pr-4">
                  {/* One left edge for the heading and the rows under it: the heading used to sit
                      in its own column, which read as a third level that does not exist. The
                      14px chevron slot keeps both groups' labels on that same x. */}
                  <span className="w-3.5 flex-shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Added manually</span>
                  <span className="text-[11px] font-semibold text-[#9CA3AF]">{manual.length}</span>
                </div>
                {manual.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[13px] text-[#7B8FA5]">No products added by hand on this host.</p>
                    <p className="mt-1 text-[12px] text-[#9CA3AF]">
                      Use <span className="font-medium text-[#364658]">Add product</span> to declare a path the agent should scan as its own product.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0F2F5]">
                    {manual.map((r) => (
                      <ProductRow
                        key={r.key} r={r} endpointId={endpointId}
                        isOpen={open.has(r.key)} onToggle={toggle}
                        onEdit={setForm} onDelete={deleteProduct}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Everything the agent found. Shut by default — this exact list is the BOM tab
                  behind the drawer, and repeating it here was the complaint. */}
              {found.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[#E5E7EB]">
                  <button
                    onClick={() => setShowFound((v) => !v)}
                    aria-expanded={foundOpen}
                    className={`flex w-full items-center gap-2.5 py-2 pl-8 pr-4 text-left transition-colors ${foundOpen ? 'bg-[#FCFDFE]' : 'hover:bg-[#F9FAFB]'}`}
                  >
                    <ChevronRight size={14} className={`flex-shrink-0 text-[#9CA3AF] transition-transform ${foundOpen ? 'rotate-90' : ''}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Found by the agent</span>
                    <span className="text-[11px] font-semibold text-[#9CA3AF]">{found.length}</span>
                    <span className="ml-auto text-[11px] text-[#9CA3AF]">
                      {foundOpen ? 'Read-only' : 'Already listed on the BOM tab'}
                    </span>
                  </button>
                  {foundOpen && (
                    <div className="divide-y divide-[#F0F2F5] border-t border-[#F0F2F5]">
                      {found.map((r) => (
                        <ProductRow key={r.key} r={r} endpointId={endpointId} isOpen={open.has(r.key)} onToggle={toggle} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button onClick={onClose} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button
            onClick={() => { onProductsChange?.(rows); toast.success('Scan configuration saved'); onClose(); }}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
          >
            <Check size={15} /> Save changes
          </button>
        </div>
      </div>

      {/* Add / edit form, stacked above this drawer. One mount for both: the form already knew
          how to edit, so a second copy would only be a way for the two to disagree. */}
      <BomProductFormPanel
        isOpen={form !== null}
        onClose={() => setForm(null)}
        editing={editing}
        onSave={saveProduct}
      />
    </div>
  );
}
