import { ArrowUpDown, Clock } from 'lucide-react';
import type { Ticket } from './TicketListPage';
import { StatusBadge } from './StatusBadge';
import { PriorityBar } from './PriorityBar';

interface TicketTableProps {
  tickets: Ticket[];
  selectedTickets: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectTicket: (ticketId: string, checked: boolean) => void;
  onSort: (column: keyof Ticket) => void;
  sortColumn: keyof Ticket | null;
  sortDirection: 'asc' | 'desc';
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketTable({
  tickets,
  selectedTickets,
  allSelected,
  onSelectAll,
  onSelectTicket,
  onSort,
  sortColumn,
  sortDirection,
  onTicketClick
}: TicketTableProps) {
  const formatDateTime = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${day}/${month}/${year} ${hours}:${minutes} PM`;
  };

  const SortButton = ({ column, children }: { column: keyof Ticket; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-[#3D8BD0]"
    >
      {children}
      <ArrowUpDown
        size={12}
        className={sortColumn === column ? 'text-[#3D8BD0]' : 'text-[#9ca3af]'}
      />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px]">
        <thead className="border-b border-[#e5e7eb]">
          <tr className="bg-white">
            <th className="w-[40px] px-4 py-2.5 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
              />
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658]  tracking-wider">
              <span className="whitespace-nowrap">ID</span>
            </th>
            <th className="min-w-[280px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658]  tracking-wider">
              <span className="whitespace-nowrap">Subject</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658]  tracking-wider">
              <span className="whitespace-nowrap">Requester</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658]  tracking-wider"><span className="whitespace-nowrap">Due By Status</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Due By</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Created Date</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Assigned to</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Status</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Priority</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="group hover:bg-[#f9fafb] transition-colors cursor-pointer"
              onClick={() => onTicketClick(ticket)}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedTickets.has(ticket.id)}
                  onChange={(e) => onSelectTicket(ticket.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>
              <td className="px-4 py-3">
                <span 
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTicketClick(ticket);
                  }}
                >
                  {ticket.id}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <span className="max-w-[350px] truncate font-medium inline-block">{ticket.subject}</span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658] whitespace-nowrap">{ticket.requester}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-[#364658]" />
                  <span className="text-[12px] text-[#364658]">18h 1m</span>
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] text-[#364658]">{formatDateTime(ticket.dueBy)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] text-[#364658]">{formatDateTime(ticket.createdBy)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-[#3D8BD0] text-[10px] font-medium text-white">
                    {ticket.assignedTo.initials}
                  </span>
                  <span className="text-[12px] text-[#364658]">{ticket.assignedTo.name}</span>
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBar priority={ticket.priority} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}