import { ArrowUpDown, Circle } from 'lucide-react';
import type { Change } from './ChangeListPage';
import { ChangeStatusBadge } from './ChangeStatusBadge';
import { ChangePriorityBadge } from './ChangePriorityBadge';

interface ChangeTableProps {
  changes: Change[];
  selectedChanges: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectChange: (changeId: string, checked: boolean) => void;
  onSort: (column: keyof Change) => void;
  sortColumn: keyof Change | null;
  sortDirection: 'asc' | 'desc';
  onChangeClick: (change: Change) => void;
}

export function ChangeTable({
  changes,
  selectedChanges,
  allSelected,
  onSelectAll,
  onSelectChange,
  onSort,
  sortColumn,
  sortDirection,
  onChangeClick,
}: ChangeTableProps) {
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

  const SortButton = ({ column, children }: { column: keyof Change; children: React.ReactNode }) => (
    <button onClick={() => onSort(column)} className="flex items-center gap-1 hover:text-[#3D8BD0]">
      {children}
      <ArrowUpDown size={12} className={sortColumn === column ? 'text-[#3D8BD0]' : 'text-[#9ca3af]'} />
    </button>
  );

  const riskColor = (risk: Change['changeRisk']) =>
    risk === 'High' ? 'text-[#ef4444]' : risk === 'Medium' ? 'text-[#fb923c]' : 'text-[#22c55e]';

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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Created Date</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Assignee</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Status</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Priority</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Change Type</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Change Risk</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {changes.map((change) => (
            <tr
              key={change.id}
              className="group hover:bg-[#f9fafb] transition-colors cursor-pointer"
              onClick={() => onChangeClick(change)}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedChanges.has(change.id)}
                  onChange={(e) => onSelectChange(change.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>
              <td className="px-4 py-3">
                <span
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeClick(change);
                  }}
                >
                  {change.id}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <span className="max-w-[350px] truncate font-medium inline-block">{change.subject}</span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658] whitespace-nowrap">{change.requester}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] text-[#364658]">{formatDateTime(change.createdDate)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium text-white"
                    style={{ backgroundColor: change.assignee.color }}
                  >
                    {change.assignee.initials}
                  </span>
                  <span className="text-[12px] text-[#364658]">{change.assignee.name}</span>
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <ChangeStatusBadge status={change.status} />
              </td>
              <td className="px-4 py-3">
                <ChangePriorityBadge priority={change.priority} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {change.changeType ? (
                  <span className="text-[12px] text-[#364658]">{change.changeType}</span>
                ) : (
                  <span className="text-[12px] text-[#9ca3af]">---</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {change.changeRisk ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Circle size={8} className={riskColor(change.changeRisk)} fill="currentColor" />
                    <span className="text-[12px] text-[#6b7280]">{change.changeRisk}</span>
                  </span>
                ) : (
                  <span className="text-[12px] text-[#9ca3af]">---</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
