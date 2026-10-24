import type { Patch } from './PatchesListPage';

interface PatchesTableProps {
  patches: Patch[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof Patch) => void;
  sortColumn: keyof Patch | null;
  sortDirection: 'asc' | 'desc';
  onPatchClick?: (patch: Patch) => void;
}

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

// Severity → colored dot. Critical red, Important orange, Moderate amber, Low/Unspecified neutral.
const severityDot = (s: Patch['severity']) =>
  s === 'Critical' ? '#EF4444'
    : s === 'Important' ? '#F59E0B'
      : s === 'Moderate' ? '#EAB308'
        : s === 'Low' ? '#111827'
          : '#6B7280'; // Unspecified

export function PatchesTable({
  patches,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onPatchClick,
}: PatchesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px]">
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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Patch ID</span></th>
            <th className="min-w-[300px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Severity</span></th>
            <th className="min-w-[200px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Release Date</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Missing System</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Installed System</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Reboot Required</span></th>
            <th className="min-w-[150px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Approval Status</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {patches.map((p) => (
            <tr key={p.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={(e) => onSelect(p.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* Patch ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onPatchClick?.(p)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {p.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onPatchClick?.(p)}
                  className="font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  <span className="block max-w-[340px] truncate">{p.name}</span>
                </button>
              </td>

              {/* Severity */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: severityDot(p.severity) }} />
                  {p.severity}
                </span>
              </td>

              {/* Release Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.releaseDate}</td>

              {/* Missing System */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.missingSystem === null ? <Dash /> : p.missingSystem}</td>

              {/* Installed System */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.installedSystem === null ? <Dash /> : p.installedSystem}</td>

              {/* Reboot Required */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.rebootRequired}</td>

              {/* Approval Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.approvalStatus === 'Approved' ? '#22C55E' : '#F59E0B' }} />
                  {p.approvalStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
