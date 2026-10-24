import { AlertTriangle, ArrowUpDown, Flag, X, Download, FileText, Columns3, RefreshCw } from 'lucide-react';
import type { SoftwareComponent } from './softwareComponentsData';

/* The three readings above the Software Components table.
 *
 * Same card system as the BOM admin screens (.kpi / .kh / .knum / .klabel / .kcta), so the
 * technician listing and the admin surface read as one module rather than two designs.
 *
 * Every figure is DERIVED from the rows below — nothing is stored — so a card and the table
 * it sits above cannot quote different numbers. Each card's action filters that table
 * instead of navigating away, and says so while it is doing it. */

export type ComponentFocus = 'vulnerable' | 'fixable' | 'license' | null;

export const focusFn: Record<Exclude<ComponentFocus, null>, (c: SoftwareComponent) => boolean> = {
  /* Every component carrying a known vulnerability — the cut the removed "Vulnerable" tab made,
     now reached from the card that counts them. */
  vulnerable: (c) => c.vulnerabilities > 0,
  fixable: (c) => c.vulnerabilities > 0 && !!c.fixVersion,
  license: (c) => c.licenseFlag,
};

export const FOCUS_LABEL: Record<Exclude<ComponentFocus, null>, string> = {
  vulnerable: 'Vulnerable components',
  fixable: 'Fix available',
  license: 'Flagged licenses',
};

/* InfoTip moved into BomKpiCard with the rest of line 1 — it is part of the grammar, not
   of this page. */

/** The KPI card the register and the AI tab draw. It is an adapter over the module's shared
 *  grammar (`BomKpiCard`) rather than a second implementation of it: these two tabs and the
 *  dashboard were three copies of one shape, and they had already drifted to three heights.
 *
 *  The only thing this adds is the TOGGLE reading of the action — a listing card filters the
 *  table under it, so its action says "Showing this" while it is doing so, where a dashboard
 *  card's action simply goes somewhere.
 */
export function KpiCard({
  icon, title, children, active = false, onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  /** Kept for callers; not shown — the card's title says what it counts. */
  info?: string;
  children: React.ReactNode;
  active?: boolean;
  onToggle?: () => void;
  cta?: string;
}) {
  /* The whole card is the filter: click to show only these rows, click again to clear. */
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex min-h-[90px] min-w-0 flex-col justify-center gap-2 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
        active ? 'border-[#3D8BD0] bg-[#F5FAFF] shadow-sm' : 'border-[#E5E7EB] bg-white hover:border-[#3D8BD0] hover:shadow-sm'
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`flex-shrink-0 ${active ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`}>{icon}</span>
          <span className={`truncate text-[13px] font-medium ${active ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`}>{title}</span>
        </span>
        {active && <X size={14} className="flex-shrink-0 text-[#3D8BD0]" aria-label="Clear filter" />}
      </span>
      {children}
    </button>
  );
}

/* The grammar's figure size, so the register's cards and the dashboard's quote numbers at the
   same weight. It was 26px here and 24 there — a difference nobody chose, left over from the two
   surfaces having had two card components. Kept as a token because these cards compose their own
   line 2 rather than calling KpiValue; when they migrate to it, this goes. */
export const KPI_NUM = 'text-[24px] font-bold leading-none tracking-[-0.6px] tabular-nums';

export function SoftwareComponentsKpis({
  rows, focus, setFocus,
}: {
  rows: SoftwareComponent[];
  focus: ComponentFocus;
  setFocus: (f: ComponentFocus) => void;
}) {
  /* Every card counts COMPONENTS, so the number on a card is the number of rows it filters to. */
  const vulnerable = rows.filter(focusFn.vulnerable);
  const fixable = rows.filter(focusFn.fixable).length;
  const flagged = rows.filter(focusFn.license);
  const toggle = (f: Exclude<ComponentFocus, null>) => () => setFocus(focus === f ? null : f);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <KpiCard icon={<AlertTriangle size={15} />} title="Vulnerable components" active={focus === 'vulnerable'} onToggle={toggle('vulnerable')}>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className={`${KPI_NUM} ${vulnerable.length ? 'text-[#B42318]' : 'text-[#364658]'}`}>{vulnerable.length}</span>
        </span>
      </KpiCard>

      <KpiCard icon={<ArrowUpDown size={15} />} title="Fix available" active={focus === 'fixable'} onToggle={toggle('fixable')}>
        <span className={`${KPI_NUM} text-[#364658]`}>{fixable}</span>
      </KpiCard>

      <KpiCard icon={<Flag size={15} />} title="Flagged licenses" active={focus === 'license'} onToggle={toggle('license')}>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className={`${KPI_NUM} ${flagged.length ? 'text-[#D97706]' : 'text-[#364658]'}`}>{flagged.length}</span>
        </span>
      </KpiCard>
    </div>
  );
}

/** The list actions, kept beside the filters both component lists put in their control row. */
export function ListActions({ onDownload, onRefresh }: { onDownload?: () => void; onRefresh?: () => void } = {}) {
  const btn = 'flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#6b7280] transition-colors hover:border-[#3D8BD0] hover:bg-[#F5F7FA] hover:text-[#364658]';
  return (
    <div className="flex flex-shrink-0 items-center gap-1.5">
      <button className={btn} title="Download" onClick={onDownload}><Download size={16} /></button>
      <button className={btn} title="Export"><FileText size={16} /></button>
      <button className={btn} title="Columns"><Columns3 size={16} /></button>
      <button className={btn} title="Refresh" onClick={onRefresh}><RefreshCw size={16} /></button>
    </div>
  );
}
