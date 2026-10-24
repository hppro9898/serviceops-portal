import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AssetsToolbar } from './AssetsToolbar';
import { NonItAssetsTable } from './NonItAssetsTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { NonItAssetDrawer } from './NonItAssetDrawer';

export type NonItStatus = 'In Use' | 'In Stock' | 'In Store' | 'Not Working';

export interface NonItAsset {
  id: string;
  name: string;
  external?: boolean;
  assetType: string;
  status: NonItStatus;
  impact: string;
  managedBy: { name: string; initials?: string; color?: string };
  usedBy: string | null;
  managedByGroup: string;
}

const U = { name: 'Unassigned' };

export const mockAssets: NonItAsset[] = [
  { id: 'NON-5966', name: 'Ergonomic Office Chair — Herman Miller Aeron', assetType: 'Furniture', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: 'Priya Nair (priya.nair@mota...)', managedByGroup: 'Facilities' },
  { id: 'NON-5965', name: 'Conference Table — 12 Seater Walnut', assetType: 'Furniture', status: 'In Use', impact: 'On Department', managedBy: { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' }, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5964', name: 'Toyota Innova Crysta — Pool Car', assetType: 'Vehicles', status: 'In Use', impact: 'On Organization', managedBy: { name: 'Imran Qureshi', initials: 'IQ', color: '#F59E0B' }, usedBy: 'Fleet Pool', managedByGroup: 'Fleet Management' },
  { id: 'NON-5963', name: 'Mahindra Scorpio-N — Site Visits', assetType: 'SUV', status: 'In Use', impact: 'On Department', managedBy: { name: 'Imran Qureshi', initials: 'IQ', color: '#F59E0B' }, usedBy: 'Rahul Verma (rahul.verma@mota...)', managedByGroup: 'Fleet Management' },
  { id: 'NON-5962', name: 'Epson EB-X51 Projector — Boardroom', assetType: 'Office Equipment', status: 'In Use', impact: 'On Department', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5961', name: 'Split Air Conditioner 1.5 Ton — Daikin', assetType: 'Office Equipment', status: 'In Use', impact: 'On Department', managedBy: { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' }, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5960', name: 'Water Dispenser — Hot & Cold', assetType: 'Office Equipment', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: 'Neha Raje (neha.raje@mota...)', managedByGroup: 'Admin' },
  { id: 'NON-5959', name: 'Reception Sofa — 3 Seater Leather', assetType: 'Furniture', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5958', name: 'Filing Cabinet — 4 Drawer Steel', assetType: 'Furniture', status: 'In Stock', impact: 'Low', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5957', name: 'Honda City — Executive Sedan', assetType: 'Vehicles', status: 'In Use', impact: 'On Organization', managedBy: { name: 'Vikram Sethi', initials: 'VS', color: '#10B981' }, usedBy: 'Kavya Menon (kavya.menon@mota...)', managedByGroup: 'Fleet Management' },
  { id: 'NON-5956', name: 'Standing Desk — Electric Height Adjustable', assetType: 'Office Equipment', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: 'Karan Malhotra (karan.malho...)', managedByGroup: 'Facilities' },
  { id: 'NON-5955', name: 'Fire Extinguisher — CO2 4.5kg', assetType: 'Safety Equipment', status: 'In Use', impact: 'On Organization', managedBy: { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' }, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5954', name: 'First Aid Kit — Wall Mounted', assetType: 'Safety Equipment', status: 'In Stock', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5953', name: 'Paper Shredder — Cross Cut Heavy Duty', assetType: 'Office Equipment', status: 'In Use', impact: 'On Department', managedBy: U, usedBy: 'Harsh Patil (harsh.patil@mota...)', managedByGroup: 'Admin' },
  { id: 'NON-5952', name: 'Coffee Machine — Bean to Cup', assetType: 'Office Equipment', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5951', name: 'Visitor Badge Printer — Pantum', assetType: 'Office Equipment', status: 'Not Working', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Front Desk' },
  { id: 'NON-5950', name: 'A4 Paper Ream — 80 GSM (Box of 5)', assetType: 'Stationery', status: 'In Stock', impact: 'On Users', managedBy: U, usedBy: 'Harsh Patil (harsh.patil@mota...)', managedByGroup: 'Admin' },
  { id: 'NON-5949', name: 'Blue Ballpoint Pen — Box of 50', assetType: 'Stationery', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5948', name: 'A4 Paper Ream — 75 GSM', external: true, assetType: 'Stationery', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5947', name: 'Whiteboard — 6 x 4 ft Magnetic', assetType: 'Office Equipment', status: 'In Use', impact: 'On Department', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5946', name: 'Microwave Oven — 25L Convection', assetType: 'Office Equipment', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5945', name: 'Refrigerator — 240L Double Door', assetType: 'Office Equipment', status: 'In Use', impact: 'On Department', managedBy: { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' }, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5944', name: 'Television — 55" 4K Display', assetType: 'Office Equipment', status: 'In Store', impact: 'On Department', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5943', name: 'Bookshelf — 5 Tier Oak', assetType: 'Furniture', status: 'In Use', impact: 'Low', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5942', name: 'Podium / Lectern — Acrylic', assetType: 'Furniture', status: 'In Stock', impact: 'Low', managedBy: U, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5941', name: 'Toyota Forklift 8FG — Warehouse', assetType: 'Vehicles', status: 'In Use', impact: 'On Department', managedBy: { name: 'Imran Qureshi', initials: 'IQ', color: '#F59E0B' }, usedBy: 'Warehouse Team', managedByGroup: 'Logistics' },
  { id: 'NON-5940', name: 'Pedestal Fan — High Speed', assetType: 'Office Equipment', status: 'In Stock', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5939', name: 'Office Telephone — IP Desk Phone', assetType: 'Office Equipment', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: 'Ananya Iyer (ananya.iyer@mota...)', managedByGroup: 'Front Desk' },
  { id: 'NON-5938', name: 'Heavy Duty Stapler — Box of 10', assetType: 'Stationery', status: 'In Stock', impact: 'On Users', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5937', name: 'Smoke Detector — Photoelectric', assetType: 'Safety Equipment', status: 'In Use', impact: 'On Organization', managedBy: { name: 'Farah Sheikh', initials: 'FS', color: '#A78BFA' }, usedBy: null, managedByGroup: 'Facilities' },
  { id: 'NON-5936', name: 'Workstation Cubicle — L Shape', assetType: 'Furniture', status: 'In Use', impact: 'On Users', managedBy: U, usedBy: 'Aditya Bose (aditya.bose@mota...)', managedByGroup: 'Facilities' },
  { id: 'NON-5935', name: 'Notice Board — Cork 4 x 3 ft', assetType: 'Office Equipment', status: 'In Use', impact: 'Low', managedBy: U, usedBy: null, managedByGroup: 'Admin' },
  { id: 'NON-5934', name: 'Tata Ace — Delivery Mini Truck', assetType: 'Vehicles', status: 'Not Working', impact: 'On Department', managedBy: { name: 'Vikram Sethi', initials: 'VS', color: '#10B981' }, usedBy: 'Logistics Team', managedByGroup: 'Logistics' },
];

export function NonItAssetsListPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [assets] = useState<NonItAsset[]>(mockAssets);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState<keyof NonItAsset | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAssets, setOpenAssets] = useState<NonItAsset[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const { open: openInStack } = useDrawerStack();

  const handleOpenAsset = (asset: NonItAsset) => {
    openInStack('non-it-assets', asset.id, asset.name, asset);
  };

  const handleOpenRelation = (rel: { ticketId: string; subject: string }) => {
    handleOpenAsset({ ...mockAssets[Math.abs([...rel.ticketId].reduce((a, c) => a + c.charCodeAt(0), 0)) % mockAssets.length], id: rel.ticketId, name: rel.subject });
  };

  const handleCloseDrawer = () => { setOpenAssets([]); setActiveAssetId(null); };

  const handleCloseTab = (assetId: string) => {
    const updated = openAssets.filter(a => a.id !== assetId);
    setOpenAssets(updated);
    if (activeAssetId === assetId) {
      setActiveAssetId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const handleTabChange = (assetId: string) => setActiveAssetId(assetId);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set(assets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(a => a.id));
      setSelected(ids);
    } else {
      setSelected(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected);
    checked ? next.add(id) : next.delete(id);
    setSelected(next);
  };

  const handleSort = (column: keyof NonItAsset) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  let filtered = assets;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = assets.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.assetType.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q) ||
      a.impact.toLowerCase().includes(q) ||
      a.managedByGroup.toLowerCase().includes(q) ||
      (a.usedBy ?? '').toLowerCase().includes(q)
    );
  }

  let sorted = [...filtered];
  if (sortColumn) {
    sorted.sort((a, b) => {
      const aVal = String(a[sortColumn] ?? '');
      const bVal = String(b[sortColumn] ?? '');
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentPageIds = paginated.map(a => a.id);
  const allCurrentSelected = currentPageIds.every(id => selected.has(id)) && currentPageIds.length > 0;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="non-it-assets" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={selected.size} />
        <AssetsToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Non-IT Assets" viewLabel="All Non IT Assets" />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-white min-h-0">
            <NonItAssetsTable
              assets={paginated}
              selected={selected}
              allSelected={allCurrentSelected}
              onSelectAll={handleSelectAll}
              onSelect={handleSelect}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onAssetClick={handleOpenAsset}
            />
          </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={sorted.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
            />
        </main>
      </div>
      <NonItAssetDrawer
        openAssets={openAssets}
        activeAssetId={activeAssetId}
        onClose={handleCloseDrawer}
        onCloseTab={handleCloseTab}
        onTabChange={handleTabChange}
        onOpenRelation={handleOpenRelation}
      />
    </div>
  );
}
