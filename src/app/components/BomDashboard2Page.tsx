import { useState } from 'react';
import { Layers, Boxes, ClipboardCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDrawerStack } from './DrawerStack';
import { bomDashboard } from './bomDashboardData';
import type { ExpiringCert, EolModel } from './bomDashboardData';
import type { BomType } from './bomData';
import {
  Card, HeadPill, ExposureBar, ViewAll, bomProductRecord,
  EstateKpis, LicenceDistributionCard, Empty, SEVERITY, sev, BAND, bandFor,
} from './bomDashboardUi';

/* BOM Dashboard 2 — the same estate, read visually.
 *
 * Rules taken from BOM/CLAUDE.md and applied uniformly:
 *   · attention-first — the exception leads its panel, distributions are context underneath;
 *   · an attention number always states its denominator, so no bar ships without one;
 *   · colour lands on the number and its driver figures only — icon, title and label stay neutral;
 *   · explicit zero states; absence is stated, never implied;
 *   · every displayed number is derived — `bomDashboardData` is the single source and this file
 *     computes nothing.
 */

/** Shared timeline lane. Gridlines at the labelled thresholds so a dot reads against a scale
 *  rather than floating. */
function Lane({ posPct, color, gridlines, marker }: {
  posPct: number; color: string; gridlines: number[]; marker?: number;
}) {
  return (
    <span className="relative block h-2.5 w-full">
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#F1F5F9]" />
      {gridlines.map((g) => (
        <span key={g} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-[#E5E7EB]" style={{ left: `${g}%` }} />
      ))}
      {marker !== undefined && (
        <span className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-[#CBD5E1]" style={{ left: `${marker}%` }} />
      )}
      <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
        style={{ width: `${posPct}%`, backgroundColor: color, opacity: 0.3 }} />
      <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
        style={{ left: `${posPct}%`, backgroundColor: color }} />
    </span>
  );
}

/** Both axes read left-to-right as SOONEST → LATEST, in the same grammar. */
function Axis({ marks, gridlines }: { marks: { at: number; label: string; strong?: boolean }[]; gridlines: number[] }) {
  return (
    <span className="relative block h-6 w-full">
      {gridlines.map((g) => (
        <span key={g} className="absolute bottom-0 top-3.5 w-px bg-[#E5E7EB]" style={{ left: `${g}%` }} />
      ))}
      {marks.map((m) => (
        <span key={m.label}
          className={`absolute top-0 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-wide ${m.strong ? 'font-semibold text-[#64748B]' : 'text-[#9CA3AF]'}`}
          style={{ left: `${m.at}%` }}
        >{m.label}</span>
      ))}
    </span>
  );
}

// ── page ───────────────────────────────────────────────────────────────
export function BomDashboard2Page({ onNavigate }: { onNavigate: (page: string) => void }) {
  const d = bomDashboard();
  const { open: openInStack } = useDrawerStack();
  const [licHover, setLicHover] = useState<number | null>(null);

  const openBom = (productId: string, type: BomType) => {
    const rec = bomProductRecord(productId, type);
    if (rec) openInStack('bom-products', rec.id, rec.name, rec);
  };

  const crumbBtn = 'inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]';
  const maxReach = Math.max(1, d.bomProducts);

  const certMax = Math.max(120, ...d.certs.map((c) => c.days)) * 1.06;
  const certAt = (days: number) => Math.max(2, Math.min(98, (days / certMax) * 100));
  const modelSpan = Math.max(30, ...d.models.map((m) => Math.abs(m.days))) * 1.08;
  const modelAt = (days: number) => Math.max(2, Math.min(98, 50 + (days / modelSpan) * 50));
  const certGrid = [certAt(30), certAt(120)];

  /* Repeated row metadata is deduped to the panel. If every certificate is quantum-vulnerable,
     saying so five times is five copies of one fact. */
  const allQuantum = d.certs.length > 0 && d.certs.every((c) => c.quantumVulnerable);
  const allNoCard = d.models.length > 0 && d.models.every((m) => m.detail.includes('no model card'));
  const stripDeduped = (s: string) => s.split(' · ').filter((x) => !(allNoCard && x === 'no model card')).join(' · ');

  const certBands = ([
    { key: 'critical', label: 'Critical', hint: '≤ 30 days', items: d.certs.filter((c) => c.days <= 30) },
    { key: 'upcoming', label: 'Upcoming', hint: '31–120 days', items: d.certs.filter((c) => c.days > 30 && c.days <= 120) },
    { key: 'later', label: 'Later', hint: '> 120 days', items: d.certs.filter((c) => c.days > 120) },
  ] as { key: keyof typeof BAND; label: string; hint: string; items: ExpiringCert[] }[]).filter((g) => g.items.length);

  const modelBands = ([
    { key: 'critical', label: 'Past end-of-life', hint: 'no security fixes', items: d.models.filter((m) => m.past) },
    { key: 'upcoming', label: 'Approaching end-of-life', hint: '≤ 180 days', items: d.models.filter((m) => !m.past && m.days <= 180) },
    { key: 'later', label: 'Active', hint: '> 180 days', items: d.models.filter((m) => !m.past && m.days > 180) },
  ] as { key: keyof typeof BAND; label: string; hint: string; items: EolModel[] }[]).filter((g) => g.items.length);

  const withFindings = d.affected.filter((a) => a.cves.length > 0).length;

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar activePage="bom-dashboard-2" onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header selectedCount={0} onOpenAdmin={() => onNavigate('admin')} />

        <div className="border-b border-[#e5e7eb] bg-white">
          <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-3">
            <div className="min-w-0">
              <h1 className="text-[16px] font-semibold text-[#364658]">Dashboard 2</h1>
              <p className="mt-1 max-w-[820px] text-[13px] leading-relaxed text-[#7B8FA5]">
                Continuous software supply-chain assurance — SBOM, CBOM and AI BOM evidence for every
                product in BOM scope. <span className="tabular-nums text-[#364658]">{d.productTotal} products · {d.bomProducts} with a BOM ·{' '}
                {d.declared.toLocaleString()} declared components</span> — every figure below is
                derived live from the BOM data it links to.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button className={crumbBtn} onClick={() => onNavigate('software-components')}><Boxes size={15} /> BOM Inventory</button>
              <button className={crumbBtn} onClick={() => onNavigate('compliance-reports')}><ClipboardCheck size={15} /> Compliance Report Pack</button>
              <button onClick={() => onNavigate('bom')} className="inline-flex h-8 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"><Layers size={15} /> Configuration Items</button>
            </div>
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-6 pb-8 pt-4">
            {/* ── estate health ───────────────────── */}
            <EstateKpis d={d} onNavigate={onNavigate} />

            {/* ── exposure · licences ────────────────────────────── */}
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <Card
                className="lg:col-span-2"
                title="Components with highest exposure"
                sub={d.sharedProduct ? `ranked by product reach · all present in ${d.sharedProduct}` : 'ranked by product reach'}
                right={<ViewAll onClick={() => onNavigate('software-components')} />}
              >
                {d.affected.length === 0 ? (
                  <Empty>No components with open findings</Empty>
                ) : (
                  <div className="divide-y divide-[#F0F2F5]">
                    {d.affected.map((a, i) => {
                      const exposure = Math.round((a.reach / maxReach) * 100);
                      const s = sev(a.severity);
                      /* The shared product is stated in the header, so it is dropped from the row. */
                      const own = a.products.filter((p) => p !== d.sharedProduct);
                      const shown = own.slice(0, 2);
                      const rest = own.length - shown.length;
                      return (
                        <button
                          key={a.key}
                          onClick={() => onNavigate('software-components')}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F9FAFB]"
                        >
                          <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[11px] font-semibold tabular-nums text-[#9CA3AF]">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-mono text-[13px] font-semibold text-[#364658]">{a.name}</span>
                              <span className="flex-shrink-0 text-[12px] text-[#7B8FA5]">{a.version}</span>
                              {a.versions > 1 && <span className="flex-shrink-0 text-[11px] text-[#9CA3AF]">+{a.versions - 1} ver</span>}
                              <span className="flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: s.bg, color: s.ink }}>
                                {a.cves.length ? `${a.cves.length} CVE${a.cves.length === 1 ? '' : 's'} · ${a.severity}` : 'No CVE'}
                              </span>
                              <span className="ml-auto flex-shrink-0 whitespace-nowrap text-[12px] tabular-nums text-[#7B8FA5]">
                                <b className="font-semibold text-[#364658]">{a.reach}</b> / {maxReach} products · <b className="font-semibold" style={{ color: s.ink }}>{exposure}%</b>
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-3">
                              <span className="min-w-0 flex-1"><ExposureBar pct={exposure} color={s.bar} /></span>
                              <span className="w-[210px] flex-shrink-0 truncate text-right text-[12px] text-[#7B8FA5]" title={a.products.join(' · ')}>
                                {shown.join(' · ')}{rest > 0 ? ` +${rest}` : ''}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="mt-auto border-t border-[#F0F2F5] px-4 py-2.5 text-[12px] text-[#7B8FA5]">
                  <span className="tabular-nums">{withFindings}</span> of the top {d.affected.length} carry a known CVE.
                </div>
              </Card>

              <LicenceDistributionCard d={d} onNavigate={onNavigate} />
            </div>

            {/* ── lifecycle ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              <Card
                className="lg:col-span-2"
                title="Expiring trust material" sub="certificates from the CBOM"
                right={
                  <div className="flex items-center gap-2">
                    <HeadPill tone={d.certsDueSoon > 0 ? 'red' : 'neutral'}>{d.certsDueSoon} due &lt; 120d</HeadPill>
                    <ViewAll onClick={() => onNavigate('bom')} />
                  </div>
                }
              >
                {d.certs.length === 0 ? (
                  <Empty>No certificates expiring in 180 days</Empty>
                ) : (
                  <>
                    {allQuantum && (
                      <div className="border-b border-[#F0F2F5] px-4 py-2 text-[12px] text-[#7B8FA5]">
                        All tracked certificates are <b className="font-medium text-[#364658]">quantum-vulnerable</b>.
                      </div>
                    )}
                    <div className="flex items-center gap-3 px-4 pt-2.5">
                      <span className="w-[76px] flex-shrink-0" />
                      <span className="min-w-0 flex-1">
                        <Axis gridlines={certGrid} marks={[
                          { at: 2, label: 'Now', strong: true }, { at: certGrid[0], label: '30d' },
                          { at: certGrid[1], label: '120d' }, { at: 96, label: 'Later' },
                        ]} />
                      </span>
                    </div>
                    {certBands.map((g) => (
                      <div key={g.key}>
                        <div className="flex items-center gap-2 px-4 pb-0.5 pt-2">
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: BAND[g.key].ink }} />
                          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: BAND[g.key].ink }}>{g.label}</span>
                          <span className="text-[11px] text-[#9CA3AF]">{g.hint}</span>
                          <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#7B8FA5]">{g.items.length}</span>
                        </div>
                        {g.items.map((c) => (
                          <button key={c.key} onClick={() => openBom(c.productId, 'CBOM')}
                            className="flex w-full items-center gap-3 px-4 py-1.5 text-left transition-colors hover:bg-[#F9FAFB]">
                            <span className="w-[76px] flex-shrink-0 rounded-full px-2 py-0.5 text-center text-[12px] font-semibold tabular-nums"
                              style={{ backgroundColor: BAND[bandFor(c.days)].bg, color: BAND[bandFor(c.days)].ink }}>{c.days}d</span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-baseline gap-2">
                                <span className="truncate font-mono text-[13px] font-semibold text-[#364658]">{c.name}</span>
                                <span className="ml-auto flex-shrink-0 truncate text-[12px] text-[#7B8FA5]" style={{ maxWidth: 260 }}
                                  title={`${c.productName}${c.reach > 1 ? ` +${c.reach - 1} more` : ''} · ${c.detail}${c.quantumVulnerable ? ' · quantum-vulnerable' : ''}`}>
                                  {c.productName}{c.reach > 1 ? ` +${c.reach - 1}` : ''} · {c.detail}{!allQuantum && c.quantumVulnerable ? ' · quantum-vulnerable' : ''}
                                </span>
                              </span>
                              <span className="mt-1 block"><Lane posPct={certAt(c.days)} color={BAND[bandFor(c.days)].ink} gridlines={certGrid} /></span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                <div className="mt-auto border-t border-[#F0F2F5] px-4 py-2.5 text-[12px] leading-relaxed text-[#7B8FA5]">
                  An expired certificate is an outage, not a finding — rotate before the clock hits zero.
                  {' '}<span className="tabular-nums">{d.certQuantumVulnerable}</span> of the{' '}
                  <span className="tabular-nums">{d.certTotal}</span> tracked certificates also sit on the PQC migration track.
                </div>
              </Card>

              <Card
                title="Deprecated AI models" sub="lifecycle from the AI BOM"
                right={
                  <div className="flex items-center gap-2">
                    <HeadPill tone={d.modelsPastEol > 0 ? 'red' : 'neutral'}>{d.modelsPastEol} past EOL</HeadPill>
                    <ViewAll onClick={() => onNavigate('bom')} />
                  </div>
                }
              >
                {d.models.length === 0 ? (
                  <Empty>No deprecated models</Empty>
                ) : (
                  <>
                    {allNoCard && (
                      <div className="border-b border-[#F0F2F5] px-4 py-2 text-[12px] text-[#7B8FA5]">
                        None of these ship a <b className="font-medium text-[#364658]">model card</b>.
                      </div>
                    )}
                    <div className="px-4 pt-2.5">
                      <Axis gridlines={[50]} marks={[
                        { at: 8, label: 'Overdue' }, { at: 50, label: 'EOL', strong: true }, { at: 92, label: 'Later' },
                      ]} />
                    </div>
                    {modelBands.map((g) => (
                      <div key={g.key}>
                        <div className="flex items-center gap-2 px-4 pb-0.5 pt-2">
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: BAND[g.key].ink }} />
                          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: BAND[g.key].ink }}>{g.label}</span>
                          <span className="text-[11px] text-[#9CA3AF]">{g.hint}</span>
                          <span className="ml-auto text-[11px] font-semibold tabular-nums text-[#7B8FA5]">{g.items.length}</span>
                        </div>
                        {g.items.map((m) => (
                          <button key={m.key} onClick={() => openBom(m.productId, 'AI BOM')}
                            className="w-full px-4 py-1.5 text-left transition-colors hover:bg-[#F9FAFB]">
                            <span className="flex items-baseline gap-2">
                              <span className="truncate font-mono text-[13px] font-semibold text-[#364658]">{m.name}</span>
                              <span className="ml-auto flex-shrink-0 whitespace-nowrap text-[12px] font-semibold tabular-nums" style={{ color: BAND[g.key].ink }}>
                                {/* "EOL" stays in the badge: the band header names the state, but a
                                    row lifted out of context must still say what the number means. */}
                                {m.past ? `EOL ${Math.abs(m.days)}d ago` : `${m.days}d`}
                              </span>
                            </span>
                            <span className="mt-1 block"><Lane posPct={modelAt(m.days)} color={BAND[g.key].ink} gridlines={[]} marker={50} /></span>
                            <span className="mt-1 block truncate text-[12px] text-[#7B8FA5]" title={`${m.productName}${m.reach > 1 ? ` +${m.reach - 1} more` : ''} · ${m.detail}`}>
                              {m.productName}{m.reach > 1 ? ` +${m.reach - 1}` : ''} · {stripDeduped(m.detail)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                <div className="mt-auto border-t border-[#F0F2F5] px-4 py-2.5 text-[12px] leading-relaxed text-[#7B8FA5]">
                  A model past end-of-life receives no security fixes — retrain, upgrade, or retire it.
                  {' '}<span className="tabular-nums">{d.modelsEolWithin6m}</span> more model{d.modelsEolWithin6m === 1 ? '' : 's'} reach EOL within 6 months.
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
