import { CheckCircle, FileText, Mail, XCircle } from 'lucide-react';

// AI Reply Options
export const aiOptions = [
  { label: 'Acknowledge', icon: CheckCircle, color: 'text-[#10B981]' },
  { label: 'Request Additional Details', icon: FileText, color: 'text-[#3D8BD0]' },
  { label: 'Follow up', icon: Mail, color: 'text-[#F59E0B]' },
  { label: 'Request Closure\nConfirmation', icon: XCircle, color: 'text-[#EF4444]' },
];

// AI Response Templates
export const getAIResponse = (option: string): string => {
  const responses: { [key: string]: string } = {
    'Acknowledge': "Thank you for reaching out to us. We've received your request and our team is reviewing it. We appreciate your patience and will get back to you shortly with an update.",
    'Request Additional Details': "Thank you for contacting us. To better assist you with this issue, could you please provide us with some additional information? Specifically, we would need to know more details about when this issue started occurring and any error messages you may have encountered. This will help us resolve your request more efficiently.",
    'Follow up': "I wanted to follow up on your recent request to ensure everything has been resolved to your satisfaction. If you're still experiencing any issues or have additional questions, please don't hesitate to let us know. We're here to help!",
    'Request Closure\nConfirmation': "We believe we've successfully resolved your issue. Before we close this request, could you please confirm that everything is working as expected on your end? If you have any remaining concerns or questions, please let us know and we'll be happy to assist you further."
  };
  return responses[option] || "Thank you for your message. We're looking into this and will get back to you soon.";
};

// Date/Time formatting helper
export const formatDateTime = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${dayName}, ${day}/${month}/${year} ${hours}:${minutes}`;
};

// AI typing animation helper
export const createAITypingEffect = (
  text: string,
  onUpdate: (currentText: string) => void,
  onComplete: () => void
) => {
  const thinkingDelay = 800 + Math.random() * 700; // Random delay between 800-1500ms
  
  setTimeout(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        onUpdate(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        onComplete();
      }
    }, 20); // Typing speed: 20ms per character
  }, thinkingDelay);
};

/** Build seeded cross-module relations (default 4 per type) so a drawer's Relations tab is populated and items can be opened as same-drawer tabs. */
export function makeCrossModuleRelations(specs: { type: string; prefix: string; count?: number }[]) {
  const subs = ['VPN connection timeout', 'Email delivery issues', 'Application access request', 'Network connectivity problem', 'Software license renewal', 'Hardware replacement needed', 'Security patch installation', 'User account creation'];
  const st = ['Open', 'In Progress', 'Pending', 'Resolved'];
  const pr = ['High', 'Medium', 'Urgent', 'Low'];
  const names = ['John Doe', 'Neha Raje', 'Rohan Mehta', 'Priya Nair'];
  const out: { id: string; type: string; ticketId: string; subject: string; status: string; assignedTo: { name: string }; priority: string }[] = [];
  specs.forEach(({ type, prefix, count = 4 }) => {
    for (let i = 0; i < count; i++) {
      out.push({ id: `def-${type}-${i}`, type, ticketId: `${prefix}-${1001 + i}`, subject: subs[i % subs.length], status: st[i % st.length], assignedTo: { name: names[i % names.length] }, priority: pr[i % pr.length] });
    }
  });
  return out;
}

// Properties Panel Relation Modal Helper Functions
export const getPropertiesRelationMockTickets = (type: string) => {
  const prefix = type === 'Request' ? 'REQ' : 
                 type === 'Problem' ? 'PRB' :
                 type === 'Change' ? 'CHG' :
                 type === 'Release' ? 'REL' :
                 type === 'Asset' ? 'AST' :
                 type === 'CI' ? 'CI' :
                 type === 'Contract' ? 'CNT' :
                 type === 'Knowledge' ? 'KB' :
                 type === 'Purchase' ? 'PO' : 'PRJ';
  
  const statuses = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const subjects = [
    'System performance degradation',
    'Email delivery issues',
    'VPN connection timeout',
    'Application access request',
    'Software license renewal',
    'Hardware replacement needed',
    'Network connectivity problem',
    'Security patch installation',
    'User account creation',
    'Database access permission needed'
  ];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${type}-${i + 1}`,
    ticketId: `${prefix}-${(1000 + i).toString()}`,
    subject: subjects[i],
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length]
  }));
};

export const getStatusDotColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-[#1E40AF]';
    case 'in progress':
      return 'bg-[#92400E]';
    case 'pending':
      return 'bg-[#D97706]';
    case 'resolved':
      return 'bg-[#065F46]';
    case 'closed':
      return 'bg-[#374151]';
    default:
      return 'bg-[#6B7280]';
  }
};

export const getPriorityDotColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-[#DC2626]';
    case 'medium':
      return 'bg-[#D97706]';
    case 'low':
      return 'bg-[#2563EB]';
    default:
      return 'bg-[#6B7280]';
  }
};

// Dropdown Options Data
export const statusOptions = [
  { label: 'Open', color: '#3B82F6' },
  { label: 'In Progress', color: '#F59E0B' },
  { label: 'Pending', color: '#8B5CF6' },
  { label: 'On Hold', color: '#F97316' },
  { label: 'Resolved', color: '#10B981' },
  { label: 'Closed', color: '#6B7280' },
];

export const priorityOptions = [
  { label: 'Urgent', bars: 4, color: '#E74C3C' },
  { label: 'High', bars: 3, color: '#F59E0B' },
  { label: 'Medium', bars: 2, color: '#3D8BD0' },
  { label: 'Low', bars: 1, color: '#10B981' },
];

export const assigneeOptions = [
  { label: 'Sarah Johnson', initials: 'SJ', color: '#3D8BD0', statusColor: '#10B981' },
  { label: 'Michael Chen', initials: 'MC', color: '#8B5CF6', statusColor: '#10B981' },
  { label: 'Emma Wilson', initials: 'EW', color: '#EC4899', statusColor: '#F59E0B' },
  { label: 'David Kim', initials: 'DK', color: '#F59E0B', statusColor: '#6B7280' },
  { label: 'Lisa Anderson', initials: 'LA', color: '#10B981', statusColor: '#10B981' },
];

export const techGroupOptions = [
  { label: 'IT Support Team' },
  { label: 'Network Team' },
  { label: 'Security Team' },
  { label: 'Database Team' },
];

export const urgencyOptions = [
  { label: 'Critical', color: '#E74C3C' },
  { label: 'High', color: '#F59E0B' },
  { label: 'Medium', color: '#3D8BD0' },
  { label: 'Low', color: '#10B981' },
];

export const impactOptions = [
  { label: 'Affects Multiple Users', color: '#E74C3C' },
  { label: 'Affects Department', color: '#F59E0B' },
  { label: 'Affects Single User', color: '#3D8BD0' },
  { label: 'Minimal Impact', color: '#10B981' },
];

export const categoryOptions = [
  { label: 'Hardware' },
  { label: 'Software' },
  { label: 'Network' },
  { label: 'Security' },
];

export const departmentOptions = [
  { label: 'IT' },
  { label: 'HR' },
  { label: 'Finance' },
  { label: 'Operations' },
];

export const sourceOptions = [
  { label: 'Email' },
  { label: 'Phone' },
  { label: 'Portal' },
  { label: 'Chat' },
];

export const locationOptions = [
  { label: 'New York, NY' },
  { label: 'San Francisco, CA' },
  { label: 'Chicago, IL' },
  { label: 'Austin, TX' },
];

export const vendorOptions = [
  { label: 'Dell Inc.' },
  { label: 'HP Enterprise' },
  { label: 'Cisco Systems' },
  { label: 'Microsoft' },
];

export const supportLevelOptions = [
  { label: 'Level 1' },
  { label: 'Level 2' },
  { label: 'Level 3' },
];

export const projectNameOptions = [
  { label: 'Network Infrastructure', color: '#3D8BD0' },
  { label: 'Cloud Migration', color: '#8B5CF6' },
  { label: 'Security Upgrade', color: '#F59E0B' },
];

export const costCenterOptions = [
  { label: 'CC-1001', color: '#3D8BD0' },
  { label: 'CC-2002', color: '#8B5CF6' },
  { label: 'CC-3003', color: '#F59E0B' },
];

export const buildingOptions = [
  { label: 'Main Office - Building A' },
  { label: 'Main Office - Building B' },
  { label: 'Remote Office - East' },
];

export const requestChannelOptions = [
  { label: 'Portal', color: '#3D8BD0' },
  { label: 'Email', color: '#8B5CF6' },
  { label: 'Phone', color: '#F59E0B' },
  { label: 'Chat', color: '#10B981' },
];

// Static Data
export const staticLinkedTickets = [
  { id: 'REQ-5678', title: 'Network Configuration Issue', status: 'In Progress', assignee: 'Michael Chen', initials: 'MC', color: '#8B5CF6', relationship: 'Related to' },
  { id: 'REQ-3456', title: 'VPN Access Request', status: 'Resolved', assignee: 'Emma Wilson', initials: 'EW', color: '#EC4899', relationship: 'Duplicate of' },
];

export const availableSimilarTickets = [
  { id: 'REQ-8901', type: 'Request', title: 'Laptop Network Connectivity Problem', status: 'Open', assignee: 'David Martinez', initials: 'DM', color: '#F59E0B', match: '85% match' },
  { id: 'REQ-7890', type: 'Request', title: 'Cannot Connect to WiFi Network', status: 'Resolved', assignee: 'Lisa Anderson', initials: 'LA', color: '#10B981', match: '78% match' },
  { id: 'PRB-4412', type: 'Problem', title: 'Recurring Network Drops on Floor 3', status: 'In Progress', assignee: 'Sarah Johnson', initials: 'SJ', color: '#3D8BD0', match: '74% match' },
  { id: 'REQ-6789', type: 'Request', title: 'Network Adapter Not Working', status: 'In Progress', assignee: 'Sarah Johnson', initials: 'SJ', color: '#3D8BD0', match: '72% match' },
  { id: 'CHG-2091', type: 'Change', title: 'Core Switch Firmware Upgrade', status: 'Open', assignee: 'Michael Chen', initials: 'MC', color: '#8B5CF6', match: '68% match' },
];

// Helper Functions
export const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Requested':
      return {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#1E40AF]',
        dot: 'bg-[#3B82F6]'
      };
    case 'Approved':
      return {
        bg: 'bg-[#ECFDF5]',
        text: 'text-[#065F46]',
        dot: 'bg-[#10B981]'
      };
    case 'Rejected':
      return {
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#991B1B]',
        dot: 'bg-[#EF4444]'
      };
    case 'Pending':
      return {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#92400E]',
        dot: 'bg-[#F59E0B]'
      };
    default:
      return {
        bg: 'bg-[#F3F4F6]',
        text: 'text-[#6B7280]',
        dot: 'bg-[#9CA3AF]'
      };
  }
};

// Field Management Functions
export const getFilteredPinnedFields = (pinnedFields: string[], searchQuery: string) => {
  if (!searchQuery) return pinnedFields;
  return pinnedFields.filter(field => 
    field.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export const getGroupTitle = (activeGroup: string) => {
  if (activeGroup === 'properties') return 'Request Properties';
  if (activeGroup === 'activity') return 'Activity & Resources';
  if (activeGroup === 'chatbot') return 'ServiceOps AI';
  if (activeGroup === 'users') return 'Users';
  if (activeGroup === 'notes') return 'Notes';
  return 'AI Suggestions';
};

export const getCurrentStatusColor = (selectedStatus: string) => {
  return statusOptions.find(s => s.label === selectedStatus)?.color || '#3B82F6';
};

export const getCurrentPriorityColor = (selectedPriority: string) => {
  return priorityOptions.find(p => p.label === selectedPriority)?.color || '#3D8BD0';
};

export const getCurrentAssigneeColor = (selectedAssignee: string) => {
  return assigneeOptions.find(a => a.label === selectedAssignee)?.color || '#3D8BD0';
};

export const getCurrentUrgencyColor = (selectedUrgency: string) => {
  return urgencyOptions.find(u => u.label === selectedUrgency)?.color || '#3D8BD0';
};

export const getCurrentImpactColor = (selectedImpact: string) => {
  return impactOptions.find(i => i.label === selectedImpact)?.color || '#3D8BD0';
};

export const getCurrentProjectNameColor = (selectedProjectName: string) => {
  return projectNameOptions.find(p => p.label === selectedProjectName)?.color || '#3D8BD0';
};

export const getCurrentCostCenterColor = (selectedCostCenter: string) => {
  return costCenterOptions.find(c => c.label === selectedCostCenter)?.color || '#3D8BD0';
};

export const getCurrentRequestChannelColor = (selectedRequestChannel: string) => {
  return requestChannelOptions.find(r => r.label === selectedRequestChannel)?.color || '#3D8BD0';
};

export const getFilteredTicketFields = (pinnedFields: string[], showMoreFields: boolean, searchQuery: string) => {
  // 7 upfront fields (with Tags, rendered unconditionally by the accordion, as #7);
  // the rest sit behind "View more". Shared by Ticket/Problem/Change/Release.
  const basicFields = ['Status', 'Priority', 'Assignee', 'Technician Group', 'Urgency', 'Impact'];
  const additionalFields = ['Category', 'Department', 'Source', 'Location', 'Vendor', 'Support Level'];
  
  // If showMoreFields is true or there's a search query, include all fields
  const allFields = showMoreFields || searchQuery 
    ? [...basicFields, ...additionalFields]
    : basicFields;
  
  return allFields.filter(field => 
    !pinnedFields.includes(field) &&
    (!searchQuery || field.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};

export const getFilteredAdditionalFormFields = (pinnedFields: string[], searchQuery: string) => {
  const formFields = ['Project Name', 'Cost Center', 'Business Unit', 'Building', 'Request Channel'];
  return formFields.filter(field =>
    !pinnedFields.includes(field) &&
    (!searchQuery || field.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};

// SLA breach penalty shown on the SLA Status card and history popup. Records
// that are on track (e.g. INC-32) carry no penalty and the card hides the row;
// breached ones incur a flat demo amount.
export const getSlaPenaltyAmount = (id?: string): number => {
  if (!id || id === 'INC-32') return 0;
  return 250;
};

export const formatPenaltyAmount = (amount: number): string => `$${amount.toFixed(2)}`;

export const getFilteredAdditionalFields = (pinnedFields: string[], searchQuery: string) => {
  const fields = [
    'Current SLA',
    'Resolution Escalation Level',
    'Response Escalation Level',
    'First Response Due By',
    'First Response Date',
    'Request Type',
    'Request Age',
    'Last Updated Date',
    'Last Approved Date',
    'Created By',
    'Last Updated By',
    'Created Date',
    'Modified By',
    'Modified Date'
  ];
  return fields.filter(field => 
    !pinnedFields.includes(field) &&
    (!searchQuery || field.toLowerCase().includes(searchQuery.toLowerCase()))
  );
};