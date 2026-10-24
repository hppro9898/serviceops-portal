import { useEffect, useRef } from 'react';

/* BOM Management — the admin surface that gates everything Component Intelligence can show.
 *
 * Licensing decides which CIs take part, Scheduler decides when they are scanned, Retention
 * decides how long their versions survive, and Policies holds the reusable targeting all
 * three share.
 *
 * This module used to be a React re-implementation of the BOM prototype, which meant the
 * same screens existed twice — once here and once in the prototype — and the two drifted
 * apart with every change. The prototype IS the module now: it lives at
 * `public/bom-admin/index.html` and is mounted here directly, so admin BOM and technician
 * BOM are maintained in one place.
 *
 * It is a self-contained document (no build step, no imports), and it already understands
 * `?embed=1` — that suppresses its own topbar because this shell already draws one. */

export type BomAdminScreen = 'landing' | 'licensing' | 'scheduler' | 'retention' | 'audit' | 'policies';

/** The prototype's own routes. One map, so the nav, the hash and this component cannot
 *  disagree about which screen is which. */
const ROUTE_FOR: Record<BomAdminScreen, string> = {
  landing: '#/admin',
  licensing: '#/admin/bom-licensing',
  scheduler: '#/admin/bom-scheduler',
  retention: '#/admin/bom-retention',
  audit: '#/admin/bom-audit',
  policies: '#/admin/bom-policies',
};

const SCREEN_FOR: Record<string, BomAdminScreen> = Object.fromEntries(
  Object.entries(ROUTE_FOR).map(([s, h]) => [h, s as BomAdminScreen]),
) as Record<string, BomAdminScreen>;

/** BASE_URL is `/` in dev and `/serviceops-ticket-detail/` in a Pages build, so the
 *  iframe has to be built from it rather than from a hard-coded absolute path. */
const SRC = `${import.meta.env.BASE_URL}bom-admin/index.html?embed=1`;

export function AdminBomModule({ screen, onScreen }: { screen: BomAdminScreen; onScreen: (s: BomAdminScreen) => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  /* The screen the PARENT last pushed in. Without it, echoing the child's own hashchange
     back down would fight the user: they navigate inside, we hear it, we set the hash to
     what we already think it is, and the module jumps back. */
  const pushed = useRef<BomAdminScreen | null>(null);

  /* Parent → child. Setting the hash on the existing document navigates the prototype
     without reloading it, so its in-memory state survives a nav from the sidebar. */
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const win = frame.contentWindow;
    if (!win) return;
    const want = ROUTE_FOR[screen];
    if (pushed.current === screen) return;
    pushed.current = screen;
    try {
      if (win.location.hash !== want) win.location.hash = want;
    } catch {
      /* Same-origin, so this should not throw — but a cross-origin surprise must not
         take the admin page down with it. */
    }
  }, [screen]);

  /* Child → parent. The prototype has its own landing cards and breadcrumb; when the user
     moves inside it the sidebar highlight has to follow, or the nav says you are somewhere
     you have already left. */
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;

    const report = () => {
      const win = frame.contentWindow;
      if (!win) return;
      let hash = '';
      try { hash = win.location.hash; } catch { return; }
      const next = SCREEN_FOR[hash] ?? (hash.startsWith('#/admin') ? 'landing' : null);
      if (!next || next === pushed.current) return;
      pushed.current = next;
      onScreen(next);
    };

    const attach = () => {
      const win = frame.contentWindow;
      if (!win) return;
      /* The document is replaced on load, so the listener is attached per load. */
      win.addEventListener('hashchange', report);
      // Land on the screen the parent asked for before anything paints.
      const want = ROUTE_FOR[screen];
      try { if (win.location.hash !== want) win.location.hash = want; } catch { /* ignore */ }
      pushed.current = screen;
    };

    frame.addEventListener('load', attach);
    if (frame.contentWindow?.document.readyState === 'complete') attach();

    return () => {
      frame.removeEventListener('load', attach);
      try { frame.contentWindow?.removeEventListener('hashchange', report); } catch { /* ignore */ }
    };
    // `screen` is deliberately not a dependency: this effect owns the LOAD wiring, and the
    // effect above owns subsequent screen changes. Re-running it on every nav would tear
    // the listener down and rebuild it for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScreen]);

  return (
    <iframe
      ref={ref}
      src={`${SRC}${ROUTE_FOR[screen]}`}
      title="BOM Management"
      className="block h-full min-h-0 w-full border-0 bg-[#F7F9FC]"
    />
  );
}
