import { Laptop, Server, Monitor, HardDrive, User } from 'lucide-react';
import type { HardwareAsset, AssetType, AssetStatus } from './HardwareAssetsListPage';

interface HardwareAssetsTableProps {
  assets: HardwareAsset[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof HardwareAsset) => void;
  sortColumn: keyof HardwareAsset | null;
  sortDirection: 'asc' | 'desc';
  onAssetClick?: (asset: HardwareAsset) => void;
}

const typeIcon = (t: AssetType) => {
  switch (t) {
    case 'Mac Laptop':
    case 'Windows Laptop':
      return <Laptop size={14} />;
    case 'HyperV Server':
    case 'UNIX Server':
      return <Server size={14} />;
    case 'Windows Desktop':
      return <Monitor size={14} />;
    case 'Hardware':
    default:
      return <HardDrive size={14} />;
  }
};

const statusColor = (s: AssetStatus) => (s === 'In Store' ? '#3D8BD0' : '#22C55E');

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

export function HardwareAssetsTable({
  assets,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onSort,
  sortColumn,
  sortDirection,
  onAssetClick,
}: HardwareAssetsTableProps) {
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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">ID</span></th>
            <th className="min-w-[260px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Asset Type</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Status</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Host Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">IP Address</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Used By</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Managed By Group</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Managed By</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Serial Number</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {assets.map((a) => (
            <tr key={a.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={(e) => onSelect(a.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onAssetClick?.(a)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {a.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onAssetClick?.(a)}
                  className="inline-flex items-center gap-1.5 max-w-[320px] text-left text-[12px] hover:text-[#3D8BD0] transition-colors"
                >
                  {a.flagged && <span className="size-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />}
                  <span className="truncate font-medium">{a.name}</span>
                </button>
              </td>

              {/* Asset Type */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="text-[#6B7280] flex-shrink-0">{typeIcon(a.assetType)}</span>
                  {a.assetType}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(a.status) }} />
                  {a.status}
                </span>
              </td>

              {/* Host Name */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                {a.hostName === '---' ? <Dash /> : <span className="inline-block max-w-[200px] truncate align-bottom">{a.hostName}</span>}
              </td>

              {/* IP Address */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                {a.ipAddress === '---' ? <Dash /> : a.ipAddress}
              </td>

              {/* Used By */}
              <td className="px-4 py-3 whitespace-nowrap">
                {a.usedBy ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="inline-block rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[12px] text-[#364658] max-w-[180px] truncate">
                      {a.usedBy.label}
                    </span>
                    {a.usedBy.more ? (
                      <span className="inline-block rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#6B7280]">
                        +{a.usedBy.more}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <Dash />
                )}
              </td>

              {/* Managed By Group */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                {a.managedByGroup}
              </td>

              {/* Managed By */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  {a.managedBy.initials ? (
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium text-white"
                      style={{ backgroundColor: a.managedBy.color || '#9CA3AF' }}
                    >
                      {a.managedBy.initials}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F1F5F9] text-[#9CA3AF]">
                      <User size={13} />
                    </span>
                  )}
                  <span className="text-[12px] text-[#364658]">{a.managedBy.name}</span>
                </span>
              </td>

              {/* Serial Number */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                {a.serialNumber === '---' ? <Dash /> : a.serialNumber}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
