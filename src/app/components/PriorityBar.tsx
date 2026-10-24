import { Circle } from 'lucide-react';

interface PriorityBarProps {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export function PriorityBar({ priority }: PriorityBarProps) {
  const config = {
    'Low': {
      color: 'text-[#22c55e]',
      label: 'Low'
    },
    'Medium': {
      color: 'text-[#fb923c]',
      label: 'Medium'
    },
    'High': {
      color: 'text-[#ef4444]',
      label: 'High'
    },
    'Urgent': {
      color: 'text-[#dc2626]',
      label: 'Urgent'
    }
  };

  const { color, label } = config[priority];

  return (
    <span className="inline-flex items-center gap-1.5">
      <Circle size={8} className={color} fill="currentColor" />
      <span className="text-[12px] text-[#6b7280]">{label}</span>
    </span>
  );
}