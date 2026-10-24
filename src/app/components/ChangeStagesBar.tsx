import { LogIn, ClipboardList, FileCheck, Wrench, ScanSearch, CheckCheck, Check } from 'lucide-react';

interface ChangeStagesBarProps {
  /** The full change status string, e.g. "Planning: In Progress" */
  status?: string;
  /** Drawer width — drives the compact layout for narrow/half view */
  drawerWidth?: number;
}

interface Stage {
  key: string;
  label: string;
  icon: (size: number) => React.ReactNode;
  options: { label: string; color: string }[];
  completedLabel: string;
}

const STAGES: Stage[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    icon: (s) => <LogIn style={{ width: s, height: s }} />,
    options: [
      { label: 'Requested', color: '#3D8BD0' },
      { label: 'Accepted', color: '#22A06B' },
      { label: 'Rejected', color: '#E5484D' },
    ],
    completedLabel: 'Accepted',
  },
  {
    key: 'planning',
    label: 'Planning',
    icon: (s) => <ClipboardList style={{ width: s, height: s }} />,
    options: [
      { label: 'In Progress', color: '#F59E0B' },
      { label: 'Pre Approved', color: '#9CA3AF' },
      { label: 'Cancelled', color: '#E5484D' },
      { label: 'Completed', color: '#22A06B' },
    ],
    completedLabel: 'Completed',
  },
  {
    key: 'approval',
    label: 'Approval',
    icon: (s) => <FileCheck style={{ width: s, height: s }} />,
    options: [
      { label: 'Pending', color: '#F59E0B' },
      { label: 'Approved', color: '#22A06B' },
      { label: 'Rejected', color: '#E5484D' },
    ],
    completedLabel: 'Approved',
  },
  {
    key: 'implementation',
    label: 'Implementation',
    icon: (s) => <Wrench style={{ width: s, height: s }} />,
    options: [
      { label: 'In Progress', color: '#F59E0B' },
      { label: 'Build', color: '#8B5CF6' },
      { label: 'Deployment', color: '#F97316' },
      { label: 'Completed', color: '#22A06B' },
    ],
    completedLabel: 'Completed',
  },
  {
    key: 'review',
    label: 'In Review',
    icon: (s) => <ScanSearch style={{ width: s, height: s }} />,
    options: [
      { label: 'In Progress', color: '#F59E0B' },
      { label: 'Testing', color: '#22A06B' },
      { label: 'Failed', color: '#E5484D' },
      { label: 'Passed', color: '#22A06B' },
    ],
    completedLabel: 'Passed',
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: (s) => <CheckCheck style={{ width: s, height: s }} />,
    options: [
      { label: 'Closed', color: '#6B7280' },
      { label: 'Cancelled', color: '#E5484D' },
    ],
    completedLabel: 'Closed',
  },
];

/** Map a change status string to the active stage index + sub-status label. */
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

export function ChangeStagesBar({ status, drawerWidth = 1546 }: ChangeStagesBarProps) {
  const { index: activeIndex, sub: subStatus } = resolveStatus(status);

  const compact = drawerWidth <= 1080;
  const H = compact ? 26 : 30;          // chevron height
  const D = compact ? 9 : 11;           // arrow depth
  const iconPx = compact ? 12 : 14;
  const labelCls = compact ? 'text-[10px]' : 'text-[12px]';
  const subCls = compact ? 'text-[10px]' : 'text-[11px]';

  const activeStage = STAGES[activeIndex];
  const activeColor = activeStage?.options.find(o => o.label === subStatus)?.color || '#F59E0B';

  const clipFor = (i: number, last: boolean) => {
    if (i === 0) return `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%)`;
    if (last) return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${D}px 50%)`;
    return `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%, ${D}px 50%)`;
  };

  return (
    <div className={`bg-white border-b border-[#e5e7eb] px-4 ${compact ? 'py-2.5' : 'py-3'}`}>
      <div className="flex items-start">
        {STAGES.map((stage, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === STAGES.length - 1;

          const bg = isCompleted ? '#E6F6EF' : isActive ? '#3D8BD0' : '#EEF2F6';
          const fg = isCompleted ? '#1F8A5B' : isActive ? '#FFFFFF' : '#9CA3AF';

          return (
            <div
              key={stage.key}
              className="flex flex-col items-center flex-shrink-0"
              style={{ marginLeft: i === 0 ? 0 : -(D - 4) }}
            >
              {/* Chevron */}
              <div
                className="flex items-center justify-center gap-1.5 overflow-hidden"
                style={{
                  height: H,
                  backgroundColor: bg,
                  color: fg,
                  clipPath: clipFor(i, isLast),
                  paddingLeft: i === 0 ? 12 : D + 10,
                  paddingRight: isLast ? 12 : D + 10,
                }}
              >
                <span className="flex-shrink-0 flex items-center justify-center">
                  {isCompleted ? <Check style={{ width: iconPx, height: iconPx }} /> : stage.icon(iconPx)}
                </span>
                <span className={`${labelCls} font-semibold leading-none whitespace-nowrap`}>{stage.label}</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
