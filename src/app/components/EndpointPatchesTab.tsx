import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Search, X, Trash2, Download, RotateCcw, EyeOff, FileDown, ChevronDown, Check, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from './Pagination';
import type { LucideIcon } from 'lucide-react';

/* Patches tab of the ENDPOINT detail page (EndpointDrawer) — the inverse of the Patch page's
 * Endpoint tab: instead of "which computers miss this patch", this lists "which patches this
 * computer is missing / has installed / has ignored". Same design as PatchComputersTab (bucket
 * pills + search + Take Action + sticky pagination); only the rows are patches. */

export type PatchBucket = 'Missing' | 'Installed' | 'Ignored';

export interface EndpointPatch {
  id: string;
  name: string;
  category: string;
  severity: 'Critical' | 'Important' | 'Moderate' | 'Low' | 'Unspecified';
  approvalStatus: 'Approved' | 'Not Approved' | 'Declined';
  application: string | null;
  releaseDate: string;
  bulletinId: string | null;
  kbNumber: string | null;
  downloadSize: string;
  uuid: string;
  bucket: PatchBucket;
}

// Patch state of ONE endpoint (mock): what it's missing, what's installed, what was ignored.
export const INITIAL_ENDPOINT_PATCHES: EndpointPatch[] = [
  // ---- Missing ----
  { id: 'PCH-4345', name: '2026-07 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5062553)', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jul 08, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5062553', downloadSize: '731.24 MB', uuid: 'b7c1e2a4-9f3d-4c8b-a1e6-5d2f8c4b9a01', bucket: 'Missing' },
  { id: 'PCH-4340', name: '2026-07 Cumulative Update for .NET Framework 3.5 and 4.8.1 for Windows 11 Version 24H2 (KB5062063)', category: 'Security Updates', severity: 'Important', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jul 08, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5062063', downloadSize: '68.42 MB', uuid: '3f9a7d21-6b4e-4f0a-9c2d-8e1b5a7f3c44', bucket: 'Missing' },
  { id: 'PCH-4338', name: 'Security Intelligence Update for Microsoft Defender Antivirus - KB2267602 (Version 1.435.782.0)', category: 'Definition Updates', severity: 'Important', approvalStatus: 'Approved', application: null, releaseDate: 'Mon, Jul 21, 2026 09:10 AM', bulletinId: null, kbNumber: 'KB2267602', downloadSize: '148.90 MB', uuid: 'a2d64c19-8e0f-42b7-b5a3-1c9d7e2f6b58', bucket: 'Missing' },
  { id: 'PCH-4331', name: '2026-07 Security Update for Microsoft Edge Stable Channel (Version 138.0.3351.83)', category: 'Updates', severity: 'Important', approvalStatus: 'Approved', application: null, releaseDate: 'Thu, Jul 10, 2026 11:45 AM', bulletinId: null, kbNumber: null, downloadSize: '176.30 MB', uuid: 'edge-win64-stable-138.0.3351.83', bucket: 'Missing' },
  { id: 'PCH-4327', name: '2026-07 Update for Microsoft Office 2019 (KB5002623) 64-Bit Edition', category: 'Updates', severity: 'Moderate', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jul 01, 2026 04:20 PM', bulletinId: null, kbNumber: 'KB5002623', downloadSize: '54.18 MB', uuid: '9c4b2f70-1d8a-4e6c-8f3b-7a5d9e1c2b36', bucket: 'Missing' },
  { id: 'PCH-4322', name: 'Google Chrome 138.0.7204.97 (x64)', category: 'Third Party Updates', severity: 'Important', approvalStatus: 'Approved', application: 'Google Chrome', releaseDate: 'Wed, Jul 09, 2026 02:00 PM', bulletinId: null, kbNumber: null, downloadSize: '112.36 MB', uuid: 'chrome-windows-x64-msi-138.0.7204.97', bucket: 'Missing' },
  { id: 'PCH-4318', name: 'WinRAR 7.20 (x64)', category: 'Third Party Updates', severity: 'Low', approvalStatus: 'Approved', application: 'WinRAR', releaseDate: 'Wed, Feb 01, 2026 10:00 AM', bulletinId: null, kbNumber: null, downloadSize: '42.67 MB', uuid: 'win_rar-windows-x64-exe-7.20', bucket: 'Missing' },
  { id: 'PCH-4315', name: 'Mozilla Firefox 141.0.2 (x64 en-US)', category: 'Third Party Updates', severity: 'Important', approvalStatus: 'Not Approved', application: 'Mozilla Firefox', releaseDate: 'Tue, Jul 15, 2026 06:30 PM', bulletinId: null, kbNumber: null, downloadSize: '64.51 MB', uuid: 'firefox-windows-x64-exe-141.0.2', bucket: 'Missing' },
  { id: 'PCH-4309', name: 'Adobe Acrobat Reader DC 25.001.20472 Update', category: 'Third Party Updates', severity: 'Critical', approvalStatus: 'Approved', application: 'Adobe Acrobat Reader DC', releaseDate: 'Tue, Jul 08, 2026 08:15 PM', bulletinId: 'APSB26-44', kbNumber: null, downloadSize: '289.74 MB', uuid: 'acrobat-reader-dc-x64-25.001.20472', bucket: 'Missing' },
  { id: 'PCH-4304', name: '2026-06 .NET 8.0.17 Security Update for x64 Client (KB5061344)', category: 'Security Updates', severity: 'Important', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jun 10, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5061344', downloadSize: '91.08 MB', uuid: '5e8d3a67-2c9f-4b1e-a6d8-4f7b2c9e1a53', bucket: 'Missing' },
  { id: 'PCH-4296', name: 'Update for Windows Malicious Software Removal Tool x64 - v5.135 (KB890830)', category: 'Update Rollups', severity: 'Unspecified', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jul 08, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB890830', downloadSize: '93.84 MB', uuid: 'f1a9c5e3-7d2b-4a8f-9e6c-3b5d8f2a7c19', bucket: 'Missing' },
  { id: 'PCH-4291', name: 'Zoom Workplace 6.5.3 (64-bit)', category: 'Third Party Updates', severity: 'Moderate', approvalStatus: 'Not Approved', application: 'Zoom Workplace', releaseDate: 'Mon, Jul 14, 2026 03:40 PM', bulletinId: null, kbNumber: null, downloadSize: '204.90 MB', uuid: 'zoom-workplace-x64-msi-6.5.3', bucket: 'Missing' },
  { id: 'PCH-4287', name: 'VLC Media Player 3.0.21 (x64)', category: 'Third Party Updates', severity: 'Low', approvalStatus: 'Approved', application: 'VLC Media Player', releaseDate: 'Thu, Jun 12, 2026 12:00 PM', bulletinId: null, kbNumber: null, downloadSize: '43.12 MB', uuid: 'vlc-windows-x64-msi-3.0.21', bucket: 'Missing' },
  { id: 'PCH-4280', name: '2026-07 Servicing Stack Update for Windows 11 Version 24H2 (KB5062687)', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jul 08, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5062687', downloadSize: '25.40 MB', uuid: 'c8f2b6d4-3a7e-4c9b-8d1f-6e4a2b9c5d70', bucket: 'Missing' },

  // ---- Installed ----
  { id: 'PCH-4258', name: '2026-06 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5060842)', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jun 10, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5060842', downloadSize: '702.16 MB', uuid: 'd4a8c2f6-9b3e-4d7a-b8c5-2f6e9a4d1b87', bucket: 'Installed' },
  { id: 'PCH-4251', name: '2026-06 Cumulative Update for .NET Framework 3.5 and 4.8.1 for Windows 11 Version 24H2 (KB5060512)', category: 'Security Updates', severity: 'Important', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, Jun 10, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5060512', downloadSize: '66.90 MB', uuid: '7b3e9f51-4c8a-4e2d-9a6b-8d1f5c3e7a24', bucket: 'Installed' },
  { id: 'PCH-4243', name: 'Update for Microsoft Defender Antivirus antimalware platform - KB4052623 (Version 4.18.26050.4)', category: 'Updates', severity: 'Unspecified', approvalStatus: 'Approved', application: null, releaseDate: 'Wed, May 28, 2026 07:00 AM', bulletinId: null, kbNumber: 'KB4052623', downloadSize: '4.30 MB', uuid: '2e7c4a98-6f1d-4b3a-8c9e-5a2d7f4b1c68', bucket: 'Installed' },
  { id: 'PCH-4236', name: '2026-05 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5058411)', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: null, releaseDate: 'Tue, May 13, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5058411', downloadSize: '689.52 MB', uuid: 'a6d2f8c4-1b7e-4a9c-8e3d-9f5b2a6c4d13', bucket: 'Installed' },
  { id: 'PCH-4229', name: '7-Zip 24.09 (x64)', category: 'Third Party Updates', severity: 'Low', approvalStatus: 'Approved', application: '7-Zip', releaseDate: 'Fri, Nov 29, 2025 10:00 AM', bulletinId: null, kbNumber: null, downloadSize: '1.60 MB', uuid: '7zip-windows-x64-msi-24.09', bucket: 'Installed' },
  { id: 'PCH-4221', name: 'Google Chrome 137.0.7151.120 (x64)', category: 'Third Party Updates', severity: 'Important', approvalStatus: 'Approved', application: 'Google Chrome', releaseDate: 'Wed, Jun 11, 2026 02:00 PM', bulletinId: null, kbNumber: null, downloadSize: '111.84 MB', uuid: 'chrome-windows-x64-msi-137.0.7151.120', bucket: 'Installed' },
  { id: 'PCH-4214', name: '2026-05 Update for Windows 11 Version 24H2 (KB5058499) — Out-of-band quality update', category: 'Updates', severity: 'Moderate', approvalStatus: 'Approved', application: null, releaseDate: 'Wed, May 28, 2026 09:20 PM', bulletinId: null, kbNumber: 'KB5058499', downloadSize: '58.72 MB', uuid: '4c9b7e23-8a5f-4d1c-b2e8-6d3a9f7c5b41', bucket: 'Installed' },

  // ---- Ignored ----
  { id: 'PCH-4188', name: 'Windows 11, version 25H2 Feature Update for x64-based Systems', category: 'Feature Packs', severity: 'Unspecified', approvalStatus: 'Not Approved', application: null, releaseDate: 'Tue, Jun 24, 2026 05:30 PM', bulletinId: null, kbNumber: null, downloadSize: '4.80 GB', uuid: 'e3b8d5a2-7c4f-4e6b-9d1a-8f2c6b4e9a57', bucket: 'Ignored' },
  { id: 'PCH-4175', name: 'Intel Corporation - Display - 32.0.101.6790 (Intel Iris Xe Graphics driver)', category: 'Driver Updates', severity: 'Low', approvalStatus: 'Declined', application: null, releaseDate: 'Mon, Jun 02, 2026 01:30 PM', bulletinId: null, kbNumber: null, downloadSize: '1.32 GB', uuid: 'intel-display-32.0.101.6790-x64', bucket: 'Ignored' },
  { id: 'PCH-4169', name: '2026-06 Preview Cumulative Update for Windows 11 Version 24H2 (KB5060829)', category: 'Updates', severity: 'Moderate', approvalStatus: 'Not Approved', application: null, releaseDate: 'Thu, Jun 26, 2026 05:30 PM', bulletinId: null, kbNumber: 'KB5060829', downloadSize: '710.45 MB', uuid: '8f4a2c76-5d9b-4f3e-a7c1-2b8e6d4a9f35', bucket: 'Ignored' },
];

const BUCKETS: PatchBucket[] = ['Missing', 'Installed', 'Ignored'];

/** Patch category filter — "All Categories" = no filter (same slot as the Patch page's group filter). */
const ALL_CATEGORIES = 'All Categories';

const SEVERITY_COLORS: Record<EndpointPatch['severity'], string> = {
  Critical: '#EF4444', Important: '#F59E0B', Moderate: '#EAB308', Low: '#111827', Unspecified: '#6B7280',
};
const APPROVAL_COLORS: Record<EndpointPatch['approvalStatus'], { dot: string; text: string }> = {
  Approved: { dot: '#22C55E', text: '#22A06B' },
  'Not Approved': { dot: '#F59E0B', text: '#D97706' },
  Declined: { dot: '#94A3B8', text: '#64748B' },
};

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

interface EndpointPatchesTabProps {
  patches: EndpointPatch[];
  setPatches: Dispatch<SetStateAction<EndpointPatch[]>>;
}

export function EndpointPatchesTab({ patches, setPatches }: EndpointPatchesTabProps) {
  const [bucket, setBucket] = useState<PatchBucket>('Missing');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);
  // Category filter — scopes the whole tab, so the bucket counts reflect it too.
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [showCategory, setShowCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryOptions = [ALL_CATEGORIES, ...Array.from(new Set(patches.map((p) => p.category))).sort()];
  const categoryQuery = categorySearch.trim().toLowerCase();
  const filteredCategories = categoryQuery ? categoryOptions.filter((c) => c.toLowerCase().includes(categoryQuery)) : categoryOptions;
  const closeCategoryMenu = () => { setShowCategory(false); setCategorySearch(''); };
  // Everything below (counts, rows, select-all) works off the category-scoped set.
  const scoped = category === ALL_CATEGORIES ? patches : patches.filter((p) => p.category === category);

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  // Bulk actions on the selected rows.
  const moveSelected = (to: PatchBucket, verb: string) => {
    const n = selected.size;
    setPatches((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, bucket: to } : p)));
    clearSelection();
    toast.success(`${n} patch${n > 1 ? 'es' : ''} ${verb}`);
  };
  const deleteSelected = () => {
    const n = selected.size;
    setPatches((prev) => prev.filter((p) => !selected.has(p.id)));
    clearSelection();
    toast.error(`${n} patch${n > 1 ? 'es' : ''} removed`);
  };
  const notify = (msg: string) => { const n = selected.size; clearSelection(); toast.success(`${n} patch${n > 1 ? 'es' : ''} — ${msg}`); };

  // Bulk actions available for the current bucket. `tone` drives styling; `danger` sorts last.
  type BulkAction = { key: string; label: string; icon: LucideIcon; tone?: 'primary' | 'danger'; buckets: PatchBucket[]; run: () => void };
  const ALL_ACTIONS: BulkAction[] = [
    // Prototype behavior: installing moves the patch straight to Installed (no deployment queue here).
    { key: 'install', label: 'Install Patch', icon: Download, tone: 'primary', buckets: ['Missing', 'Ignored'], run: () => moveSelected('Installed', 'installation initiated') },
    { key: 'ignore', label: 'Ignore', icon: EyeOff, buckets: ['Missing'], run: () => moveSelected('Ignored', 'ignored') },
    { key: 'uninstall', label: 'Uninstall Patch', icon: RotateCcw, tone: 'primary', buckets: ['Installed'], run: () => moveSelected('Missing', 'marked as uninstalled') },
    { key: 'restore', label: 'Restore', icon: RotateCcw, buckets: ['Ignored'], run: () => moveSelected('Missing', 'restored') },
    { key: 'export', label: 'Export Selected', icon: FileDown, buckets: ['Installed', 'Ignored'], run: () => notify('exported') },
    { key: 'delete', label: 'Delete', icon: Trash2, tone: 'danger', buckets: ['Missing', 'Installed', 'Ignored'], run: deleteSelected },
  ];
  const actions = ALL_ACTIONS.filter((a) => a.buckets.includes(bucket));

  const counts: Record<PatchBucket, number> = { Missing: 0, Installed: 0, Ignored: 0 };
  scoped.forEach((p) => { counts[p.bucket] += 1; });

  const q = search.trim().toLowerCase();
  const rows = scoped.filter((p) => p.bucket === bucket).filter((p) =>
    !q ||
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.application ?? '').toLowerCase().includes(q) ||
    (p.kbNumber ?? '').toLowerCase().includes(q) ||
    (p.bulletinId ?? '').toLowerCase().includes(q) ||
    p.uuid.toLowerCase().includes(q)
  );

  // Pagination — mirrors the Patch page's endpoint grid.
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  // Any change to the bucket / category / search resets to the first page.
  useEffect(() => { setCurrentPage(1); }, [bucket, category, search]);
  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const pageRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="px-6 py-4">
      {/* Top row — category filter + bucket pills (Missing / Installed / Ignored) */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowCategory((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[13px] font-medium transition-colors ${category !== ALL_CATEGORIES ? 'bg-[#EBF5FF] border-[#3D8BD0] text-[#3D8BD0]' : 'bg-white border-[#DFE5ED] text-[#364658] hover:bg-[#F5F7FA] hover:border-[#3D8BD0]'}`}
          >
            <Layers size={14} className={category !== ALL_CATEGORIES ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'} />
            {category}
            <ChevronDown size={14} className={`transition-transform ${showCategory ? 'rotate-180' : ''} ${category !== ALL_CATEGORIES ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
          </button>
          {showCategory && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeCategoryMenu} />
              <div className="absolute left-0 top-full mt-1 z-50 w-[240px] bg-white rounded-lg shadow-lg border border-[#DFE5ED] py-1">
                <div className="px-3 pb-2 pt-1">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-3 pr-9 py-2 text-[13px] text-[#364658] bg-[#F9FAFB] border border-[#E5E7EB] rounded placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3D8BD0] focus:border-transparent"
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                </div>
                <div className="max-h-[260px] overflow-y-auto">
                  {filteredCategories.length === 0 ? (
                    <div className="px-4 py-3 text-[13px] text-[#9CA3AF] text-center">No categories found</div>
                  ) : filteredCategories.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); closeCategoryMenu(); setSelected(new Set()); }}
                      className={`w-full px-4 py-2 text-[13px] text-left transition-colors flex items-center justify-between gap-2 ${category === c ? 'bg-[#F1F5F9] text-[#364658]' : 'text-[#364658] hover:bg-[#F9FAFB]'}`}
                    >
                      <span className="truncate">{c}</span>
                      {category === c && <Check size={15} className="text-[#3D8BD0] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <span className="h-5 w-px bg-[#E3E8EF] mx-0.5" />

        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => setBucket(b)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[13px] font-medium transition-colors ${bucket === b ? 'bg-[#EBF5FF] border-[#3D8BD0] text-[#3D8BD0]' : 'bg-white border-[#DFE5ED] text-[#364658] hover:bg-[#F5F7FA] hover:border-[#3D8BD0]'}`}
          >
            {b}
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold ${bucket === b ? 'bg-[#3D8BD0] text-white' : 'bg-[#EEF2F6] text-[#64748B]'}`}>
              {counts[b]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Select field to search..."
            className="h-8 w-full rounded border border-[#d1d5db] bg-white pl-3 pr-10 text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:border-[#3D8BD0] focus:outline-none focus:ring-1 focus:ring-[#3D8BD0]"
          />
          {search ? (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#364658]"><X size={16} /></button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          )}
        </div>
      </div>

      {/* Bulk-action bar — appears when rows are selected. Single "Take Action" menu holds every
          action (scales to any number), with a selected-count chip + "Unselect all". */}
      {selected.size > 0 && (
        <div className="animate-slide-up mb-3 flex flex-wrap items-center gap-3 rounded-md border border-[#E3E8EF] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_6px_rgba(16,24,40,0.06)]">
          <div className="relative">
            <button
              onClick={() => setShowMore((v) => !v)}
              className={`inline-flex h-8 items-center gap-1.5 rounded border bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors ${showMore ? 'border-[#3D8BD0] bg-[#F8FAFC]' : 'border-[#DFE5ED] hover:bg-[#F5F7FA]'}`}
            >
              Take Action <ChevronDown size={14} className={`text-[#7B8FA5] transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                <div className="absolute left-0 top-full mt-1 z-50 w-[220px] bg-white rounded-lg shadow-lg border border-[#DFE5ED] py-1">
                  {actions.map((a) => (
                    <div key={a.key}>
                      {a.tone === 'danger' && <div className="my-1 border-t border-[#F0F2F5]" />}
                      <button
                        onClick={() => { a.run(); setShowMore(false); }}
                        className={`w-full px-4 py-2 text-[13px] text-left transition-colors flex items-center gap-2.5 ${a.tone === 'danger' ? 'text-[#DC2626] hover:bg-[#FEF3F2]' : 'text-[#364658] hover:bg-[#F9FAFB]'}`}
                      >
                        <span className={`flex-shrink-0 ${a.tone === 'danger' ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}><a.icon size={15} /></span>
                        <span className="flex-1">{a.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-[#EAF2FB] text-[#3D8BD0] text-[12px] font-semibold tabular-nums">{selected.size}</span>
            <span className="text-[#64748B]">{selected.size === 1 ? 'record' : 'records'} selected</span>
            <span className="h-4 w-px bg-[#E3E8EF]" />
            <button onClick={clearSelection} className="text-[12px] font-medium text-[#3D8BD0] hover:underline">Unselect all</button>
          </div>
        </div>
      )}

      {/* Table — standard borderless style (matches the other detail-page tabs) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1700px]">
          <thead className="border-b border-[#e5e7eb]">
            <tr>
              <th className="w-[40px] px-4 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={pageRows.length > 0 && pageRows.every((p) => selected.has(p.id))}
                  onChange={(e) => setSelected(e.target.checked ? new Set(pageRows.map((p) => p.id)) : new Set())}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </th>
              {['Patch ID', 'Name', 'Patch Category', 'Severity', 'Approval Status', 'Application', 'Release Date', 'Bulletin Id', 'KB Number', 'Download Size', 'UUID'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {pageRows.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No {bucket.toLowerCase()} patches found.</td></tr>
            ) : pageRows.map((p) => (
              <tr key={p.id} className="hover:bg-[#f9fafb] transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={(e) => toggleRow(p.id, e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] hover:bg-[#d0e8f9] transition-colors">{p.id}</button>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]"><span className="block max-w-[340px] truncate" title={p.name}>{p.name}</span></td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.category}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                  <span className="inline-flex items-center gap-1.5 text-[#364658]">
                    <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[p.severity] }} />
                    {p.severity}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                  <span className="inline-flex items-center gap-1.5" style={{ color: APPROVAL_COLORS[p.approvalStatus].text }}>
                    <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: APPROVAL_COLORS[p.approvalStatus].dot }} />
                    {p.approvalStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.application ?? <Dash />}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.releaseDate}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.bulletinId ?? <Dash />}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.kbNumber ?? <Dash />}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.downloadSize}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]"><span className="block max-w-[180px] truncate" title={p.uuid}>{p.uuid}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination — shared component, sticky to the bottom of the scroll viewport. */}
      <div className="sticky bottom-0 z-30 -mx-6 -mb-4 bg-white">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={rows.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
