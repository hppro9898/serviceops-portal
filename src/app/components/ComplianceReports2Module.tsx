import { Sidebar } from './Sidebar';
import { Header } from './Header';

/* Compliance Reports 2 — the same assessment as Compliance Reports, arranged differently:
 * the thirteen frameworks stack down a rail on the left instead of scrolling sideways, the
 * selected one opens in full while the rest stay compact, and its stats band and rules table
 * fill the right. A saved view's tab carries an edit pencil that reopens the view drawer with
 * that view's own choices in it.
 *
 * It is the SAME document as Compliance Reports at a different route (`#/bom/reports2`), and
 * the same engine underneath — one painter, two arrangements. Mounting it as a second iframe
 * costs one route and keeps the two layouts genuinely comparable, which is the whole point of
 * having both.
 *
 * ONE SOURCE, ONE COPY: `BOM/concepts/component-inventory.html` is the source. After editing
 * it, run `sync-bom-reports.sh` from the Test4 root — the file under `public/` is a build
 * artifact, not a second place to make changes.
 *
 * `?embed=1` suppresses the prototype's own topbar, because this shell already draws one. */

const SRC = `${import.meta.env.BASE_URL}bom-reports/index.html?embed=1#/bom/reports2`;

export function ComplianceReports2Module({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="compliance-reports-2" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate?.('admin')} />
        {/* The prototype scrolls itself, so the frame fills the pane and owns its own
            scrollbar — a second one on this side would give the page two. */}
        <iframe
          src={SRC}
          title="Compliance Reports 2"
          className="min-h-0 flex-1 border-0"
        />
      </div>
    </div>
  );
}
