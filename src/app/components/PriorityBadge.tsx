interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getBadgeColor = () => {
    switch (priority) {
      case 'Low':
        return 'bg-[#dcfce7] text-[#16a34a]';
      case 'Medium':
        return 'bg-[#fef3c7] text-[#d97706]';
      case 'High':
        return 'bg-[#fed7aa] text-[#ea580c]';
      case 'Urgent':
        return 'bg-[#fee2e2] text-[#dc2626]';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium ${getBadgeColor()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {priority}
    </span>
  );
}
