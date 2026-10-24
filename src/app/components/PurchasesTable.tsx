import { ShoppingCart, User } from 'lucide-react';
import type { Purchase, PurchaseStatus } from './PurchasesListPage';

interface PurchasesTableProps {
  purchases: Purchase[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onSort: (column: keyof Purchase) => void;
  sortColumn: keyof Purchase | null;
  sortDirection: 'asc' | 'desc';
  onPurchaseClick?: (purchase: Purchase) => void;
}

const statusColor = (s: PurchaseStatus) =>
  s === 'Approved' ? '#22C55E'
    : s === 'Received' ? '#16A34A'
      : s === 'Sent For Approval' ? '#D97706'
        : s === 'Partially Received' ? '#9CA3AF'
          : s === 'Ordered' ? '#8B5CF6'
            : '#3D8BD0'; // Generated

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

// Deterministic avatar tint from a name so each owner keeps a stable color.
const AVATAR_COLORS = ['#3D8BD0', '#7C3AED', '#0EA5E9', '#16A34A', '#D97706', '#DC2626', '#0D9488'];
const avatarColor = (name: string) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

export function PurchasesTable({
  purchases,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onPurchaseClick,
}: PurchasesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1300px]">
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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Order Number</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Status</span></th>
            <th className="min-w-[180px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Owner</span></th>
            <th className="min-w-[190px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Vendor</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Required By</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {purchases.map((p) => (
            <tr key={p.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={(e) => onSelect(p.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onPurchaseClick?.(p)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {p.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onPurchaseClick?.(p)}
                  className="inline-flex items-center gap-1.5 font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  <span className="text-[#6B7280] flex-shrink-0"><ShoppingCart size={14} /></span>
                  <span className="max-w-[280px] truncate">{p.name}</span>
                </button>
              </td>

              {/* Order Number */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.orderNumber ? p.orderNumber : <Dash />}</td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(p.status) }} />
                  {p.status}
                </span>
              </td>

              {/* Owner */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {p.owner ? (
                  <span className="inline-flex items-center gap-2 text-[#364658]">
                    <span
                      className="flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarColor(p.owner) }}
                    >
                      {initials(p.owner)}
                    </span>
                    {p.owner}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[#9ca3af]">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#f3f4f6] text-[#9ca3af] flex-shrink-0">
                      <User size={11} />
                    </span>
                    Unassigned
                  </span>
                )}
              </td>

              {/* Vendor */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.vendor}</td>

              {/* Required By */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.requiredBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
