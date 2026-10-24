interface ReleaseStatusBadgeProps {
  status:
    | 'Planning: In Progress'
    | 'Submitted: Requested'
    | 'Planning: Cancelled'
    | 'Review: Failed'
    | 'Approval: Pending'
    | 'Deployment: In Progress'
    | 'Build: In Progress'
    | 'Testing: In Progress'
    | 'Completed: Closed';
}

export function ReleaseStatusBadge({ status }: ReleaseStatusBadgeProps) {
  const config: Record<string, { dot: string; text: string }> = {
    'Planning: In Progress':    { dot: '#EAB308', text: '#CA8A04' },
    'Submitted: Requested':     { dot: '#3D8BD0', text: '#2E6BA4' },
    'Planning: Cancelled':      { dot: '#6B7280', text: '#4B5563' },
    'Review: Failed':           { dot: '#EF4444', text: '#DC2626' },
    'Approval: Pending':        { dot: '#F59E0B', text: '#D97706' },
    'Deployment: In Progress':  { dot: '#F97316', text: '#EA580C' },
    'Build: In Progress':       { dot: '#8B5CF6', text: '#7C3AED' },
    'Testing: In Progress':     { dot: '#10B981', text: '#059669' },
    'Completed: Closed':        { dot: '#94A3B8', text: '#64748B' },
  };

  const { dot, text } = config[status] ?? config['Submitted: Requested'];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      <span className="text-[12px] font-medium" style={{ color: text }}>{status}</span>
    </span>
  );
}
