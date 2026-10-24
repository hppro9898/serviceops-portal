import { FileCode2, KeyRound, Cpu, Upload } from 'lucide-react';
import { EndpointBomTab } from './EndpointBomTab';
import { componentCount } from './bomData';
import type { BomType } from './bomData';
import { productBomTypes, productKey, productScope } from './bomProductsData';
import type { ProductRecord } from './bomProductsData';

/* SBOM · CBOM · AI BOM — one tab each, managed separately.
 *
 * Used by the product detail page AND by a linked service's CMDB page, so the two show the same
 * three BOMs the same way. Each tab is the version-history view locked to its one type. */

export type BomTabId = 'sbom' | 'cbom' | 'aibom';
export const BOM_TABS: { id: BomTabId; type: BomType; label: string }[] = [
  { id: 'sbom', type: 'SBOM', label: 'SBOM' },
  { id: 'cbom', type: 'CBOM', label: 'CBOM' },
  { id: 'aibom', type: 'AI BOM', label: 'AI BOM' },
];
export const BOM_TAB_IDS = BOM_TABS.map((t) => t.id) as string[];
export const bomTabFor = (type: BomType): BomTabId => BOM_TABS.find((t) => t.type === type)!.id;

export const bomTypeIcon = (t: BomType, size = 14) =>
  t === 'SBOM' ? <FileCode2 size={size} /> : t === 'CBOM' ? <KeyRound size={size} /> : <Cpu size={size} />;

/** What the tab badge counts: components / crypto assets / AI components. `null` while the first scan
 *  is still queued — there is nothing to count yet. */
export function bomTypeCount(p: ProductRecord, t: BomType): number | null {
  if (p.scanState === 'Queued') return null;
  if (!productBomTypes(p).includes(t)) return 0;
  return componentCount(p.id, productKey(p), t);
}


/** One product's BOM of one type — or the reason there is none. `onIngest` (ingested applications
 *  only) opens the Ingest BOM drawer on this type: its first file from the empty state, or a new
 *  version from the tab's primary action. */
export function ProductBomTypeView({ p, type, onIngest }: { p: ProductRecord; type: BomType; onIngest?: () => void }) {
  const ingested = p.source === 'Ingest';
  const queued = p.scanState === 'Queued';

  /* A designed empty state, never a blank panel. It names the application, then says why there is
     nothing: an ingest only holds the BOM files that were uploaded; a scan only lists what it found. */
  if (!queued && !productBomTypes(p).includes(type)) {
    return (
      <EmptyType type={type}
        title={ingested ? 'No file ingested yet' : 'Nothing found in the last scan'}
        body={ingested ? 'Use Ingest to add one.' : `The scan of ${p.scanPath ?? 'this application'} returned no results.`}
        action={ingested && onIngest ? { label: 'Ingest', onClick: onIngest } : undefined} />
    );
  }
  return (
    <EndpointBomTab
      key={`${p.id}:${type}`}
      endpointId={p.id}
      hostName={p.agent?.hostName ?? p.name}
      fixedScope={productScope(p)}
      allowedTypes={[type]}
      lockedType={type}
      initialType={type}
      ingested={ingested}
      primaryAction={ingested && onIngest ? { label: 'Ingest', icon: <Upload size={15} />, onClick: onIngest } : undefined}
    />
  );
}

function EmptyType({ type, title, body, action }: { type: BomType; title: string; body?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="px-6 py-6">
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F9FAFB] px-6 py-14 text-center">
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-[#EEF2F6] text-[#7B8FA5]">{bomTypeIcon(type, 18)}</span>
        <p className="text-[14px] font-semibold text-[#364658]">{title}</p>
        {body && <p className="mt-1 max-w-[460px] text-[13px] text-[#7B8FA5]">{body}</p>}
        {action && (
          <button type="button" onClick={action.onClick}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#2F7AB8]">
            <Upload size={15} />{action.label}
          </button>
        )}
      </div>
    </div>
  );
}
