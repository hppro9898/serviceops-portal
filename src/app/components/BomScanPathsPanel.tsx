import { useState, useEffect } from 'react';
import { X, Search, Plus, SquarePen, Trash2, ShieldCheck, Clock, TriangleAlert, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { BomExcludedPaths } from './BomExcludedPaths';
import { BomProductFormPanel } from './BomProductFormPanel';
import type { ProductFormValue } from './BomProductFormPanel';
import { componentCount, OS_PRODUCT_KEY } from './bomData';
import type { BomProduct } from './bomData';

/* Manage scan paths — the host's BOM scan configuration. Which product owns which directory
 * decides which BOM a component lands in, so this is the panel that shapes every other screen.
 * Exclusions are per product (shown in their own column), not host-wide. */

const STATUS_STYLE: Record<BomProduct['status'], { bg: string; text: string; icon: typeof ShieldCheck }> = {
  Scanned: { bg: '#ECFDF3', text: '#22A06B', icon: ShieldCheck },
  Pending: { bg: '#FEF7E6', text: '#D97706', icon: Clock },
  Failed: { bg: '#FEF3F2', text: '#DC2626', icon: TriangleAlert },
};

interface BomScanPathsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  endpointId: string;
  hostName: string;
  products: BomProduct[];
  /** Lets the BOM tab follow along when the default scope changes. */
  onProductsChange?: (products: BomProduct[]) => void;
}

export function BomScanPathsPanel({ isOpen, onClose, endpointId, hostName, products, onProductsChange }: BomScanPathsPanelProps) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<BomProduct[]>(products);
  const [formFor, setFormFor] = useState<{ open: boolean; editing: BomProduct | null }>({ open: false, editing: null });
  // Product key whose delete confirmation is open (null = none).
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Re-seed from the host each time the panel opens (edits are local to the session).
  useEffect(() => {
    if (!isOpen) return;
    setRows(products); setSearch(''); setFormFor({ open: false, editing: null }); setConfirmDelete(null);
  }, [isOpen, endpointId]);

  if (!isOpen) return null;

  const saveProduct = (v: ProductFormValue) => {
    setRows((prev) => {
      const existing = prev.some((r) => r.key === v.key);
      let next: BomProduct[];
      if (existing) {
        next = prev.map((r) => (r.key === v.key
          ? { ...r, name: v.name, version: v.version || null, path: v.path, excludePaths: v.excludePaths }
          : r));
      } else {
        next = [
          {
            key: v.key, name: v.name, version: v.version || null, path: v.path,
            source: 'agent · directory scan', status: 'Pending', lastScan: '—', findings: 0,
            excludePaths: v.excludePaths,
          },
          ...prev,
        ];
      }
      // Only one product can be the default — setting one clears the rest.
      if (v.isDefault) next = next.map((r) => ({ ...r, isDefault: r.key === v.key }));
      else next = next.map((r) => (r.key === v.key ? { ...r, isDefault: false } : r));
      // If nothing is default any more, fall back to the OS scope.
      if (!next.some((r) => r.isDefault)) {
        const fb = next.find((r) => r.key === OS_PRODUCT_KEY) ?? next[0];
        if (fb) fb.isDefault = true;
      }
      return next;
    });
    setFormFor({ open: false, editing: null });
    toast.success(`${v.name} ${formFor.editing ? 'updated' : 'added — it will be scanned on the next agent check-in'}`);
  };

  const removeProduct = (key: string, name: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      if (!next.some((r) => r.isDefault) && next.length) {
        const fb = next.find((r) => r.key === OS_PRODUCT_KEY) ?? next[0];
        fb.isDefault = true;
      }
      return next;
    });
    toast.error(`${name} removed from this host's scan configuration`);
  };

  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) =>
    !q || r.name.toLowerCase().includes(q) || r.path.toLowerCase().includes(q) ||
    r.excludePaths.some((p) => p.toLowerCase().includes(q)));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50">
      <div className="flex h-full w-[1080px] max-w-[96vw] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-[#364658]">Manage scan paths</h3>
            <p className="mt-0.5 font-mono text-[13px] text-[#7B8FA5]">{hostName}</p>
          </div>
          <button onClick={onClose} className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* Search + add product */}
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
              onClick={() => setFormFor({ open: true, editing: null })}
              className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
            >
              <Plus size={15} /> Add product
            </button>
          </div>

          {/* Product path table */}
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                {['Product', 'Ver.', 'Path', 'Excluded Path', 'Source', 'Status', 'Last Scan', 'Actions'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#7B8FA5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {visible.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-[13px] text-[#9CA3AF]">No products match your search.</td></tr>
              ) : visible.map((r) => {
                const s = STATUS_STYLE[r.status];
                const Icon = s.icon;
                const comps = componentCount(endpointId, r.key, 'SBOM');
                return (
                  <tr key={r.key} className="transition-colors hover:bg-[#f9fafb]">
                    <td className="px-3 py-3 text-[13px] font-medium text-[#364658]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="block max-w-[140px] truncate" title={r.name}>{r.name}</span>
                        {r.isDefault && (
                          <span
                            className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm bg-[#E8F4FD] px-1.5 py-0.5 text-[11px] font-medium text-[#3D8BD0]"
                            title="Its versions are shown when the BOM tab opens"
                          ><Star size={10} className="fill-current" />Default</span>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#364658]">{r.version ?? '—'}</td>
                    <td className="px-3 py-3 font-mono text-[13px] text-[#364658]">
                      <span className="block max-w-[150px] truncate" title={r.path}>{r.path}</span>
                    </td>
                    <td className="px-3 py-3"><BomExcludedPaths paths={r.excludePaths} /></td>
                    <td className="px-3 py-3 text-[13px] text-[#7B8FA5]">
                      <span className="block max-w-[110px] truncate" title={r.source}>{r.source}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
                          <Icon size={12} />{r.status}
                        </span>
                        <span className="text-[12px] text-[#9CA3AF]">{r.status === 'Pending' ? '—' : `${comps} comp.`}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-[#364658]">{r.lastScan}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => setFormFor({ open: true, editing: r })}
                          className="flex size-7 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"
                          title="Edit"
                        ><SquarePen size={14} /></button>
                        {/* Deleting a scope drops its whole BOM history, so it confirms in place
                            rather than firing on the first click. */}
                        <span className="relative">
                          <button
                            onClick={() => setConfirmDelete(confirmDelete === r.key ? null : r.key)}
                            disabled={r.key === OS_PRODUCT_KEY}
                            className={`flex size-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#7B8FA5] ${
                              confirmDelete === r.key ? 'bg-[#FEF3F2] text-[#DC2626]' : 'text-[#7B8FA5] hover:bg-[#FEF3F2] hover:text-[#DC2626]'
                            }`}
                            title={r.key === OS_PRODUCT_KEY ? 'The OS scope cannot be removed' : 'Delete'}
                          ><Trash2 size={14} /></button>

                          {confirmDelete === r.key && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setConfirmDelete(null)} />
                              {/* whitespace-normal: the cell is nowrap, which would otherwise
                                  force this onto one line and blow past the drawer edge. */}
                              <div className="absolute right-0 top-full z-50 mt-1 w-[280px] whitespace-normal rounded-lg border border-[#DFE5ED] bg-white p-3 text-left shadow-lg">
                                <p className="text-[13px] font-medium text-[#364658]">Delete {r.name}?</p>
                                <p className="mt-1 text-[12px] text-[#7B8FA5]">
                                  Its scan path and BOM history are removed from this host. Components it
                                  owned roll up to the OS scope on the next scan.
                                </p>
                                <div className="mt-3 flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="inline-flex h-7 items-center rounded border border-[#DFE5ED] bg-white px-2.5 text-[12px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]"
                                  >Cancel</button>
                                  <button
                                    onClick={() => { removeProduct(r.key, r.name); setConfirmDelete(null); }}
                                    className="inline-flex h-7 items-center gap-1.5 rounded bg-[#DC2626] px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#B91C1C]"
                                  ><Trash2 size={12} /> Delete</button>
                                </div>
                              </div>
                            </>
                          )}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      {/* Add / edit form, stacked above this drawer */}
      <BomProductFormPanel
        isOpen={formFor.open}
        onClose={() => setFormFor({ open: false, editing: null })}
        editing={formFor.editing}
        onSave={saveProduct}
      />
    </div>
  );
}
