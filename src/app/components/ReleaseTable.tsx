import { Circle } from 'lucide-react';
import type { Release } from './ReleaseListPage';
import { ReleaseStatusBadge } from './ReleaseStatusBadge';
import { ChangePriorityBadge } from './ChangePriorityBadge';

interface ReleaseTableProps {
  releases: Release[];
  selectedReleases: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRelease: (releaseId: string, checked: boolean) => void;
  onSort: (column: keyof Release) => void;
  sortColumn: keyof Release | null;
  sortDirection: 'asc' | 'desc';
  onReleaseClick: (release: Release) => void;
}

export function ReleaseTable({
  releases,
  selectedReleases,
  allSelected,
  onSelectAll,
  onSelectRelease,
  onSort,
  sortColumn,
  sortDirection,
  onReleaseClick,
}: ReleaseTableProps) {
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

  const riskColor = (risk: Release['releaseRisk']) =>
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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">ID</span>
            </th>
            <th className="min-w-[280px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Subject</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
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
              <span className="whitespace-nowrap">Release Type</span>
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
              <span className="whitespace-nowrap">Release Risk</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {releases.map((release) => (
            <tr
              key={release.id}
              className="group hover:bg-[#f9fafb] transition-colors cursor-pointer"
              onClick={() => onReleaseClick(release)}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedReleases.has(release.id)}
                  onChange={(e) => onSelectRelease(release.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>
              <td className="px-4 py-3">
                <span
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReleaseClick(release);
                  }}
                >
                  {release.id}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <span className="max-w-[350px] truncate font-medium inline-block">{release.subject}</span>
              </td>
              <td className="px-4 py-3 text-[12px] text-[#364658] whitespace-nowrap">{release.requester}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-[12px] text-[#364658]">{formatDateTime(release.createdDate)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium text-white"
                    style={{ backgroundColor: release.assignee.color }}
                  >
                    {release.assignee.initials}
                  </span>
                  <span className="text-[12px] text-[#364658]">{release.assignee.name}</span>
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <ReleaseStatusBadge status={release.status} />
              </td>
              <td className="px-4 py-3">
                <ChangePriorityBadge priority={release.priority} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {release.releaseType ? (
                  <span className="text-[12px] text-[#364658]">{release.releaseType}</span>
                ) : (
                  <span className="text-[12px] text-[#9ca3af]">---</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {release.releaseRisk ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Circle size={8} className={riskColor(release.releaseRisk)} fill="currentColor" />
                    <span className="text-[12px] text-[#6b7280]">{release.releaseRisk}</span>
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
