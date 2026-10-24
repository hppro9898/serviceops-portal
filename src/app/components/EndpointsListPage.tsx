import { useState, useEffect } from 'react';
import { ChevronDown, X, Search, FileText, Download, RefreshCw, Columns3 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EndpointsTable } from './EndpointsTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import type { Patch } from './PatchesListPage';
import { mockEndpoints } from './endpointsData';
import type { Endpoint } from './endpointsData';

/* One fleet, one definition. `bomData` reads the endpoints from `endpointsData`, so this page
   defining a second copy meant the Configuration Items rows and the BOM records behind them
   could drift apart without anything failing. Re-exported here so existing importers of
   `./EndpointsListPage` keep working. */
export { mockEndpoints } from './endpointsData';
export type { Endpoint } from './endpointsData';

// Toolbar tailored to the Endpoints list (title + view + action icons; no create CTA).
function EndpointsToolbar({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const IconBtn = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <button className="flex h-[30px] w-[30px] items-center justify-center rounded text-[#6b7280] hover:bg-[#f3f4f6]" title={title}>
      {children}
    </button>
  );
  return (
    <div className="bg-white">
      {/* First Row: Title + view dropdown + actions */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-semibold text-[#364658]">Endpoints</h1>
          <button className="flex items-center gap-1 text-[14px] font-medium text-[#364658] hover:text-[#3D8BD0]">
            <span>All Endpoints</span>
            <ChevronDown size={16} className="text-[#6b7280]" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn title="Export"><FileText size={16} /></IconBtn>
          <IconBtn title="Download"><Download size={16} /></IconBtn>
          <IconBtn title="Refresh"><RefreshCw size={16} /></IconBtn>
          <IconBtn title="Columns"><Columns3 size={16} /></IconBtn>
        </div>
      </div>

      {/* Second Row: Full-width Search */}
      <div className="px-6 pb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Select field to search..."
            className="h-[36px] w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658] transition-colors"
            >
              <X size={16} />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Adapt an endpoint onto the Patch shape the cloned EndpointDrawer body expects
 *  (same pattern as the deployment adapter). */
const endpointToPatchShape = (e: Endpoint): Patch => ({
  id: e.id,
  name: e.hostName,
  severity: 'Unspecified',
  releaseDate: '---',
  missingSystem: null,
  installedSystem: null,
  rebootRequired: e.rebootRequired === 'Yes' ? 'Yes' : 'No',
  approvalStatus: 'Approved',
  category: 'Endpoint',
  endpoint: { agentOnline: e.agentOnline, systemHealth: e.systemHealth },
});

export function EndpointsListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [endpoints] = useState<Endpoint[]>(mockEndpoints);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const { open: openInStack } = useDrawerStack();
  const handleOpenEndpoint = (e: Endpoint) => {
    openInStack('endpoints', e.id, e.hostName, endpointToPatchShape(e));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(endpoints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(e => e.id)));
    } else {
      setSelected(new Set());
    }
  };
  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  let filtered = endpoints;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = endpoints.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.hostName.toLowerCase().includes(q) ||
      e.ipAddress.toLowerCase().includes(q) ||
      e.osName.toLowerCase().includes(q) ||
      (e.version ?? '').toLowerCase().includes(q) ||
      (e.remoteOffice ?? '').toLowerCase().includes(q) ||
      (e.systemHealth ?? '').toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageIds = paginated.map(e => e.id);
  const allCurrentSelected = currentPageIds.every(id => selected.has(id)) && currentPageIds.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="endpoints" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selected.size} />
        <EndpointsToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <EndpointsTable
              endpoints={paginated}
              selected={selected}
              allSelected={allCurrentSelected}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onEndpointClick={handleOpenEndpoint}
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
