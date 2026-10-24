import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PatchInstallation, InstallationStatus } from './PatchComputersTab';

/* Patch DEPLOYMENT detail page — "Patches" tab: the patches this deployment rolls out.
 * Standard borderless grid + search, columns mirroring the patch catalog
 * (ID / Name / Category / Severity / Approval / Application / Release Date / KB / Size / UUID). */

export interface DeployedPatch {
  id: string;
  name: string;
  category: string;
  severity: 'Critical' | 'Important' | 'Moderate' | 'Low';
  approvalStatus: 'Approved' | 'Not Approved';
  application: string;
  releaseDate: string;
  kbNumber: string;
  downloadSize: string;
  uuid: string;
}

// Realistic patches carried by this deployment run (exported: the header KPI strip counts them).
export const DEPLOYED_PATCHES: DeployedPatch[] = [
  { id: 'PCH-4345', name: '2025-10 Cumulative Update for Windows 11, version 25H2 for x64-based Systems', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: 'Windows 11', releaseDate: 'Tue, Oct 14, 2025 05:00 PM', kbNumber: '5066128', downloadSize: '93.84 MB', uuid: 'BF92D4D8-5410-4EBB-A2C7-3E81D904F213' },
  { id: 'PCH-3986', name: '2025-09 Cumulative Update for Windows 10, version 22H2 for x64-based Systems', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: 'Windows 10, version 22H2', releaseDate: 'Tue, Sep 09, 2025 05:00 PM', kbNumber: '5065429', downloadSize: '758.13 MB', uuid: '2680C385-659A-432E-91D8-7AC04D115E60' },
  { id: 'PCH-2440', name: '2023-10 Servicing Stack Update for Windows 10, version 22H2 for x64-based Systems', category: 'Security Updates', severity: 'Critical', approvalStatus: 'Approved', application: 'Windows 10, version 22H2', releaseDate: 'Tue, Oct 10, 2023 05:00 PM', kbNumber: '5031539', downloadSize: '15.99 MB', uuid: 'F4FCE270-A397-467F-B1D3-06C24A98E5C1' },
  { id: 'PCH-3121', name: '2025-07 Security Update for Microsoft .NET Framework 4.8.1 for Windows 11 for x64', category: 'Security Updates', severity: 'Important', approvalStatus: 'Approved', application: '.NET Framework 4.8.1', releaseDate: 'Tue, Jul 08, 2025 05:00 PM', kbNumber: '5056579', downloadSize: '68.42 MB', uuid: '9C31A7E4-0D52-48F1-B6A9-51E20C87D3B4' },
];

const severityDot = (s: DeployedPatch['severity']) =>
  s === 'Critical' ? '#EF4444' : s === 'Important' ? '#F59E0B' : s === 'Moderate' ? '#EAB308' : '#111827';

/* The endpoints this deployment targets. The Deployment tab shows the FULL patch × endpoint
 * matrix (every patch on every endpoint), so `patches.length × endpoints.length` rows. */
export const DEPLOYMENT_ENDPOINTS = [
  { id: 'EP-380', hostName: 'ACIWSUSV-01', ip: '192.168.1.13' },
  { id: 'EP-397', hostName: 'Jevyjava-LT', ip: '192.168.112.75' },
  { id: 'EP-400', hostName: 'PARTH-UPADHYAY', ip: '192.168.1.75' },
  { id: 'EP-426', hostName: 'DESKTOP-A3RMK1H', ip: '192.168.29.100' },
];

// A deterministic status per (patch, endpoint) cell so the matrix reads varied but stable.
const MATRIX_STATUS: InstallationStatus[] = ['Success', 'Failed', 'Yet to Receive', 'In Progress'];

/** Build the patch × endpoint deployment matrix — one row per pair (the Deployment tab's rows). */
export function buildDeploymentMatrix(): PatchInstallation[] {
  const rows: PatchInstallation[] = [];
  DEPLOYED_PATCHES.forEach((p, pi) => {
    DEPLOYMENT_ENDPOINTS.forEach((e, ei) => {
      const status = MATRIX_STATUS[(pi * 3 + ei) % MATRIX_STATUS.length];
      const done = status === 'Success' || status === 'Failed';
      rows.push({
        id: `INST-${p.id}-${e.id}`,
        agentId: e.id,
        hostName: e.hostName,
        ipAddress: e.ip,
        configType: 'Install',
        deploymentDate: done ? 'Mon, Jul 20, 2026 04:58 PM' : '---',
        installationStatus: status,
        retryStatus: status === 'Failed' ? 2 : 0,
        // Download = fetch from the office/DS (never the Internet); the patch reaches the endpoint
        // fine even on an install failure (that's a machine-side issue).
        downloadStatus: 'Success',
        taskType: 'Auto Patch Deployment',
        patchId: p.id,
        patchName: p.name,
        patchSeverity: p.severity,
        result: status === 'Success' ? 'Installed' : status === 'Failed' ? 'Install Failed' : '---',
      });
    });
  });
  return rows;
}

export function PatchDeploymentPatchesTab() {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const rows = DEPLOYED_PATCHES.filter((p) =>
    !q ||
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.severity.toLowerCase().includes(q) ||
    p.application.toLowerCase().includes(q) ||
    p.kbNumber.includes(q) ||
    p.uuid.toLowerCase().includes(q)
  );

  const headers = ['Patch ID', 'Name', 'Patch Category', 'Severity', 'Approval Status', 'Application', 'Release Date', 'KB Number', 'Download Size', 'UUID'];

  return (
    <div className="px-6 py-4">
      {/* Search */}
      <div className="relative mb-3">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1500px]">
          <thead className="border-b border-[#e5e7eb]">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No patches match your search.</td></tr>
            ) : rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-[#f9fafb]">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{p.id}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#364658]"><span className="block max-w-[260px] truncate" title={p.name}>{p.name}</span></td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.category}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                  <span className="inline-flex items-center gap-1.5 text-[#364658]">
                    <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: severityDot(p.severity) }} />
                    {p.severity}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                  <span className="inline-flex items-center gap-1.5 text-[#364658]">
                    <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: p.approvalStatus === 'Approved' ? '#22A06B' : '#F59E0B' }} />
                    {p.approvalStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">[{p.application}]</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]"><span className="block max-w-[170px] truncate" title={p.releaseDate}>{p.releaseDate}</span></td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.kbNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{p.downloadSize}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]"><span className="block max-w-[220px] truncate" title={p.uuid}>{p.uuid}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
