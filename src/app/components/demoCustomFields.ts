// Demo custom form fields — mirrors a real customer who has configured 50+
// custom fields, so we can show how the Additional Fields panel scrolls/behaves
// at that scale. Shared between AdditionalFieldsAccordion (the list + pin
// affordance) and PinnedFieldsAccordion (so a pinned custom field resolves to
// its value/color in the top "Pinned Fields" section). Rendered only on the
// ticket detail page, gated by the `demoCustomFields` prop.
//
// `group` = the form-builder SEPARATOR the admin added between field sections;
// the panel renders a small group header whenever the group changes, so the
// long list reads as titled sections instead of one flat wall of fields.
export interface DemoCustomField {
  label: string;
  value: string;
  color?: string;
  group?: string;
}

export const DEMO_CUSTOM_FORM_FIELDS: DemoCustomField[] = [
  // — Requester Details —
  { group: 'Requester Details', label: 'Requester Department', value: 'Information Technology', color: '#3D8BD0' },
  { group: 'Requester Details', label: 'Sub-Department', value: 'Network Operations' },
  { group: 'Requester Details', label: 'Employee ID', value: 'EMP-100245' },
  { group: 'Requester Details', label: 'Reporting Manager', value: 'Rakesh Rathod' },
  { group: 'Requester Details', label: 'Manager Email', value: 'rakesh.rathod@motadata.com' },
  { group: 'Requester Details', label: 'Reporting Group', value: 'Infrastructure', color: '#3D8BD0' },
  { group: 'Requester Details', label: 'Account Type', value: 'Domain', color: '#3D8BD0' },
  { group: 'Requester Details', label: 'Security Group', value: 'IT-Network-Admins' },
  // — Location & Workplace —
  { group: 'Location & Workplace', label: 'Office Location', value: 'Bengaluru, IN', color: '#0D9488' },
  { group: 'Location & Workplace', label: 'Floor', value: '3rd Floor' },
  { group: 'Location & Workplace', label: 'Desk Number', value: 'Seat 4-B' },
  { group: 'Location & Workplace', label: 'Building Access Level', value: 'Level 2', color: '#F59E0B' },
  { group: 'Location & Workplace', label: 'Region', value: 'APAC', color: '#0D9488' },
  { group: 'Location & Workplace', label: 'Country', value: 'India' },
  { group: 'Location & Workplace', label: 'State', value: 'Karnataka' },
  { group: 'Location & Workplace', label: 'City', value: 'Bengaluru' },
  { group: 'Location & Workplace', label: 'Postal Code', value: '560103' },
  { group: 'Location & Workplace', label: 'Work Shift', value: 'General (9 - 6)' },
  { group: 'Location & Workplace', label: 'Time Zone', value: 'IST (GMT +5:30)' },
  // — Asset & Network —
  { group: 'Asset & Network', label: 'Asset Tag', value: 'AST-90432' },
  { group: 'Asset & Network', label: 'Configuration Item', value: 'LAP-IT-0245' },
  { group: 'Asset & Network', label: 'Hardware Vendor', value: 'Cisco Systems', color: '#8B5CF6' },
  { group: 'Asset & Network', label: 'Vendor Ticket #', value: 'CISCO-559021' },
  { group: 'Asset & Network', label: 'Warranty Status', value: 'In Warranty', color: '#22A06B' },
  { group: 'Asset & Network', label: 'VPN Profile', value: 'corp-split-tunnel' },
  { group: 'Asset & Network', label: 'Network Segment', value: 'VLAN 30' },
  { group: 'Asset & Network', label: 'IP Address', value: '192.168.1.84' },
  { group: 'Asset & Network', label: 'MAC Address', value: '3C:22:FB:8A:11:09' },
  { group: 'Asset & Network', label: 'Hostname', value: 'LAP-IT-0245' },
  { group: 'Asset & Network', label: 'OS Version', value: 'Windows 11 Pro 23H2' },
  { group: 'Asset & Network', label: 'Antivirus Status', value: 'Compliant', color: '#22A06B' },
  { group: 'Asset & Network', label: 'Patch Compliance', value: '98%', color: '#F59E0B' },
  { group: 'Asset & Network', label: 'Last Hardware Scan', value: '02 Mar 2025, 08:42' },
  // — Service Details —
  { group: 'Service Details', label: 'Service Category', value: 'Network & Connectivity', color: '#3D8BD0' },
  { group: 'Service Details', label: 'Service Sub-Category', value: 'Wired / Wireless' },
  { group: 'Service Details', label: 'SLA Plan', value: 'Gold', color: '#F59E0B' },
  { group: 'Service Details', label: 'Operational Hours', value: '24 x 7' },
  // — Approval & Priority —
  { group: 'Approval & Priority', label: 'Approval Required', value: 'Yes', color: '#22A06B' },
  { group: 'Approval & Priority', label: 'Approver', value: 'Sarah Johnson' },
  { group: 'Approval & Priority', label: 'Urgency Justification', value: 'Business Critical', color: '#EF4444' },
  { group: 'Approval & Priority', label: 'Impact Scope', value: 'Department-wide', color: '#F59E0B' },
  // — Finance & Procurement —
  { group: 'Finance & Procurement', label: 'Cost Code', value: 'CC-1001' },
  { group: 'Finance & Procurement', label: 'GL Account', value: '6000-IT-NET' },
  { group: 'Finance & Procurement', label: 'Budget Line', value: 'FY25-OPEX' },
  { group: 'Finance & Procurement', label: 'Purchase Order #', value: 'PO-2407-118' },
  { group: 'Finance & Procurement', label: 'Contract Reference', value: 'CON-44' },
  { group: 'Finance & Procurement', label: 'Project Code', value: 'PRJ-NET-2025' },
  { group: 'Finance & Procurement', label: 'Billing Type', value: 'Internal', color: '#94A3B8' },
  // — Contact Preferences —
  { group: 'Contact Preferences', label: 'Preferred Contact', value: 'Email', color: '#3D8BD0' },
  { group: 'Contact Preferences', label: 'Alternate Contact', value: '+91 98765 43221' },
  { group: 'Contact Preferences', label: 'Preferred Language', value: 'English' },
  { group: 'Contact Preferences', label: 'Remote Work Eligible', value: 'Yes', color: '#22A06B' },
  // — Compliance & Security —
  { group: 'Compliance & Security', label: 'Data Classification', value: 'Confidential', color: '#EF4444' },
  { group: 'Compliance & Security', label: 'Compliance Tag', value: 'ISO 27001', color: '#8B5CF6' },
];
