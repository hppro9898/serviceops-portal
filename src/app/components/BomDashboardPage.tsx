import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDrawerStack } from './DrawerStack';
import { bomDashboard } from './bomDashboardData';
import { useProductsVersion } from './bomProductsData';
import type { LicencePolicy } from './bomDashboardData';
import type { BomType } from './bomData';
import type { SoftwareComponent } from './softwareComponentsData';
import { BomComponentListDrawer, type ComponentListSpec } from './BomComponentListDrawer';
/* Chrome lives in one place now that a second dashboard draws it too. */
import {
  Card, HeadPill, ViewAll,
  sevColor, bomProductRecord, EstateKpis, LicenceDistributionCard, CertBands, ExposureRing,
  BomSourcesCard,
} from './bomDashboardUi';

/* BOM Dashboard — the module's front page.
 *
 * The claim in the subtitle is the design constraint: every figure is derived from the BOM data
 * it links to, so nothing here is a typed-in number and every panel row opens the BOM it came
 * from. Counting is done once in `bomDashboardData`; this file only draws it.
 *
 * Everything is counted over PRODUCTS in BOM scope — a BOM belongs to a product (Agent or
 * Ingest), not to a CI — and re-derives when a product is added or removed.
 */

// ── page ───────────────────────────────────────────────────────────────
export function BomDashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useProductsVersion();
  const d = bomDashboard();
  const { open: openInStack } = useDrawerStack();
  /** Shared by the ring and the legend, so pointing at either lights the same slice. */
  const [licHover, setLicHover] = useState<number | null>(null);
  /** Which exposure row is showing its detail. Hover OR focus, so a keyboard reaches it. */
  const [expHover, setExpHover] = useState<string | null>(null);
  /** The list behind a chart's count, when one has been picked. */
  const [list, setList] = useState<ComponentListSpec | null>(null);

  /** One thing -> its detail page. The stack renders it above everything, including the list. */
  const openComponent = (c: SoftwareComponent) =>
    openInStack('software-components', c.id, `${c.name} ${c.version}`, c);

  /* A count -> the things it counted. The predicate is derived from the slices the donut drew:
     "Other" means "not one of the named ones", so the bucket here and the wedge on the chart
     cannot come apart. */
  const openLicence = (licence: string) => {
    const named = new Set(d.licences.map((l) => l.licence).filter((l) => l !== 'Other'));
    const match = (c: SoftwareComponent) =>
      licence === 'Other' ? !named.has(c.license)
        : licence === 'Undeclared' ? !c.license || c.license === 'Undeclared'
          : c.license === licence;
    setList({
      title: licence === 'Other' ? 'Other licences' : licence,
      subtitle: licence === 'Other'
        ? `outside the ${named.size} largest licences`
        : `licensed ${licence}`,
      rows: d.components.filter(match).sort((a, b) => b.cis - a.cis || a.name.localeCompare(b.name)),
    });
  };

  /** Open a product on the tab of a specific BOM. */
  const openBom = (productId: string, type: BomType) => {
    const rec = bomProductRecord(productId, type);
    if (rec) openInStack('bom-products', rec.id, rec.name, rec);
  };

  /** The reach denominator: products that have produced a BOM. */
  const maxReach = Math.max(1, d.bomProducts);

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="bom-dashboard" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate('admin')} />

        {/* ── page head ────────────────────────────────────────────────
            The same fold every other module in this group draws: white band,
            `px-6 pb-2 pt-3`, a 16px semibold title, one bottom hairline. The 24px
            title and breadcrumb this used to carry were the only ones in the product
            and made the Dashboard read as a different kind of page.

            No actions in the band: the three that were here went to modules the rail
            already reaches, and every panel below already links into the one it is
            about. A dashboard is read, not navigated from the top. */}
        <div className="border-b border-[#e5e7eb] bg-white">
          <div className="px-6 pb-3 pt-3">
            <h1 className="text-[16px] font-semibold text-[#364658]">Dashboard</h1>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 pb-8 pt-4">
            {/* ── estate health ───────────────────── */}
            <EstateKpis d={d} onNavigate={onNavigate} />

            {/* ── what is in the estate: exposure, licences, scan scopes ──
                Three across. The exposure list leads because it is the ranked exception; the two
                distributions sit beside it as the context for it. */}
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <Card
                title="Vulnerable software components"
                right={<button onClick={() => onNavigate('software-components')} className="text-[13px] font-medium text-[#3D8BD0] hover:underline">All</button>}
              >
                {/* A ranked operational list, not a chart. Several components sit on the same
                    number of CIs, so bars of equal length said nothing; what a technician needs
                    is what it is, how far it reaches, and where.

                    ONE LINE per row. The severity chip used to sit in the same flex-wrap as the
                    name and version, and in a third-width column it pushed them onto a second and
                    third line — five entries then filled a card sized for far more, and the rest
                    was air. The chip is gone and the same height carries twelve.

                    Severity is not lost with it: the bar is coloured by it, and the tooltip names
                    it with the CVE count. It IS a weaker signal than a chip — worth knowing. */}
                <div className="flex flex-1 flex-col divide-y divide-[#F0F2F5]">
                  {d.affected.map((a, i) => {
                    const exposure = Math.round((a.reach / maxReach) * 100);
                    const on = expHover === a.key;
                    /* The last rows open upward, or the card would have to grow to hold the card. */
                    const up = i >= d.affected.length - 3;
                    return (
                      <div key={a.key} className="relative flex flex-1 flex-col">
                        <button
                          onClick={() => {
                            /* The panel ranks by component NAME and shows the version on the most
                               CIs; that pair is the row the register carries. */
                            const c = d.components.find((x) => x.name === a.name && x.version === a.version);
                            if (c) openComponent(c);
                          }}
                          onMouseEnter={() => setExpHover(a.key)} onMouseLeave={() => setExpHover(null)}
                          onFocus={() => setExpHover(a.key)} onBlur={() => setExpHover(null)}
                          /* Severity is off the card now and lives in the ring's colour. Stated
                             here so it is not colour ALONE for a screen reader — a sighted
                             reader has only the colour, which is worth knowing. */
                          aria-label={`${a.name} ${a.version}, ${exposure}% exposure, ${a.reach} of ${maxReach} applications${
                            a.cves.length ? `, ${a.cves.length} CVE${a.cves.length === 1 ? '' : 's'}, worst ${a.severity}` : ', no known CVE'}`}
                          className="flex flex-1 items-center gap-3 whitespace-nowrap px-4 py-2 text-left transition-colors hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3D8BD0]"
                        >
                          <span className="w-4 flex-shrink-0 text-right text-[12px] font-semibold tabular-nums text-[#9CA3AF]">{i + 1}</span>

                          {/* The name gives way before the version does — a truncated version
                              number is a different version, and reads as one. */}
                          <span className="flex min-w-0 flex-1 items-baseline gap-2">
                            <span className="truncate font-mono text-[13px] text-[#364658]">{a.name}</span>
                            <span className="flex-shrink-0 text-[12px] text-[#7B8FA5]">{a.version}</span>
                          </span>

                          {/* Only the share — the count it is a share OF is in the header, and the
                              percentage is the thing that actually differs down the list. */}
                          <ExposureRing pct={exposure} color={sevColor(a.severity)} />
                          {/* The word went to the header — "% of 30 CIs" says it once for the
                              whole panel rather than eight times down it. The fixed column stays:
                              it is what lines the percentages up. */}
                          {/* Applications carrying it — a count reads on its own, a percentage needed a header to explain it. */}
                          <span className="w-[52px] flex-shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#364658]">{a.reach} app{a.reach === 1 ? '' : 's'}</span>
                        </button>

                        {/* The browser's own tooltip was carrying 33 product names — five lines
                            wide enough to cover the four rows beneath it, and nothing about a
                            `title` can be capped or placed. This one is sized, positioned, and
                            says how many applications it did not show. */}
                        {on && (
                          /* Three bands, hairline between: what it is, how far it reaches, how
                             widely it is used. The figure leads each band and the words qualify
                             it — the same grammar the KPI cards use. */
                          <div className={`pointer-events-none absolute left-4 z-30 w-[260px] overflow-hidden rounded border border-[#E5E7EB] bg-white text-[13px] shadow-md ${up ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                            <div className="px-3 py-2">
                              <span className="font-mono text-[13px] text-[#364658]">{a.name}</span>{' '}
                              <span className="text-[12px] text-[#7B8FA5]">{a.version}</span>
                            </div>
                            <div className="border-t border-[#F0F2F5] px-3 py-2">
                              <span className="font-semibold tabular-nums text-[#364658]">{a.reach}</span>
                              <span className="text-[#7B8FA5]"> of {maxReach} applications</span>
                            </div>
                            <div className="border-t border-[#F0F2F5] px-3 py-2">
                              <span className="font-semibold tabular-nums text-[#364658]">{a.versions}</span>
                              <span className="text-[#7B8FA5]"> version{a.versions === 1 ? '' : 's'} in use</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* One `layout` for both, so the pair cannot drift apart. `row` — donut left,
                  legend right — which a third of the page holds now that the row branch is
                  measured for it: a 132px ring rather than 180, and no footer paragraph under
                  either chart. */}
              <LicenceDistributionCard d={d} onNavigate={onNavigate} layout="row" onPickLicence={openLicence} />
              <BomSourcesCard d={d} onNavigate={onNavigate} layout="row" />
            </div>

            {/* ── the two deadlines: certificates and models ─────────────
                Both answer "what runs out, and when". Half width each — the lifecycle axis spans
                630 days and a third of the page would squeeze that chart back into being pills. */}
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
              <Card
                title="Expiring trust material"
                right={<ViewAll onClick={() => onNavigate('bom')} />}
              >
                {/* Windows first, then the shape they describe. The chips answer "how much, when";
                    the rule answers "is it spread out or does it all land in one week". */}
                <CertBands bands={d.certBands} />
                {/* The certificates to act on first: expired, then soonest to expire. */}
                <DashTable
                  head={['Certificate', 'Application', 'Status']}
                  rows={[...d.certs].sort((x, y) => x.days - y.days).slice(0, 5).map((c) => ({
                    key: c.key,
                    onClick: () => openBom(c.productId, 'CBOM'),
                    cells: [
                      <span className="font-mono text-[12px] text-[#364658]">{c.name}</span>,
                      <span className="text-[12px] text-[#364658]">{c.productName}</span>,
                      <StatusTag tone={c.days < 0 ? 'crit' : c.days <= 30 ? 'warn' : 'ok'}>{c.days < 0 ? `Expired ${-c.days}d ago` : `${c.days}d left`}</StatusTag>,
                    ],
                  }))}
                  empty="No certificates in scope."
                />
              </Card>

              <Card
                title="AI models"
                right={
                  <div className="flex items-center gap-2">
                    {/* The all-clear is a state, not an absence: "0 past EOL" in the alarm's own
                        grey reads as a panel that failed to load. */}
                    {d.modelsPastEol > 0
                      ? <HeadPill tone="red">{d.modelsPastEol} past EOL</HeadPill>
                      : <HeadPill tone="ok">all supported</HeadPill>}
                    <ViewAll onClick={() => onNavigate('ai-components')} />
                  </div>
                }
              >
                {/* Every model, most urgent end-of-life first; a model with no published date shows —. */}
                <DashTable
                  head={['Model', 'Application', 'Type', 'End of Life']}
                  rows={d.allModels.slice(0, 5).map((m) => ({
                    key: m.name,
                    onClick: () => openBom(m.productId, 'AI BOM'),
                    cells: [
                      <span className="font-mono text-[12px] text-[#364658]">{m.name}</span>,
                      <span className="text-[12px] text-[#364658]">{m.productName}</span>,
                      <span className="text-[12px] text-[#364658]">{m.hosted ? 'Hosted API' : 'Local'}</span>,
                      m.days === null ? <span className="text-[12px] text-[#9CA3AF]">—</span>
                        : <StatusTag tone={m.days < 0 ? 'crit' : m.days <= 90 ? 'warn' : 'ok'}>{m.days < 0 ? `Past EOL ${-m.days}d` : `EOL in ${m.days}d`}</StatusTag>,
                    ],
                  }))}
                  empty="No AI models in scope."
                />
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* The list behind a count. Below the drawer stack's layer, so opening a component from it
          stacks the detail OVER the list and closing that comes back here. */}
      {list && (
        <BomComponentListDrawer
          spec={list}
          onClose={() => setList(null)}
          onOpenComponent={openComponent}
        />
      )}
    </div>
  );
}

/* ── Small tables for the two bottom panels ─────────────────────────────── */
const STATUS_TAG = { crit: 'bg-[#FEF3F2] text-[#B42318]', warn: 'bg-[#FFFAEB] text-[#B54708]', ok: 'bg-[#F1F5F9] text-[#475467]' } as const;
function StatusTag({ tone, children }: { tone: keyof typeof STATUS_TAG; children: React.ReactNode }) {
  return <span className={`whitespace-nowrap rounded-sm px-2 py-0.5 text-[11px] font-medium ${STATUS_TAG[tone]}`}>{children}</span>;
}
function DashTable({ head, rows, empty }: {
  head: string[];
  rows: { key: string; onClick: () => void; cells: React.ReactNode[] }[];
  empty: string;
}) {
  if (!rows.length) return <p className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]">{empty}</p>;
  return (
    <table className="mt-3 w-full border-t border-[#F0F2F5]">
      <thead><tr>{head.map((h) => <th key={h} className="px-4 py-2 text-left text-[12px] font-semibold text-[#364658]">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-[#F0F2F5]">
        {rows.map((r) => (
          <tr key={r.key} onClick={r.onClick} className="cursor-pointer transition-colors hover:bg-[#F9FAFB]">
            {r.cells.map((c, i) => <td key={i} className="max-w-[220px] truncate px-4 py-2">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
