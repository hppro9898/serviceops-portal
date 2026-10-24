interface ProblemStatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Pending' | 'Pending QA' | 'Resolved' | 'Closed';
}

export function ProblemStatusBadge({ status }: ProblemStatusBadgeProps) {
  const config: Record<string, { dot: string; text: string }> = {
    'Open':       { dot: '#F59E0B', text: '#D97706' },
    'In Progress':{ dot: '#6366F1', text: '#4F46E5' },
    'Pending':    { dot: '#8B5CF6', text: '#7C3AED' },
    'Pending QA': { dot: '#64748B', text: '#475569' },
    'Resolved':   { dot: '#10B981', text: '#059669' },
    'Closed':     { dot: '#6B7280', text: '#4B5563' },
  };

  const { dot, text } = config[status] ?? config['Open'];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      <span className="text-[12px] font-medium" style={{ color: text }}>{status}</span>
    </span>
  );
}
