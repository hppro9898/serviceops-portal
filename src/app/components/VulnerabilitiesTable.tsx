import type { Vulnerability } from './VulnerabilitiesListPage';

interface VulnerabilitiesTableProps {
  vulnerabilities: Vulnerability[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  /** Opens the vulnerability's detail page — not wired yet (listing only for now). */
  onVulnerabilityClick?: (vulnerability: Vulnerability) => void;
}

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

// Severity → colored dot. Critical red, Important orange, Moderate amber, Low/Unspecified neutral.
const severityDot = (s: Vulnerability['severity']) =>
  s === 'Critical' ? '#EF4444'
    : s === 'Important' ? '#F59E0B'
      : s === 'Moderate' ? '#EAB308'
        : s === 'Low' ? '#111827'
          : '#6B7280'; // Unspecified

/** Comma-joined CVE list, truncated with the full list on hover; --- when empty. */
const CveCell = ({ cves }: { cves: string[] }) =>
  cves.length === 0 ? <Dash /> : (
    <span className="block max-w-[180px] truncate text-[12px] text-[#364658]" title={cves.join(', ')}>
      {cves.join(', ')}
    </span>
  );

export function VulnerabilitiesTable({
  vulnerabilities,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onVulnerabilityClick,
}: VulnerabilitiesTableProps) {
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
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">ID</span></th>
            <th className="min-w-[320px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Name</span></th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Severity</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Exploited CVEs</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Non Exploited CVEs</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Category</span></th>
            <th className="min-w-[120px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">CVSS 3.1 Score</span></th>
            <th className="min-w-[200px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Published Date</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Impacted Endpoints</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {vulnerabilities.map((v) => (
            <tr key={v.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(v.id)}
                  onChange={(e) => onSelect(v.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>

              {/* ID */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onVulnerabilityClick?.(v)}
                  className="whitespace-nowrap inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] cursor-pointer hover:bg-[#d0e8f9] transition-colors"
                >
                  {v.id}
                </button>
              </td>

              {/* Name */}
              <td className="px-4 py-3 text-[12px] text-[#364658]">
                <button
                  type="button"
                  onClick={() => onVulnerabilityClick?.(v)}
                  className="font-medium text-left hover:text-[#3D8BD0] transition-colors"
                >
                  <span className="block max-w-[360px] truncate" title={v.name}>{v.name}</span>
                </button>
              </td>

              {/* Severity */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#364658]">
                  <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: severityDot(v.severity) }} />
                  {v.severity}
                </span>
              </td>

              {/* Exploited / Non Exploited CVEs */}
              <td className="px-4 py-3 whitespace-nowrap"><CveCell cves={v.exploitedCves} /></td>
              <td className="px-4 py-3 whitespace-nowrap"><CveCell cves={v.nonExploitedCves} /></td>

              {/* Category */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{v.category}</td>

              {/* CVSS 3.1 Score */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{v.cvssScore}</td>

              {/* Published Date */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{v.publishedDate}</td>

              {/* Impacted Endpoints */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{v.impactedEndpoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
