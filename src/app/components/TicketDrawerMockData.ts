// Mock data for TicketDrawer component

export const watchers = [
  { id: '1', name: 'John Doe', email: 'john.doe@company.com', avatar: 'JD' },
  { id: '2', name: 'Sarah Smith', email: 'sarah.smith@company.com', avatar: 'SS' },
  { id: '3', name: 'Michael Chen', email: 'michael.chen@company.com', avatar: 'MC' }
];

export const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'resolved', label: 'Resolved' }
];

export const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export const assigneeOptions = [
  { value: 'john', label: 'John Doe' },
  { value: 'sarah', label: 'Sarah Smith' },
  { value: 'michael', label: 'Michael Chen' },
  { value: 'emily', label: 'Emily Rodriguez' }
];

export const techGroupOptions = [
  { value: 'infrastructure', label: 'Infrastructure Team' },
  { value: 'application', label: 'Application Support' },
  { value: 'network', label: 'Network Team' }
];

export const urgencyOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const impactOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const categoryOptions = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' }
];

export const departmentOptions = [
  { value: 'it', label: 'IT' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'sales', label: 'Sales' }
];

export const sourceOptions = [
  { value: 'email', label: 'Email' },
  { value: 'portal', label: 'Portal' },
  { value: 'phone', label: 'Phone' }
];

export const locationOptions = [
  { value: 'ny', label: 'New York Office' },
  { value: 'sf', label: 'San Francisco Office' },
  { value: 'remote', label: 'Remote' }
];

export const catalogItems = [
  {
    id: 1,
    name: 'Apple MacBook Pro',
    description: 'High-performance laptop designed for professionals. Features M3 Pro chip and Retina display.',
    price: '$1,159.00',
    category: 'Hardware',
    icon: 'macbook'
  },
  {
    id: 2,
    name: 'Dell UltraSharp 27" Monitor',
    description: '4K UHD display with stunning color accuracy and ergonomic design for productivity.',
    price: '$549.00',
    category: 'Hardware',
    icon: 'monitor'
  },
  {
    id: 3,
    name: 'Wireless Keyboard & Mouse Combo',
    description: 'Ergonomic wireless keyboard and mouse set with long battery life.',
    price: '$89.00',
    category: 'Accessories',
    icon: 'keyboard'
  },
  {
    id: 4,
    name: 'Ergonomic Office Chair',
    description: 'Premium ergonomic chair with lumbar support and adjustable armrests.',
    price: '$399.00',
    category: 'Furniture',
    icon: 'chair'
  },
  {
    id: 5,
    name: 'Microsoft Office 365 License',
    description: 'Annual subscription to Microsoft Office suite including Word, Excel, PowerPoint, and Teams.',
    price: '$149.00/year',
    category: 'Software',
    icon: 'office'
  },
  {
    id: 6,
    name: 'Apple iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
    price: '$999.00',
    category: 'Mobile Device',
    icon: 'iphone'
  }
];

export const initialAttachments = [
  { id: '1', name: 'network-diagram.pdf', size: '2.4 MB', uploadedBy: 'Sarah Johnson' },
  { id: '2', name: 'error-screenshot.png', size: '856 KB', uploadedBy: 'Michael Chen' },
  { id: '3', name: 'system-logs.txt', size: '124 KB', uploadedBy: 'Sarah Johnson' },
  { id: '4', name: 'configuration.xml', size: '45 KB', uploadedBy: 'Sarah Johnson' },
  { id: '5', name: 'troubleshooting-guide.docx', size: '1.2 MB', uploadedBy: 'Michael Chen' },
];

export const availableSimilarTickets = [
  {
    id: 'INC-1234',
    subject: 'Network connectivity issues in Building A',
    status: 'Resolved',
    similarity: 95
  },
  {
    id: 'INC-1189',
    subject: 'Unable to connect to VPN from home',
    status: 'Resolved',
    similarity: 87
  },
  {
    id: 'INC-1045',
    subject: 'Internet connection dropping intermittently',
    status: 'Closed',
    similarity: 82
  }
];

export const suggestedKnowledgeArticles = [
  {
    id: 'KB-001',
    title: 'How to Troubleshoot Network Connectivity Issues',
    category: 'Network',
    views: 1245,
    helpful: 98
  },
  {
    id: 'KB-045',
    title: 'VPN Connection Best Practices',
    category: 'Security',
    views: 892,
    helpful: 95
  },
  {
    id: 'KB-123',
    title: 'Common Wi-Fi Problems and Solutions',
    category: 'Network',
    views: 2103,
    helpful: 91
  }
];
