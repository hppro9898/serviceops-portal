import { Sidebar } from './Sidebar';
import { Header } from './Header';

/* Compliance Reports — the Compliance Report Pack, third item in the BOM flyout beside
 * Configuration Items and Software Components.
 *
 * Like BOM Management (see AdminBomModule), the screen IS the prototype rather than a React
 * re-implementation of it. It was built in `BOM/concepts/component-inventory.html`, where the
 * module's other five BOM screens already live and where its route `#/bom/reports` is
 * declared, so re-typing ~700 lines of scoring engine here would create the same screen twice
 * and start the same drift. The document is copied to `public/bom-reports/index.html` and
 * mounted directly.
 *
 * ONE SOURCE, ONE COPY: `BOM/concepts/component-inventory.html` is the source. After editing
 * it, run `sync-bom-reports.sh` from the Test4 root — the file under `public/` is a build
 * artifact, not a second place to make changes.
 *
 * `?embed=1` suppresses the prototype's own topbar, because this shell already draws one. */

const SRC = `${import.meta.env.BASE_URL}bom-reports/index.html?embed=1#/bom/reports`;

export function ComplianceReportsModule({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="compliance-reports" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate?.('admin')} />
        {/* The prototype scrolls itself, so the frame fills the pane and owns its own
            scrollbar — a second one on this side would give the page two. */}
        <iframe
          src={SRC}
          title="Compliance Report Pack"
          className="min-h-0 flex-1 border-0"
        />
      </div>
    </div>
  );
}
