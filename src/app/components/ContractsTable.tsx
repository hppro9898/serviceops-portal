import { FileText } from 'lucide-react';
import type { Contract, ContractStatus } from './ContractsListPage';

interface ContractsTableProps {
  contracts: Contract[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof Contract) => void;
  sortColumn: keyof Contract | null;
  sortDirection: 'asc' | 'desc';
  onContractClick?: (contract: Contract) => void;
}

const statusColor = (s: ContractStatus) =>
  s === 'Active' ? '#22C55E' : s === 'Not Started' ? '#D97706' : '#9CA3AF';

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

export function ContractsTable({
  contracts,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onContractClick,
}: ContractsTableProps) {
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
            <th className="min-w-[220px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Contract Type</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Contract Number</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Contract Start Date</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Contract End Date</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Status</span></th>
            <th className="min-w-[180px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Vendor</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Cost</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {contracts.map((c) => (
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
                  onClick={() => onContractClick?.(c)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {c.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onContractClick?.(c)}
                  className="inline-flex items-center gap-1.5 font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  <span className="text-[#6B7280] flex-shrink-0"><FileText size={14} /></span>
                  <span className="max-w-[260px] truncate">{c.name}</span>
                </button>
              </td>

              {/* Contract Type */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.contractType}</td>

              {/* Contract Number */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.contractNumber ? c.contractNumber : <Dash />}</td>

              {/* Contract Start Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.startDate}</td>

              {/* Contract End Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.endDate}</td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(c.status) }} />
                  {c.status}
                </span>
              </td>

              {/* Vendor */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.vendor}</td>

              {/* Cost */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.cost ? c.cost : <Dash />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
