import { Zap, Flag, ArrowUp } from 'lucide-react';
import { affectedProducts, useProductsVersion } from './bomProductsData';
import type { SoftwareComponent, ComponentSeverity } from './softwareComponentsData';

/* Software Components grid — one row per component VERSION across the fleet.
 *
 * Same shell as BomInventoryTable (header weights, row hover, cell padding, checkbox) so the
 * two BOM listings read as one module; only the columns differ, because the question does. */

const Dash = () => <span className="text-[12px] text-[#9ca3af]">—</span>;

/* The app's existing severity tints (DetectedCvesTable) rather than a second set — a
   Critical must not be one red on the CVE listing and another red here. */
const SEVERITY_PILL: Record<Exclude<ComponentSeverity, 'None'>, { bg: string; text: string; dot: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318', dot: '#EF4444' },
  High: { bg: '#FFF4ED', text: '#C4320A', dot: '#F59E0B' },
  Medium: { bg: '#FFFAEB', text: '#B54708', dot: '#EAB308' },
  Low: { bg: '#F2F4F7', text: '#475467', dot: '#98A2B3' },
};

export function SeverityPill({ severity }: { severity: ComponentSeverity }) {
  if (severity === 'None') return <Dash />;
  const s = SEVERITY_PILL[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.dot }} />
      {severity}
    </span>
  );
}


/* The licence chip: neutral at rest; amber only when the licence needs a legal read. */
const CHIP = 'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] font-medium';
const CHIP_NEUTRAL = { backgroundColor: '#F1F5F9', color: '#475467' };
const CHIP_FLAG = { backgroundColor: '#FEF7E6', color: '#D97706' };

interface SoftwareComponentsTableProps {
  rows: SoftwareComponent[];
  /** Opens the component detail drawer. */
  onRowClick?: (c: SoftwareComponent) => void;
}

/* No row selection here, unlike the Inventory grid: every bulk action on that listing acts
   on a CI (re-scan it, ingest into it). A component version is not a thing you act on one
   by one — you act on the CIs carrying it — so a checkbox would arm nothing. */
export function SoftwareComponentsTable({ rows, onRowClick }: SoftwareComponentsTableProps) {
  useProductsVersion();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1700px]">
        <thead className="border-b border-[#e5e7eb]">
          <tr className="bg-white">
            {[
              ['ID', 'min-w-[120px]'], ['Component', 'min-w-[230px]'], ['Version', 'min-w-[100px]'],
              ['PURL', 'min-w-[220px]'], ['Applications', ''], ['Vulnerabilities', ''],
              ['Severity', 'min-w-[130px]'], ['Fix Version', 'min-w-[120px]'],
              ['License', 'min-w-[150px]'],
            ].map(([h, cls]) => (
              <th key={h} className={`${cls} px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider`}>
                <span className="whitespace-nowrap">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {rows.length === 0 ? (
            <tr><td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No components match your search.</td></tr>
          ) : rows.map((c) => (
            <tr key={c.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                {/* Now a real button, because there IS somewhere to go — the same treatment
                    Inventory gives a CI id. */}
                <button
                  onClick={() => onRowClick?.(c)}
                  className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]"
                >{c.id}</button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <button onClick={() => onRowClick?.(c)} className="text-[12px] font-medium text-[#364658] transition-colors hover:text-[#3D8BD0]">{c.name}</button>
                  {/* KEV is not a severity — it says this one is being exploited right now,
                      which is why it sits on the name rather than in the severity column. */}
                  {c.kev && (
                    <span
                      className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: '#FEF3F2', color: '#B42318' }}
                      title="On CISA's Known Exploited Vulnerabilities list"
                    ><Zap size={11} />KEV</span>
                  )}
                </div>
                <div className="mt-0.5 text-[12px] text-[#7B8FA5]">{c.ecosystem}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{c.version}</td>
              <td className="px-4 py-3 text-[12px] text-[#7B8FA5]">
                <span className="block max-w-[220px] truncate" title={c.purl}>{c.purl}</span>
              </td>
              {/* Blast radius — the reason to look at this listing rather than a single BOM. */}
              {/* Same lookup the component's detail page lists, so the count and the rows agree. */}
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{affectedProducts(c).length}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                <span className={c.vulnerabilities > 0 ? 'font-semibold text-[#D97706]' : 'text-[#9ca3af]'}>{c.vulnerabilities}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap"><SeverityPill severity={c.topSeverity} /></td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {c.fixVersion ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[#22A06B]">
                    <ArrowUp size={12} />{c.fixVersion}
                  </span>
                ) : <Dash />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={CHIP}
                  style={c.licenseFlag ? CHIP_FLAG : CHIP_NEUTRAL}
                  title={c.licenseFlag ? 'Copyleft or dual-licensed — worth a legal review' : undefined}
                >
                  {c.licenseFlag && <Flag size={12} />}
                  {c.license}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
