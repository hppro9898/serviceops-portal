import { useState, useEffect } from 'react';
import {
  X, Search, ChevronDown, Check, ShieldAlert,
} from 'lucide-react';
import { useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SoftwareComponentsTable } from './SoftwareComponentsTable';
import { Pagination } from './Pagination';
import { useDrawerStack } from './DrawerStack';
import { allSoftwareComponents } from './softwareComponentsData';
import { affectedProducts } from './bomProductsData';
/* Only components that some application's SBOM actually contains — a register row with nobody
   carrying it would be a component the estate does not have. */
const presentComponents = () => allSoftwareComponents().filter((c) => affectedProducts(c).length > 0);
import { AiModelsTab } from './AiModelsTab';
import { aiAssets } from './aiModelsData';
import { SoftwareComponentsKpis, focusFn, FOCUS_LABEL, ListActions } from './SoftwareComponentsKpis';
import type { ComponentFocus } from './SoftwareComponentsKpis';

/* BOM Inventory — the fleet seen the other way up from Configuration Items.
 *
 * Configuration Items is one row per CI ("what is on this machine"). This is one row per component
 * VERSION ("where does this thing live"), which is the question a new CVE forces. Same shell,
 * same table treatment and the same tag vocabulary as the Inventory listing — only the columns
 * change, because only the question does. */

/* Two top-level scopes. "Known exploited" stopped being one of them: it is not a peer
   of All — it is a slice of Vulnerable, and a tab row that mixes levels invites the
   reading that a component could be exploited without being vulnerable. */
/* Severity is single-select: a component has exactly one top severity, so choosing two
   would be asking for rows that cannot exist. */
type SevFilter = '' | 'Critical' | 'High' | 'Medium' | 'None';
const SEV_OPTIONS: Exclude<SevFilter, ''>[] = ['Critical', 'High', 'Medium', 'None'];
/* "None" is a real answer — the component has no known vulnerabilities — so it is spelled
   out rather than left as a word that reads like "no filter". */
const SEV_LABEL = (s: Exclude<SevFilter, ''>) => (s === 'None' ? 'No known vulnerabilities' : s);
const SEV_DOT: Record<Exclude<SevFilter, ''>, string> = {
  Critical: '#EF4444', High: '#F59E0B', Medium: '#EAB308', None: '#22C55E',
};

type BomTab = 'components' | 'models';

function ComponentsToolbar({ tab }: { tab: BomTab }) {
  return (
    <div className="bg-white">
      {/* Title only: the list actions sit in the control row beside the filters. */}
      <div className="flex items-center px-6 pb-2 pt-3">
        <h1 className="text-[16px] font-semibold text-[#364658]">
          BOM Inventory <span className="text-[#9CA3AF]">·</span>{' '}
          <span className="text-[#7B8FA5]">{tab === 'models' ? 'AI Components' : 'Software components'}</span>
        </h1>
      </div>

      {/* No tab strip: which half you are reading is a ROUTE now, chosen in the rail's flyout.
          A strip here and a flyout there were offering the same choice at two levels, and only
          one of them could be linked to.

          The readings and the control row are rendered by the PAGE, inside the scroll container,
          so the cards scroll away while the controls pin. See ComponentsControls. */}
    </div>
  );
}


/** The row that narrows the list. Its own component because the PAGE places it — inside the
 *  scroll container, under the readings, pinned to the top — and a toolbar that renders both
 *  could not put them in two different scroll contexts. */
function ComponentsControls({
  searchQuery, setSearchQuery, sev, setSev, focus, setFocus, sevCount, allShown,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sev: SevFilter;
  setSev: (s: SevFilter) => void;
  focus: ComponentFocus;
  setFocus: (f: ComponentFocus) => void;
  sevCount: (s: Exclude<SevFilter, ''>) => number;
  allShown: number;
}) {
  const [sevOpen, setSevOpen] = useState(false);
  const sevRef = useRef<HTMLDivElement>(null);
  /* Closing on outside click as well as on the scrim: the scrim alone misses a click that
     lands on another control inside the toolbar. */
  useEffect(() => {
    if (!sevOpen) return;
    const onDown = (e: MouseEvent) => {
      if (sevRef.current && !sevRef.current.contains(e.target as Node)) setSevOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sevOpen]);
  return (
    <>
      {/* One control row. No tab strip above it: the list shows everything by default, and the
          cuts through it — the search, severity, and whatever a KPI card is filtering — all
          live here as controls rather than as places you navigate to. */}
      <div className="flex items-center gap-2.5 px-6 pb-3 pt-3">
        {/* A card's filter rides INSIDE the search box as a chip. It and the typed query are
            both ways of narrowing the same list, so they read as one control — and a chip is
            already the shape a removable narrowing takes. */}
        <div className="relative flex flex-1 items-center gap-2 rounded border border-[#d1d5db] bg-white pl-2 pr-10 focus-within:border-[#3D8BD0] focus-within:ring-1 focus-within:ring-[#3D8BD0]">
          {focus && (
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-sm bg-[#EBF5FF] px-2 py-0.5 text-[13px] text-[#3D8BD0]">
              {FOCUS_LABEL[focus]}
              <button onClick={() => setFocus(null)} aria-label={`Clear the ${FOCUS_LABEL[focus]} filter`}
                      className="text-[#3D8BD0]/70 transition-colors hover:text-[#DC2626]">
                <X size={13} />
              </button>
            </span>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={focus ? 'Search within this…' : 'Search ID, name, version or PURL...'}
            className="h-[34px] min-w-0 flex-1 bg-transparent text-[13px] text-[#364658] placeholder:text-[#9ca3af] focus:outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors hover:text-[#364658]"
            >
              <X size={16} />
            </button>
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          )}
        </div>
        <div className="relative flex-shrink-0" ref={sevRef}>
            <button
              onClick={() => setSevOpen((v) => !v)}
              className={`inline-flex h-[34px] items-center gap-1.5 rounded border px-2.5 text-[13px] font-medium transition-colors ${
                sev ? 'border-[#3D8BD0] bg-[#EBF5FF] text-[#3D8BD0]' : 'border-[#DFE5ED] bg-white text-[#364658] hover:border-[#3D8BD0] hover:bg-[#F5F7FA]'
              }`}
            >
              <ShieldAlert size={14} className={sev ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'} />
              {sev ? SEV_LABEL(sev) : 'All severities'}
              <ChevronDown size={14} className={`transition-transform ${sevOpen ? 'rotate-180' : ''} ${sev ? 'text-[#3D8BD0]' : 'text-[#7B8FA5]'}`} />
            </button>
            {sevOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSevOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-[240px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
                  <div className="max-h-[260px] overflow-y-auto">
                    {/* No search box: four fixed options do not need one, and an empty
                        search field would imply the list could be longer than it is. */}
                    {([''] as SevFilter[]).concat(SEV_OPTIONS).map((o) => (
                      <button
                        key={o || 'any'}
                        onClick={() => { setSev(o); setSevOpen(false); }}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] transition-colors ${
                          sev === o ? 'bg-[#F1F5F9] text-[#364658]' : 'text-[#364658] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {o && <span className="size-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: SEV_DOT[o] }} />}
                          <span className="truncate">{o ? SEV_LABEL(o) : 'All severities'}</span>
                        </span>
                        <span className="flex flex-shrink-0 items-center gap-2">
                          <span className="text-[12px] text-[#7B8FA5]">{o ? sevCount(o as Exclude<SevFilter, ''>) : allShown}</span>
                          {sev === o && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>
        <ListActions />
      </div>
    </>
  );
}

/** Counted once: the tab label needs it before the tab is ever opened. */
const AI_ASSETS = aiAssets();

export function SoftwareComponentsListPage({ onNavigate, tab = 'components' }: {
  onNavigate: (page: string) => void;
  /** Which half to render. The rail routes to it, so the page does not own the choice. */
  tab?: BomTab;
}) {
  const [sev, setSev] = useState<SevFilter>('');
  const [focus, setFocus] = useState<ComponentFocus>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sev, focus]);

  /* Everything by default. A card's focus narrows it, then severity — one filter applied
     after the other, rather than two states that can contradict each other. */
  const SOFTWARE_COMPONENTS = presentComponents();
  const focused = focus ? SOFTWARE_COMPONENTS.filter(focusFn[focus]) : SOFTWARE_COMPONENTS;
  const scoped = sev ? focused.filter((c) => c.topSeverity === sev) : focused;
  /* Each option reports how many rows it WOULD show, counted with every other filter applied
     but its own — otherwise every option but the active one would read zero. */
  const sevCount = (s: Exclude<SevFilter, ''>) => focused.filter((c) => c.topSeverity === s).length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = !q ? scoped : scoped.filter((c) =>
    c.id.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.version.toLowerCase().includes(q) ||
    c.purl.toLowerCase().includes(q) ||
    c.ecosystem.toLowerCase().includes(q) ||
    c.license.toLowerCase().includes(q)
  );

  const { open: openInStack } = useDrawerStack();

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Which ROUTE this is, not which component is rendering — the page serves both halves, and
          the rail highlights the row you actually came from. */}
      <Sidebar activePage={tab === 'models' ? 'ai-components' : 'software-components'} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate('admin')} />
        <ComponentsToolbar tab={tab} />
        <main className="flex flex-1 flex-col overflow-hidden">
          {tab === 'models' ? (
            /* The AI tab owns its own readings, controls and table — the two BOMs share a header
               and nothing else, because a severity split says nothing about a model. */
            <AiModelsTab />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-auto bg-white">
                {/* Read once, on arrival — so they scroll away with the list. */}
                <div className="px-6 pb-4 pt-4">
                  <SoftwareComponentsKpis rows={SOFTWARE_COMPONENTS} focus={focus} setFocus={setFocus} />
                </div>
                {/* The one thing that stays: you filter at any depth in a list. */}
                <div className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white">
                  <ComponentsControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sev={sev}
                    setSev={setSev}
                    sevCount={sevCount}
                    allShown={focused.length}
                    focus={focus}
                    setFocus={setFocus}
                  />
                </div>
                <SoftwareComponentsTable
                  rows={paginated}
                  onRowClick={(c) => openInStack('software-components', c.id, `${c.name} ${c.version}`, c)}
                />
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filtered.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
