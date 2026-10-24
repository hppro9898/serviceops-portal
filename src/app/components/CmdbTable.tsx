import { ChevronDown, Database, AppWindow, Laptop, Server, Network, HardDrive, Smartphone, User, Workflow, Globe, Layers } from 'lucide-react';
import type { Ci } from './CmdbListPage';

interface CmdbTableProps {
  cis: Ci[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof Ci) => void;
  sortColumn: keyof Ci | null;
  sortDirection: 'asc' | 'desc';
  onCiClick?: (ci: Ci) => void;
}

const ciTypeIcon = (type: string) => {
  switch (type) {
    case 'Application': return <AppWindow size={15} />;
    case 'Business Service': return <Workflow size={15} />;
    case 'Application Service': return <Layers size={15} />;
    case 'Database': return <Database size={15} />;
    case 'Web Server': return <Globe size={15} />;
    case 'Application Server': return <Server size={15} />;
    case 'Mac Laptop':
    case 'Windows Laptop': return <Laptop size={15} />;
    case 'Server': return <Server size={15} />;
    case 'Switch': return <Network size={15} />;
    case 'Hardware': return <HardDrive size={15} />;
    case 'Mobile Devices': return <Smartphone size={15} />;
    default: return <Database size={15} />; // Base CI
  }
};

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

export function CmdbTable({
  cis,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onCiClick,
}: CmdbTableProps) {
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
            <th className="min-w-[240px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">CI Type</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Status</span></th>
            <th className="min-w-[150px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Host Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">IP Address</span></th>
            <th className="min-w-[170px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Used By</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Managed By Group</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Managed By</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {/* A CI type with nothing in it is a real answer now that the tree lets you select
              one — the branch is part of the CMDB's shape whether or not it is populated. */}
          {cis.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                No CIs of this type.
              </td>
            </tr>
          )}
          {cis.map((c) => (
            <tr key={c.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={(e) => onSelect(c.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onCiClick?.(c)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {c.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onCiClick?.(c)}
                  className="inline-flex items-center gap-2 font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  {c.nameDot && <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.nameDot }} />}
                  <span className="max-w-[280px] truncate">{c.name}</span>
                </button>
              </td>

              {/* CI Type */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[#6B7280] flex-shrink-0">{ciTypeIcon(c.ciType)}</span>
                  {c.ciType}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                {c.status === 'Operational' ? (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                    <span className="size-2 rounded-full flex-shrink-0 bg-[#9CA3AF]" />
                    Operational
                  </span>
                ) : (
                  <span className="text-[12px] text-[#D97706]">Select</span>
                )}
              </td>

              {/* Host Name */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.hostName === '---' ? <Dash /> : c.hostName}</td>

              {/* IP Address */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.ipAddress === '---' ? <Dash /> : c.ipAddress}</td>

              {/* Used By (select-style) */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center justify-between gap-2 min-w-[140px] rounded border border-[#DFE5ED] bg-white px-2 py-1">
                  {c.usedBy ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#EAF2FB] px-1.5 py-0.5 text-[12px] text-[#364658] max-w-[120px]"><span className="truncate">{c.usedBy}</span></span>
                  ) : (
                    <span className="text-[12px] text-[#9ca3af]">---</span>
                  )}
                  <ChevronDown size={13} className="text-[#9ca3af] flex-shrink-0" />
                </span>
              </td>

              {/* Managed By Group */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.managedByGroup}</td>

              {/* Managed By */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {c.managedBy ? (
                  <span className="inline-flex items-center gap-2 text-[#364658]">
                    <span className="flex size-5 items-center justify-center rounded text-[9px] font-semibold text-white flex-shrink-0" style={{ backgroundColor: c.managedBy.color || '#9CA3AF' }}>{c.managedBy.initials}</span>
                    {c.managedBy.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[#9ca3af]">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#f3f4f6] text-[#9ca3af] flex-shrink-0"><User size={11} /></span>
                    Unassigned
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
