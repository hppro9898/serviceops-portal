import { useRef, useState } from 'react';
import { Header } from './Header';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { ADMIN_SECTIONS, sectionByTitle } from './adminData';
import { AdminBomModule } from './AdminBomModule';
import type { BomAdminScreen } from './AdminBomModule';
import { AdminOsUpgradeModule } from './AdminOsUpgradeModule';
import { AdminFormRulesModule } from './AdminFormRulesModule';

/** Sections that have a real module behind them rather than only a card grid. Selecting one in
 *  the sidebar opens that module; everything else still scrolls the Overview. */
const MODULE_TITLES = ['BOM Management'];

/** Which screen each level-2 nav item opens. The nav, the Overview cards and the module's own
 *  landing all route through this one map, so they can never disagree about where a card goes. */
const BOM_SCREEN_FOR: Record<string, BomAdminScreen> = {
  'BOM Policies': 'policies',
  'BOM Scope': 'licensing',
  'BOM Scheduler': 'scheduler',
  'BOM Retention': 'retention',
  'BOM Audit': 'audit',
};

/** Level-2 cards that own a module even though their SECTION doesn't, keyed "<section>/<card>".
 *  Their sections are still card grids; these are the entries with a real screen behind them, so
 *  only those rows swap the pane. */
const CARD_MODULES: Record<string, string> = {
  'Patch Management/OS Upgrade': 'OS Upgrade',
  'Request Management/Request Form Rule': 'Request Form Rules',
};

/* Admin hub — the settings surface. Its own shell: the product's left icon rail is replaced by a
 * grouped settings nav, with "Back to app" as the way out.
 *
 * The sidebar and the Overview share one section list, and selecting in the sidebar scrolls the
 * Overview rather than swapping the pane — the whole point of a hub is that it is one surface. */

export function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [active, setActive] = useState('Overview');
  const [query, setQuery] = useState('');
  // Only the first section starts open, mirroring the live admin.
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set([ADMIN_SECTIONS[0].key]));
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** Title of the module currently open, or null for the Overview. */
  const [module, setModule] = useState<string | null>(null);
  const [bomScreen, setBomScreen] = useState<BomAdminScreen>('landing');

  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  /** Level-2 module inside the active section, when one is selected. Drives the nav highlight. */
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const select = (title: string, card?: string) => {
    const cardModule = card ? CARD_MODULES[`${title}/${card}`] : undefined;
    // A nav row that opens nothing must not stay highlighted while the Overview shows behind it.
    const opensSomething = !!cardModule || (!!card && MODULE_TITLES.includes(title));
    setActive(title);
    setActiveCard(opensSomething ? card! : null);

    if (cardModule) {
      setModule(cardModule);
      return;
    }

    // A level-2 module opens its listing on the right. Level 1 only expands the branch, which
    // the sidebar handles on its own — it never reaches here for a tree section.
    if (card && MODULE_TITLES.includes(title)) {
      setModule(title);
      setBomScreen(BOM_SCREEN_FOR[card] ?? 'landing');
      return;
    }
    if (MODULE_TITLES.includes(title)) {
      setModule(title);
      setBomScreen('landing');
      return;
    }
    setModule(null);
    if (title === 'Overview') {
      sectionRefs.current[ADMIN_SECTIONS[0].key]?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('[data-admin-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const s = sectionByTitle(title);
    if (!s) return;
    // Opening it first means the scroll lands on content, not on a collapsed strip.
    setOpenKeys((prev) => new Set(prev).add(s.key));
    requestAnimationFrame(() => {
      sectionRefs.current[s.key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="flex h-screen flex-col bg-[#F7F9FC]">
      <Header selectedCount={0} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AdminSidebar active={active} activeCard={activeCard} onSelect={select} onBackToApp={() => onNavigate('request')} />
        <div data-admin-scroll className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {module === 'BOM Management' ? (
            /* The module is its own document and scrolls itself, so this pane must NOT —
               two scrollbars for one list is the usual cost of nesting a scroller. */
            <div className="min-h-0 flex-1 overflow-hidden bg-[#F7F9FC]">
              {/* The module's own navigation (its landing cards, its breadcrumb) reports back so
                  the nav highlight follows — the sidebar must never say you are somewhere you
                  have already navigated away from. */}
              <AdminBomModule
                screen={bomScreen}
                onScreen={(s) => {
                  setBomScreen(s);
                  const card = Object.keys(BOM_SCREEN_FOR).find((k) => BOM_SCREEN_FOR[k] === s);
                  setActiveCard(card ?? null);
                }}
              />
            </div>
          ) : module === 'Request Form Rules' ? (
            /* Its own document, scrolling itself — same reasoning as BOM Management above. */
            <div className="min-h-0 flex-1 overflow-hidden bg-white">
              <AdminFormRulesModule />
            </div>
          ) : module === 'OS Upgrade' ? (
            /* White, not the hub's grey: an admin LISTING is the same surface as a technician
               portal list page — head, search, then a full-bleed table with no card around it. */
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
              <AdminOsUpgradeModule />
            </div>
          ) : (
            <AdminOverview
              openKeys={openKeys}
              onToggle={toggle}
              query={query}
              onQuery={setQuery}
              registerSection={(key, el) => { sectionRefs.current[key] = el; }}
              onOpenCard={(sectionTitle, cardTitle) => {
                // A card that owns a module opens it, so the Overview and the nav agree.
                if (CARD_MODULES[`${sectionTitle}/${cardTitle}`]) {
                  select(sectionTitle, cardTitle);
                  return true;
                }
                // A BOM card on the Overview jumps straight into that screen, rather than
                // making the admin land on the module and click again.
                if (sectionTitle !== 'BOM Management') return false;
                select('BOM Management', cardTitle);
                return true;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
