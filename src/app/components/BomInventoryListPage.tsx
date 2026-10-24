import { useState, useEffect } from 'react';
import { X, Search, FileText, Download, RefreshCw, Columns3, Upload, Filter } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BomInventoryTable } from './BomInventoryTable';
import type { ProductRow } from './BomInventoryTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { openAddProduct } from './BomProductHost';
import { bomProducts, productBomSummary, useProductsVersion, seatsLeft, BOM_LICENSE_SEATS, isCmdbLicensed, endpointIdOf } from './bomProductsData';
import type { ProductRecord } from './bomProductsData';

/* BOM › Application Services — the BOM module's listing.
 *
 * One row per Application Service in BOM scope, under the name it was added with — typed, or
 * picked from the CMDB. Agent and Ingest entries sit in one list; the Source column says which,
 * the Agent column which agent scans it (Agent only), and CMDB Link the Application Service CI —
 * only when the name was picked from (or created in) the CMDB, and only with a CMDB licence.
 *
 * Technicians can only INGEST here; the Agent flow lives in Admin › BOM Scope. Both open the same
 * shared form. (The file keeps its old name; App routes 'bom' here.) */

/* Predefined filters — the same set Admin › BOM Scope offers. */
type Scope = 'all' | 'Agent' | 'Ingest';
const FILTERS: { key: Scope; label: string; cmdbOnly?: boolean; fn: (p: ProductRecord) => boolean }[] = [
  { key: 'all', label: 'All', fn: () => true },
  { key: 'Agent', label: 'BOM source: Endpoint', fn: (p) => p.source === 'Agent' },
  { key: 'Ingest', label: 'BOM source: Ingest', fn: (p) => p.source === 'Ingest' },
];

/* Technician side: INGEST only. Adding an agent-scanned product is an admin decision (Admin ›
   BOM Management › BOM Scope), so this page offers one action rather than a menu. */
function AddMenu() {
  const left = seatsLeft();
  return (
    <button
      onClick={() => openAddProduct('ingest')}
      disabled={left <= 0}
      title={left <= 0 ? `All ${BOM_LICENSE_SEATS} BOM licences are in use` : `Upload an SBOM for an application · uses 1 BOM licence · ${left} of ${BOM_LICENSE_SEATS} available`}
      className="inline-flex h-[36px] flex-shrink-0 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
    >
      <Upload size={15} /> Ingest BOM
    </button>
  );
}

function FilterMenu({ scope, setScope, counts }: { scope: Scope; setScope: (s: Scope) => void; counts: Record<Scope, number> }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const shown = FILTERS.filter((f) => !f.cmdbOnly || isCmdbLicensed());
  const cur = FILTERS.find((f) => f.key === scope) ?? FILTERS[0];
  return (
    <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-[36px] items-center gap-2 whitespace-nowrap rounded border bg-white px-3 text-[13px] transition-colors hover:bg-[#F5F7FA] ${scope !== 'all' ? 'border-[#3D8BD0] text-[#3D8BD0]' : 'border-[#d1d5db] text-[#364658]'}`}>
        {cur.label}<Filter size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[240px] rounded-lg border border-[#DFE5ED] bg-white p-1 shadow-lg">
          {shown.map((f) => (
            <button key={f.key} onClick={() => { setScope(f.key); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-3 rounded px-2.5 py-2 text-left text-[13px] transition-colors ${scope === f.key ? 'bg-[#EFF6FC] text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F5F7FA]'}`}>
              <span>{f.label}</span><span className="text-[12px] text-[#7B8FA5]">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BomToolbar({ searchQuery, setSearchQuery, scope, setScope, counts }: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  scope: Scope;
  setScope: (s: Scope) => void;
  counts: Record<Scope, number>;
}) {
  /* Two lines: the title, then one row of search · filter · refresh · export · download · columns · Ingest BOM. */
  const BoxBtn = ({ title, children, onClick }: { title: string; children: React.ReactNode; onClick?: () => void }) => (
    <button title={title} onClick={onClick}
      className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded border border-[#d1d5db] bg-white text-[#6b7280] transition-colors hover:bg-[#F5F7FA]">{children}</button>
  );
  return (
    <div className="bg-white px-6 pb-3 pt-3">
      <h1 className="mb-2 text-[16px] font-semibold text-[#364658]">Applications</h1>
      <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Select field to search..."
          className="h-[36px] w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#364658]"><X size={16} /></button>
        ) : (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
        )}
      </div>
      <FilterMenu scope={scope} setScope={setScope} counts={counts} />
      <BoxBtn title="Refresh" onClick={() => setSearchQuery(searchQuery)}><RefreshCw size={15} /></BoxBtn>
      <BoxBtn title="Export"><FileText size={15} /></BoxBtn>
      <BoxBtn title="Download"><Download size={15} /></BoxBtn>
      <BoxBtn title="Columns"><Columns3 size={15} /></BoxBtn>
      <AddMenu />
      </div>
    </div>
  );
}

export function BomInventoryListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useProductsVersion();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');

  useEffect(() => { setCurrentPage(1); setSelected(new Set()); }, [searchQuery, scope]);

  const { open: openInStack } = useDrawerStack();
  const handleOpen = (p: ProductRecord) => openInStack('bom-products', p.id, p.name, p);

  const all: ProductRow[] = bomProducts().map((product) => ({ product, bom: productBomSummary(product) }));
  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, all.filter((r) => f.fn(r.product)).length])) as Record<Scope, number>;
  /* The CMDB filters vanish without a licence — never leave the list filtered by one. */
  const active = FILTERS.find((f) => f.key === scope && (!f.cmdbOnly || isCmdbLicensed())) ?? FILTERS[0];
  const scoped = all.filter((r) => active.fn(r.product));

  const q = searchQuery.trim().toLowerCase();
  const filtered = !q ? scoped : scoped.filter(({ product: p }) =>
    [p.id, p.name, p.publisher, p.version, p.source === 'Agent' ? 'Endpoint' : 'Ingest', p.scanPath ?? '', p.sbomFile ?? '',
      p.agent ? endpointIdOf(p.agent) : '', p.agent?.hostName ?? '', p.linkedCi?.id ?? '', p.linkedCi?.name ?? ''].some((v) => v.toLowerCase().includes(q)));

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageIds = paginated.map((r) => r.product.id);
  const allCurrentSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="bom" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selected.size} onOpenAdmin={() => onNavigate('admin')} />
        <BomToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} scope={scope} setScope={setScope} counts={counts} />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <BomInventoryTable
              rows={paginated}
              selected={selected}
              allSelected={allCurrentSelected}
              onSelectAll={(checked) => setSelected(checked ? new Set(pageIds) : new Set())}
              onSelect={(id, checked) => setSelected((prev) => { const next = new Set(prev); checked ? next.add(id) : next.delete(id); return next; })}
              onOpen={handleOpen}
              emptyText={all.length ? 'No application matches your search.' : 'No application is in BOM scope yet — add one to generate its first BOM.'}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
          />
        </main>
      </div>
    </div>
  );
}
