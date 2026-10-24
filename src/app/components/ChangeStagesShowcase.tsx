import { LogIn, ClipboardList, FileCheck, Wrench, ScanSearch, CheckCheck, Check, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

/**
 * Review-only showcase: renders multiple stage-bar styles stacked with captions
 * so the design can be compared with the management team. Once a style is picked,
 * keep that one variant and drop the rest.
 */

interface ShowcaseProps {
  status?: string;
  drawerWidth?: number;
}

interface Stage {
  key: string;
  label: string;
  icon: (size: number) => React.ReactNode;
  options: { label: string; color: string }[];
  completedLabel: string;
  /** Mock date/time the stage was completed (shown in the hover tooltip) */
  date: string;
}

const STAGES: Stage[] = [
  { key: 'submitted', label: 'Submitted', icon: (s) => <LogIn style={{ width: s, height: s }} />, date: 'Wed, Feb 26, 2025 03:02 PM',
    options: [{ label: 'Requested', color: '#3D8BD0' }, { label: 'Accepted', color: '#22A06B' }, { label: 'Rejected', color: '#E5484D' }], completedLabel: 'Accepted' },
  { key: 'planning', label: 'Planning', icon: (s) => <ClipboardList style={{ width: s, height: s }} />, date: 'Thu, Feb 27, 2025 11:30 AM',
    options: [{ label: 'In Progress', color: '#F59E0B' }, { label: 'Pre Approved', color: '#9CA3AF' }, { label: 'Cancelled', color: '#E5484D' }, { label: 'Completed', color: '#22A06B' }], completedLabel: 'Completed' },
  { key: 'approval', label: 'Approval', icon: (s) => <FileCheck style={{ width: s, height: s }} />, date: 'Fri, Feb 28, 2025 02:15 PM',
    options: [{ label: 'Pending', color: '#F59E0B' }, { label: 'Approved', color: '#22A06B' }, { label: 'Rejected', color: '#E5484D' }], completedLabel: 'Approved' },
  { key: 'implementation', label: 'Implementation', icon: (s) => <Wrench style={{ width: s, height: s }} />, date: 'Mon, Mar 03, 2025 10:00 AM',
    options: [{ label: 'In Progress', color: '#F59E0B' }, { label: 'Build', color: '#8B5CF6' }, { label: 'Deployment', color: '#F97316' }, { label: 'Rejected', color: '#E5484D' }, { label: 'Completed', color: '#22A06B' }], completedLabel: 'Completed' },
  { key: 'review', label: 'In Review', icon: (s) => <ScanSearch style={{ width: s, height: s }} />, date: 'Tue, Mar 04, 2025 04:45 PM',
    options: [{ label: 'In Progress', color: '#F59E0B' }, { label: 'Testing', color: '#22A06B' }, { label: 'Failed', color: '#E5484D' }, { label: 'Passed', color: '#22A06B' }], completedLabel: 'Passed' },
  { key: 'closed', label: 'Closed', icon: (s) => <CheckCheck style={{ width: s, height: s }} />, date: 'Wed, Mar 05, 2025 01:20 PM',
    options: [{ label: 'Closed', color: '#6B7280' }, { label: 'Cancelled', color: '#E5484D' }], completedLabel: 'Closed' },
];

function resolveStatus(status?: string): { index: number; sub: string } {
  const s = (status || '').toLowerCase();
  const sub = status && status.includes(':') ? status.split(':')[1].trim() : '';
  if (s.startsWith('submitted')) return { index: 0, sub: sub || 'Requested' };
  if (s.startsWith('planning')) return { index: 1, sub: sub || 'In Progress' };
  if (s.startsWith('approval')) return { index: 2, sub: sub || 'Pending' };
  if (s.startsWith('implementation') || s.startsWith('deployment') || s.startsWith('build')) return { index: 3, sub: sub || 'In Progress' };
  if (s.startsWith('in review') || s.startsWith('review') || s.startsWith('testing')) return { index: 4, sub: sub || 'In Progress' };
  if (s.startsWith('completed') || s.startsWith('closed')) return { index: 5, sub: sub || 'Closed' };
  return { index: 1, sub: 'In Progress' };
}

const colorFor = (stage: Stage, sub: string) => stage.options.find(o => o.label === sub)?.color || '#F59E0B';

/** Wraps a completed stage in a hover tooltip showing the completion date/time. */
function StageTip({ done, date, children }: { done: boolean; date?: string; children: React.ReactNode }) {
  if (!done || !date) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{date}</TooltipContent>
    </Tooltip>
  );
}

function SubPill({ color, label, compact }: { color: string; label: string; compact: boolean }) {
  // Display-only status badge — the status is changed from the Status field in Properties.
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#DFE5ED] bg-white ${compact ? 'text-[10px]' : 'text-[11px]'} font-medium text-[#364658]`}>
      <span className="size-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="truncate max-w-[90px]">{label}</span>
    </span>
  );
}

interface VariantProps { activeIndex: number; sub: string; compact: boolean }

/* ---------- Option A: Icon Stepper (current product style) ---------- */
function IconStepper({ activeIndex, sub, compact }: VariantProps) {
  const box = compact ? 28 : 34, iconPx = compact ? 14 : 16, center = box / 2;
  return (
    <div className="flex items-start">
      {STAGES.map((stage, i) => {
        const done = i < activeIndex, active = i === activeIndex, last = i === STAGES.length - 1;
        const circle = done ? 'bg-[#22A06B] text-white border-[#22A06B]' : active ? 'bg-[#3D8BD0] text-white border-[#3D8BD0] shadow-[0_1px_5px_rgba(61,139,208,0.3)]' : 'bg-[#F7F9FB] text-[#C2CAD4] border-[#E1E6ED]';
        return (
          <StageTip key={stage.key} done={done} date={stage.date}>
            <div className={`flex-1 flex flex-col items-center relative min-w-0 ${done ? 'cursor-default' : ''}`}>
              {!last && <div className="absolute h-[2px]" style={{ top: center - 1, left: '50%', width: '100%', backgroundColor: i < activeIndex ? '#22A06B' : '#E1E6ED' }} />}
              <div className={`relative z-10 rounded-lg border flex items-center justify-center ${circle}`} style={{ width: box, height: box }}>
                {done ? <Check style={{ width: iconPx, height: iconPx }} /> : stage.icon(iconPx)}
              </div>
              <span className={`mt-1.5 ${compact ? 'text-[10px]' : 'text-[12px]'} font-semibold truncate max-w-full ${active || done ? 'text-[#364658]' : 'text-[#9CA3AF]'}`}>{stage.label}</span>
            </div>
          </StageTip>
        );
      })}
    </div>
  );
}

/* ---------- Option B: Chevron Process Flow ---------- */
function ChevronFlow({ activeIndex, sub, compact }: VariantProps) {
  const H = compact ? 26 : 30, D = compact ? 9 : 11, iconPx = compact ? 12 : 14;
  const clipFor = (i: number, last: boolean) => {
    if (i === 0) return `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%)`;
    if (last) return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${D}px 50%)`;
    return `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%, ${D}px 50%)`;
  };
  return (
    <div className="flex items-start">
      {STAGES.map((stage, i) => {
        const done = i < activeIndex, active = i === activeIndex, last = i === STAGES.length - 1;
        const bg = done ? '#E6F6EF' : active ? '#3D8BD0' : '#EEF2F6';
        const fg = done ? '#1F8A5B' : active ? '#FFFFFF' : '#9CA3AF';
        return (
          <StageTip key={stage.key} done={done} date={stage.date}>
            <div
              className={`flex flex-col items-center flex-shrink-0 ${done ? 'cursor-default' : ''}`}
              style={{ marginLeft: i === 0 ? 0 : -(D - 4) }}
            >
              <div className="flex items-center justify-center gap-1.5 overflow-hidden" style={{ height: H, backgroundColor: bg, color: fg, clipPath: clipFor(i, last), paddingLeft: i === 0 ? 12 : D + 10, paddingRight: last ? 12 : D + 10 }}>
                <span className="flex-shrink-0 flex items-center">{done ? <Check style={{ width: iconPx, height: iconPx }} /> : stage.icon(iconPx)}</span>
                <span className={`${compact ? 'text-[10px]' : 'text-[12px]'} font-semibold leading-none whitespace-nowrap`}>{stage.label}</span>
              </div>
            </div>
          </StageTip>
        );
      })}
    </div>
  );
}

/* ---------- Option C: Numbered Stepper ---------- */
function NumberedStepper({ activeIndex, sub, compact }: VariantProps) {
  const box = compact ? 24 : 28, center = box / 2;
  return (
    <div className="flex items-start">
      {STAGES.map((stage, i) => {
        const done = i < activeIndex, active = i === activeIndex, last = i === STAGES.length - 1;
        const circle = done ? 'bg-[#22A06B] text-white border-[#22A06B]' : active ? 'bg-[#3D8BD0] text-white border-[#3D8BD0]' : 'bg-white text-[#9CA3AF] border-[#D7DEE7]';
        return (
          <StageTip key={stage.key} done={done} date={stage.date}>
            <div className={`flex-1 flex flex-col items-center relative min-w-0 ${done ? 'cursor-default' : ''}`}>
              {!last && <div className="absolute h-[2px]" style={{ top: center - 1, left: '50%', width: '100%', backgroundColor: i < activeIndex ? '#22A06B' : '#E1E6ED' }} />}
              <div className={`relative z-10 rounded-full border flex items-center justify-center font-semibold ${compact ? 'text-[11px]' : 'text-[12px]'} ${circle}`} style={{ width: box, height: box }}>
                {done ? <Check style={{ width: compact ? 13 : 15, height: compact ? 13 : 15 }} /> : i + 1}
              </div>
              <span className={`mt-1.5 ${compact ? 'text-[10px]' : 'text-[12px]'} font-semibold truncate max-w-full ${active || done ? 'text-[#364658]' : 'text-[#9CA3AF]'}`}>{stage.label}</span>
            </div>
          </StageTip>
        );
      })}
    </div>
  );
}

/* ---------- Option D: Segmented Progress Bar ---------- */
function SegmentedBar({ activeIndex, sub, compact }: VariantProps) {
  return (
    <div>
      <div className="flex gap-1">
        {STAGES.map((stage, i) => {
          const done = i < activeIndex, active = i === activeIndex;
          const color = done ? '#22A06B' : active ? '#3D8BD0' : '#E6EAF0';
          return <div key={stage.key} className="flex-1 rounded-full" style={{ height: compact ? 5 : 6, backgroundColor: color }} />;
        })}
      </div>
      <div className="flex mt-2">
        {STAGES.map((stage, i) => {
          const done = i < activeIndex, active = i === activeIndex;
          return (
            <StageTip key={stage.key} done={done} date={stage.date}>
              <div className={`flex-1 flex flex-col items-center min-w-0 px-0.5 ${done ? 'cursor-default' : ''}`}>
                <span className={`${compact ? 'text-[10px]' : 'text-[12px]'} font-semibold truncate max-w-full ${active || done ? 'text-[#364658]' : 'text-[#9CA3AF]'}`}>{stage.label}</span>
              </div>
            </StageTip>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Option E: Pill / Chip Row ---------- */
function PillRow({ activeIndex, sub, compact }: VariantProps) {
  const iconPx = compact ? 13 : 14;
  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map((stage, i) => {
        const done = i < activeIndex, active = i === activeIndex;
        if (active) {
          return (
            <span key={stage.key} className={`inline-flex items-center gap-1.5 rounded-full bg-[#3D8BD0] text-white ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'} font-semibold`}>
              {stage.icon(iconPx)}
              <span>{stage.label}</span>
            </span>
          );
        }
        if (done) {
          return (
            <StageTip key={stage.key} done={done} date={stage.date}>
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#E6F6EF] text-[#1F8A5B] border border-[#BFE6D2] cursor-default ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'} font-medium`}>
                <Check style={{ width: iconPx, height: iconPx }} />
                <span>{stage.label}</span>
              </span>
            </StageTip>
          );
        }
        return (
          <span key={stage.key} className={`inline-flex items-center gap-1.5 rounded-full bg-white text-[#9CA3AF] border border-[#E1E6ED] ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'} font-medium`}>
            {stage.icon(iconPx)}
            <span>{stage.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export function ChangeStagesShowcase({ status, drawerWidth = 1546 }: ShowcaseProps) {
  const { index, sub } = resolveStatus(status);
  const compact = drawerWidth <= 1080;
  const vp = { activeIndex: index, sub, compact };

  // Toggle to `true` to bring back the full design-options review (Options A–E).
  // Kept here intentionally so the other stage-bar styles can be shown again in the future.
  const SHOW_ALL_OPTIONS: boolean = false;

  if (!SHOW_ALL_OPTIONS) {
    // Live stage bar — Chevron Process Flow (Option B).
    return (
      <div className="bg-white px-4 py-3">
        <ChevronFlow {...vp} />
      </div>
    );
  }

  const variants: { label: string; node: React.ReactNode }[] = [
    { label: 'Option A · Icon Stepper (current product style)', node: <IconStepper {...vp} /> },
    { label: 'Option B · Chevron Process Flow', node: <ChevronFlow {...vp} /> },
    { label: 'Option C · Numbered Stepper', node: <NumberedStepper {...vp} /> },
    { label: 'Option D · Segmented Progress Bar', node: <SegmentedBar {...vp} /> },
    { label: 'Option E · Pill / Chip Row', node: <PillRow {...vp} /> },
  ];

  return (
    <div className="bg-white border-b border-[#e5e7eb] px-4 py-4 space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
        Change Lifecycle Stages — Design Options (for review)
      </div>
      <div className="flex items-center gap-1.5 text-[12px] text-[#5A6A7D] bg-[#F0F6FC] border border-[#D6E6F5] rounded-md px-3 py-2">
        <Info size={14} className="text-[#3D8BD0] flex-shrink-0" />
        <span>The stages are read-only. To move this change forward, change the <span className="font-semibold text-[#364658]">Status</span> field in the Properties panel on the right.</span>
      </div>
      {variants.map((v) => (
        <div key={v.label} className="rounded-lg border border-[#EEF1F5] overflow-hidden">
          <div className="px-3 py-1.5 bg-[#F7F9FB] border-b border-[#EEF1F5] text-[11px] font-semibold text-[#5A6A7D]">
            {v.label}
          </div>
          <div className="px-3 py-3.5">{v.node}</div>
        </div>
      ))}
    </div>
  );
}
