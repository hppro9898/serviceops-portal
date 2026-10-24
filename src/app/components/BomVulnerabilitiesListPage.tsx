import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, ChevronDown, Check, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { SeverityPill } from './SoftwareComponentsTable';
import { ListActions } from './SoftwareComponentsKpis';
import type { BomSeverity } from './bomData';
import { useProductsVersion } from './bomProductsData';
import { bomVulnerabilities } from './bomVulnerabilitiesData';
import type { BomVulnerability } from './bomVulnerabilitiesData';

/* BOM Vulnerabilities listing — one row per vulnerability ID found in the applications' current
 * SBOMs. The rows and the detail page read the same bomVulnerabilities(), so a count on the row
 * is always the count of rows behind it. */

type SevFilter = '' | BomSeverity;
const SEV_OPTIONS: BomSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
const SEV_DOT: Record<BomSeverity, string> = { Critical: '#EF4444', High: '#F59E0B', Medium: '#EAB308', Low: '#98A2B3' };

const Dash = () => <span className="text-[12px] text-[#9ca3af]">—</span>;

/** One dropdown shape for every filter, so they cannot drift apart. */
function FilterDropdown<T extends string>({ value, onChange, options, allLabel, icon }: {
  value: T | '';
  onChange: (v: T | '') => void;
  options: { id: T; label: string; count: number; dot?: string }[];
  allLabel: { label: string; count: number };
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const current = options.find((o) => o.id === value);
  const rows: { id: T | ''; label: string; count: number; dot?: string }[] = [{ id: '', ...allLabel }, ...options];
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-[34px] items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
          value ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
        }`}
      >
        {current?.dot ? <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: current.dot }} />
          : <span className={value ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}>{icon}</span>}
        {current ? current.label : allLabel.label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''} ${value ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[250px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
          {rows.map((o) => (
            <button
              key={o.id || 'all'}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] text-[#364658] transition-colors ${
                value === o.id ? 'bg-[#F1F5F9]' : 'hover:bg-[#F9FAFB]'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {o.dot && <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: o.dot }} />}
                <span className="truncate">{o.label}</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-2">
                <span className="text-[12px] text-[#7B8FA5]">{o.count}</span>
                {value === o.id && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
function downloadCsv(rows: BomVulnerability[]) {
  const head = ['CVE ID', 'Description', 'Severity', 'CWE ID', 'Components', 'Applications', 'Impacted Endpoints', 'Patch Availability', 'CVSS 3.1 Score', 'Exploit Status', 'Vulnerability Type', 'Published Date'];
  const body = rows.map((r) => [
    r.id, r.adv?.title ?? '', r.severity ?? '', r.adv?.cwe ?? '', r.components.map((c) => `${c.name}@${c.version}`).join('; '),
    r.apps.length, r.endpoints.length, r.fixAvailable ? 'Yes' : 'No', r.adv?.cvss ?? '', r.adv?.kev ? 'Yes' : 'No', r.vulnTypes.join('; '), r.adv?.published ?? '',
  ].map(csvCell).join(','));
  const blob = new Blob([[head.map(csvCell).join(','), ...body].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bom-vulnerabilities.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

const TH = 'px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider whitespace-nowrap';
const TD = 'px-4 py-3 text-[12px] text-[#364658]';

export function BomVulnerabilitiesListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const productsVersion = useProductsVersion();
  const [refreshKey, setRefreshKey] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ALL = useMemo(bomVulnerabilities, [productsVersion, refreshKey]);
  const [sev, setSev] = useState<SevFilter>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { open: openInStack } = useDrawerStack();

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sev]);

  /* Search narrows first; the severity options count within the search, so each says how many
     rows it would show. */
  const q = searchQuery.trim().toLowerCase();
  const bySearch = !q ? ALL : ALL.filter((r) =>
    [r.id, r.adv?.title ?? '', r.adv?.cwe ?? '', ...r.components.map((c) => `${c.name} ${c.version}`), ...r.apps.map((p) => `${p.id} ${p.name}`)]
      .join(' ').toLowerCase().includes(q));
  const passSev = (r: BomVulnerability) => !sev || r.severity === sev;
  const filtered = bySearch.filter(passSev);
  const forSev = bySearch;
  const nFilters = sev ? 1 : 0;

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const openRow = (r: BomVulnerability) => openInStack('bom-vulnerabilities', r.id, r.adv?.title ?? r.id, { id: r.id });

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="bom-vulnerabilities" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate('admin')} />
        <div className="flex items-center bg-white px-6 pb-2 pt-3">
          <h1 className="text-[16px] font-semibold text-[#364658]">Vulnerabilities</h1>
        </div>
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <div className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-[#E5E7EB] bg-white px-6 pb-3 pt-3">
              <div className="relative flex flex-1 items-center rounded border border-[#d1d5db] bg-white pl-2 pr-10 focus-within:border-[#3D8BD0] focus-within:ring-1 focus-within:ring-[#3D8BD0]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search CVE ID, description, CWE ID, component or application..."
                  className="h-[34px] min-w-0 flex-1 bg-transparent text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:outline-none"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#364658]"><X size={16} /></button>
                ) : (
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
                )}
              </div>
              <FilterDropdown<BomSeverity>
                value={sev} onChange={setSev} icon={<ShieldAlert size={14} />}
                allLabel={{ label: 'All severities', count: forSev.length }}
                options={SEV_OPTIONS.map((s) => ({ id: s, label: s, dot: SEV_DOT[s], count: forSev.filter((r) => r.severity === s).length }))}
              />
              <ListActions onDownload={() => downloadCsv(filtered)} onRefresh={() => setRefreshKey((k) => k + 1)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px]">
                <thead className="border-b border-[#e5e7eb]">
                  <tr className="bg-white">
                    {[['CVE ID', 'min-w-[150px]'], ['Description', 'min-w-[320px]'], ['Severity', 'min-w-[110px]'], ['CWE ID', ''],
                      ['Components', 'min-w-[200px]'], ['Applications', ''], ['Impacted Endpoints', ''], ['Patch Availability', ''],
                      ['CVSS 3.1 Score', ''], ['Exploit Status', ''], ['Vulnerability Type', ''], ['Published Date', 'min-w-[110px]']]
                      .map(([h, cls]) => <th key={h} className={`${cls} ${TH}`}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] bg-white">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={12} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                      {ALL.length === 0 ? 'No vulnerabilities found in the applications in BOM scope.' : (
                        <>No vulnerabilities match.{' '}
                          <button onClick={() => { setSearchQuery(''); setSev(''); }} className="text-[13px] font-medium text-[#3D8BD0] hover:underline">
                            {nFilters ? 'Clear filters' : 'Clear search'}
                          </button>
                        </>
                      )}
                    </td></tr>
                  ) : paginated.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => openRow(r)}
                          className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]">{r.id}</button>
                      </td>
                      <td className={TD}>
                        <button onClick={() => openRow(r)} title={r.adv?.description}
                          className="line-clamp-2 max-w-[420px] text-left text-[12px] font-medium text-[#364658] transition-colors hover:text-[#3D8BD0]">
                          {r.adv?.title ?? 'No description reported'}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.severity ? <SeverityPill severity={r.severity} /> : <span className="text-[12px] text-[#9CA3AF]">Not rated</span>}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.adv?.cwe ?? <Dash />}</td>
                      <td className={`${TD} whitespace-nowrap`}>
                        <span className="font-medium">{r.components[0].name}</span> <span className="text-[#7B8FA5]">{r.components[0].version}</span>
                        {r.components.length > 1 && (
                          <span className="ml-1.5 rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] text-[#475467]"
                                title={r.components.slice(1).map((c) => `${c.name} ${c.version}`).join('\n')}>+{r.components.length - 1}</span>
                        )}
                      </td>
                      <td className={`${TD} whitespace-nowrap`}>{r.apps.length}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.endpoints.length}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.fixAvailable ? <span className="font-medium text-[#22A06B]">Yes</span> : <span className="text-[#64748B]">No</span>}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.adv?.cvss != null ? r.adv.cvss.toFixed(1) : <Dash />}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.adv?.kev ? <span className="font-medium text-[#B42318]">Yes</span> : <span className="text-[#64748B]">No</span>}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.vulnTypes.join(', ')}</td>
                      <td className={`${TD} whitespace-nowrap`}>{r.adv?.published ?? <Dash />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
