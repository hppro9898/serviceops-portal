/* Shared patch reference data used by BOTH the right-panel groups (Affected Products / File
 * Details in TicketPropertiesPanel) and the Overview KPI strip in PatchDrawer, so the two can
 * never drift out of sync. */

export interface AffectedProduct {
  name: string;
  type: 'OS' | 'Application';
}

/** Products affected by the patch. A single patch targets EITHER operating systems OR an
 * application — never a mix — so every entry here carries the same `type` (this one is an OS
 * patch: the Windows editions its KB applies to). */
export const PATCH_AFFECTED_PRODUCTS: AffectedProduct[] = [
  { name: 'Microsoft Windows Server 2022 Standard', type: 'OS' },
  { name: 'Microsoft Windows Server 2022 Datacenter', type: 'OS' },
  { name: 'Microsoft Windows Server 2019 Standard', type: 'OS' },
  { name: 'Microsoft Windows Server 2019 Datacenter', type: 'OS' },
  { name: 'Microsoft Windows Server 2016 Standard', type: 'OS' },
  { name: 'Microsoft Windows 11 Enterprise', type: 'OS' },
  { name: 'Microsoft Windows 11 Pro', type: 'OS' },
  { name: 'Microsoft Windows 11 Education', type: 'OS' },
  { name: 'Microsoft Windows 10 Enterprise', type: 'OS' },
  { name: 'Microsoft Windows 10 Pro', type: 'OS' },
];

export interface PatchFile {
  name: string;
  size: string;
  language: string;
}

/** Files that make up the patch. */
export const PATCH_FILES: PatchFile[] = [
  { name: 'officedeploymenttool_19822.20114.exe', size: '3.52 MB', language: 'all' },
  { name: 'windows11.0-kb5036893-x64.msu', size: '287.4 MB', language: 'en-US' },
  { name: 'ndp48-x86-x64-allos-enu.exe', size: '121.6 MB', language: 'all' },
];

/** Sum the human-readable file sizes ("287.4 MB") into a single display string. */
export function totalPatchFileSize(files: PatchFile[] = PATCH_FILES): string {
  const mb = files.reduce((sum, f) => {
    const m = f.size.match(/([\d.]+)\s*(KB|MB|GB)/i);
    if (!m) return sum;
    const value = parseFloat(m[1]);
    const unit = m[2].toUpperCase();
    return sum + (unit === 'GB' ? value * 1024 : unit === 'KB' ? value / 1024 : value);
  }, 0);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}
