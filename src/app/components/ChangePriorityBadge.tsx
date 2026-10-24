import { Circle } from 'lucide-react';

interface ChangePriorityBadgeProps {
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'Low' | 'Medium' | 'High' | 'Urgent';
}

export function ChangePriorityBadge({ priority }: ChangePriorityBadgeProps) {
  const config: Record<string, { color: string; label: string }> = {
    'P1':     { color: 'text-[#1f2937]', label: 'P1' },
    'P2':     { color: 'text-[#ef4444]', label: 'P2' },
    'P3':     { color: 'text-[#fb923c]', label: 'P3' },
    'P4':     { color: 'text-[#22c55e]', label: 'P4' },
    'Low':    { color: 'text-[#22c55e]', label: 'Low' },
    'Medium': { color: 'text-[#fb923c]', label: 'Medium' },
    'High':   { color: 'text-[#ef4444]', label: 'High' },
    'Urgent': { color: 'text-[#dc2626]', label: 'Urgent' },
  };

  const { color, label } = config[priority] ?? config['Medium'];

  return (
    <span className="inline-flex items-center gap-1.5">
      <Circle size={8} className={color} fill="currentColor" />
      <span className="text-[12px] text-[#6b7280]">{label}</span>
    </span>
  );
}
