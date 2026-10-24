import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { TicketTable } from './TicketTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { TicketDrawer } from './TicketDrawer';

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  dueBy: Date;
  createdBy: Date;
  assignedTo: {
    name: string;
    initials: string;
    avatar?: string;
  };
  status: 'Open' | 'In Progress' | 'Completed' | 'Pending' | 'Closed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// Mock data
export const generateMockTickets = (): Ticket[] => {
  const subjects = [
    "Don't you hate me too? it name it that...",
    "Employee Onboarding",
    "My Internet Down",
    "WiFi is not working",
    "Employee Onboarding",
    "Request for Apple MacBook Pro Allocation",
    "Employee Onboarding",
    "help",
    "Employee Onboarding",
    "Laptop charger not working",
    "WiFi is not working",
    "Employee Onboarding",
    "help",
    "Employee Onboarding",
    "My Internet Down",
    "Employee Onboarding",
    "WiFi is not working"
  ];
  
  const requesters = ['Manual', 'Prashant Pandhe', 'Arnav Desai', 'Agnika Mir', 'Ashish'];
  const assignees = [
    { name: 'Amou Desai', initials: 'AD' },
    { name: 'Keetion Dale', initials: 'KD' },
    { name: 'Shreyak Dalal', initials: 'SD' },
    { name: 'Kaison Potai', initials: 'KP' },
    { name: 'Novak Potai', initials: 'NP' },
    { name: 'Rahul Shukla', initials: 'RS' },
    { name: 'Keetion Dale', initials: 'KD' },
    { name: 'Pratik Patial', initials: 'PP' }
  ];
  
  const statuses: Ticket['status'][] = ['Open', 'In Progress', 'Completed', 'Pending', 'Closed'];
  const priorities: Ticket['priority'][] = ['Low', 'Medium', 'High', 'Urgent'];
  
  return Array.from({ length: 65 }, (_, i) => ({
    id: `INC-${String(i + 30).padStart(2, '0')}`,
    subject: subjects[i % subjects.length],
    requester: requesters[i % requesters.length],
    dueBy: new Date(2022, 3, 20 + (i % 10), 2 + (i % 12), 34),
    createdBy: new Date(2022, 3, 19 + (i % 8), 3 + (i % 12), 30),
    assignedTo: assignees[i % assignees.length],
    status: i === 9 ? 'Closed' : (i === 2 ? 'Open' : statuses[i % statuses.length]), // INC-39 (index 9) should be Closed, INC-32 (index 2) should be Open
    priority: priorities[i % priorities.length]
  }));
};

export function TicketListPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [tickets] = useState<Ticket[]>(generateMockTickets());
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Ticket | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const { open: openInStack } = useDrawerStack();

  const handleOpenTicket = (ticket: Ticket) => {
    // INC-33 opens the SECOND design option of the detail page (TicketDrawerV2);
    // every other ticket keeps the existing V1 TicketDrawer.
    openInStack(ticket.id === 'INC-33' ? 'request-v2' : 'request', ticket.id, ticket.subject, ticket);
  };

  const handleCloseDrawer = () => {
    setOpenTickets([]);
    setActiveTicketId(null);
  };

  const handleCloseTab = (ticketId: string) => {
    const newOpenTickets = openTickets.filter(t => t.id !== ticketId);
    setOpenTickets(newOpenTickets);
    
    // If closing active ticket, switch to another tab or close drawer
    if (activeTicketId === ticketId) {
      if (newOpenTickets.length > 0) {
        setActiveTicketId(newOpenTickets[newOpenTickets.length - 1].id);
      } else {
        setActiveTicketId(null);
      }
    }
  };

  const handleTabChange = (ticketId: string) => {
    setActiveTicketId(ticketId);
  };

  // Open a clicked relation (Problem / Change / Release / Asset …) as a new tab in the same drawer.
  const handleOpenRelation = (rel: { ticketId: string; subject: string; status: string; priority: string; assignedTo: { name: string } }) => {
    const mapStatus = (s: string): Ticket['status'] => {
      const v = (s || '').toLowerCase();
      if (v.includes('progress')) return 'In Progress';
      if (v.includes('resolved') || v.includes('complete')) return 'Completed';
      if (v.includes('pending')) return 'Pending';
      if (v.includes('closed')) return 'Closed';
      if (v.includes('cancel')) return 'Cancelled';
      return 'Open';
    };
    const mapPriority = (p: string): Ticket['priority'] => {
      const v = (p || '').toLowerCase();
      if (v.includes('urgent') || v === 'p1') return 'Urgent';
      if (v.includes('high') || v === 'p2') return 'High';
      if (v.includes('low') || v === 'p4') return 'Low';
      return 'Medium';
    };
    const name = rel.assignedTo?.name || 'Unassigned';
    handleOpenTicket({
      id: rel.ticketId,
      subject: rel.subject,
      requester: name,
      dueBy: new Date(),
      createdBy: new Date(),
      assignedTo: { name, initials: name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() },
      status: mapStatus(rel.status),
      priority: mapPriority(rel.priority),
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentTicketIds = new Set(
        tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(t => t.id)
      );
      setSelectedTickets(currentTicketIds);
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSort = (column: keyof Ticket) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter tickets based on search query
  let filteredTickets = tickets;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredTickets = tickets.filter(ticket => {
      // Search by ticket ID
      if (ticket.id.toLowerCase().includes(query)) return true;
      // Search by subject
      if (ticket.subject.toLowerCase().includes(query)) return true;
      // Search by requester
      if (ticket.requester.toLowerCase().includes(query)) return true;
      // Search by assignee name
      if (ticket.assignedTo.name.toLowerCase().includes(query)) return true;
      // Search by status
      if (ticket.status.toLowerCase().includes(query)) return true;
      // Search by priority
      if (ticket.priority.toLowerCase().includes(query)) return true;
      return false;
    });
  }

  // Sort tickets
  let sortedTickets = [...filteredTickets];
  if (sortColumn) {
    sortedTickets.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (sortColumn === 'assignedTo') {
        aVal = (a.assignedTo as any).name;
        bVal = (b.assignedTo as any).name;
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  // Paginate
  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentPageTickets = paginatedTickets.map(t => t.id);
  const allCurrentPageSelected = currentPageTickets.every(id => selectedTickets.has(id)) && currentPageTickets.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="request" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selectedTickets.size} onOpenAdmin={() => onNavigate('admin')} />
        <Toolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <TicketTable
              tickets={paginatedTickets}
              selectedTickets={selectedTickets}
              allSelected={allCurrentPageSelected}
              onSelectAll={handleSelectAll}
              onSelectTicket={handleSelectTicket}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onTicketClick={handleOpenTicket}
            />
            
          </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sortedTickets.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
        </main>
      </div>
      
      <TicketDrawer
        openTickets={openTickets}
        activeTicketId={activeTicketId}
        onClose={handleCloseDrawer}
        onCloseTab={handleCloseTab}
        onTabChange={handleTabChange}
        onOpenRelation={handleOpenRelation}
      />
    </div>
  );
}
export const MOCK_TICKETS: Ticket[] = generateMockTickets();
