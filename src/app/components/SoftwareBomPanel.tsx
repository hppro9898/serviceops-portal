import { useEffect, useMemo, useState } from 'react';
import { X, Search, ShieldAlert } from 'lucide-react';
import { softwarePackages, softwareComponents } from './softwareBomData';
import type { SoftwarePackage } from './softwareBomData';
import type { BomComponent } from './bomData';

/* The list behind a Packages or Components count on the asset Software tab.
 *
 * ONE panel for both, because both are the same shape of thing — a titled side drawer
 * over a searchable table. Only the columns differ, so only the columns are branched;
 * splitting it in two would duplicate the header, the search, the scrim and the counts,
 * and let them drift apart.
 */

export type SoftwareBomKind = 'packages' | 'components';

interface SoftwareBomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  kind: SoftwareBomKind;
  softwareName: string;
  softwareVersion?: string;
  /** The number the grid column showed — the drawer lists exactly this many rows. */
  count?: number;
}

const FORMAT_TONE: Record<string, { bg: string; text: string }> = {
  MSI: { bg: '#E8F4FD', text: '#3D8BD0' },
  EXE: { bg: '#EEF2F6', text: '#364658' },
  AppX: { bg: '#F3ECFB', text: '#8B5CF6' },
  pkg: { bg: '#ECFDF3', text: '#22A06B' },
  deb: { bg: '#FEF7E6', text: '#D97706' },
};

const ORIGIN_TONE: Record<string, { bg: string; text: string }> = {
  'Open-source': { bg: '#ECFDF3', text: '#22A06B' },
  Proprietary: { bg: '#EEF2F6', text: '#364658' },
  'Third-party': { bg: '#FEF7E6', text: '#D97706' },
};

function Pill({ label, tone }: { label: string; tone?: { bg: string; text: string } }) {
  const t = tone ?? { bg: '#EEF2F6', text: '#364658' };
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-sm px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: t.bg, color: t.text }}>{label}</span>
  );
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-[#7B8FA5]">{children}</th>
);
const TD = ({ children, mono, className = '' }: { children: React.ReactNode; mono?: boolean; className?: string }) => (
  <td className={`px-3 py-3 text-[13px] text-[#364658] ${mono ? 'font-mono' : ''} ${className}`}>{children}</td>
);

export function SoftwareBomPanel({ isOpen, onClose, kind, softwareName, softwareVersion, count }: SoftwareBomPanelProps) {
  const [query, setQuery] = useState('');

  // A fresh open is a fresh search — carrying the last one over hides rows the count promised.
  useEffect(() => { if (isOpen) setQuery(''); }, [isOpen, kind, softwareName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const packages = useMemo(
    () => (kind === 'packages' ? softwarePackages(softwareName, softwareVersion, count) : []),
    [kind, softwareName, softwareVersion, count],
  );
  const components = useMemo(
    () => (kind === 'components' ? softwareComponents(softwareName, count) : []),
    [kind, softwareName, count],
  );

  const q = query.trim().toLowerCase();
  const shownPackages = !q ? packages : packages.filter((p: SoftwarePackage) =>
    [p.name, p.packageId, p.format, p.version, p.installSource].some((v) => v.toLowerCase().includes(q)));
  const shownComponents = !q ? components : components.filter((c: BomComponent) =>
    [c.name, c.version, c.type, c.ecosystem, c.license, c.origin, ...(c.cves ?? [])]
      .some((v) => v.toLowerCase().includes(q)));

  if (!isOpen) return null;

  const total = kind === 'packages' ? packages.length : components.length;
  const shown = kind === 'packages' ? shownPackages.length : shownComponents.length;
  const noun = kind === 'packages' ? 'package' : 'component';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50" onClick={onClose}>
      {/* Wide enough that the components table — its 8 columns are the wider of the two —
          fits without sideways scrolling on a normal screen. */}
      <div className="flex h-full w-[1080px] max-w-[95vw] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header — the software is the subject; the kind is what you are looking at of it. */}
        <div className="flex items-start justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-[#364658]">
              {kind === 'packages' ? 'Installed packages' : 'Components'}
            </h3>
            <p className="mt-0.5 truncate text-[13px] text-[#7B8FA5]">
              {softwareName}{softwareVersion ? ` · ${softwareVersion}` : ''}
              <span className="mx-1.5">·</span>
              {total} {noun}{total === 1 ? '' : 's'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 border-b border-[#DFE5ED] px-5 py-3">
          <div className="relative w-[300px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={kind === 'packages' ? 'Search packages…' : 'Search components…'}
              className="h-8 w-full rounded border border-[#DFE5ED] bg-white pl-9 pr-3 text-[13px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-[#3D8BD0] focus:outline-none"
            />
          </div>
          {/* Only worth saying when the search is hiding something. */}
          {q && <span className="text-[12px] text-[#7B8FA5]">{shown} of {total} shown</span>}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {shown === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] font-medium text-[#364658]">No {noun}s match “{query}”.</p>
              <button onClick={() => setQuery('')} className="mt-2 text-[13px] font-medium text-[#3D8BD0] hover:underline">Clear search</button>
            </div>
          ) : kind === 'packages' ? (
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-[#e5e7eb] bg-white">
                <tr><TH>Package Name</TH><TH>Package ID</TH><TH>Format</TH><TH>Version</TH><TH>Size</TH><TH>Install Source</TH><TH>Installed Date</TH></tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {shownPackages.map((p) => (
                  <tr key={p.packageId} className="transition-colors hover:bg-[#f9fafb]">
                    <TD mono>{p.name}</TD>
                    <TD mono className="max-w-[240px] truncate"><span title={p.packageId}>{p.packageId}</span></TD>
                    <TD><Pill label={p.format} tone={FORMAT_TONE[p.format]} /></TD>
                    <TD mono>{p.version}</TD>
                    <TD mono className="whitespace-nowrap">{p.size}</TD>
                    <TD className="whitespace-nowrap">{p.installSource}</TD>
                    <TD className="whitespace-nowrap">{p.installedDate}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* table-fixed + colgroup: with auto layout the PURL and License columns claimed
               enough width to push CVEs off the pane. Fixed widths make that impossible —
               PURL absorbs the slack and truncates, everything else stays readable. */
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: 190 }} /><col style={{ width: 100 }} /><col style={{ width: 96 }} />
                <col style={{ width: 106 }} /><col style={{ width: 122 }} /><col style={{ width: 118 }} />
                <col /><col style={{ width: 78 }} />
              </colgroup>
              <thead className="border-b border-[#e5e7eb] bg-white">
                <tr><TH>Component</TH><TH>Version</TH><TH>Type</TH><TH>Ecosystem</TH><TH>License</TH><TH>Origin</TH><TH>PURL</TH><TH>CVEs</TH></tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {shownComponents.map((c, i) => (
                  <tr key={`${c.purl}-${i}`} className="transition-colors hover:bg-[#f9fafb]">
                    <TD mono className="truncate"><span title={c.name}>{c.name}</span></TD>
                    <TD mono className="truncate">{c.version}</TD>
                    <TD className="truncate">{c.type}</TD>
                    <TD className="truncate">{c.ecosystem}</TD>
                    <TD className="truncate"><span title={c.license}>{c.license}</span></TD>
                    <TD><Pill label={c.origin} tone={ORIGIN_TONE[c.origin]} /></TD>
                    <TD mono className="truncate"><span title={c.purl}>{c.purl}</span></TD>
                    <TD>
                      {c.cves?.length ? (
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#FEF2F2] px-2 py-0.5 text-[12px] font-medium text-[#DC2626]"
                          title={c.cves.join(', ')}>
                          <ShieldAlert size={13} />{c.cves.length}
                        </span>
                      ) : <span className="text-[12px] text-[#9ca3af]">—</span>}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
