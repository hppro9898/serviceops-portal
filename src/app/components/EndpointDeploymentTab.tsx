import { useState, useEffect } from 'react';
import { Search, X, LayoutGrid, List as ListIcon, Package, Box, FileCog } from 'lucide-react';
import { Pagination } from './Pagination';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

/* Deployment tab of the ENDPOINT detail page (EndpointDrawer) — what has been pushed TO this
 * computer, split into three sub-tabs: Patch (patch deployments), Package (software packages),
 * Registry (registry deployments). Same design language as the Patches tab (pill sub-tabs +
 * search + standard borderless table + sticky pagination); the card view mirrors the Patch
 * page's Deployment tab (card default, list toggle, tinted status pills). */

type DeploySection = 'Patch' | 'Package' | 'Registry';

type InstallationStatus = 'Yet to Receive' | 'Received' | 'In Progress' | 'Success' | 'Failed' | 'Cancelled';

interface PatchDeployRow {
  id: string;
  name: string;
  severity: 'Critical' | 'Important' | 'Moderate' | 'Low' | 'Unspecified';
  configType: string;
  deploymentDate: string | null;
  installationStatus: InstallationStatus;
  retryStatus: number;
  downloadStatus: string;
  taskType: string;
}

interface PackageDeployRow {
  id: string;
  name: string;
  configType: string;
  deploymentDate: string | null;
  installationStatus: InstallationStatus;
  retryStatus: number;
  downloadStatus: string;
  taskType: string;
  createdDate: string;
  updatedDate: string;
}

interface RegistryDeployRow {
  name: string;
  configType: string | null;
  deploymentDate: string | null;
  installedStatus: InstallationStatus;
  retryStatus: number;
  taskType: string;
}

// Patch pushes to this endpoint — ids/names line up with the Patches tab's Missing/Installed story.
const PATCH_DEPLOYS: PatchDeployRow[] = [
  { id: 'PCH-4345', name: '2026-07 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5062553)', severity: 'Critical', configType: 'Install', deploymentDate: null, installationStatus: 'Yet to Receive', retryStatus: 0, downloadStatus: 'Success', taskType: 'Manual Remote Deployment' },
  { id: 'PCH-4338', name: 'Security Intelligence Update for Microsoft Defender Antivirus - KB2267602 (Version 1.435.782.0)', severity: 'Important', configType: 'Install', deploymentDate: 'Tue, Jul 21, 2026 09:42 AM', installationStatus: 'Received', retryStatus: 0, downloadStatus: 'Success', taskType: 'Automatic Patch Deployment' },
  { id: 'PCH-4258', name: '2026-06 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5060842)', severity: 'Critical', configType: 'Install', deploymentDate: 'Wed, Jun 11, 2026 02:15 AM', installationStatus: 'Success', retryStatus: 0, downloadStatus: 'Success', taskType: 'Automatic Patch Deployment' },
  { id: 'PCH-4251', name: '2026-06 Cumulative Update for .NET Framework 3.5 and 4.8.1 for Windows 11 Version 24H2 (KB5060512)', severity: 'Important', configType: 'Install', deploymentDate: 'Wed, Jun 11, 2026 02:20 AM', installationStatus: 'Success', retryStatus: 0, downloadStatus: 'Success', taskType: 'Automatic Patch Deployment' },
  { id: 'PCH-4221', name: 'Google Chrome 137.0.7151.120 (x64)', severity: 'Important', configType: 'Install', deploymentDate: 'Wed, Jun 11, 2026 11:05 AM', installationStatus: 'Success', retryStatus: 1, downloadStatus: 'Success', taskType: 'Manual Remote Deployment' },
  { id: 'PCH-4236', name: '2026-05 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5058411)', severity: 'Critical', configType: 'Install', deploymentDate: 'Wed, May 14, 2026 02:10 AM', installationStatus: 'Success', retryStatus: 0, downloadStatus: 'Success', taskType: 'Automatic Patch Deployment' },
];

// Software packages pushed via deployment (not patches) — install/uninstall jobs.
const PACKAGE_DEPLOYS: PackageDeployRow[] = [
  { id: 'PKG-3', name: 'AnyDesk 8.1.2', configType: 'Install', deploymentDate: 'Mon, Jul 20, 2026 11:30 AM', installationStatus: 'Received', retryStatus: 0, downloadStatus: 'Success', taskType: 'Manual Remote Deployment', createdDate: 'Mon, Jul 20, 2026 11:02 AM', updatedDate: 'Mon, Jul 20, 2026 11:30 AM' },
  { id: 'PKG-2', name: 'Zoho Assist 5.4', configType: 'Install', deploymentDate: null, installationStatus: 'Cancelled', retryStatus: 0, downloadStatus: 'Success', taskType: 'Manual Remote Deployment', createdDate: 'Mon, Jul 20, 2026 10:48 AM', updatedDate: 'Mon, Jul 20, 2026 10:55 AM' },
  { id: 'PKG-1', name: 'Spotify 1.2.63', configType: 'Uninstall', deploymentDate: 'Mon, Jul 20, 2026 10:12 AM', installationStatus: 'Received', retryStatus: 0, downloadStatus: 'Success', taskType: 'Manual Remote Deployment', createdDate: 'Mon, Jul 20, 2026 09:58 AM', updatedDate: 'Mon, Jul 20, 2026 10:12 AM' },
];

// Registry-key deployments pushed to this endpoint (hardening / policy tweaks).
const REGISTRY_DEPLOYS: RegistryDeployRow[] = [
  { name: 'Disable WinZip Updater', configType: null, deploymentDate: null, installedStatus: 'Yet to Receive', retryStatus: 0, taskType: 'Manual Remote Deployment' },
  { name: 'Disable SMBv1 Protocol', configType: 'Modify', deploymentDate: 'Fri, Jul 17, 2026 04:25 PM', installedStatus: 'Success', retryStatus: 0, taskType: 'Manual Remote Deployment' },
  { name: 'Enable BitLocker Recovery Key Backup to AD', configType: 'Add', deploymentDate: 'Thu, Jun 25, 2026 10:40 AM', installedStatus: 'Success', retryStatus: 1, taskType: 'Automatic Registry Deployment' },
];

const SECTIONS: DeploySection[] = ['Patch', 'Package', 'Registry'];

const SEVERITY_COLORS: Record<PatchDeployRow['severity'], string> = {
  Critical: '#EF4444', Important: '#F59E0B', Moderate: '#EAB308', Low: '#111827', Unspecified: '#6B7280',
};

// Clean status-badge palette (soft tint bg + strong text + dot) — same treatment as the Patch
// page's Deployment tab.
const STATUS_META: Record<InstallationStatus, { bg: string; text: string; dot: string }> = {
  'Yet to Receive': { bg: '#F2F4F7', text: '#475467', dot: '#667085' },
  Received: { bg: '#EFF8FF', text: '#175CD3', dot: '#2E90FA' },
  'In Progress': { bg: '#FFF8EB', text: '#B54708', dot: '#F79009' },
  Success: { bg: '#ECFDF3', text: '#067647', dot: '#12B76A' },
  Failed: { bg: '#FEF3F2', text: '#B42318', dot: '#F04438' },
  Cancelled: { bg: '#F2F4F7', text: '#475467', dot: '#667085' },
};

function StatusPill({ status }: { status: InstallationStatus }) {
  const m = STATUS_META[status];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[12px] font-medium cursor-default" style={{ backgroundColor: m.bg, color: m.text }}>
          <span className="size-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.dot }} />
          {status}
        </span>
      </TooltipTrigger>
      <TooltipContent>Installation Status</TooltipContent>
    </Tooltip>
  );
}

const downloadDot = (s: string) => (s === 'Success' ? '#22C55E' : s === 'Failed' ? '#EF4444' : '#64748B');

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

const ViewConfigButton = ({ full = false }: { full?: boolean }) => (
  <button className={`${full ? 'w-full' : 'inline-block whitespace-nowrap'} rounded bg-[#e8f4fd] px-3 py-1.5 text-[12px] font-medium text-[#3D8BD0] hover:bg-[#d0e8f9] transition-colors`}>View Configuration</button>
);

/** Card field cell — label over value, matching the Patch page's deployment cards. */
const CardField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0"><div className="text-[11px] text-[#9CA3AF]">{label}</div><div className="text-[12px] text-[#364658] truncate">{children}</div></div>
);

export function EndpointDeploymentTab() {
  const [section, setSection] = useState<DeploySection>('Patch');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'card'>('card');
  const q = search.trim().toLowerCase();

  const counts: Record<DeploySection, number> = {
    Patch: PATCH_DEPLOYS.length,
    Package: PACKAGE_DEPLOYS.length,
    Registry: REGISTRY_DEPLOYS.length,
  };

  const patchRows = PATCH_DEPLOYS.filter((r) => !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.installationStatus.toLowerCase().includes(q) || r.taskType.toLowerCase().includes(q));
  const packageRows = PACKAGE_DEPLOYS.filter((r) => !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.installationStatus.toLowerCase().includes(q) || r.taskType.toLowerCase().includes(q));
  const registryRows = REGISTRY_DEPLOYS.filter((r) => !q || r.name.toLowerCase().includes(q) || r.installedStatus.toLowerCase().includes(q) || r.taskType.toLowerCase().includes(q));
  const rowCount = section === 'Patch' ? patchRows.length : section === 'Package' ? packageRows.length : registryRows.length;

  // Pagination — same recipe as the Patches tab (bar auto-hides at ≤10 rows).
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  useEffect(() => { setCurrentPage(1); }, [section, search, view]);
  const totalPages = Math.ceil(rowCount / itemsPerPage) || 1;
  const slice = <T,>(rows: T[]): T[] => rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const thCls = 'px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider whitespace-nowrap';
  const tdCls = 'px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]';
  const cardGridCls = 'grid gap-4 grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3';
  const cardCls = 'rounded-xl border border-[#E5E7EB] bg-white p-4 hover:border-[#3D8BD0] hover:shadow-sm transition-all';
  const emptyCls = 'py-10 text-center text-[13px] text-[#9CA3AF]';

  return (
    <div className="px-6 py-4 @container">
      {/* Sub-tab pills — Patch / Package / Registry (same pill design as the Patches tab buckets) */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[13px] font-medium transition-colors ${section === s ? 'bg-[#EBF5FF] border-[#3D8BD0] text-[#3D8BD0]' : 'bg-white border-[#DFE5ED] text-[#364658] hover:bg-[#F5F7FA] hover:border-[#3D8BD0]'}`}
          >
            {s}
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold ${section === s ? 'bg-[#3D8BD0] text-white' : 'bg-[#EEF2F6] text-[#64748B]'}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + card/list view toggle */}
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
        <button
          title={view === 'list' ? 'Card view' : 'List view'}
          onClick={() => setView((v) => (v === 'list' ? 'card' : 'list'))}
          className="size-8 flex-shrink-0 flex items-center justify-center rounded border border-[#DFE5ED] text-[#364658] hover:bg-[#F3F4F6] transition-colors"
        >
          {view === 'list' ? <LayoutGrid size={16} /> : <ListIcon size={16} />}
        </button>
      </div>

      {/* ---------------- Patch sub-tab ---------------- */}
      {section === 'Patch' && (view === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px]">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                {['Patch ID', 'Name', 'Severity', 'Configuration Type', 'Deployment Date', 'Installation Status', 'Retry Status', 'Download Status', 'Task Type', 'Actions'].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {patchRows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No patch deployments found.</td></tr>
              ) : slice(patchRows).map((r) => (
                <tr key={r.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] hover:bg-[#d0e8f9] transition-colors">{r.id}</button>
                  </td>
                  <td className={tdCls}><span className="block max-w-[280px] truncate" title={r.name}>{r.name}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                    <span className="inline-flex items-center gap-1.5 text-[#364658]">
                      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[r.severity] }} />
                      {r.severity}
                    </span>
                  </td>
                  <td className={tdCls}>{r.configType}</td>
                  <td className={tdCls}>{r.deploymentDate ?? <Dash />}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusPill status={r.installationStatus} /></td>
                  <td className={tdCls}>{r.retryStatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                    <span className="inline-flex items-center gap-1.5 text-[#364658]">
                      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: downloadDot(r.downloadStatus) }} />
                      {r.downloadStatus}
                    </span>
                  </td>
                  <td className={tdCls}>{r.taskType}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><ViewConfigButton /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : patchRows.length === 0 ? (
        <div className={emptyCls}>No patch deployments found.</div>
      ) : (
        <div className={cardGridCls}>
          {slice(patchRows).map((r) => (
            <div key={r.id} className={cardCls}>
              <div className="flex items-start gap-3 flex-wrap">
                <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#3D8BD0]"><Package size={18} /></span>
                <div className="min-w-0 flex-1">
                  <span className="inline-block whitespace-nowrap rounded bg-[#e8f4fd] px-1.5 py-0.5 text-[11px] font-semibold text-[#3D8BD0]">{r.id}</span>
                  <button className="block mt-1 text-[13px] font-semibold text-[#3D8BD0] hover:underline truncate text-left max-w-full" title={r.name}>{r.name}</button>
                </div>
                <span className="flex-shrink-0"><StatusPill status={r.installationStatus} /></span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F0F2F5] grid grid-cols-2 gap-x-3 gap-y-2">
                <CardField label="Severity"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[r.severity] }} />{r.severity}</span></CardField>
                <CardField label="Configuration Type">{r.configType}</CardField>
                <CardField label="Deployment Date">{r.deploymentDate ?? <Dash />}</CardField>
                <CardField label="Retry Status">{r.retryStatus}</CardField>
                <CardField label="Download Status"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: downloadDot(r.downloadStatus) }} />{r.downloadStatus}</span></CardField>
                <CardField label="Task Type">{r.taskType}</CardField>
              </div>
              <div className="mt-3"><ViewConfigButton full /></div>
            </div>
          ))}
        </div>
      ))}

      {/* ---------------- Package sub-tab ---------------- */}
      {section === 'Package' && (view === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px]">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                {['Package ID', 'Name', 'Configuration Type', 'Deployment Date', 'Installation Status', 'Retry Status', 'Download Status', 'Task Type', 'Created Date', 'Updated Date', 'Actions'].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {packageRows.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No package deployments found.</td></tr>
              ) : slice(packageRows).map((r) => (
                <tr key={r.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] hover:bg-[#d0e8f9] transition-colors">{r.id}</button>
                  </td>
                  <td className={tdCls}>{r.name}</td>
                  <td className={tdCls}>{r.configType}</td>
                  <td className={tdCls}>{r.deploymentDate ?? <Dash />}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusPill status={r.installationStatus} /></td>
                  <td className={tdCls}>{r.retryStatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                    <span className="inline-flex items-center gap-1.5 text-[#364658]">
                      <span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: downloadDot(r.downloadStatus) }} />
                      {r.downloadStatus}
                    </span>
                  </td>
                  <td className={tdCls}>{r.taskType}</td>
                  <td className={tdCls}>{r.createdDate}</td>
                  <td className={tdCls}>{r.updatedDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><ViewConfigButton /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : packageRows.length === 0 ? (
        <div className={emptyCls}>No package deployments found.</div>
      ) : (
        <div className={cardGridCls}>
          {slice(packageRows).map((r) => (
            <div key={r.id} className={cardCls}>
              <div className="flex items-start gap-3 flex-wrap">
                <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#3D8BD0]"><Box size={18} /></span>
                <div className="min-w-0 flex-1">
                  <span className="inline-block whitespace-nowrap rounded bg-[#e8f4fd] px-1.5 py-0.5 text-[11px] font-semibold text-[#3D8BD0]">{r.id}</span>
                  <button className="block mt-1 text-[13px] font-semibold text-[#3D8BD0] hover:underline truncate text-left max-w-full" title={r.name}>{r.name}</button>
                </div>
                <span className="flex-shrink-0"><StatusPill status={r.installationStatus} /></span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F0F2F5] grid grid-cols-2 gap-x-3 gap-y-2">
                <CardField label="Configuration Type">{r.configType}</CardField>
                <CardField label="Deployment Date">{r.deploymentDate ?? <Dash />}</CardField>
                <CardField label="Retry Status">{r.retryStatus}</CardField>
                <CardField label="Download Status"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: downloadDot(r.downloadStatus) }} />{r.downloadStatus}</span></CardField>
                <CardField label="Task Type">{r.taskType}</CardField>
                <CardField label="Created Date">{r.createdDate}</CardField>
                <CardField label="Updated Date">{r.updatedDate}</CardField>
              </div>
              <div className="mt-3"><ViewConfigButton full /></div>
            </div>
          ))}
        </div>
      ))}

      {/* ---------------- Registry sub-tab ---------------- */}
      {section === 'Registry' && (view === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="border-b border-[#e5e7eb]">
              <tr>
                {['Name', 'Configuration Type', 'Deployment Date', 'Installed Status', 'Retry Status', 'Task Type', 'Actions'].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {registryRows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No registry deployments found.</td></tr>
              ) : slice(registryRows).map((r) => (
                <tr key={r.name} className="hover:bg-[#f9fafb] transition-colors">
                  <td className={tdCls}>{r.name}</td>
                  <td className={tdCls}>{r.configType ?? <Dash />}</td>
                  <td className={tdCls}>{r.deploymentDate ?? <Dash />}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusPill status={r.installedStatus} /></td>
                  <td className={tdCls}>{r.retryStatus}</td>
                  <td className={tdCls}>{r.taskType}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><ViewConfigButton /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : registryRows.length === 0 ? (
        <div className={emptyCls}>No registry deployments found.</div>
      ) : (
        <div className={cardGridCls}>
          {slice(registryRows).map((r) => (
            <div key={r.name} className={cardCls}>
              {/* items-center (not -start): no ID-pill line above the name here, so the single-line
                  title centers against the icon badge. */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF3FB] text-[#3D8BD0]"><FileCog size={18} /></span>
                <div className="min-w-0 flex-1">
                  <button className="block text-[13px] font-semibold text-[#3D8BD0] hover:underline truncate text-left max-w-full" title={r.name}>{r.name}</button>
                </div>
                <span className="flex-shrink-0"><StatusPill status={r.installedStatus} /></span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#F0F2F5] grid grid-cols-2 gap-x-3 gap-y-2">
                <CardField label="Configuration Type">{r.configType ?? <Dash />}</CardField>
                <CardField label="Deployment Date">{r.deploymentDate ?? <Dash />}</CardField>
                <CardField label="Retry Status">{r.retryStatus}</CardField>
                <CardField label="Task Type">{r.taskType}</CardField>
              </div>
              <div className="mt-3"><ViewConfigButton full /></div>
            </div>
          ))}
        </div>
      ))}

      {/* Pagination — shared component, sticky to the bottom of the scroll viewport. */}
      <div className="sticky bottom-0 z-30 -mx-6 -mb-4 mt-4 bg-white">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={rowCount}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
