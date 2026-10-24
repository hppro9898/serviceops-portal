import { Keyboard, Mouse, Camera, Plug, MemoryStick, Cable, BatteryFull, Usb, Headphones, Droplet, Package, User } from 'lucide-react';
import type { ConsumableAsset } from './ConsumableAssetsListPage';

interface ConsumableAssetsTableProps {
  assets: ConsumableAsset[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof ConsumableAsset) => void;
  sortColumn: keyof ConsumableAsset | null;
  sortDirection: 'asc' | 'desc';
  onAssetClick?: (asset: ConsumableAsset) => void;
}

const typeIcon = (t: string) => {
  switch (t) {
    case 'Keyboard': return <Keyboard size={14} />;
    case 'Mouse': return <Mouse size={14} />;
    case 'Cameras': return <Camera size={14} />;
    case 'Adapter': return <Plug size={14} />;
    case 'RAM': return <MemoryStick size={14} />;
    case 'Cable': return <Cable size={14} />;
    case 'Batteries': return <BatteryFull size={14} />;
    case 'USB Drive': return <Usb size={14} />;
    case 'Headset': return <Headphones size={14} />;
    case 'Hand Sanitizer': return <Droplet size={14} />;
    default: return <Package size={14} />;
  }
};

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">{children}</span></th>
);

export function ConsumableAssetsTable({
  assets,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onAssetClick,
}: ConsumableAssetsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1700px]">
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
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Asset Type</Th>
            <Th>Managed By</Th>
            <Th>Managed By Group</Th>
            <Th>Department</Th>
            <Th>Location</Th>
            <Th>Asset Group</Th>
            <Th>Tags</Th>
            <Th>Created Date</Th>
            <Th>Last Updated Date</Th>
            <Th>Available Quantity</Th>
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
                  className="block max-w-[260px] truncate font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  {a.name}
                </button>
              </td>

              {/* Asset Type */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="text-[#6B7280] flex-shrink-0">{typeIcon(a.assetType)}</span>
                  {a.assetType}
                </span>
              </td>

              {/* Managed By */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  {a.managedBy.initials ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-medium text-white" style={{ backgroundColor: a.managedBy.color || '#9CA3AF' }}>
                      {a.managedBy.initials}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-[#F1F5F9] text-[#9CA3AF]"><User size={13} /></span>
                  )}
                  <span className="text-[12px] text-[#364658]">{a.managedBy.name}</span>
                </span>
              </td>

              {/* Managed By Group */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{a.managedByGroup}</td>

              {/* Department */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{a.department}</td>

              {/* Location */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                {a.location === '---' ? <Dash /> : a.location}
              </td>

              {/* Asset Group */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{a.assetGroup}</td>

              {/* Tags */}
              <td className="px-4 py-3 whitespace-nowrap">
                {a.tags && a.tags.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <span key={t} className="inline-block rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#364658]">{t}</span>
                    ))}
                  </span>
                ) : (
                  <Dash />
                )}
              </td>

              {/* Created Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{a.createdDate}</td>

              {/* Last Updated Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{a.lastUpdatedDate}</td>

              {/* Available Quantity */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] font-medium text-[#364658]">{a.availableQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
