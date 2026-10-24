import { useMemo, useState } from 'react';
import { X, Search, Flag } from 'lucide-react';
import type { SoftwareComponent } from './softwareComponentsData';

/* A slice of the estate's components, as a right-anchored drawer.
 *
 * The dashboard's charts are counts; this is the list behind a count. Clicking "Apache-2.0 · 167"
 * has to produce 167 things, which is why the rows come from the same computation the chart was
 * counted from rather than from the register fixture — six Apache rows behind a slice labelled
 * 167 is the module's own north-star failure, a picture that does not signal its own
 * incompleteness.
 *
 * It sits BELOW the drawer stack's layer on purpose: opening a component from here stacks its
 * detail over this list, and closing that returns to the list rather than to the dashboard.
 */

const SEV: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318' },
  High: { bg: '#FEF3F2', text: '#B42318' },
  Medium: { bg: '#FEF7E6', text: '#B45309' },
  Low: { bg: '#F1F5F9', text: '#475467' },
};

export interface ComponentListSpec {
  /** What the reader clicked, in their words. */
  title: string;
  /** Why these rows and not others — the filter, stated. */
  subtitle: string;
  rows: SoftwareComponent[];
}

export function BomComponentListDrawer({ spec, onClose, onOpenComponent }: {
  spec: ComponentListSpec;
  onClose: () => void;
  onOpenComponent: (c: SoftwareComponent) => void;
}) {
  const [q, setQ] = useState('');
  /* A fact true of every row belongs to the panel, not the rows. Asked of the WHOLE list rather
     than of what a search has left, so the chips do not appear and disappear as you type. */
  const sameLicence = spec.rows.length > 1
    && spec.rows.every((c) => c.license === spec.rows[0].license);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return spec.rows;
    return spec.rows.filter((c) =>
      c.name.toLowerCase().includes(needle)
      || c.version.toLowerCase().includes(needle)
      || c.license.toLowerCase().includes(needle));
  }, [spec.rows, q]);

  return (
    <>
      {/* Lighter than the stack's scrim: this drawer is one level in, not the top of the pile. */}
      <div className="fixed inset-0 z-[8999] bg-black/20" onClick={onClose} aria-hidden />
      <aside
        role="dialog" aria-label={spec.title}
        className="fixed inset-y-0 right-0 z-[9000] flex w-[560px] max-w-[92vw] flex-col border-l border-[#E5E7EB] bg-white shadow-xl"
      >
        <div className="flex h-[50px] flex-shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
          <h3 className="flex-shrink-0 whitespace-nowrap text-[15px] font-semibold text-[#364658]">{spec.title}</h3>
          <span className="min-w-0 flex-1 truncate text-[13px] text-[#7B8FA5]" title={spec.subtitle}>· {spec.subtitle}</span>
          <button
            onClick={onClose} aria-label="Close"
            className="ml-auto flex-shrink-0 rounded p-1 text-[#7B8FA5] transition-colors hover:bg-[#F1F5F9] hover:text-[#364658]"
          ><X size={16} /></button>
        </div>

        <div className="flex-shrink-0 border-b border-[#F0F2F5] px-4 py-2.5">
          <div className="flex h-8 items-center gap-2 rounded border border-[#d1d5db] px-2.5">
            <Search size={14} className="flex-shrink-0 text-[#9CA3AF]" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search these components"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#364658] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
          {/* The count is the claim the chart made. It must survive a search, so both are shown. */}
          <div className="mt-2 flex items-center gap-2 text-[12px] text-[#7B8FA5]">
            <span>
              <span className="font-semibold tabular-nums text-[#364658]">{rows.length}</span>
              {rows.length === spec.rows.length ? ' components' : ` of ${spec.rows.length} components`}
            </span>
            {/* The fact deduped off the rows, stated once — with its flag, which is the only part
                of a licence that is ever a finding. */}
            {sameLicence && (
              <span
                className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
                style={spec.rows[0].licenseFlag
                  ? { backgroundColor: '#FEF7E6', color: '#D97706' }
                  : { backgroundColor: '#F1F5F9', color: '#475467' }}
              >
                {spec.rows[0].licenseFlag && <Flag size={11} />}{spec.rows[0].license}
              </span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No components match your search.</div>
          ) : (
            <div className="divide-y divide-[#F0F2F5]">
              {rows.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenComponent(c)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3D8BD0]"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate font-mono text-[13px] font-semibold text-[#364658]">{c.name}</span>
                      <span className="flex-shrink-0 text-[12px] text-[#7B8FA5]">{c.version}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-2 text-[12px] text-[#7B8FA5]">
                      {/* Only when it varies. Every row saying "Apache-2.0" in a list the reader
                          opened BY picking Apache-2.0 is a column of the same word. */}
                      {!sameLicence && (
                        <span
                          className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium"
                          style={c.licenseFlag
                            ? { backgroundColor: '#FEF7E6', color: '#D97706' }
                            : { backgroundColor: '#F1F5F9', color: '#475467' }}
                        >
                          {c.licenseFlag && <Flag size={11} />}{c.license}
                        </span>
                      )}
                      <span className="tabular-nums">{c.cis} CIs</span>
                    </span>
                  </span>
                  {c.vulnerabilities > 0 && (
                    <span
                      className="flex-shrink-0 whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-medium"
                      style={SEV[c.topSeverity] ?? SEV.Low}
                    >
                      {c.vulnerabilities} CVE{c.vulnerabilities === 1 ? '' : 's'} · {c.topSeverity}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
