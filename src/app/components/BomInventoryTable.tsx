import { ShieldCheck, RefreshCw, XCircle, KeyRound } from 'lucide-react';
import type { BomStatus } from './bomData';
import type { ProductRecord, ProductBomSummary } from './bomProductsData';
import { isCmdbLicensed } from './bomProductsData';
import { EndpointLink, SourcePill } from './BomProductFormParts';

/* Application Services grid — one row per Application Service in BOM scope, named the way it was added.
 *
 * It used to be one row per CI ("what is on this laptop"). A row is now the product someone
 * chose to cover, and the columns say where its BOM comes from (Agent or Ingest), which agent
 * scans it (Agent only — an ingest has none), and — only if someone linked one — the Business or
 * Application Service it is linked to in the CMDB.
 *
 * (The file keeps its old name; renaming it mid-feature buys nothing but a broken import.) */

const Dash = () => <span className="text-[12px] text-[#9ca3af]">—</span>;

const STATUS_STYLE: Record<BomStatus, { bg: string; text: string; icon: typeof ShieldCheck; label: string }> = {
  Success: { bg: '#ECFDF3', text: '#22A06B', icon: ShieldCheck, label: 'Success' },
  'In Progress': { bg: '#FEF7E6', text: '#D97706', icon: RefreshCw, label: 'In Progress' },
  Failed: { bg: '#FEF3F2', text: '#DC2626', icon: XCircle, label: 'Failed' },
};

/** The last scan's outcome; an ingested application is never scanned, so it shows a dash. */
export function BomStatusPill({ status }: { status: BomStatus | null }) {
  if (!status) return <Dash />;
  const s = STATUS_STYLE[status];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
      <Icon size={13} />{s.label}
    </span>
  );
}

export interface ProductRow { product: ProductRecord; bom: ProductBomSummary }

interface Props {
  rows: ProductRow[];
  selected: Set<string>;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpen: (p: ProductRecord) => void;
  emptyText: string;
}

/* Same order as Admin › BOM Scope (ID · Application · BOM Source · Scan Path · Endpoint · CI ·
   Manufacturer), then what the technician side adds: the BOM itself. */
const HEADERS: [string, string][] = [
  ['ID', ''], ['Application', 'min-w-[220px]'], ['BOM Source', ''], ['Scan Path', 'min-w-[200px]'],
  ['Endpoint', ''], ['CI', ''], ['Manufacturer', 'min-w-[150px]'],
  ['BOM Status', 'min-w-[130px]'], ['Software Components', ''], ['Vulnerable Components', ''], ['Crypto Assets', ''],
  ['AI Components', ''], ['Created Date', 'min-w-[130px]'], ['Last Updated Date', 'min-w-[150px]'],
];

export function BomInventoryTable({ rows, selected, allSelected, onSelectAll, onSelect, onOpen, emptyText }: Props) {
  /* Without a CMDB licence nothing can be linked, so the column would only ever say "Not linked". */
  const cmdb = isCmdbLicensed();
  const headers = cmdb ? HEADERS : HEADERS.filter(([h]) => h !== 'CI');
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1800px]">
        <thead className="border-b border-[#e5e7eb]">
          <tr className="bg-white">
            <th className="w-[40px] px-4 py-2.5 text-left">
              <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0" />
            </th>
            {headers.map(([h, cls]) => (
              <th key={h} className={`${cls} px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]`}>
                <span className="whitespace-nowrap">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] bg-white">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length + 1} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">{emptyText}</td></tr>
          ) : rows.map(({ product: p, bom }) => {
            const ingest = p.source === 'Ingest';
            return (
              <tr key={p.id} className="group cursor-pointer transition-colors hover:bg-[#f9fafb]" onClick={() => onOpen(p)}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={(ev) => onSelect(p.id, ev.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0" />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button onClick={(e) => { e.stopPropagation(); onOpen(p); }}
                    className="inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] transition-colors hover:bg-[#d0e8f9]">{p.id}</button>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[12px] font-medium text-[#364658] group-hover:text-[#3D8BD0]">{p.name}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3"><SourcePill source={p.source} /></td>
                <td className="px-4 py-3 text-[12px]">
                  {ingest ? <Dash /> : <span className="block max-w-[260px] truncate font-mono text-[#364658]" title={p.scanPath ?? ''}>{p.scanPath}</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                  {p.agent ? <EndpointLink agent={p.agent} /> : <Dash />}
                </td>
                {cmdb && <td className="whitespace-nowrap px-4 py-3 text-[12px]">
                  {p.linkedCi ? (
                    <button type="button" title={`Open ${p.linkedCi.id} · ${p.linkedCi.name} in CMDB`}
                      onClick={(e) => { e.stopPropagation(); window.__bomStore?.openCi(p.linkedCi!.id); }}
                      className="rounded-md bg-[#E5E7EB] px-2 py-0.5 text-[12px] font-semibold text-[#364658] transition-colors hover:bg-[#D9DEE5] hover:text-[#3D8BD0]">{p.linkedCi.id}</button>
                  ) : <Dash />}
                </td>}
                <td className="px-4 py-3 text-[12px] text-[#364658]"><span className="block max-w-[200px] truncate">{p.publisher}</span></td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
