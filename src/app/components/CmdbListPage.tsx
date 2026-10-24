import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AssetsToolbar } from './AssetsToolbar';
import { CmdbTable } from './CmdbTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { CmdbDrawer } from './CmdbDrawer';
import { CmdbTreePanel } from './CmdbTreePanel';
import { nodeById, nodeIdForCiType, subtreeIds } from './cmdbTree';
import { serviceCis, serviceCiRow, agentByCmdbId, newServerRows } from './bomProductsData';

export type CiStatus = 'Operational' | 'Select';

export interface Ci {
  id: string;
  name: string;
  /** small colored dot before the name (agent health); omit for none */
  nameDot?: string;
  ciType: string;
  status: CiStatus;
  hostName: string;
  ipAddress: string;
  /** "Used By" person, or null = --- */
  usedBy: string | null;
  managedByGroup: string;
  managedBy: { name: string; initials?: string; color?: string } | null;
}

const GREEN = '#22C55E';
const YELLOW = '#EAB308';

const RM = { name: 'Rohan Mehta', initials: 'RM', color: '#6366F1' };
const TK = { name: 'Tabrez Khan', initials: 'TK', color: '#3D8BD0' };
const VS = { name: 'Vikram Sethi', initials: 'VS', color: '#10B981' };
const IQ = { name: 'Imran Qureshi', initials: 'IQ', color: '#F59E0B' };
const NR = { name: 'Neha Raje', initials: 'NR', color: '#EC4899' };
const FS = { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' };

export const mockCis: Ci[] = [
  { id: 'CI-907', name: 'Email Service', ciType: 'Base CI', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: null, managedByGroup: 'IT Operations', managedBy: null },
  { id: 'CI-906', name: 'SAP ERP — Production', ciType: 'Application', status: 'Operational', hostName: 'SAP-PRD-APP', ipAddress: '10.20.50.11', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: VS },
  { id: 'CI-905', name: 'MacBook Pro 16" — Design', nameDot: GREEN, ciType: 'Mac Laptop', status: 'Operational', hostName: 'DSGN-MAC-0041', ipAddress: '10.20.18.41', usedBy: 'Aarav Sharma', managedByGroup: 'End User Computing', managedBy: RM },
  { id: 'CI-904', name: 'DC1-APP-01 — Application Server', ciType: 'Server', status: 'Operational', hostName: 'DC1-APP-01', ipAddress: '10.20.40.21', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: IQ },
  { id: 'CI-891', name: 'Core Switch — DC1', ciType: 'Switch', status: 'Operational', hostName: 'DC1-SW-CORE-01', ipAddress: '10.20.40.2', usedBy: null, managedByGroup: 'Network Team', managedBy: IQ },
  { id: 'CI-890', name: 'Distribution Switch — HQ Floor 2', ciType: 'Switch', status: 'Operational', hostName: 'HQ-SW-DIST-02', ipAddress: '10.20.30.2', usedBy: null, managedByGroup: 'Network Team', managedBy: IQ },
  { id: 'CI-409', name: 'Salesforce CRM', ciType: 'Application', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: null, managedByGroup: 'IT Operations', managedBy: null },
  { id: 'CI-659', name: 'MacBook Air 13" — Marketing', nameDot: GREEN, ciType: 'Mac Laptop', status: 'Operational', hostName: 'MKT-MAC-0067', ipAddress: '10.20.18.67', usedBy: 'Diya Kapoor', managedByGroup: 'End User Computing', managedBy: RM },
  { id: 'CI-888', name: 'Dell Latitude 7440 — Finance', nameDot: YELLOW, ciType: 'Windows Laptop', status: 'Operational', hostName: 'FIN-LT-0188', ipAddress: '10.20.22.188', usedBy: 'Priya Nair', managedByGroup: 'End User Computing', managedBy: TK },
  { id: 'CI-722', name: 'HP EliteBook 840 G10 — Sales', nameDot: GREEN, ciType: 'Windows Laptop', status: 'Operational', hostName: 'SAL-LT-0204', ipAddress: '10.20.23.204', usedBy: 'Ananya Iyer', managedByGroup: 'IT Operations', managedBy: TK },
  { id: 'CI-883', name: 'DC1-DB-PROD-01 — Database Server', ciType: 'Server', status: 'Operational', hostName: 'DC1-DB-01', ipAddress: '10.20.40.33', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: VS },
  { id: 'CI-406', name: 'Online Banking Portal', ciType: 'Base CI', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: null },
  { id: 'CI-664', name: 'FortiGate Firewall — HQ Edge', ciType: 'Hardware', status: 'Operational', hostName: 'HQ-FW-EDGE-01', ipAddress: '10.20.30.1', usedBy: null, managedByGroup: 'Network Team', managedBy: IQ },
  { id: 'CI-686', name: 'Backup NAS — DC1', ciType: 'Server', status: 'Operational', hostName: 'DC1-NAS-01', ipAddress: '10.20.40.50', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: VS },
  { id: 'CI-238', name: 'Payroll Service', ciType: 'Base CI', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: null, managedByGroup: 'IT Operations', managedBy: null },
  { id: 'CI-687', name: 'HP LaserJet Pro M404dn — Floor 2', ciType: 'Hardware', status: 'Select', hostName: 'OFC-PRT-0207', ipAddress: '10.20.30.207', usedBy: null, managedByGroup: 'IT Operations', managedBy: null },
  { id: 'CI-778', name: 'Lenovo ThinkPad T14 — Support', nameDot: YELLOW, ciType: 'Windows Laptop', status: 'Operational', hostName: 'SUP-LT-0108', ipAddress: '10.20.24.108', usedBy: 'Rahul Verma', managedByGroup: 'IT Operations', managedBy: NR },
  { id: 'CI-662', name: 'Dell OptiPlex 7010 — Reception', ciType: 'Windows Laptop', status: 'Select', hostName: 'REC-DT-0023', ipAddress: '10.20.21.23', usedBy: null, managedByGroup: 'Service Desk', managedBy: FS },
  { id: 'CI-893', name: 'ThinkPad X1 Carbon — Engineering', nameDot: GREEN, ciType: 'Windows Laptop', status: 'Operational', hostName: 'ENG-LT-0312', ipAddress: '10.20.19.112', usedBy: 'Karan Malhotra', managedByGroup: 'IT Operations', managedBy: NR },
  { id: 'CI-886', name: 'MacBook Pro 14" — Product', nameDot: GREEN, ciType: 'Mac Laptop', status: 'Operational', hostName: 'PRD-MAC-0019', ipAddress: '10.20.18.19', usedBy: 'Siddharth Rao', managedByGroup: 'End User Computing', managedBy: RM },
  { id: 'CI-233', name: 'iPhone 14 Pro — Sales', ciType: 'Mobile Devices', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: 'Ananya Iyer', managedByGroup: 'End User Computing', managedBy: null },
  { id: 'CI-885', name: 'Microsoft Exchange Online', ciType: 'Application', status: 'Operational', hostName: '---', ipAddress: '---', usedBy: null, managedByGroup: 'Datacenter Team', managedBy: VS },
];

const GREEN_DOT = '#22C55E';
const YELLOW_DOT = '#EAB308';

/** The CMDB rows: the seed, the application servers the BOM examples' agents run on, and the
 *  Business / Application Services a BOM product can link to — including any service created
 *  from BOM scope's Add product form, the only CMDB record BOM scope ever creates. */
function buildCmdbRows(): Ci[] {
  const svcs: Ci[] = serviceCis().map(serviceCiRow);
  const servers: Ci[] = newServerRows().map((h) => ({
    id: h.cmdbId, name: h.hostName, nameDot: h.agentOnline ? GREEN_DOT : YELLOW_DOT, ciType: h.deviceType, status: 'Operational',
    hostName: h.hostName, ipAddress: h.ipAddress, usedBy: null, managedByGroup: 'Datacenter Team', managedBy: null,
  }));
  /* An agent machine shows the agent-health dot, wherever it appears. */
  const seed: Ci[] = mockCis.map((c) => {
    const a = agentByCmdbId(c.id);
    return a && !c.nameDot ? { ...c, nameDot: a.agentOnline ? GREEN_DOT : YELLOW_DOT } : c;
  });
  return [...svcs, ...servers, ...seed];
}

export function CmdbListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  /* Built once: the CMDB does not change while the page is open. */
  const [cis] = useState<Ci[]>(buildCmdbRows);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState<keyof Ci | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [openCis, setOpenCis] = useState<Ci[]>([]);
  const [activeCiId, setActiveCiId] = useState<string | null>(null);
  /* Opens on the root, which is every CI — the listing's job before you narrow it. */
  const [treeNode, setTreeNode] = useState('base-ci');

  useEffect(() => { setCurrentPage(1); setSelected(new Set()); }, [searchQuery, treeNode]);

  /* Which tree node each CI hangs off, resolved once. */
  const nodeOf = (c: Ci) => nodeIdForCiType(c.ciType);
  /* A branch counts its whole subtree, which is what selecting it will show. */
  const countFor = (nodeId: string) => {
    const ids = subtreeIds(nodeId);
    return cis.filter((c) => ids.has(nodeOf(c))).length;
  };

  const { open: openInStack } = useDrawerStack();

  const handleOpenCi = (ci: Ci) => {
    openInStack('cmdb', ci.id, ci.name, ci);
  };
  const handleOpenRelation = (rel: { ticketId: string; subject: string }) => {
    handleOpenCi({ ...mockCis[Math.abs([...rel.ticketId].reduce((a, c) => a + c.charCodeAt(0), 0)) % mockCis.length], id: rel.ticketId, name: rel.subject });
  };

  const handleCloseDrawer = () => { setOpenCis([]); setActiveCiId(null); };
  const handleCloseTab = (ciId: string) => {
    const updated = openCis.filter(c => c.id !== ciId);
    setOpenCis(updated);
    if (activeCiId === ciId) setActiveCiId(updated.length > 0 ? updated[updated.length - 1].id : null);
  };
  const handleTabChange = (ciId: string) => setActiveCiId(ciId);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(cis.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(c => c.id)));
    } else {
      setSelected(new Set());
    }
  };
  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };
  const handleSort = (column: keyof Ci) => {
    if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
  };

  /* Tree first, then the text search — the branch is the wider cut, and searching inside a
     branch should stay inside it rather than quietly jumping back to the whole estate. */
  const nodeIds = subtreeIds(treeNode);
  let filtered = cis.filter((c) => nodeIds.has(nodeOf(c)));
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.ciType.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      c.hostName.toLowerCase().includes(q) ||
      c.ipAddress.toLowerCase().includes(q) ||
      (c.usedBy ?? '').toLowerCase().includes(q) ||
      c.managedByGroup.toLowerCase().includes(q)
    );
  }

  let sorted = [...filtered];
  if (sortColumn) {
    sorted.sort((a, b) => {
      const aStr = String(a[sortColumn] ?? '');
      const bStr = String(b[sortColumn] ?? '');
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageIds = paginated.map(c => c.id);
  const allCurrentSelected = currentPageIds.every(id => selected.has(id)) && currentPageIds.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="cmdb" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selected.size} />
        {/* The title follows the tree: the heading has to name what the table is showing,
            or selecting a branch leaves the page claiming to be something it is not. */}
        <AssetsToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title={nodeById(treeNode)?.label ?? 'Base CI'}
          viewLabel={treeNode === 'base-ci' ? 'All CI' : `All ${nodeById(treeNode)?.label ?? 'CI'}`}
        />
        <main className="flex min-h-0 flex-1 overflow-hidden">
          <CmdbTreePanel selectedId={treeNode} onSelect={setTreeNode} countFor={countFor} />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <CmdbTable
              cis={paginated}
              selected={selected}
              allSelected={allCurrentSelected}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onCiClick={handleOpenCi}
            />
          </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sorted.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
            />
          </div>
        </main>
      </div>
      <CmdbDrawer
        openAssets={openCis}
        activeAssetId={activeCiId}
        onClose={handleCloseDrawer}
        onCloseTab={handleCloseTab}
        onTabChange={handleTabChange}
        onOpenRelation={handleOpenRelation}
      />
    </div>
  );
}
