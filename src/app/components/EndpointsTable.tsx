import type { Endpoint } from './EndpointsListPage';

interface EndpointsTableProps {
  endpoints: Endpoint[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  /** Opens the endpoint's detail page (EndpointDrawer) as a drawer tab. */
  onEndpointClick?: (endpoint: Endpoint) => void;
}

const Dash = () => <span className="text-[12px] text-[#9ca3af]">---</span>;

const healthDot = (h: NonNullable<Endpoint['systemHealth']>) =>
  h === 'Healthy' ? '#22C55E' : h === 'Warning' ? '#F59E0B' : '#EF4444';

export function EndpointsTable({
  endpoints,
  selected,
  allSelected,
  onSelectAll,
  onSelect,
  onEndpointClick,
}: EndpointsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1600px]">
        <thead className="border-b border-[#e5e7eb]">
          <tr className="bg-white">
            <th className="w-[40px] px-4 py-2.5 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
              />
            </th>
            <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Agent ID</span></th>
            <th className="min-w-[170px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Host Name</span></th>
            <th className="min-w-[130px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">IP Address</span></th>
            <th className="min-w-[210px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">OS Name</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Version</span></th>
            <th className="min-w-[110px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Service Pack</span></th>
            <th className="min-w-[110px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Architecture</span></th>
            <th className="min-w-[160px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Remote Office</span></th>
            <th className="min-w-[130px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">System Health</span></th>
            <th className="min-w-[140px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Tags</span></th>
            <th className="min-w-[130px] px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider"><span className="whitespace-nowrap">Reboot Required</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {endpoints.map((e) => (
            <tr key={e.id} className="group hover:bg-[#f9fafb] transition-colors">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(e.id)}
                  onChange={(ev) => onSelect(e.id, ev.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  {/* agent-health dot (agent online/stale), same treatment as the patch Endpoint tab */}
                  <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: e.agentOnline ? '#22C55E' : '#EAB308' }} />
                  <button
                    onClick={() => onEndpointClick?.(e)}
                    className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]"
                  >{e.id}</button>
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">
                <button onClick={() => onEndpointClick?.(e)} className="hover:text-[#3D8BD0] transition-colors">{e.hostName}</button>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{e.ipAddress}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]"><span className="block max-w-[220px] truncate" title={e.osName}>{e.osName}</span></td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{e.version ?? <Dash />}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{e.servicePack ?? <Dash />}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{e.architecture}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {e.remoteOffice ? (
                  <span className="inline-block rounded bg-[#EEF2F6] px-2 py-0.5 text-[12px] text-[#364658]">{e.remoteOffice}</span>
                ) : <Dash />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {e.systemHealth ? (
                  <span className="inline-flex items-center gap-1.5 text-[#364658]">
                    <span className="size-2 flex-shrink-0 rounded-full" style={{ backgroundColor: healthDot(e.systemHealth) }} />
                    {e.systemHealth}
                  </span>
                ) : <Dash />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px]">
                {e.tags.length ? (
                  <span className="inline-flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span key={t} className="inline-block rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#475467]">{t}</span>
                    ))}
                  </span>
                ) : <Dash />}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#364658]">{e.rebootRequired}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
