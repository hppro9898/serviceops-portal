import { useMemo, useState } from 'react';
import { Search, KeyRound, ChevronRight } from 'lucide-react';
import { linkedProductsFor, productsOnEndpoint, productBomSummary, useProductsVersion, isCmdbLicensed, OPEN_DETAIL_EVENT } from './bomProductsData';
import type { ProductRecord } from './bomProductsData';
import { BomStatusPill } from './BomInventoryTable';
import { EndpointLink, SourcePill } from './BomProductFormParts';

/* BOM tab on a page that is NOT an application — a CMDB Business / Application Service, or an
 * Endpoint. Neither holds a BOM of its own: the BOM belongs to the APPLICATION. So the tab only
 * answers "which applications sit behind this record?" —
 *
 *   Application Service   the applications linked to it
 *   Business Service      the applications linked to the Application Services it depends on
 *   Endpoint              the applications scanned on it
 *
 * — as a plain grid, one row per application. The versions, components and vulnerabilities live
 * on the application's own page in the BOM module; a row click opens it there, so there is ONE
 * place to read a BOM rather than a second copy embedded in every CI and endpoint. */

const Dash = () => <span className="text-[12px] text-[#9ca3af]">—</span>;

type Ctx = 'ci' | 'endpoint';

const openApp = (id: string) => window.dispatchEvent(new CustomEvent(OPEN_DETAIL_EVENT, { detail: { id } }));

export function ApplicationGrid({ apps, ctx, emptyText }: {
  apps: ProductRecord[];
  ctx: Ctx;
  emptyText: string;
}) {
  const [q, setQ] = useState('');
  const cmdb = isCmdbLicensed();
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return apps
      .filter((p) => !t || `${p.id} ${p.name} ${p.publisher} ${p.scanPath ?? ''} ${p.agent?.hostName ?? ''} ${p.linkedCi?.id ?? ''} ${p.linkedCi?.name ?? ''}`.toLowerCase().includes(t))
      .map((p) => ({ p, bom: productBomSummary(p) }));
  }, [apps, q]);

  /* The record the tab sits on is already known, so its own column is dropped: the endpoint page
     shows Scan Path + CI instead of Endpoint, the CI page shows BOM Source + Endpoint (the CI is the page itself). */
  const headers: [string, string][] = [
    ['ID', ''], ['Application', 'min-w-[200px]'],
    ...(ctx === 'endpoint'
      ? [['Scan Path', 'min-w-[180px]'], ...(cmdb ? [['CI', '']] : [])] as [string, string][]
      : [['BOM Source', ''], ['Endpoint', '']] as [string, string][]),
    ['BOM Status', ''], ['Software Components', ''], ['Vulnerable Components', ''], ['Crypto Assets', ''], ['AI Components', ''],
    ['Created Date', 'min-w-[130px]'], ['Last Updated Date', 'min-w-[150px]'], ['', 'w-[40px]'],
  ];

  if (apps.length === 0) {
    return <div className="px-6 py-10 text-center text-[13px] text-[#7B8FA5]">{emptyText}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-4">
        <div className="relative w-[280px] max-w-full">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search"
            className="h-8 w-full rounded border border-[#DFE5ED] bg-white pl-8 pr-3 text-[13px] text-[#364658] placeholder:text-[#9CA3AF] focus:border-[#3D8BD0] focus:outline-none" />
        </div>
        <span className="text-[12px] text-[#7B8FA5]">
          <span className="font-semibold text-[#364658]">{apps.length}</span> {apps.length === 1 ? 'application' : 'applications'}
          {ctx === 'endpoint' ? ' scanned on this endpoint' : ' linked to this CI'} · open one to see its BOM
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="border-b border-[#e5e7eb]">
            <tr className="bg-white">
              {headers.map(([h, cls], i) => (
                <th key={h || i} className={`${cls} px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]`}>
                  <span className="whitespace-nowrap">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">No application matches “{q}”.</td></tr>
            ) : rows.map(({ p, bom }) => {
              return (
                <tr key={p.id} className="group cursor-pointer transition-colors hover:bg-[#f9fafb]" onClick={() => openApp(p.id)}
                  title={`Open ${p.id} · ${p.name} in BOM`}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors group-hover:bg-[#d0e8f9]">{p.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-medium text-[#364658] group-hover:text-[#3D8BD0]">{p.name}</div>
                    <div className="text-[11px] text-[#7B8FA5]">{p.publisher}{p.version ? ` · v${p.version}` : ''}</div>
                  </td>
                  {ctx === 'endpoint' ? (
                    <>
                      <td className="px-4 py-3 text-[12px]">
                        {p.scanPath ? <span className="block max-w-[240px] truncate font-mono text-[#364658]" title={p.scanPath}>{p.scanPath}</span> : <Dash />}
                      </td>
                      {cmdb && <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                        {p.linkedCi
                          ? <span className="rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[12px] font-semibold text-[#364658]" title={p.linkedCi.name}>{p.linkedCi.id}</span>
                          : <Dash />}
                      </td>}
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-4 py-3"><SourcePill source={p.source} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-[12px]" onClick={(e) => e.stopPropagation()}>
                        {p.agent ? <EndpointLink agent={p.agent} /> : <Dash />}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-4 py-3"><BomStatusPill status={bom.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">{bom.components ? bom.components.toLocaleString() : <Dash />}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                    {p.scanState === 'Queued' ? <Dash />
                      : <span className={bom.vulnerabilities > 0 ? 'font-semibold text-[#D97706]' : 'text-[#9ca3af]'}>{bom.vulnerabilities}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                    {bom.cryptoAssets ? <span className="inline-flex items-center gap-1.5 text-[#364658]"><KeyRound size={13} className="text-[#7B8FA5]" />{bom.cryptoAssets}</span> : <Dash />}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">{bom.aiComponents || <Dash />}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">{p.createdAt ?? p.addedOn}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">{p.updatedAt ?? p.createdAt ?? p.addedOn}</td>
                  <td className="px-2 py-3 text-[#9CA3AF] group-hover:text-[#3D8BD0]"><ChevronRight size={16} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** CMDB page — a Business Service or an Application Service. */
export function CiBomTab({ ciId }: { ciId: string }) {
  useProductsVersion();
  return (
    <ApplicationGrid
      ctx="ci"
      apps={linkedProductsFor(ciId)}
      emptyText="No application in BOM scope is linked to this CI. Link one from an application's page in BOM, or from BOM Scope."
    />
  );
}

/** Endpoint page — the applications scanned on this endpoint. */
export function EndpointAppBomTab({ endpointId }: { endpointId: string }) {
  useProductsVersion();
  return (
    <ApplicationGrid
      ctx="endpoint"
      apps={productsOnEndpoint(endpointId)}
      emptyText="No application in BOM scope is scanned on this endpoint. Add one in Admin › BOM Management › BOM Scope."
    />
  );
}
