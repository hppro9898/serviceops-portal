import { Circle, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Completed' | 'Pending' | 'Closed' | 'Cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    'Open': {
      icon: Circle,
      color: 'text-[#3D8BD0]',
      label: 'Open',
      fill: true
    },
    'In Progress': {
      icon: Circle,
      color: 'text-[#3D8BD0]',
      label: 'In Progress',
      fill: true
    },
    'Completed': {
      icon: Circle,
      color: 'text-[#22c55e]',
      label: 'Completed',
      fill: true
    },
    'Pending': {
      icon: Circle,
      color: 'text-[#fb923c]',
      label: 'Pending',
      fill: true
    },
    'Closed': {
      icon: Circle,
      color: 'text-[#6b7280]',
      label: 'Closed',
      fill: true
    },
    'Cancelled': {
      icon: Circle,
      color: 'text-[#ef4444]',
      label: 'Cancelled',
      fill: true
    }
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5">
      <Icon size={8} className={color} fill="currentColor" />
      <span className={`text-[12px] font-medium ${color}`}>{label}</span>
    </span>
  );
}