import { useState, useEffect } from 'react';
import { ChevronDown, X, Search, Download, RefreshCw, Columns3, MoreVertical, FileOutput } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DetectedCvesTable } from './DetectedCvesTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import type { Patch } from './PatchesListPage';

/* Detected CVEs listing — opened from the Vulnerability sidebar flyout's "Detected CVEs" item.
 * Same grid design as the other list pages; rows are the CVEs found on scanned endpoints. */

export type CveSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DetectedCve {
  id: string;
  description: string;
  severity: CveSeverity;
  cweId: string;
  impactedEndpoints: number;
  patchAvailability: 'Yes' | 'No';
  cvssScore: number;
  exploitStatus: 'Yes' | 'No';
  publishedDate: string;
  status: 'Modified' | 'Analyzed' | 'Awaiting Analysis';
}

// Realistic detected-CVE catalog (mock) — June 2024 Windows Patch-Tuesday style entries.
export const mockDetectedCves: DetectedCve[] = [
  { id: 'CVE-2024-30099', description: 'Windows Kernel Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-367', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30076', description: 'Windows Container Manager Service Elevation of Privilege Vulnerability', severity: 'Medium', cweId: 'CWE-59', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 6.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30063', description: 'Windows Distributed File System (DFS) Remote Code Execution Vulnerability', severity: 'Medium', cweId: 'CWE-641', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 6.7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30085', description: 'Windows Cloud Files Mini Filter Driver Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30094', description: 'Windows Routing and Remote Access Service (RRAS) Remote Code Execution Vulnerability', severity: 'High', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30068', description: 'Windows Kernel Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-125', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 8.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30082', description: 'Win32k Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-416', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30096', description: 'Windows Cryptographic Services Information Disclosure Vulnerability', severity: 'Medium', cweId: 'CWE-200', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 5.5, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30090', description: 'Microsoft Streaming Service Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-822', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30065', description: 'Windows Themes Denial of Service Vulnerability', severity: 'Medium', cweId: 'CWE-59', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 5.5, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30088', description: 'Windows Kernel Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-367', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Analyzed' },
  { id: 'CVE-2024-30091', description: 'Win32k Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-38213', description: 'Windows Mark of the Web Security Feature Bypass Vulnerability', severity: 'Medium', cweId: 'CWE-693', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 6.5, exploitStatus: 'Yes', publishedDate: 'Tue, Aug 13, 2024 11:45 PM', status: 'Analyzed' },
  { id: 'CVE-2024-30067', description: 'Winlogon Elevation of Privilege Vulnerability', severity: 'Medium', cweId: 'CWE-190', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 5.5, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30066', description: 'Winlogon Elevation of Privilege Vulnerability', severity: 'Medium', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 5.5, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30077', description: 'Windows OLE Remote Code Execution Vulnerability', severity: 'High', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30087', description: 'Win32k Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-20', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30095', description: 'Windows Routing and Remote Access Service (RRAS) Remote Code Execution Vulnerability', severity: 'High', cweId: 'CWE-122', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30069', description: 'Windows Remote Access Connection Manager Information Disclosure Vulnerability', severity: 'Medium', cweId: 'CWE-126', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 4.7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30089', description: 'Microsoft Streaming Service Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-416', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30097', description: 'Microsoft Speech Application Programming Interface (SAPI) Remote Code Execution Vulnerability', severity: 'High', cweId: 'CWE-415', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 8.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-35250', description: 'Windows Kernel-Mode Driver Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-822', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:46 PM', status: 'Analyzed' },
  { id: 'CVE-2024-35265', description: 'Windows Perception Service Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-367', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:46 PM', status: 'Modified' },
  { id: 'CVE-2024-30080', description: 'Microsoft Message Queuing (MSMQ) Remote Code Execution Vulnerability', severity: 'Critical', cweId: 'CWE-416', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 9.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-38063', description: 'Windows TCP/IP Remote Code Execution Vulnerability', severity: 'Critical', cweId: 'CWE-191', impactedEndpoints: 2, patchAvailability: 'Yes', cvssScore: 9.8, exploitStatus: 'No', publishedDate: 'Tue, Aug 13, 2024 11:45 PM', status: 'Analyzed' },
  { id: 'CVE-2024-38112', description: 'Windows MSHTML Platform Spoofing Vulnerability', severity: 'High', cweId: 'CWE-668', impactedEndpoints: 1, patchAvailability: 'Yes', cvssScore: 7.5, exploitStatus: 'Yes', publishedDate: 'Tue, Jul 09, 2024 10:45 PM', status: 'Analyzed' },
  { id: 'CVE-2024-30078', description: 'Windows Wi-Fi Driver Remote Code Execution Vulnerability', severity: 'High', cweId: 'CWE-420', impactedEndpoints: 3, patchAvailability: 'Yes', cvssScore: 8.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Modified' },
  { id: 'CVE-2024-30064', description: 'Windows Kernel Elevation of Privilege Vulnerability', severity: 'High', cweId: 'CWE-908', impactedEndpoints: 1, patchAvailability: 'No', cvssScore: 8.8, exploitStatus: 'No', publishedDate: 'Tue, Jun 11, 2024 10:45 PM', status: 'Awaiting Analysis' },
];

// Toolbar tailored to the Detected CVEs list (title + view dropdown + action icons).
function DetectedCvesToolbar({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
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
          <h1 className="text-[16px] font-semibold text-[#364658]">Detected CVEs</h1>
          <button className="flex items-center gap-1 text-[14px] font-medium text-[#364658] hover:text-[#3D8BD0]">
            <span>Detected Vulnerabilities</span>
            <ChevronDown size={16} className="text-[#6b7280]" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn title="Export"><FileOutput size={16} /></IconBtn>
          <IconBtn title="Download"><Download size={16} /></IconBtn>
          <IconBtn title="Refresh"><RefreshCw size={16} /></IconBtn>
          <IconBtn title="Columns"><Columns3 size={16} /></IconBtn>
          <IconBtn title="More"><MoreVertical size={16} /></IconBtn>
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

/** Maps a DetectedCve onto the Patch shape so the cloned DetectedCveDrawer body compiles. */
export const cveToPatchShape = (c: DetectedCve): Patch => ({
  id: c.id,
  name: c.description,
  severity: c.severity === 'High' ? 'Important' : c.severity === 'Medium' ? 'Moderate' : c.severity,
  releaseDate: c.publishedDate,
  missingSystem: c.impactedEndpoints,
  installedSystem: null,
  rebootRequired: 'No',
  approvalStatus: 'Approved',
  category: 'Security Updates',
  // NVD-style long description for the Overview tab, composed from the record's real facts.
  description: `${c.description}. Tracked as ${c.id} (${c.cweId}), this vulnerability was published on ${c.publishedDate} and carries a CVSS 3.1 base score of ${c.cvssScore}. ${c.exploitStatus === 'Yes' ? 'Exploitation in the wild has been reported — remediation should be prioritized.' : 'No in-the-wild exploitation has been reported so far.'} A vendor patch is ${c.patchAvailability === 'Yes' ? 'available and can be deployed through the linked patches' : 'not yet available'}, and ${c.impactedEndpoints} managed endpoint${c.impactedEndpoints === 1 ? ' is' : 's are'} currently impacted.`,
  cve: { severity: c.severity, cweId: c.cweId, cvssScore: c.cvssScore, exploitStatus: c.exploitStatus, patchAvailability: c.patchAvailability, nvdStatus: c.status },
});

export function DetectedCvesListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [cves] = useState<DetectedCve[]>(mockDetectedCves);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const { open: openInStack } = useDrawerStack();
  const handleOpenCve = (c: DetectedCve) => {
    openInStack('detected-cves', c.id, c.description, cveToPatchShape(c));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(cves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(c => c.id)));
    } else {
      setSelected(new Set());
    }
  };
  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  let filtered = cves;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = cves.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.severity.toLowerCase().includes(q) ||
      c.cweId.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      c.publishedDate.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageIds = paginated.map(c => c.id);
  const allCurrentSelected = currentPageIds.every(id => selected.has(id)) && currentPageIds.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="detected-cves" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selected.size} />
        <DetectedCvesToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <DetectedCvesTable
              cves={paginated}
              selected={selected}
              allSelected={allCurrentSelected}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onCveClick={handleOpenCve}
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
