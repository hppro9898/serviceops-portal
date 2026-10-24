import type { DetectedCve } from './DetectedCvesListPage';

interface DetectedCvesTableProps {
  cves: DetectedCve[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  /** Opens the CVE's detail page — not wired yet (listing only for now). */
  onCveClick?: (cve: DetectedCve) => void;
}

// Severity → tinted pill (per the reference design; matches the tint-pill treatment used for
// installation statuses elsewhere).
const SEVERITY_PILL: Record<DetectedCve['severity'], { bg: string; text: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318' },
  High: { bg: '#FFF4ED', text: '#C4320A' },
  Medium: { bg: '#FFFAEB', text: '#B54708' },
  Low: { bg: '#F2F4F7', text: '#475467' },
};

export function DetectedCvesTable({
  cves,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onCveClick,
}: DetectedCvesTableProps) {
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
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">CVE ID</span></th>
            <th className="min-w-[280px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Description</span></th>
            <th className="min-w-[100px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Severity</span></th>
            <th className="min-w-[110px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">CWE ID</span></th>
            <th className="min-w-[150px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Impacted Endpoints</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Patch Availability</span></th>
            <th className="min-w-[120px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">CVSS 3.1 Score</span></th>
            <th className="min-w-[110px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Exploit Status</span></th>
            <th className="min-w-[200px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Published Date</span></th>
            <th className="min-w-[120px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Status</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {cves.map((c) => (
            <tr key={c.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={(e) => onSelect(c.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* CVE ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onCveClick?.(c)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {c.id}
                </button>
              </td>

              {/* Description */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <span className="block max-w-[320px] truncate" title={c.description}>{c.description}</span>
              </td>

              {/* Severity — tinted pill */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className="inline-block rounded-sm px-2 py-0.5 text-[12px] font-medium"
                  style={{ backgroundColor: SEVERITY_PILL[c.severity].bg, color: SEVERITY_PILL[c.severity].text }}
                >
                  {c.severity}
                </span>
              </td>

              {/* CWE ID */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.cweId}</td>

              {/* Impacted Endpoints */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.impactedEndpoints}</td>

              {/* Patch Availability */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.patchAvailability}</td>

              {/* CVSS 3.1 Score */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.cvssScore}</td>

              {/* Exploit Status */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                <span className={c.exploitStatus === 'Yes' ? 'font-medium text-[#DC2626]' : 'text-[#364658]'}>{c.exploitStatus}</span>
              </td>

              {/* Published Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.publishedDate}</td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
