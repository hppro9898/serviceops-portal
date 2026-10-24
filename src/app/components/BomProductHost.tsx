import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDrawerStack } from './DrawerStack';
import { BomAddProductPanel } from './BomAddProductPanel';
import { X, Trash2 } from 'lucide-react';
import { productById, serviceById, serviceCiRow, agentById, endpointIdOf, removeProduct, seatsLeft, OPEN_ADD_EVENT, OPEN_DETAIL_EVENT, OPEN_CI_EVENT, OPEN_EDIT_EVENT, OPEN_ENDPOINT_EVENT, OPEN_REMOVE_EVENT } from './bomProductsData';
import type { Patch } from './PatchesListPage';
import type { ProductRecord, ProductSource } from './bomProductsData';

/* The one home of the Add product form.
 *
 * Mounted once by App, inside the drawer host, and opened by event rather than by prop: the BOM
 * listing asks for it, and so does Admin › BOM Management › BOM Scope — a vanilla-JS prototype
 * in an iframe with no props to pass. One form, two doors. */

export function openAddProduct(mode: 'agent' | 'ingest') {
  window.dispatchEvent(new CustomEvent(OPEN_ADD_EVENT, { detail: { mode } }));
}

export function BomProductHost() {
  const [mode, setMode] = useState<ProductSource | null>(null);
  /* Edit opens the SAME form, filled in, with the endpoint and source locked. */
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  /* Remove asks in a centred dialog here, over the whole shell — the Admin iframe only requests it. */
  const [removing, setRemoving] = useState<ProductRecord | null>(null);
  const { open } = useDrawerStack();
  const openDetail = (p: ProductRecord) => open('bom-products', p.id, p.name, p);

  useEffect(() => {
    const onAdd = (e: Event) => { setEditing(null); setMode((e as CustomEvent).detail?.mode === 'ingest' ? 'Ingest' : 'Agent'); };
    const onEdit = (e: Event) => { const p = productById((e as CustomEvent).detail?.id); if (p) { setEditing(p); setMode(p.source); } };
    const onDetail = (e: Event) => { const p = productById((e as CustomEvent).detail?.id); if (p) openDetail(p); };
    /* A product's linked service opens as its real CMDB page, landing on the BOM tab. */
    const onCi = (e: Event) => {
      const ci = serviceById((e as CustomEvent).detail?.id);
      if (ci) open('cmdb', ci.id, ci.name, { ...serviceCiRow(ci), landOn: 'bom' });
    };
    window.addEventListener(OPEN_ADD_EVENT, onAdd);
    window.addEventListener(OPEN_EDIT_EVENT, onEdit);
    window.addEventListener(OPEN_DETAIL_EVENT, onDetail);
    window.addEventListener(OPEN_CI_EVENT, onCi);
    /* The endpoint opens as its real Endpoint detail page — the same one Patch and Vulnerability
       open — adapted the way the Endpoints listing adapts it. */
    const onEndpoint = (e: Event) => {
      const ag = agentById((e as CustomEvent).detail?.agentId);
      if (!ag) return;
      const id = endpointIdOf(ag);
      const shape: Patch = {
        id, name: ag.hostName, severity: 'Unspecified', releaseDate: '---', missingSystem: null, installedSystem: null,
        rebootRequired: 'No', approvalStatus: 'Approved', category: 'Endpoint',
        endpoint: { agentOnline: ag.agentOnline, systemHealth: 'Healthy' },
      };
      open('endpoints', id, ag.hostName, shape);
    };
    window.addEventListener(OPEN_ENDPOINT_EVENT, onEndpoint);
    const onRemove = (e: Event) => { const p = productById((e as CustomEvent).detail?.id); if (p) setRemoving(p); };
    window.addEventListener(OPEN_REMOVE_EVENT, onRemove);
    return () => {
      window.removeEventListener(OPEN_REMOVE_EVENT, onRemove);
      window.removeEventListener(OPEN_ADD_EVENT, onAdd);
      window.removeEventListener(OPEN_EDIT_EVENT, onEdit);
      window.removeEventListener(OPEN_DETAIL_EVENT, onDetail);
      window.removeEventListener(OPEN_CI_EVENT, onCi);
      window.removeEventListener(OPEN_ENDPOINT_EVENT, onEndpoint);
    };
  }, []);

  const confirmRemove = () => {
    if (!removing) return;
    removeProduct(removing.id);
    const left = seatsLeft();
    toast.success(`${removing.name} removed · ${left} licence${left === 1 ? '' : 's'} available`);
    setRemoving(null);
  };

  return (
    <>
    {removing && <RemoveDialog p={removing} onCancel={() => setRemoving(null)} onConfirm={confirmRemove} />}
    <BomAddProductPanel
      isOpen={mode !== null}
      initialMode={mode ?? 'Agent'}
      editing={editing}
      onClose={() => { setMode(null); setEditing(null); }}
      onSaved={(p) => { setMode(null); setEditing(null); toast.success(`${p.name} updated`); }}
      onAdded={(p) => {
        /* An ingest confirms itself INSIDE the drawer (success state, licence strip, Ingest another),
           so the drawer stays open until Close. An endpoint add closes and lands on the new entry. */
        if (p.source === 'Ingest') return;
        setMode(null);
        toast.success(`${p.name} added · first scan queued on ${p.agent?.hostName}`);
        openDetail(p);
      }}
    />
    </>
  );
}

/* Removing deletes the application's BOM data from the server, so it is asked in the middle of the
   screen, said in one sentence, and the destructive button is the red one. */
function RemoveDialog({ p, onCancel, onConfirm }: { p: ProductRecord; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="bom-rm-title" className="w-[440px] max-w-[92vw] rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FEE4E2] text-[#DC2626]"><Trash2 size={17} /></span>
          <div className="min-w-0 flex-1">
            <h3 id="bom-rm-title" className="text-[16px] font-semibold text-[#364658]">Remove application?</h3>
            <p className="mt-1.5 text-[13px] leading-5 text-[#7B8FA5]">
              <span className="font-medium text-[#364658]">{p.name}</span> and all of its BOM data (SBOM, CBOM and AI BOM, every version) will be permanently deleted from the server.
            </p>
          </div>
          <button type="button" onClick={onCancel} title="Close" className="-mr-2 -mt-2 flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]"><X size={18} /></button>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#DFE5ED] px-5 py-3">
          <button type="button" autoFocus onClick={onCancel} className="inline-flex h-8 items-center rounded border border-[#DFE5ED] bg-white px-4 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]">Cancel</button>
          <button type="button" onClick={onConfirm} className="inline-flex h-8 items-center rounded bg-[#DC2626] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#B91C1C]">Remove</button>
        </div>
      </div>
    </div>
  );
}
