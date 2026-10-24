import { useState, useEffect } from 'react';
import {
  X, Minus, Square, Copy, Link2, ShieldAlert, Boxes, Package, Server, Info,
  Layers, Download, Gauge, Share2, CalendarClock, History, StickyNote, Clock, Radio, Hand,
  ScanLine, ArrowRight, CirclePlus, CircleMinus, RefreshCw,
} from 'lucide-react';
import { bomVersions } from './bomData';
import type { BomType } from './bomData';
import { toast } from 'sonner';
import { DrawerTabStrip } from './DrawerTabStrip';
import { MinimizedDrawerRail } from './MinimizedDrawerRail';
import { appComponents, appPackages, appVulnerabilities, affectedCisFor } from './softwareApplicationsData';
import type { SoftwareApplication } from './softwareApplicationsData';

/* Software Catalog entry detail — a product the Software tab lists. Not a CI: installed software
 * is a row on its host, and only Business Applications hold a BOM licence.
 *
 * Its own drawer rather than a CmdbDrawer variant: an application is not a machine, so the
 * hardware detail page's tabs (Hardware, Running Process, Baseline) would all be dead, and
 * the three that matter here — what it is MADE of, what it is INSTALLED FROM, and WHERE it
 * is installed — have nowhere to live in that shell.
 *
 * Tabs with no data still render. An empty Meter tab is a true statement about this
 * application; removing it would make the page's shape change per record, and the reader
 * could not tell "nothing here" from "not supported".
 */

type Tab =
  | 'properties' | 'bom' | 'components' | 'packages' | 'affected'
  | 'vulnerabilities' | 'consolidated' | 'installation' | 'meter'
  | 'relationships' | 'linked-events' | 'history' | 'notes' | 'eosl';

interface SoftwareApplicationDrawerProps {
  openAssets: SoftwareApplication[];
  activeAssetId: string;
  onClose: () => void;
  onCloseTab: (id: string) => void;
  onTabChange: (id: string) => void;
  stackTabs?: { id: string; subject: string }[];
  stackWidth?: number;
  onStackWidthChange?: (w: number) => void;
  stackMinimized?: boolean;
  onStackMinimizedChange?: (m: boolean) => void;
  stackActiveTab?: string;
  onStackActiveTabChange?: (t: string) => void;
}

const SEV_TONE: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#FEF3F2', text: '#B42318' },
  High: { bg: '#FFF4ED', text: '#C4320A' },
  Medium: { bg: '#FFFAEB', text: '#B54708' },
};

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">{children}</th>
);
const TD = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td className={`px-4 py-3 text-[12px] text-[#364658] ${mono ? 'font-mono' : ''}`}>{children}</td>
);

/** Every tab that has nothing to show uses this, so "empty" looks the same everywhere. */
function Empty({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center px-6 py-10">
      <div className="text-center">
        <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-[#F5F7FA] text-[#9CA3AF]">{icon}</div>
        <h3 className="text-[14px] font-semibold text-[#364658]">{title}</h3>
        <p className="mx-auto mt-1 max-w-[420px] text-[13px] text-[#7B8FA5]">{note}</p>
      </div>
    </div>
  );
}

export function SoftwareApplicationDrawer({
  openAssets, activeAssetId, onClose, onCloseTab, onTabChange,
  stackTabs, stackWidth, onStackWidthChange, stackMinimized, onStackMinimizedChange,
  stackActiveTab, onStackActiveTabChange,
}: SoftwareApplicationDrawerProps) {
  const a = openAssets.find((x) => x.id === activeAssetId) ?? openAssets[0];

  const [tabLocal, setTabLocal] = useState<Tab>('properties');
  const activeTab = (stackActiveTab as Tab) ?? tabLocal;
  const setTab = (t: Tab) => { setTabLocal(t); onStackActiveTabChange?.(t); };

  const [bomType, setBomType] = useState<BomType>('SBOM');
  const [minimizedLocal, setMinimizedLocal] = useState(false);
  const minimized = stackMinimized ?? minimizedLocal;
  const setMinimized = (m: boolean) => { setMinimizedLocal(m); onStackMinimizedChange?.(m); };

  const [widthLocal, setWidthLocal] = useState(stackWidth ?? 1280);
  const drawerWidth = stackWidth ?? widthLocal;
  const toggleWidth = () => {
    const next = drawerWidth > 1080 ? 900 : 1280;
    setWidthLocal(next); onStackWidthChange?.(next);
  };

  // A new record opens on Properties — the tab that is never empty.
  useEffect(() => { if (a) setTabLocal('properties'); }, [a?.id]);

  if (!a) return null;
  if (minimized) {
    return (
      <MinimizedDrawerRail
        items={stackTabs ?? [{ id: a.id, subject: a.name }]}
        activeId={activeAssetId}
        onSelect={(id) => { onTabChange(id); setMinimized(false); }}
        onRestore={() => setMinimized(false)}
      />
    );
  }

  /* Version history for the application itself. Keyed by the application's own CI id so it
     is stable per application rather than per host: the same release of Docker Desktop is one
     document, whichever machine reports it. */
  const versions = bomVersions(a.id, 'app', bomType);
  const components = appComponents(a);
  const packages = appPackages(a);
  const vulns = appVulnerabilities(a);
  const cis = affectedCisFor(a);

  const TABS: { id: Tab; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'properties', label: 'Properties', icon: <Info size={14} /> },
    /* An application ships its own Bill of Materials, and it is the same document the hosts
       carry — so the tab is the version history of THIS application, not of a machine. */
    { id: 'bom', label: 'BOM', count: versions.length, icon: <Boxes size={14} /> },
    { id: 'components', label: 'Components', count: components.length, icon: <Boxes size={14} /> },
    { id: 'packages', label: 'Packages', count: packages.length, icon: <Package size={14} /> },
    { id: 'affected', label: 'Affected CIs', count: cis.length, icon: <Server size={14} /> },
    { id: 'vulnerabilities', label: 'Vulnerabilities', count: vulns.length, icon: <ShieldAlert size={14} /> },
    { id: 'consolidated', label: 'Consolidated Software', icon: <Layers size={14} /> },
    { id: 'installation', label: 'Installation', icon: <Download size={14} /> },
    { id: 'meter', label: 'Meter', icon: <Gauge size={14} /> },
    { id: 'relationships', label: 'Relationships', icon: <Share2 size={14} /> },
    { id: 'linked-events', label: 'Linked Events', count: 0, icon: <CalendarClock size={14} /> },
    { id: 'history', label: 'History', icon: <History size={14} /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote size={14} /> },
    { id: 'eosl', label: 'EOSL Insight', icon: <Clock size={14} /> },
  ];

  const kpi = (label: string, value: React.ReactNode) => (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[11px] text-[#7B8FA5]">{label}</span>
      <span className="text-[12px] font-medium text-[#364658]">{value}</span>
    </span>
  );
  const sep = <span className="h-3 w-px bg-[#E5E7EB]" />;

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="min-w-0">
      <div className="text-[12px] text-[#7B8FA5]">{label}</div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-[#364658]">{value}</div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50" onClick={onClose} />
      <aside
        data-drawer
        className="fixed inset-y-0 right-0 z-[9999] flex flex-col bg-white shadow-2xl"
        style={{ width: drawerWidth, maxWidth: '96vw' }}
      >
        {/* Open-item tabs + window controls — the shared chrome every detail page uses. */}
        <div className="flex items-center border-b border-[#DFE5ED] bg-white pl-2">
          <DrawerTabStrip
            items={stackTabs ?? [{ id: a.id, subject: a.name }]}
            activeId={activeAssetId}
            onSelect={onTabChange}
            onClose={onCloseTab}
          />
          <div className="ml-auto flex items-center border-l border-[#DFE5ED]">
            <button onClick={() => setMinimized(true)} title="Minimize panel" className="p-2 text-[#7B8FA5] hover:text-[#364658]"><Minus size={16} /></button>
            <button onClick={toggleWidth} title={drawerWidth > 1080 ? 'Switch to small view' : 'Switch to full view'} className="p-2 text-[#7B8FA5] hover:text-[#364658]"><Square size={15} /></button>
            <button onClick={onClose} title="Close" className="p-2 text-[#7B8FA5] hover:text-[#364658]"><X size={16} /></button>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-[#DFE5ED] px-6 py-3">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{a.id}</span>
                <h1 className="truncate text-[18px] font-semibold text-[#364658]">{a.name}</h1>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {kpi('Record', 'Software Catalog entry')}{sep}
                {kpi('Type', a.type)}{sep}
                {kpi('Version', a.version)}{sep}
                {kpi('Publisher', a.publisher)}{sep}
                {/* Same pill as the Software tab and Configuration Items — a fact that appears
                    on three screens has to look the same on all three. */}
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[11px] text-[#7B8FA5]">Origin</span>
                  <span className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[12px] font-medium"
                    style={a.origin === 'Agent'
                      ? { backgroundColor: '#EEF2F6', color: '#475467' }
                      : { backgroundColor: '#F3ECFB', color: '#6941C6' }}>
                    {a.origin === 'Agent' ? <Radio size={11} /> : <Hand size={11} />}{a.origin}
                  </span>
                </span>{sep}
                {kpi('Installed on', `${cis.length} CI${cis.length === 1 ? '' : 's'}`)}
                {/* Only shown when it is real — an EOSL chip on software with no published
                    end date would be inventing a deadline. */}
                {a.eosl && <>{sep}<span className="inline-flex items-center gap-1.5">
                  <span className="text-[11px] text-[#7B8FA5]">EOSL</span>
                  <span className="text-[12px] font-semibold text-[#B54708]">{a.eosl}</span>
                </span></>}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(a.id).catch(() => {}); toast.success(`${a.id} copied`); }}
                title="Copy ID" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#7B8FA5] hover:text-[#3D8BD0]"><Copy size={15} /></button>
              <button title="Copy link" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#7B8FA5] hover:text-[#3D8BD0]"><Link2 size={15} /></button>
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex items-center gap-2.5 overflow-x-clip border-b border-[#e5e7eb] px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium transition-colors ${
                activeTab === t.id
                  ? 'border-[#3D8BD0] text-[#3D8BD0]'
                  : 'border-transparent text-[#6b7280] hover:border-[#CBD5E1] hover:bg-[#F5F7FA] hover:text-[#364658]'
              }`}
            >
              {t.icon}{t.label}
              {t.count !== undefined && (
                <span className={`rounded px-1 py-0.5 text-[11px] font-medium ${activeTab === t.id ? 'bg-[#E8F4FD] text-[#3D8BD0]' : 'bg-[#E5E7EB] text-[#364658]'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white">
          {activeTab === 'properties' && (
            <div className="px-6 py-6">
              <h3 className="mb-3 text-[14px] font-semibold text-[#364658]">Software Properties</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-lg bg-[#F9FAFB] p-5 md:grid-cols-4">
                <Field label="Application" value={a.name} />
                <Field label="Type" value={a.type} />
                <Field label="Version" value={a.version} />
                <Field label="Publisher" value={a.publisher} />
                <Field label="Category" value={a.category} />
                <Field label="Software Type" value={a.softwareType} />
                <Field label="Origin" value={a.origin} />
                <Field label="Record" value="Software Catalog entry" />
                <Field label="Packages" value={a.packages} />
                <Field label="Components" value={a.components} />
                <Field label="First Seen" value={a.firstSeen} />
                <Field label="Last Seen" value={a.lastSeen} />
                <Field label="End of Support" value={a.eosl ?? <span className="text-[#9CA3AF]">—</span>} />
                <Field label="Installed On" value={`${cis.length} CIs`} />
              </div>
            </div>
          )}

          {activeTab === 'bom' && (
            <div className="px-6 py-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#7B8FA5]">BOM type</label>
                  <select
                    value={bomType}
                    onChange={(e) => setBomType(e.target.value as BomType)}
                    className="h-9 w-[220px] rounded border border-[#d1d5db] bg-white px-3 text-[13px] text-[#364658] focus:border-[#3D8BD0] focus:outline-none"
                  >
                    {(['SBOM', 'CBOM', 'AI BOM'] as BomType[]).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => toast.success(`${bomType} scan queued for ${a.name}`)}
                  className="inline-flex h-9 items-center gap-1.5 rounded bg-[#3D8BD0] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"
                ><ScanLine size={15} /> Scan BOM</button>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[#364658]">Versions</h3>
                <span className="rounded-full bg-[#EEF2F6] px-2 text-[12px] font-semibold text-[#64748B]">{versions.length}</span>
              </div>

              {versions.length === 0 ? (
                <Empty icon={<Boxes size={24} />} title={`No ${bomType} generated`}
                  note={`Nothing has produced a ${bomType} for ${a.name} yet.`} />
              ) : (
                <div className="space-y-0">
                  {versions.map((v, i) => (
                    <div key={v.v}>
                      <div className={`rounded-lg border p-4 ${v.state === 'Current' ? 'border-[#3D8BD0] bg-[#F5FAFF]' : 'border-[#E5E7EB] bg-white'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-semibold text-[#364658]">v{v.v}</span>
                              <span className="text-[13px] text-[#364658]">{v.generatedAt}</span>
                              {v.state === 'Current'
                                ? <span className="rounded-sm bg-[#E8F4FD] px-2 py-0.5 text-[12px] font-medium text-[#3D8BD0]">Current</span>
                                : <span className="text-[12px] text-[#7B8FA5]">Superseded</span>}
                              <span className="rounded-sm bg-[#EEF2F6] px-2 py-0.5 text-[12px] font-medium text-[#475467]">{v.format}</span>
                            </div>
                            {/* The change dots: what this version added, updated and removed —
                                grey at zero so a quiet version does not borrow a colour. */}
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px]">
                              {v.cves > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                                  <ShieldAlert size={13} />{v.cves} CVE
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 ${v.added ? 'text-[#22A06B]' : 'text-[#9CA3AF]'}`}>
                                <CirclePlus size={13} />{v.added}
                              </span>
                              <span className={`inline-flex items-center gap-1 ${v.updated ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>
                                <RefreshCw size={13} />{v.updated}
                              </span>
                              <span className={`inline-flex items-center gap-1 ${v.removed ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`}>
                                <CircleMinus size={13} />{v.removed}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setTab('components')}
                            className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:border-[#3D8BD0] hover:bg-[#F5F7FA]"
                          >View components · {components.length} <ArrowRight size={14} /></button>
                        </div>
                      </div>
                      {/* The scans between two versions: a version only exists where a scan found
                          a change, so the quiet ones are accounted for rather than hidden. */}
                      {i < versions.length - 1 && (
                        <div className="py-2 pl-4 text-[12px] text-[#7B8FA5]">
                          {v.runs?.length ?? 1} scan{(v.runs?.length ?? 1) === 1 ? '' : 's'} between v{versions[i + 1].v} and v{v.v}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'components' && (
            <table className="w-full">
              <thead className="border-b border-[#e5e7eb] bg-white"><tr>
                <TH>Component</TH><TH>Version</TH><TH>Type</TH><TH>Ecosystem</TH><TH>License</TH><TH>Origin</TH><TH>CVEs</TH>
              </tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {components.map((c, i) => (
                  <tr key={`${c.purl}-${i}`} className="hover:bg-[#f9fafb]">
                    <TD mono>{c.name}</TD><TD mono>{c.version}</TD><TD>{c.type}</TD>
                    <TD>{c.ecosystem}</TD><TD>{c.license}</TD><TD>{c.origin}</TD>
                    <TD>{c.cves?.length
                      ? <span className="rounded-sm bg-[#FEF2F2] px-2 py-0.5 text-[12px] font-medium text-[#DC2626]">{c.cves.length}</span>
                      : <span className="text-[#9ca3af]">—</span>}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'packages' && (
            <table className="w-full">
              <thead className="border-b border-[#e5e7eb] bg-white"><tr>
                <TH>Package Name</TH><TH>Package ID</TH><TH>Format</TH><TH>Version</TH><TH>Size</TH><TH>Install Source</TH><TH>Installed Date</TH>
              </tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {packages.map((p) => (
                  <tr key={p.packageId} className="hover:bg-[#f9fafb]">
                    <TD mono>{p.name}</TD>
                    <TD mono><span className="block max-w-[240px] truncate" title={p.packageId}>{p.packageId}</span></TD>
                    <TD>{p.format}</TD><TD mono>{p.version}</TD><TD mono>{p.size}</TD>
                    <TD>{p.installSource}</TD><TD>{p.installedDate}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'affected' && (
            <table className="w-full">
              <thead className="border-b border-[#e5e7eb] bg-white"><tr>
                <TH>CI</TH><TH>Name</TH><TH>CI Type</TH><TH>Host Name</TH><TH>IP Address</TH><TH>Installed Version</TH><TH>Installed On</TH>
              </tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {cis.map(({ ci, version, installedOn }) => (
                  <tr key={ci.id} className="hover:bg-[#f9fafb]">
                    <TD><span className="rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0]">{ci.id}</span></TD>
                    <TD>{ci.name}</TD><TD>{ci.ciType}</TD><TD>{ci.hostName}</TD><TD>{ci.ipAddress}</TD>
                    {/* A build that differs from the application's own version is drift, and
                        drift is the reason to read this table — so it is called out. */}
                    <TD mono>
                      {version}
                      {version !== a.version && <span className="ml-2 rounded-sm bg-[#FEF7E6] px-1.5 py-0.5 text-[11px] font-medium text-[#D97706]">drift</span>}
                    </TD>
                    <TD>{installedOn}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'vulnerabilities' && (
            vulns.length === 0 ? (
              <Empty icon={<ShieldAlert size={24} />} title="No known vulnerabilities"
                note={`None of the ${components.length} components this application ships carries a known CVE.`} />
            ) : (
              <table className="w-full">
                <thead className="border-b border-[#e5e7eb] bg-white"><tr>
                  <TH>CVE</TH><TH>Severity</TH><TH>Component</TH><TH>Version</TH>
                </tr></thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {vulns.map((v) => (
                    <tr key={`${v.cve}-${v.component}`} className="hover:bg-[#f9fafb]">
                      <TD mono>{v.cve}</TD>
                      <TD><span className="rounded-sm px-2 py-0.5 text-[12px] font-medium"
                        style={SEV_TONE[v.severity] ? { backgroundColor: SEV_TONE[v.severity].bg, color: SEV_TONE[v.severity].text } : undefined}>{v.severity}</span></TD>
                      <TD mono>{v.component}</TD><TD mono>{v.version}</TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeTab === 'consolidated' && <Empty icon={<Layers size={24} />} title="No consolidated records" note="Consolidation groups the same application discovered under different names. Nothing has been consolidated onto this record." />}
          {activeTab === 'installation' && <Empty icon={<Download size={24} />} title="No installation runs" note="Deployments pushed through ServiceOps appear here. This application was discovered by the agent rather than deployed." />}
          {activeTab === 'meter' && <Empty icon={<Gauge size={24} />} title="Metering is off" note="Usage metering has not been enabled for this application, so there is nothing to report." />}
          {activeTab === 'relationships' && <Empty icon={<Share2 size={24} />} title="No relationships" note="Relationships to other CIs — hosts, services, dependencies — have not been mapped for this application yet." />}
          {activeTab === 'linked-events' && <Empty icon={<CalendarClock size={24} />} title="No linked events" note="Requests, incidents and changes that reference this application appear here." />}
          {activeTab === 'history' && <Empty icon={<History size={24} />} title="No history yet" note="Field changes and lifecycle events are recorded here once this record is edited." />}
          {activeTab === 'notes' && <Empty icon={<StickyNote size={24} />} title="No notes" note="Notes added by technicians appear here." />}
          {activeTab === 'eosl' && (
            a.eosl
              ? <div className="px-6 py-6">
                  <div className="rounded-lg border border-[#F5D9B0] bg-[#FEF7E6] p-5">
                    <h3 className="text-[14px] font-semibold text-[#B54708]">End of support: {a.eosl}</h3>
                    <p className="mt-1 max-w-[560px] text-[13px] text-[#7B4A08]">
                      {a.name} {a.version} stops receiving vendor security fixes on this date. It is
                      installed on {cis.length} CI{cis.length === 1 ? '' : 's'} — each one keeps any
                      unpatched component after that date, with no upstream fix coming.
                    </p>
                  </div>
                </div>
              : <Empty icon={<Clock size={24} />} title="No published end-of-support date" note={`The vendor has not published an EOSL date for ${a.name}.`} />
          )}
        </div>
      </aside>
    </>
  );
}
