interface ChangeStatusBadgeProps {
  status:
    | 'Submitted: Requested'
    | 'Approval: Pending'
    | 'Planning: In Progress'
    | 'Planning: Pre Approval'
    | 'Implementation: In Progress'
    | 'Submitted: Rejected'
    | 'Completed: Closed';
}

export function ChangeStatusBadge({ status }: ChangeStatusBadgeProps) {
  const config: Record<string, { dot: string; text: string }> = {
    'Submitted: Requested':       { dot: '#3D8BD0', text: '#2E6BA4' },
    'Approval: Pending':          { dot: '#F59E0B', text: '#D97706' },
    'Planning: In Progress':      { dot: '#EAB308', text: '#CA8A04' },
    'Planning: Pre Approval':     { dot: '#94A3B8', text: '#64748B' },
    'Implementation: In Progress':{ dot: '#F97316', text: '#EA580C' },
    'Submitted: Rejected':        { dot: '#EF4444', text: '#DC2626' },
    'Completed: Closed':          { dot: '#6B7280', text: '#4B5563' },
  };

  const { dot, text } = config[status] ?? config['Submitted: Requested'];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      <span className="text-[12px] font-medium" style={{ color: text }}>{status}</span>
    </span>
  );
}
