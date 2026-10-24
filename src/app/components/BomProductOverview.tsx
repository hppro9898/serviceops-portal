import {
  AlertTriangle, ShieldAlert, KeyRound, Cpu, Boxes, Scale, History, ArrowRight, CheckCircle2,
  ScanLine, CirclePlus, CircleMinus, RefreshCw, Clock, XCircle,
} from 'lucide-react';
import {
  bomVersions, bomVersionStats, componentsAtVersion, bomComponents, bomCryptoAssets, bomAiModels, bomAiInScope,
  bomRetention, cveSeverity, isBlockedLicense, BOM_SEVERITIES,
} from './bomData';
import type { BomSeverity, BomVersion, CryptoAsset, AiModel } from './bomData';
import { productKey, productBomTypes, endpointIdOf } from './bomProductsData';
import type { ProductRecord } from './bomProductsData';
import type { BomTabId } from './BomTypeTabs';

/* Application Service — Overview.
 *
 * The question a reader brings here is "is this BOM OK, and if not, what do I do first?" — so the
 * page leads with what needs attention, then the four headline figures, then the evidence behind
 * them. Every number is derived from the entry's CURRENT BOM version through the same functions
 * the SBOM / CBOM / AI BOM tabs use (bomVersionStats, componentsAtVersion, bomCryptoAssets,
 * bomAiModels), so a figure here and the tab it links to can never disagree. Nothing is invented
 * for the Overview alone.
 *
 * Dates (certificate expiry, model end-of-life) are measured against TODAY: an expired certificate
 * is expired whether or not the agent has scanned since. */

const SEV: Record<BomSeverity, { text: string; bg: string; bar: string }> = {
  Critical: { text: '#B42318', bg: '#FEF3F2', bar: '#EF4444' },
  High: { text: '#C4320A', bg: '#FFF4ED', bar: '#F97316' },
  Medium: { text: '#B54708', bg: '#FFFAEB', bar: '#F59E0B' },
  Low: { text: '#475467', bg: '#F2F4F7', bar: '#94A3B8' },
};
const STATUS_TONE = { crit: 'bg-[#FEF3F2] text-[#B42318]', warn: 'bg-[#FFFAEB] text-[#B54708]', ok: 'bg-[#F1F5F9] text-[#475467]' };
const SEV_RANK: Record<BomSeverity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const daysUntil = (d: string) => Math.round((Date.parse(d) - Date.now()) / 86400000);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const joinNames = (xs: string[], max = 2) => xs.length <= max ? xs.join(', ') : `${xs.slice(0, max).join(', ')} +${xs.length - max}`;

interface VulnRow { name: string; version: string; cves: string[]; worst: BomSeverity | null }
interface CertRow { a: CryptoAsset; days: number }
interface Attention { tone: 'crit' | 'warn' | 'info'; text: React.ReactNode; tab?: BomTabId }

/** Everything the Overview shows, derived once per render from the entry's current BOM. */
function buildOverview(p: ProductRecord) {
  const key = productKey(p);
  const agent = p.source === 'Agent';
  /* Which BOMs this entry HAS: an endpoint scan yields whatever it found; an ingest holds only the
     files that were uploaded — any of SBOM / CBOM / AI BOM. A type it lacks is never generated here. */
  const types = productBomTypes(p);
  const hasSbom = types.includes('SBOM');
  const hasCbom = types.includes('CBOM');
  const hasAi = types.includes('AI BOM');
  const sv = hasSbom ? bomVersions(p.id, key, 'SBOM') : [];
  const cur = sv.find((v) => v.state === 'Current') ?? sv[0];
  const prev = cur ? sv.find((v) => v.v === cur.v - 1) : undefined;
  const stats = cur ? bomVersionStats(p.id, key, 'SBOM', cur.v) : null;
  const present = cur ? componentsAtVersion(p.id, key, 'SBOM', cur.v) : [];
  /* name@version: only the vulnerable build carries the advisory — the same key bomVersionStats uses. */
  const comps = hasSbom ? bomComponents(p.id, key) : [];
  const byBuild = new Map(comps.map((c) => [`${c.name}@${c.version}`, c]));
  const catalog = new Map(comps.map((c) => [c.name, c]));

  const vulnerable: VulnRow[] = present
    .map((c) => ({ name: c.name, version: c.version, cves: byBuild.get(`${c.name}@${c.version}`)?.cves ?? [] }))
    .filter((x) => x.cves.length > 0)
    /* Worst RATED severity; an advisory with no rating does not rank (it is never guessed). */
    .map((x) => ({ ...x, worst: x.cves.map(cveSeverity).filter((s): s is BomSeverity => !!s).sort((a, b) => SEV_RANK[a] - SEV_RANK[b])[0] ?? null }))
    .sort((a, b) => (a.worst ? SEV_RANK[a.worst] : 9) - (b.worst ? SEV_RANK[b.worst] : 9) || b.cves.length - a.cves.length || a.name.localeCompare(b.name));

  const licenceCount = new Map<string, number>();
  present.forEach((c) => {
    const l = c.license ?? catalog.get(c.name)?.license ?? 'Unknown';
    licenceCount.set(l, (licenceCount.get(l) ?? 0) + 1);
  });
  const licences = [...licenceCount.entries()].map(([name, n]) => ({ name, n, review: isBlockedLicense(name) }))
    .sort((a, b) => b.n - a.n);

  const crypto = hasCbom ? bomCryptoAssets(p.id, key) : [];
  /* Read straight from the CBOM: a token, secret or private key found in a file. */
  const secrets = crypto.filter((c) => c.primitive === 'Secret' || c.primitive === 'Token' || c.primitive === 'Private key');
  /* One row per certificate: the demo catalogue repeats an asset when a CBOM is larger than it. */
  const certs: CertRow[] = [...new Map(crypto.filter((c) => c.expiry).map((a) => [a.name, a])).values()]
    .map((a) => ({ a, days: daysUntil(a.expiry!) })).sort((x, y) => x.days - y.days);

  const models = hasAi ? bomAiModels(p.id, key) : [];
  /* The AI BOM's own unit — every AI component that counts — so this KPI, the tab badge and the
     Applications listing quote one number. The card below lists only the models among them. */
  const aiComponents = hasAi ? bomAiInScope(p.id, key).length : 0;
  const modelEol = (m: AiModel) => (m.eol ? daysUntil(m.eol) : null);
  const pastEol = models.filter((m) => (modelEol(m) ?? 1) < 0);

  const runs = sv.flatMap((v) => v.runs);
  const lastRun = sv[0]?.runs[0];
  const failedRuns = runs.filter((r) => r.result === 'Failed').length;
  const retention = bomRetention(p.id, key, 'SBOM');

  /* What needs doing, worst first. Each line names the thing, not just a count, and opens the
     tab where it is fixed. */
  const attention: Attention[] = [];
  if (stats && stats.bySeverity.Critical > 0) {
    const names = vulnerable.filter((v) => v.worst === 'Critical').map((v) => `${v.name} ${v.version}`);
    attention.push({ tone: 'crit', tab: 'sbom', text: <><b>{plural(stats.bySeverity.Critical, 'critical CVE')}</b> in {joinNames(names)}</> });
  }
  const expired = certs.filter((c) => c.days < 0);
  if (expired.length) attention.push({ tone: 'crit', tab: 'cbom', text: <><b>{plural(expired.length, 'certificate')} expired</b> — {joinNames(expired.map((c) => c.a.name))}</> });
  const soon = certs.filter((c) => c.days >= 0 && c.days <= 30);
  if (soon.length) attention.push({ tone: 'warn', tab: 'cbom', text: <><b>{plural(soon.length, 'certificate')} expiring</b> within 30 days — {joinNames(soon.map((c) => `${c.a.name} (${c.days}d)`))}</> });
  if (pastEol.length) attention.push({ tone: 'warn', tab: 'aibom', text: <><b>{plural(pastEol.length, 'AI model')} past end-of-life</b> — {joinNames(pastEol.map((m) => m.name))}</> });
  if (secrets.length) attention.push({ tone: 'crit', tab: 'cbom', text: <><b>{plural(secrets.length, 'secret or private key')}</b> exposed on disk — {joinNames(secrets.map((c) => (c.line != null ? `${c.name} (${c.location}:${c.line})` : `${c.name} (${c.location})`)), 2)}</> });
  /* Deprecated = a SHA-1 / MD5 / DES / RC4 algorithm, or a certificate SIGNED with one — named by
     the weak part, so "SHA1-RSA" reads as the reason rather than "RSA". */
  if (stats && stats.bySeverity.High > 0) attention.push({ tone: 'warn', tab: 'sbom', text: <><b>{plural(stats.bySeverity.High, 'high-severity CVE')}</b> across {plural(vulnerable.filter((v) => v.cves.some((c) => cveSeverity(c) === 'High')).length, 'component')}</> });
  if (stats && stats.blockedLicenses > 0) attention.push({ tone: 'info', tab: 'sbom', text: <><b>{plural(stats.blockedLicenses, 'component')}</b> on licences that need review — {joinNames(licences.filter((l) => l.review).map((l) => l.name), 3)}</> });
  if (agent && p.agent && !p.agent.agentOnline) attention.push({ tone: 'warn', text: <>Endpoint <b>{endpointIdOf(p.agent)}</b> ({p.agent.hostName}) is offline — the BOM will not refresh until it checks in</> });
  if (agent && lastRun?.result === 'Failed') attention.push({ tone: 'warn', text: <>The last scan failed — {lastRun.outcome}</> });

  return { agent, hasSbom, hasCbom, hasAi, sv, cur, prev, stats, present, vulnerable, licences, crypto, secrets, certs, models, aiComponents, modelEol, pastEol, runs, lastRun, failedRuns, retention, attention };
}

/* ── Building blocks ──────────────────────────────────────────────────── */
function Panel({ icon, title, action, children, className = '' }: {
  icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col rounded-lg border border-[#E5E7EB] bg-white ${className}`}>
      <div className="flex min-h-[46px] items-center justify-between gap-3 border-b border-[#F0F2F5] px-4 py-2">
        <h3 className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-[#364658]"><span className="text-[#3D8BD0]">{icon}</span>{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

const LinkBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="inline-flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[12px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]">
    {label}<ArrowRight size={13} />
  </button>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-4 py-6 text-[13px] text-[#7B8FA5]"><CheckCircle2 size={15} className="text-[#22A06B]" />{children}</div>
);

function Kpi({ icon, label, value, tone, sub, onClick, children }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; tone: string; sub?: React.ReactNode; onClick?: () => void; children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="flex min-w-0 flex-col rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-left transition-colors enabled:hover:border-[#3D8BD0] enabled:hover:shadow-sm disabled:cursor-default">
      <span className="flex items-center gap-2 text-[12px] text-[#7B8FA5]">
        <span className="flex size-6 items-center justify-center rounded" style={{ backgroundColor: `${tone}1A`, color: tone }}>{icon}</span>{label}
      </span>
      <span className="mt-2 text-[20px] font-semibold leading-none text-[#364658] tabular-nums">{value}</span>
      {sub && <span className="mt-1.5 text-[12px] text-[#7B8FA5]">{sub}</span>}
      {children}
    </button>
  );
}


function ChangeDots({ v }: { v: BomVersion }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[12px] tabular-nums">
      <span className={`inline-flex items-center gap-1 ${v.added ? 'text-[#22A06B]' : 'text-[#9CA3AF]'}`} title="Added"><CirclePlus size={12} />{v.added}</span>
      <span className={`inline-flex items-center gap-1 ${v.updated ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`} title="Updated"><RefreshCw size={12} />{v.updated}</span>
      <span className={`inline-flex items-center gap-1 ${v.removed ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}`} title="Removed"><CircleMinus size={12} />{v.removed}</span>
      {v.cves > 0 && <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]" title="CVEs introduced"><ShieldAlert size={12} />{v.cves} CVE</span>}
    </span>
  );
}

/* ── The page ─────────────────────────────────────────────────────────── */
/** Label-over-value grid, the same shape the CI card uses — so the two general-information cards
 *  read as one row. */
export function InfoFields({ items, cols }: { items: [string, React.ReactNode][]; cols: string }) {
  return (
    <dl className={`grid gap-x-6 gap-y-4 px-4 py-4 ${cols}`}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[12px] text-[#7B8FA5]">{k}</dt>
          <dd className="mt-0.5 truncate text-[13px] font-medium text-[#364658]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BomProductOverview({ p, onGo, wide }: { p: ProductRecord; onGo: (t: BomTabId) => void; wide: boolean }) {
  const ingested = p.source === 'Ingest';
  const queued = p.scanState === 'Queued';
  const two = wide ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4';

  /* The application's own fields (source, endpoint or documents, CMDB link) live in the detail
     page's right properties panel, like every other module — the Overview starts with what needs
     attention and the figures. */
  if (queued) {
    return (
      <div className="space-y-4 px-6 py-5">
        <div className="flex items-start gap-3 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F9FAFB] px-4 py-4">
          <ScanLine size={18} className="mt-px flex-shrink-0 text-[#7B8FA5]" />
          <div>
            <p className="text-[14px] font-medium text-[#364658]">First scan queued</p>
            <p className="mt-0.5 text-[13px] text-[#7B8FA5]">
              Endpoint {p.agent ? endpointIdOf(p.agent) : ''} ({p.agent?.hostName}) is scanned at <span className="font-mono">{p.scanPath}</span> on its next check-in.
              Findings, components, crypto assets and models appear here once it reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const d = buildOverview(p);
  const s = d.stats;
  /* A type an ingest did not upload reads "Not ingested" — never a 0 that looks like a finding. */
  const notIngested = <span className="text-[13px] font-medium text-[#9CA3AF]">Not ingested</span>;
  const TONE = { crit: { bg: '#FEF3F2', dot: '#EF4444', border: '#FECDCA' }, warn: { bg: '#FFFAEB', dot: '#F59E0B', border: '#FEDF89' }, info: { bg: '#F5F7FA', dot: '#94A3B8', border: '#E5E7EB' } };

  return (
    <div className="space-y-4 px-6 py-5">
      {/* 2 · Headline figures — each opens the tab it summarises. */}
      <div className={`grid gap-3 ${wide ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {/* Just the figure — each card opens the tab that explains it. */}
        <Kpi icon={<Boxes size={14} />} label="Software components" tone="#3D8BD0" value={s ? s.totalPackages.toLocaleString() : notIngested} onClick={s ? () => onGo('sbom') : undefined} />
        <Kpi icon={<ShieldAlert size={14} />} label="Vulnerabilities" tone={s?.cves ? '#DC2626' : '#22A06B'} value={s ? s.cves : notIngested} onClick={s ? () => onGo('sbom') : undefined} />
        <Kpi icon={<KeyRound size={14} />} label="Crypto assets" tone="#6366F1" value={ingested && !d.hasCbom ? notIngested : d.crypto.length} onClick={ingested && !d.hasCbom ? undefined : () => onGo('cbom')} />
        <Kpi icon={<Cpu size={14} />} label="AI components" tone="#A855F7" value={ingested && !d.hasAi ? notIngested : d.aiComponents} onClick={ingested && !d.hasAi ? undefined : () => onGo('aibom')} />
      </div>

      {/* 3 · The evidence behind Vulnerabilities, and the licences in the SBOM — only with an SBOM. */}
      {s && <div className={wide ? 'grid grid-cols-[3fr_2fr] gap-4' : 'grid grid-cols-1 gap-4'}>
        <Panel icon={<ShieldAlert size={15} />} title="Vulnerable components"
          action={<LinkBtn label="Open SBOM" onClick={() => onGo('sbom')} />}>
          {d.vulnerable.length ? (
            <table className="w-full">
              <thead className="border-b border-[#F0F2F5]"><tr>
                {['Component', 'Version', 'Severity', 'CVEs'].map((h) => <th key={h} className="px-4 py-2 text-left text-[12px] font-semibold text-[#364658]">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {d.vulnerable.slice(0, 6).map((v) => (
                  <tr key={`${v.name}@${v.version}`} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-2 font-mono text-[12px] text-[#364658]">{v.name}</td>
                    <td className="px-4 py-2 font-mono text-[12px] text-[#364658]">{v.version}</td>
                    <td className="px-4 py-2">{v.worst
                      ? <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: SEV[v.worst].bg, color: SEV[v.worst].text }}>{v.worst}</span>
                      : <span className="text-[11px] text-[#9CA3AF]">Not rated</span>}</td>
                    <td className="px-4 py-2 font-mono text-[12px] text-[#64748B]"><span className="block max-w-[260px] truncate" title={v.cves.join(', ')}>{v.cves.join(', ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>No component in the current SBOM carries a known CVE.</Empty>}
          {d.vulnerable.length > 6 && <p className="border-t border-[#F0F2F5] px-4 py-2 text-[12px] text-[#7B8FA5]">+{d.vulnerable.length - 6} more in the SBOM tab</p>}
        </Panel>

        <Panel icon={<Scale size={15} />} title="Licences">
          {d.licences.every((l) => l.name === 'Unknown' || l.name === 'Not declared') ? <Empty>No licence data in this SBOM.</Empty> : <>
          <ul className="divide-y divide-[#F0F2F5]">
            {d.licences.slice(0, 7).map((l) => (
              <li key={l.name} className="flex items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#364658]">{l.name}</span>
                <span className="w-10 text-right text-[12px] tabular-nums text-[#64748B]">{l.n}</span>
              </li>
            ))}
          </ul>
          {d.licences.length > 7 && <p className="border-t border-[#F0F2F5] px-4 py-2 text-[12px] text-[#7B8FA5]">+{d.licences.length - 7} more licences</p>}
          </>}
        </Panel>
      </div>}

      {/* 4 · Crypto and AI — a scan always reports both; an ingest shows the ones it uploaded. */}
      {(d.agent || d.hasCbom || d.hasAi) && (
        <div className={d.agent || (d.hasCbom && d.hasAi) ? two : ''}>
          {(d.agent || d.hasCbom) && <Panel icon={<KeyRound size={15} />} title="Crypto assets"
            action={<LinkBtn label="Open CBOM" onClick={() => onGo('cbom')} />}>
            {(() => {
              /* Only what needs action: secrets found in files and certificates, most urgent first. */
              const rows = [
                ...d.secrets.map((a) => ({ key: `s:${a.name}:${a.location}`, name: a.name, type: a.primitive as string, rank: -1e9, status: 'Secret found', tone: 'crit' as const })),
                ...d.certs.map(({ a, days }) => ({ key: `c:${a.name}`, name: a.name, type: 'Certificate', rank: days,
                  status: days < 0 ? `Expired ${-days}d ago` : `${days}d left`, tone: days < 0 ? 'crit' as const : days <= 30 ? 'warn' as const : 'ok' as const })),
              ].sort((x, y) => x.rank - y.rank);
              return rows.length ? (
                <table className="w-full">
                  <thead className="border-b border-[#F0F2F5]"><tr>
                    {['Name', 'Type', 'Status'].map((h) => <th key={h} className="px-4 py-2 text-left text-[12px] font-semibold text-[#364658]">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {rows.slice(0, 5).map((r) => (
                      <tr key={r.key} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-2 font-mono text-[12px] text-[#364658]"><span className="block max-w-[220px] truncate" title={r.name}>{r.name}</span></td>
                        <td className="px-4 py-2 text-[12px] text-[#364658]">{r.type}</td>
                        <td className="px-4 py-2"><span className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[r.tone]}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Empty>{d.crypto.length ? 'No certificates or secrets in this CBOM.' : 'The scan found no cryptographic assets.'}</Empty>;
            })()}
          </Panel>}

          {(d.agent || d.hasAi) && <Panel icon={<Cpu size={15} />} title="AI models"
            action={d.models.length ? <LinkBtn label="Open AI BOM" onClick={() => onGo('aibom')} /> : undefined}>
            {d.models.length ? (
              <table className="w-full">
                <thead className="border-b border-[#F0F2F5]"><tr>
                  {['Model', 'Provider', 'Type', 'End of Life'].map((h) => <th key={h} className="px-4 py-2 text-left text-[12px] font-semibold text-[#364658]">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {/* Past or nearest end of life first; the rest keep scan order. */}
                  {[...d.models].sort((x, y) => (d.modelEol(x) ?? Number.MAX_SAFE_INTEGER) - (d.modelEol(y) ?? Number.MAX_SAFE_INTEGER)).slice(0, 5).map((m) => {
                    const eol = d.modelEol(m);
                    return (
                      <tr key={m.ref ?? m.name} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-2 text-[12px] font-medium text-[#364658]"><span className="block max-w-[220px] truncate" title={m.name}>{m.name}</span></td>
                        <td className="px-4 py-2 text-[12px] text-[#364658]">{m.provider}</td>
                        <td className="px-4 py-2 text-[12px] text-[#364658]">{m.source === 'Hosted API' ? 'Hosted API' : 'Local'}</td>
                        <td className="px-4 py-2">{eol === null ? <span className="text-[12px] text-[#9CA3AF]">-</span> : (
                          <span title={`End of life ${m.eol}`} className={`rounded-sm px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[eol < 0 ? 'crit' : eol <= 90 ? 'warn' : 'ok']}`}>
                            {eol < 0 ? 'Past EOL' : `EOL in ${eol}d`}
                          </span>
                        )}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : <Empty>No AI models found in this scan.</Empty>}
          </Panel>}
        </div>
      )}

    </div>
  );
}
