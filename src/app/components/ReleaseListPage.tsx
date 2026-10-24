import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ReleaseToolbar } from './ReleaseToolbar';
import { ReleaseTable } from './ReleaseTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { ReleaseDrawer } from './ReleaseDrawer';

export interface Release {
  id: string;
  subject: string;
  requester: string;
  createdDate: Date;
  assignee: { name: string; initials: string; color: string };
  status:
    | 'Planning: In Progress'
    | 'Submitted: Requested'
    | 'Planning: Cancelled'
    | 'Review: Failed'
    | 'Approval: Pending'
    | 'Deployment: In Progress'
    | 'Build: In Progress'
    | 'Testing: In Progress'
    | 'Completed: Closed';
  priority: 'P1' | 'P2' | 'High' | 'Medium';
  releaseType: 'Minor' | 'Major' | 'Standard' | 'Significant' | null;
  releaseRisk: 'Low' | 'Medium' | 'High' | null;
}

const UN = { name: 'Unassigned', initials: 'UN', color: '#9CA3AF' };

export const mockReleases: Release[] = [
  { id: 'REL-56', subject: 'ServiceOps platform patch upgrade to v8.7.4.22',              requester: 'Diksha Patel',          createdDate: new Date(2026,5,1,18,16),   assignee: { name: 'Dilip Mehta',        initials: 'DM', color: '#6366F1' }, status: 'Planning: In Progress',   priority: 'High',   releaseType: 'Minor',       releaseRisk: 'Low'   },
  { id: 'REL-55', subject: 'Kubernetes cluster upgrade to v1.29',                         requester: 'Manasvi Shah',           createdDate: new Date(2026,4,29,17,4),   assignee: { name: 'Manasvi Shah',       initials: 'MS', color: '#F97316' }, status: 'Submitted: Requested',    priority: 'Medium', releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-53', subject: 'Production server infrastructure upgrade',                    requester: 'Pavan Mehta',            createdDate: new Date(2026,3,22,11,31),  assignee: { name: 'Pavan Mehta',        initials: 'PM', color: '#10B981' }, status: 'Planning: Cancelled',     priority: 'P1',     releaseType: 'Major',       releaseRisk: 'Low'   },
  { id: 'REL-52', subject: 'Authentication service hotfix rollout',                       requester: 'Saahil Joshi',           createdDate: new Date(2026,1,2,16,6),    assignee: UN,                                                              status: 'Review: Failed',          priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-43', subject: 'Mobile application release v3.2.1',                          requester: 'Sakshi Gupta',           createdDate: new Date(2025,10,25,19,24), assignee: UN,                                                              status: 'Review: Failed',          priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-42', subject: 'Server security patch deployment - Oct 2025',                 requester: 'Ashutosh Kumar',         createdDate: new Date(2025,9,15,12,44),  assignee: UN,                                                              status: 'Approval: Pending',       priority: 'P1',     releaseType: 'Major',       releaseRisk: 'Low'   },
  { id: 'REL-40', subject: 'ESG module latest version deployment',                        requester: 'Shailendra Verma',       createdDate: new Date(2025,9,12,22,44),  assignee: { name: 'Vaibhav Prajapati', initials: 'VP', color: '#A78BFA' }, status: 'Deployment: In Progress', priority: 'P2',     releaseType: 'Minor',       releaseRisk: 'Low'   },
  { id: 'REL-39', subject: 'ESG reporting engine version upgrade',                        requester: 'Sharad Patil',           createdDate: new Date(2025,9,12,22,40),  assignee: UN,                                                              status: 'Approval: Pending',       priority: 'P2',     releaseType: 'Standard',    releaseRisk: 'Low'   },
  { id: 'REL-37', subject: 'Critical patch release for application servers - Sep 2025',   requester: 'Rahul Dev',              createdDate: new Date(2025,8,30,16,4),   assignee: { name: 'Hemal Joshi',        initials: 'HJ', color: '#84CC16' }, status: 'Build: In Progress',      priority: 'P1',     releaseType: 'Major',       releaseRisk: 'Low'   },
  { id: 'REL-36', subject: 'API gateway rate limiting configuration update',              requester: 'Saahil Joshi',           createdDate: new Date(2025,8,1,14,12),   assignee: { name: 'Tabrez Khan',        initials: 'TK', color: '#64748B' }, status: 'Approval: Pending',       priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-35', subject: 'Frontend dashboard performance optimization release',         requester: 'Saahil Joshi',           createdDate: new Date(2025,8,1,14,12),   assignee: { name: 'Hemal Joshi',        initials: 'HJ', color: '#84CC16' }, status: 'Planning: In Progress',   priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-33', subject: 'QA-validated regression fix release - Q3 2025',               requester: 'Sanat Patel',            createdDate: new Date(2025,7,6,17,8),    assignee: { name: 'Hetal Mori',         initials: 'HM', color: '#EC4899' }, status: 'Testing: In Progress',    priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-32', subject: 'CI/CD pipeline integration release build 123',                requester: 'Dewmi Ranathunga',       createdDate: new Date(2025,6,9,11,22),   assignee: { name: 'Jerry Varghese',     initials: 'JV', color: '#14B8A6' }, status: 'Planning: In Progress',   priority: 'P2',     releaseType: 'Minor',       releaseRisk: 'Low'   },
  { id: 'REL-31', subject: 'Motadata ServiceOps New Release 1',                           requester: 'Hetal Mori',             createdDate: new Date(2025,2,11,18,13),  assignee: { name: 'Akshay Patel',       initials: 'AP', color: '#3D8BD0' }, status: 'Approval: Pending',       priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-30', subject: 'Web portal minor update and bug fixes',                       requester: 'Sakshi Joshi',           createdDate: new Date(2025,0,23,15,5),   assignee: { name: 'Mahak Goyal',        initials: 'MG', color: '#F59E0B' }, status: 'Deployment: In Progress', priority: 'P2',     releaseType: 'Minor',       releaseRisk: 'Low'   },
  { id: 'REL-29', subject: 'Analytics service dependency update',                         requester: 'Simran Arora',           createdDate: new Date(2025,0,23,15,0),   assignee: UN,                                                              status: 'Approval: Pending',       priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-27', subject: 'Security patch release for application servers - Nov 2024',   requester: 'Parita Singh',           createdDate: new Date(2024,10,22,14,22), assignee: { name: 'Abhishek Tiwari',    initials: 'AT', color: '#6366F1' }, status: 'Approval: Pending',       priority: 'High',   releaseType: 'Standard',    releaseRisk: 'Medium'},
  { id: 'REL-25', subject: 'Hardware refresh for datacenter rack A',                      requester: 'Akshay Sharma',          createdDate: new Date(2024,10,5,17,27),  assignee: UN,                                                              status: 'Planning: In Progress',   priority: 'P2',     releaseType: null,          releaseRisk: 'Low'   },
  { id: 'REL-24', subject: 'Application release update - Q4 2024',                        requester: 'Akshay Sharma',          createdDate: new Date(2024,10,5,16,23),  assignee: UN,                                                              status: 'Submitted: Requested',    priority: 'P2',     releaseType: 'Significant', releaseRisk: 'Low'   },
  { id: 'REL-23', subject: 'Network configuration release for new office branch',         requester: 'Urja Patel',             createdDate: new Date(2024,10,5,17,21),  assignee: UN,                                                              status: 'Submitted: Requested',    priority: 'P2',     releaseType: 'Standard',    releaseRisk: 'Low'   },
  { id: 'REL-22', subject: 'Smoke test release for staging pipeline validation',          requester: 'Demo User',              createdDate: new Date(2024,9,23,15,3),   assignee: UN,                                                              status: 'Submitted: Requested',    priority: 'P2',     releaseType: 'Standard',    releaseRisk: 'Low'   },
  { id: 'REL-21', subject: 'Load testing framework upgrade to k6',                        requester: 'Nandini Patel',          createdDate: new Date(2024,9,10,10,30),  assignee: UN,                                                              status: 'Planning: In Progress',   priority: 'P2',     releaseType: 'Minor',       releaseRisk: 'Low'   },
  { id: 'REL-20', subject: 'Database backup and recovery validation release',             requester: 'Jay Vegda',              createdDate: new Date(2024,9,1,9,15),    assignee: { name: 'Marco Logan',        initials: 'ML', color: '#64748B' }, status: 'Completed: Closed',       priority: 'P2',     releaseType: 'Standard',    releaseRisk: 'Low'   },
];

export function ReleaseListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [releases] = useState<Release[]>(mockReleases);
  const [selectedReleases, setSelectedReleases] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState<keyof Release | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openReleases, setOpenReleases] = useState<Release[]>([]);
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const { open: openInStack } = useDrawerStack();

  const handleOpenRelease = (release: Release) => {
    openInStack('release', release.id, release.subject, release);
  };

  const handleOpenRelation = (rel: { ticketId: string; subject: string }) => {
    handleOpenRelease({ ...mockReleases[Math.abs([...rel.ticketId].reduce((a, c) => a + c.charCodeAt(0), 0)) % mockReleases.length], id: rel.ticketId, subject: rel.subject });
  };

  const handleCloseDrawer = () => { setOpenReleases([]); setActiveReleaseId(null); };

  const handleCloseTab = (releaseId: string) => {
    const updated = openReleases.filter(r => r.id !== releaseId);
    setOpenReleases(updated);
    if (activeReleaseId === releaseId) {
      setActiveReleaseId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const handleTabChange = (releaseId: string) => setActiveReleaseId(releaseId);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set(releases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(r => r.id));
      setSelectedReleases(ids);
    } else {
      setSelectedReleases(new Set());
    }
  };

  const handleSelectRelease = (releaseId: string, checked: boolean) => {
    const next = new Set(selectedReleases);
    checked ? next.add(releaseId) : next.delete(releaseId);
    setSelectedReleases(next);
  };

  const handleSort = (column: keyof Release) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  let filtered = releases;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = releases.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.requester.toLowerCase().includes(q) ||
      r.assignee.name.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.priority.toLowerCase().includes(q)
    );
  }

  let sorted = [...filtered];
  if (sortColumn) {
    sorted.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];
      if (sortColumn === 'assignee') { aVal = a.assignee.name; bVal = b.assignee.name; }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageIds = paginated.map(r => r.id);
  const allCurrentSelected = currentPageIds.every(id => selectedReleases.has(id)) && currentPageIds.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="release" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selectedReleases.size} />
        <ReleaseToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <ReleaseTable
              releases={paginated}
              selectedReleases={selectedReleases}
              allSelected={allCurrentSelected}
              onSelectAll={handleSelectAll}
              onSelectRelease={handleSelectRelease}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onReleaseClick={handleOpenRelease}
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
        </main>
      </div>
      <ReleaseDrawer
        openReleases={openReleases}
        activeReleaseId={activeReleaseId}
        onClose={handleCloseDrawer}
        onCloseTab={handleCloseTab}
        onTabChange={handleTabChange}
        onOpenRelation={handleOpenRelation}
      />
    </div>
  );
}
