/* The CMDB's CI-type hierarchy — the tree that drives the CMDB listing's left panel.
 *
 * A CI type is not a flat label: "Windows Laptop" is a kind of Laptop, which is a kind of
 * Hardware, which is a kind of CI. Selecting a branch has to show everything BENEATH it,
 * because that is what a hierarchy means — picking Hardware and seeing only the rows literally
 * typed "Hardware" would make every parent node look almost empty.
 *
 * Branches that carry no CIs yet are still listed. The tree is the CMDB's shape, not a report
 * of what happens to be populated, and hiding an empty branch would make the estate look
 * smaller than the model it is stored in.
 */

export interface CiTypeNode {
  id: string;
  label: string;
  /** lucide icon name, resolved by the panel */
  icon: string;
  children?: CiTypeNode[];
}

export const CMDB_TREE: CiTypeNode = {
  id: 'base-ci',
  label: 'Base CI',
  icon: 'Database',
  children: [
    {
      id: 'hardware',
      label: 'Hardware',
      icon: 'Cpu',
      children: [
        { id: 'server', label: 'Server', icon: 'Server' },
        { id: 'desktops', label: 'Desktops', icon: 'Monitor' },
        { id: 'laptops', label: 'Laptops', icon: 'Laptop' },
        { id: 'network-devices', label: 'Network Devices', icon: 'Network' },
        { id: 'storage-devices', label: 'Storage Devices', icon: 'HardDrive' },
        { id: 'printers', label: 'Printers', icon: 'Printer' },
        { id: 'mobile-devices', label: 'Mobile Devices', icon: 'Smartphone' },
        { id: 'ups', label: 'UPS', icon: 'BatteryCharging' },
        { id: 'chassis', label: 'Chassis', icon: 'Box' },
        { id: 'rack', label: 'Rack', icon: 'Rows3' },
      ],
    },
    { id: 'infrastructure', label: 'Infrastructure', icon: 'Building2', children: [
      { id: 'data-centre', label: 'Data Centre', icon: 'Building2' },
      { id: 'network-segment', label: 'Network Segment', icon: 'Network' },
    ] },
    { id: 'services', label: 'Services', icon: 'Workflow', children: [
      /* Business Applications sit under Business Service, as they do in the live product. They
         are what a BOM belongs to — one BOM licence each — so this is where every application
         added in BOM › Business Applications lands. */
      { id: 'business-service', label: 'Business Service', icon: 'Workflow', children: [
        { id: 'business-applications', label: 'Business Applications', icon: 'AppWindow' },
      ] },
      { id: 'technical-service', label: 'Technical Service', icon: 'Workflow' },
    ] },
    { id: 'virtualization', label: 'Virtualization', icon: 'Boxes', children: [
      { id: 'virtual-machine', label: 'Virtual Machine', icon: 'Boxes' },
      { id: 'hypervisor', label: 'Hypervisor', icon: 'Boxes' },
    ] },
    { id: 'public-cloud', label: 'Public Cloud Services', icon: 'Cloud', children: [
      { id: 'cloud-compute', label: 'Compute', icon: 'Cloud' },
      { id: 'cloud-storage', label: 'Storage', icon: 'Cloud' },
    ] },
    { id: 'private-cloud', label: 'Private Cloud Services', icon: 'CloudCog', children: [
      { id: 'private-compute', label: 'Compute', icon: 'CloudCog' },
    ] },
    {
      id: 'application',
      label: 'Application',
      icon: 'AppWindow',
      children: [
        /* No "Software Application" node. Installed software is a ROW on its host's Software
           tab, not a CI: promoting every installed product to a CI would spend a CMDB licence on
           each one. What the business runs is a Business Application, under Services. */
        { id: 'web-server', label: 'Web Server', icon: 'Globe' },
        { id: 'application-server', label: 'Application Server', icon: 'Server' },
        { id: 'database', label: 'Database', icon: 'Database' },
      ],
    },
  ],
};

/** Every node, flattened — used for lookups and for the panel's search. */
export const flattenTree = (n: CiTypeNode = CMDB_TREE): CiTypeNode[] =>
  [n, ...(n.children ?? []).flatMap((c) => flattenTree(c))];

const ALL_NODES = flattenTree();
export const nodeById = (id: string) => ALL_NODES.find((n) => n.id === id);

/** A node's id plus every id below it. Selecting a branch selects its subtree. */
export function subtreeIds(id: string): Set<string> {
  const find = (n: CiTypeNode): CiTypeNode | null =>
    n.id === id ? n : (n.children ?? []).reduce<CiTypeNode | null>((hit, c) => hit ?? find(c), null);
  const node = find(CMDB_TREE);
  return new Set(node ? flattenTree(node).map((n) => n.id) : [id]);
}

/** The chain from the root down to a node — what the panel must expand to reveal it. */
export function pathToNode(id: string): string[] {
  const walk = (n: CiTypeNode, trail: string[]): string[] | null => {
    if (n.id === id) return [...trail, n.id];
    for (const c of n.children ?? []) {
      const hit = walk(c, [...trail, n.id]);
      if (hit) return hit;
    }
    return null;
  };
  return walk(CMDB_TREE, []) ?? [];
}

/* ── Where an existing CI hangs ───────────────────────────────────────────────
   The stored `ciType` string is the LEAF a CI belongs to. This map is the one place
   that translates it, so the tree and the table cannot disagree about where a row
   lives. A type with no entry falls back to the root rather than disappearing —
   an unclassified CI is still a CI, and dropping it from every branch would make it
   invisible in the only view that lists it. */
const TYPE_TO_NODE: Record<string, string> = {
  'Base CI': 'base-ci',
  Hardware: 'hardware',
  Server: 'server',
  'Windows Laptop': 'laptops',
  'Mac Laptop': 'laptops',
  Desktop: 'desktops',
  Switch: 'network-devices',
  Router: 'network-devices',
  Firewall: 'network-devices',
  'Mobile Devices': 'mobile-devices',
  Printer: 'printers',
  Application: 'application',
  'Business Service': 'business-service',
  'Business Applications': 'business-applications',
  Database: 'database',
  'Web Server': 'web-server',
  'Application Server': 'application-server',
};

export const nodeIdForCiType = (ciType: string): string => TYPE_TO_NODE[ciType] ?? 'base-ci';
