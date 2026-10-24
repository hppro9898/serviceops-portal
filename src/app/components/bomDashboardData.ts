import { bomComponents, bomCryptoAssets, bomAiModels, cveSeverity, isKevListed, componentFix } from './bomData';
import { bomProducts, productKey, productBomTypes, productsVersion, BOM_LICENSE_SEATS } from './bomProductsData';
import type { BomComponent, CryptoAsset, AiModel, BomSeverity } from './bomData';
import { SOFTWARE_COMPONENTS, derivedComponentId } from './softwareComponentsData';
import type { SoftwareComponent, Ecosystem, ComponentSeverity, ComponentSource } from './softwareComponentsData';

/* Every figure on the BOM Dashboard, derived from ONE walk of the PRODUCTS IN BOM SCOPE.
 *
 * A BOM belongs to a product (Agent-scanned or Ingested), not to a CI, so every "how far does it
 * reach" figure here counts PRODUCTS. A product whose first scan is still queued holds a licence
 * but has no BOM yet: it counts toward scope, never toward a reach denominator.
 *
 * The rule the page states out loud — "every figure below is derived live from the BOM data it
 * links to" — only holds if the dashboard reads the same accessors the drawers do. So nothing
 * here is authored: it is `bomComponents` / `bomCryptoAssets` / `bomAiModels` counted up. The
 * walk is memoised against the product store's version, so adding or removing a product
 * re-derives it.
 */

/** Today (local midnight) — the same clock the application Overview and AI Components use, so a
 *  certificate or model reads "expired" on every screen at once. */
export const DASH_TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

const dayDiff = (iso: string): number | null => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.round((t - DASH_TODAY.getTime()) / 86_400_000);
};

// ---------------------------------------------------------------------------
// Licence policy — the licence STRING exists on every component; whether it is
// acceptable does not. That is a policy question, so it is answered in one place.
// ---------------------------------------------------------------------------

export { licencePolicy } from './softwareComponentsData';
export type { LicencePolicy } from './softwareComponentsData';
import { licencePolicy } from './softwareComponentsData';

/** A record is FULL DETAIL when it can answer the three questions an auditor asks of a
 *  component: what exactly is it (a resolvable purl), which version, and under what licence.
 *  Anything missing one of those is a row you cannot act on. */
export const isFullDetail = (c: BomComponent): boolean =>
  !!c.purl && !!c.version && c.version !== '—' && licencePolicy(c.license) !== 'undeclared';

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface AffectedComponent {
  key: string;
  name: string;
  version: string;
  /** How many products carry this component at ANY version — blast radius, not severity. */
  reach: number;
  /** How many distinct versions of it the estate carries. */
  versions: number;
  cves: string[];
  /** The products it was found in, by name, deduped. */
  products: string[];
  /** The worst severity among its CVEs. */
  severity: BomSeverity | null;
}

/** The CBOM's answer to a licence: which algorithm, and whether it survives a quantum computer. */
export type CryptoPosture = 'exposed' | 'quantum' | 'deprecated' | 'compliant';
/** Public-key algorithms a quantum computer breaks. */
const QUANTUM_KEY = /^(RSA|ECDSA|ECDH|EdDSA|Ed25519|DSA|DH|X25519|EC)$/i;
export interface CryptoSlice { algorithm: string; count: number; pct: number; posture: CryptoPosture }

export interface LicenceSlice {
  licence: string;
  count: number;
  pct: number;
  policy: LicencePolicy;
}

/* Both of these are keyed by NAME, not by (product, name). The same certificate subject and the
 * same model turn up in several products, and one row per product would fill the panel with
 * copies. One row per thing, carrying how many products it is in. */
export interface ExpiringCert {
  key: string;
  name: string;
  /** The product whose copy expires soonest — the one the row opens, on its CBOM tab. */
  productId: string;
  productName: string;
  /** Products carrying it. */
  reach: number;
  detail: string;
  days: number;
  quantumVulnerable: boolean;
}

export interface EolModel {
  key: string;
  name: string;
  /** The first product found running it — the one the row opens, on its AI BOM tab. */
  productId: string;
  productName: string;
  /** Products running it. */
  reach: number;
  detail: string;
  /** The published end-of-life date, as the supplier states it. The timeline's tooltip shows this
   *  rather than only the day count — "413 days over" is a reading, the date is the evidence. */
  eol: string;
  provider: string;
  /** "Hosted LLM API" / "Local weights" / "Embedded model" — where the model actually runs. */
  sourceLabel: string;
  /** Negative = already past end-of-life. */
  days: number;
  past: boolean;
}

/** The deprecated-models card's chip, derived from the model list.
 *
 *  Three states, because "3 models are past end-of-life" means two very different things:
 *
 *  - past-EOL models DEPLOYED in at least one product → the age of the worst one, in danger tint.
 *    That is the alarm: something unsupported is running.
 *  - past-EOL models that run NOWHERE → a muted "none deployed", and the number loses its
 *    urgency framing. An undeployed dead model is cleanup, not an incident.
 *  - no past-EOL models at all → the green-neutral all-clear. Never an empty coloured area.
 *
 *  `days` is negative once a model is past EOL, so the oldest is the most negative.
 */
export interface EolChip { label: string; tone: 'danger' | 'neutral' | 'ok'; urgent: boolean }

export const eolModelChip = (models: EolModel[]): EolChip => {
  const past = models.filter((m) => m.past);
  if (past.length === 0) return { label: 'all models supported', tone: 'ok', urgent: false };
  const deployed = past.filter((m) => m.reach > 0);
  if (deployed.length === 0) return { label: 'none deployed', tone: 'neutral', urgent: false };
  const oldest = Math.max(...deployed.map((m) => Math.abs(m.days)));
  return { label: `oldest ${oldest}d past EOL`, tone: 'danger', urgent: true };
};

/* ── the estate's components, as register rows ────────────────────────
   Same population the donut and the exposure list are counted from — one map, so a slice that
   says 167 opens 167 things. Shaped like a `SoftwareComponent` so the drawer that already exists
   can render them without a second component. */

const ECOSYSTEM: Record<string, Ecosystem> = {
  maven: 'Maven', npm: 'Npm', deb: 'Deb', rpm: 'RPM',
  golang: 'Golang', pypi: 'PyPI', nuget: 'NuGet',
};

/** The register, by the only thing that identifies a component version across both populations. */
const REGISTER = new Map(SOFTWARE_COMPONENTS.map((c) => [`${c.name}@${c.version}`, c]));

/** A stable id for a component the register does not carry. Kept in a range the register cannot
 *  reach (it authors `CMP-000xxx`), so a synthesised row can never inherit another's CVE
 *  fixtures by colliding with its id. */
const derivedId = derivedComponentId;

/** Where the BOMs in scope come from — the replacement for the old per-CI "managed paths". An
 *  agent scan at an application path, an agent full scan (a volume root), or an uploaded SBOM. */
export type BomSourceKind = 'agent-app' | 'agent-full' | 'ingest';
export interface BomSourceStat { kind: BomSourceKind; label: string; products: number; color: string }

export interface BomDashboard {
  /** Products in BOM scope — each holds one licence. */
  productTotal: number;
  licenceSeats: number;
  agentProducts: number;
  ingestProducts: number;
  /** In scope but the first scan has not run: no BOM yet. */
  queuedProducts: number;
  /** Products with a BOM — the denominator for every reach figure. */
  bomProducts: number;
  /** Every component row across every product's SBOM — the same number the BOMs add up to. */
  declared: number;
  /** Distinct name@version across the products. The licence donut counts these, not instances:
   *  the same library in 8 products is one licensing decision, not eight. */
  unique: number;
  fullDetail: number;
  fullDetailPct: number;

  cveIds: string[];
  cveBySeverity: Record<BomSeverity, number>;
  /** Products carrying at least one component with a known CVE — the blast radius of ALL of them. */
  vulnerableProducts: number;
  /** The single worst-known vulnerability, named — `components` counts distinct component NAMES
   *  and `reach` the products it is in; the lead is chosen by reach, because that is what makes one
   *  named flaw worse than another. Derived and correct, but nothing renders it at the moment. */
  leadVuln: { id: string; label: string; components: number; reach: number; critical: number } | null;

  affected: AffectedComponent[];
  /** A product every ranked component appears in, if there is one. Repeating it on all eight rows
   *  says nothing eight times; the panel states it once and the rows carry what differs. */
  sharedProduct: string | null;
  /** Every component version in the estate, as a register row — the population the licence
   *  donut and the exposure list are both counted from. */
  components: SoftwareComponent[];
  licences: LicenceSlice[];
  licenceTotal: number;
  licenceCounts: Record<LicencePolicy, number>;
  /** The same card's CBOM half: the algorithm mix and the posture states that lead it. */
  crypto: CryptoSlice[];
  cryptoTotal: number;
  cryptoCounts: Record<CryptoPosture, number>;

  /** Every tracked certificate with a published expiry, soonest first — the timeline plots all of
   *  them rather than a top-N, because a rotation window with nothing in it is itself the answer. */
  certs: ExpiringCert[];
  /** How many fall in each rotation window. Derived here so the chips, the band tints and the
   *  dots can never disagree about which window a certificate is in. */
  certBands: { key: 'expired' | 'd30' | 'd120' | 'd180' | 'beyond'; label: string; count: number }[];
  certsDueSoon: number;
  certTotal: number;
  certQuantumVulnerable: number;

  models: EolModel[];
  /** Where the BOMs come from, per product: agent app path / agent full scan / ingest. */
  sources: BomSourceStat[];
  /** Computed from EVERY model, not from the six the panel shows. */
  eolChip: EolChip;
  modelTotal: number;
  /** Models the supplier publishes no end-of-life for. They cannot be placed on a lifecycle axis,
   *  so the panel states the count instead of plotting them at an invented position. */
  modelsNoEol: number;
  /** Every AI model in scope (first application it was found in), most urgent end-of-life first. */
  allModels: { name: string; productId: string; productName: string; provider: string; hosted: boolean; days: number | null }[];
  modelsPastEol: number;
  modelsEolWithin6m: number;
  /** Products running at least one model already past end-of-life — counted the same way as
   *  `vulnerableProducts`, so the KPI cards mean the same thing by "products". */
  eolModelProducts: number;
}

// ---------------------------------------------------------------------------

/** Log4Shell is the one every stakeholder already knows by name. Naming it turns "8
 *  vulnerabilities" into a thing somebody can go and do something about. */
const NAMED_VULNS: Record<string, string> = {
  'CVE-2021-44228': 'Log4Shell',
  'CVE-2021-45046': 'Log4Shell',
  'CVE-2022-42889': 'Text4Shell',
};

let CACHE: BomDashboard | null = null;
let CACHE_VERSION = -1;

export const bomDashboard = (): BomDashboard => {
  if (CACHE && CACHE_VERSION === productsVersion()) return CACHE;
  CACHE_VERSION = productsVersion();
  const inScope = bomProducts();
  /* Only products that have produced a BOM are walked; a queued one has nothing to count. */
  const withBom = inScope.filter((p) => p.scanState !== 'Queued');

  const uniqueComponents = new Map<string, { c: BomComponent; cis: Set<string>; products: Set<string>; origins: Set<string> }>();
  const certByName = new Map<string, ExpiringCert>();
  const modelByName = new Map<string, EolModel>();
  const allModels = new Map<string, BomDashboard['allModels'][number]>();
  const certCis = new Map<string, Set<string>>();
  const modelCis = new Map<string, Set<string>>();
  const modelNames = new Set<string>();
  /** The subset of `modelNames` carrying a date we could actually place. */
  const modelsWithEol = new Set<string>();
  let declared = 0;
  let certTotal = 0;
  let certQuantum = 0;
  /* Distinct crypto assets, deduped the way components are: one asset on twenty CIs is one
     asset. Keyed on what makes it a different asset — its name, algorithm and key length. */
  const cryptoAssets = new Map<string, CryptoAsset>();

  for (const prod of withBom) {
    const key = productKey(prod);
    const types = productBomTypes(prod);
    /* Kept as a one-element loop so the body below reads the same as before: `ep` is the
       product (its id seeds the BOM engine), `p` its one scope. */
    const ep = { id: prod.id };
    for (const p of [{ key, name: prod.name }]) {
      for (const c of types.includes('SBOM') ? bomComponents(ep.id, p.key) : []) {
        declared++;
        const key = `${c.name}@${c.version}`;
        let entry = uniqueComponents.get(key);
        if (!entry) { entry = { c, cis: new Set(), products: new Set(), origins: new Set<string>() }; uniqueComponents.set(key, entry); }
        entry.cis.add(ep.id);
        entry.products.add(p.name);
        /* Which attestation this component arrives by, on THIS host. A component can be both —
           scanned by the agent here and ingested from a vendor SBOM there. */
        entry.origins.add(prod.source === 'Ingest' ? 'vendor' : 'agent');
      }

      for (const a of (types.includes('CBOM') ? bomCryptoAssets(ep.id, p.key) : []) as CryptoAsset[]) {
        /* Every asset counts toward the CBOM distribution — the certificate-only filter below
           belongs to the expiry timeline, which is a different question. */
        /* A secret is the same rule at a different place — keep the place in its key. */
        const ck = `${a.name}|${a.algorithm}|${a.keyLength}|${a.expiry ?? ''}|${a.posture === 'Exposed secret' ? `${a.location}:${a.line ?? ''}` : ''}`;
        if (!cryptoAssets.has(ck)) cryptoAssets.set(ck, a);
        if (a.primitive !== 'Certificate') continue;
        certTotal++;
        /* By the certificate's PUBLIC-KEY algorithm: a SHA-1-signed RSA certificate is deprecated
           AND quantum-vulnerable, and the posture field can only hold the worse of the two. */
        if (QUANTUM_KEY.test(a.algorithm)) certQuantum++;
        if (!a.expiry) continue;
        const days = dayDiff(a.expiry);
        if (days === null) continue;
        if (!certCis.has(a.name)) certCis.set(a.name, new Set());
        certCis.get(a.name)!.add(ep.id);
        const prev = certByName.get(a.name);
        // Keep the copy that expires soonest — that is the one setting the deadline.
        if (!prev || days < prev.days) {
          certByName.set(a.name, {
            key: a.name, name: a.name,
            productId: prod.id, productName: prod.name, reach: 0,
            detail: [a.keyLength !== '—' ? `${a.algorithm} ${a.keyLength}` : a.algorithm, a.signature ? `signed ${a.signature}` : null].filter(Boolean).join(' · '),
            days, quantumVulnerable: QUANTUM_KEY.test(a.algorithm),
          });
        }
      }

      for (const m of (types.includes('AI BOM') ? bomAiModels(ep.id, p.key) : []) as AiModel[]) {
        modelNames.add(m.name);
        if (!allModels.has(m.name)) allModels.set(m.name, { name: m.name, productId: prod.id, productName: prod.name, provider: m.provider, hosted: m.source === 'Hosted API', days: m.eol ? dayDiff(m.eol) : null });
        if (!m.eol) continue;
        const days = dayDiff(m.eol);
        if (days === null) continue;
        /* Everything below this line has a date we could place on an axis. The names that never
           reach here are counted by difference, so a model cannot go missing by being skipped. */
        modelsWithEol.add(m.name);
        if (!modelCis.has(m.name)) modelCis.set(m.name, new Set());
        modelCis.get(m.name)!.add(ep.id);
        if (modelByName.has(m.name)) continue;
        /* `sourceLabel` is pulled out as its own field but STAYS inside `detail` too: Dashboard 2
           renders that sentence verbatim and dedupes against it, so re-cutting it would edit a
           screen this change was not asked to touch. */
        const sourceLabel =
          m.source === 'Hosted API' ? 'Hosted LLM API' : m.source === 'Embedded' ? 'Embedded model' : 'Model';
        const bits = [
          sourceLabel,
          m.modelCard === false ? 'no model card' : null,
          m.risk ?? null,
          m.provider,
        ].filter(Boolean) as string[];
        modelByName.set(m.name, {
          key: m.name, name: m.name, productId: prod.id, productName: prod.name, reach: 0,
          detail: bits.join(' · '), eol: m.eol, provider: m.provider, sourceLabel,
          days, past: days < 0,
        });
      }
    }
  }

  // ── components ────────────────────────────────────────────────────────
  const uniques = [...uniqueComponents.values()];
  const fullDetail = uniques.filter((u) => isFullDetail(u.c)).length;

  const SEV_RANK: Record<BomSeverity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const worst = (cves: string[]): BomSeverity | null =>
    cves.reduce<BomSeverity | null>((acc, id) => {
      const s = cveSeverity(id);
      if (!s) return acc;
      return !acc || SEV_RANK[s] > SEV_RANK[acc] ? s : acc;
    }, null);

  /* Rolled up to the COMPONENT. The panel asks which components create the most exposure, and
     `openssl` at seven versions is one component with one answer — six rows of openssl pushed
     every other finding off the panel and made every row look identical. */
  const byComponent = new Map<string, {
    name: string; cis: Set<string>; products: Set<string>; versions: Map<string, number>; cves: Set<string>;
  }>();
  for (const { c, cis, products } of uniques) {
    let e = byComponent.get(c.name);
    if (!e) { e = { name: c.name, cis: new Set(), products: new Set(), versions: new Map(), cves: new Set() }; byComponent.set(c.name, e); }
    cis.forEach((x) => e!.cis.add(x));
    products.forEach((p) => e!.products.add(p));
    e.versions.set(c.version, (e.versions.get(c.version) ?? 0) + cis.size);
    (c.cves ?? []).forEach((v) => e!.cves.add(v));
  }

  /* Only components that carry a known vulnerability — a widely used clean library is not exposure. */
  const affected: AffectedComponent[] = [...byComponent.values()]
    .filter((e) => e.cves.size > 0)
    .map((e) => ({
      key: e.name,
      name: e.name,
      // The version on the most CIs — the one a remediation would target first.
      version: [...e.versions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
      versions: e.versions.size,
      reach: e.cis.size,
      cves: [...e.cves],
      products: [...e.products],
      severity: worst([...e.cves]),
    }))
    /* Reach first, then how bad it is. Reach barely varies in this estate, so severity is what
       actually orders the list — a critical on 25 CIs outranks a low on the same 25. */
    .sort((a, b) => b.reach - a.reach
      || (b.severity ? SEV_RANK[b.severity] : 0) - (a.severity ? SEV_RANK[a.severity] : 0)
      || b.cves.length - a.cves.length
      || a.name.localeCompare(b.name))
    /* The panel draws all of them, so this cap IS the panel's row count — one number, in one
       place, rather than a data cap and a display cap that can disagree.

       Eight, because this card is the TALLEST in its row and therefore the one setting the row's
       height: trimming the padding around the two rings beside it changes nothing visible until
       this list also gets shorter. Eight single-line rows come out level with the licence card's
       own content, so neither card is padding out to match the other. */
    .slice(0, 8);

  // ── vulnerabilities ───────────────────────────────────────────────────
  const cveIds = [...new Set(uniques.flatMap((u) => u.c.cves ?? []))].sort();
  const cveBySeverity = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<BomSeverity, number>;
  for (const id of cveIds) { const s = cveSeverity(id); if (s) cveBySeverity[s]++; }

  /* Any CVE, any severity — one product is counted once however many vulnerable components it carries. */
  const vulnerableProducts = new Set(
    uniques.filter((u) => (u.c.cves ?? []).length > 0).flatMap((u) => [...u.cis]),
  ).size;

  /* Counted over distinct component NAMES and distinct CIs.
   *
   * This used to count `uniques` — name@version rows — and call the result "components". The
   * fixture carries a library at up to twenty versions, so Text4Shell reported "17 components"
   * when it is carried by exactly ONE (commons-text) on 7 CIs, and it took the lead from
   * Log4Shell purely by having one more version variant. Neither figure was about the estate.
   * The lead is now the named flaw that reaches the most CIs, which is the thing that makes one
   * worse than another. */
  let leadVuln: BomDashboard['leadVuln'] = null;
  for (const id of cveIds) {
    const label = NAMED_VULNS[id];
    if (!label) continue;
    const hits = uniques.filter((u) => (u.c.cves ?? []).includes(id));
    const names = new Set(hits.map((u) => u.c.name));
    const reach = new Set(hits.flatMap((u) => [...u.cis]));
    const critical = new Set(
      hits.flatMap((u) => (u.c.cves ?? []).filter((v) => cveSeverity(v) === 'Critical')),
    ).size;
    const better = !leadVuln
      || reach.size > leadVuln.reach
      || (reach.size === leadVuln.reach && cveSeverity(id) === 'Critical' && critical > leadVuln.critical);
    if (better) leadVuln = { id, label, components: names.size, reach: reach.size, critical };
  }

  // ── licences ──────────────────────────────────────────────────────────
  const byLicence = new Map<string, number>();
  const licenceCounts: Record<LicencePolicy, number> = { denied: 0, restricted: 0, undeclared: 0, allowed: 0 };
  for (const u of uniques) {
    const raw = licencePolicy(u.c.license) === 'undeclared' ? 'Undeclared' : u.c.license;
    byLicence.set(raw, (byLicence.get(raw) ?? 0) + 1);
    licenceCounts[licencePolicy(u.c.license)]++;
  }
  const licenceTotal = uniques.length;
  const ranked = [...byLicence.entries()].sort((a, b) => b[1] - a[1]);
  const TOP = 5;
  const head = ranked.slice(0, TOP);
  const tail = ranked.slice(TOP).reduce((n, [, v]) => n + v, 0);
  /* One row per component version, from the map every other figure on this page is counted
     from. A register record wins on the facts it AUTHORS — its CVE list, KEV flag and fix
     version are content, not derivation — but never on reach: the dashboard's CI and product
     counts are the ones the rest of the page is showing. */
  const components: SoftwareComponent[] = uniques.map((u) => {
    const key = `${u.c.name}@${u.c.version}`;
    const known = REGISTER.get(key);
    const cves = u.c.cves ?? [];
    const sources = [...u.origins].sort() as ComponentSource[];
    const base: SoftwareComponent = known ?? {
      id: derivedId(key), name: u.c.name, version: u.c.version,
      ecosystem: ECOSYSTEM[u.c.ecosystem.toLowerCase()] ?? 'Deb',
      purl: u.c.purl,
      cves, cis: 0, products: 0, vulnerabilities: 0, topSeverity: 'None',
      /* KEV and the fix come from the advisories themselves (CISA KEV enrichment; Trivy's per-branch
         fix list). Exposure is not derivable from a BOM, so it is not claimed. */
      kev: cves.some(isKevListed), internetFacing: false, fixVersion: cves.length ? componentFix(cves, u.c.version) : null,
      license: u.c.license, licenseFlag: licencePolicy(u.c.license) !== 'allowed',
      sources: [],
    };
    return {
      ...base,
      cis: u.cis.size,
      products: u.products.size,
      cves,
      vulnerabilities: cves.length,
      topSeverity: (worst(cves) ?? 'None') as ComponentSeverity,
      license: u.c.license,
      licenseFlag: licencePolicy(u.c.license) !== 'allowed',
      sources: sources.length ? sources : ['agent'],
    };
  });

  const licences: LicenceSlice[] = head.map(([licence, count]) => ({
    licence, count, pct: (count / licenceTotal) * 100,
    policy: licence === 'Undeclared' ? 'undeclared' : licencePolicy(licence),
  }));
  if (tail > 0) licences.push({ licence: 'Other', count: tail, pct: (tail / licenceTotal) * 100, policy: 'allowed' });

  /* The CBOM half of the same card. Same arithmetic, same top-5-then-Other shape, so the two
     views of the card cannot report their totals differently. */
  const POSTURE_OF: Record<CryptoAsset['posture'], CryptoPosture> = {
    'Exposed secret': 'exposed', 'Quantum-vulnerable': 'quantum', Deprecated: 'deprecated', Compliant: 'compliant',
  };
  const assets = [...cryptoAssets.values()];
  const cryptoTotal = assets.length;
  const cryptoCounts: Record<CryptoPosture, number> = { exposed: 0, quantum: 0, deprecated: 0, compliant: 0 };
  const byAlgorithm = new Map<string, { n: number; posture: CryptoPosture }>();
  for (const a of assets) {
    const posture = POSTURE_OF[a.posture];
    cryptoCounts[posture]++;
    /* A certificate counts under its public-key algorithm (RSA / ECDSA), never "X.509"; a secret
       has no algorithm, so it is grouped by what it is. */
    const alg = a.algorithm === '—' ? a.primitive : a.algorithm;
    const prev = byAlgorithm.get(alg);
    /* An algorithm's slice takes the WORST posture found under it — a name that is deprecated on
       one asset and fine on another is not a clean algorithm. */
    const RANK: CryptoPosture[] = ['exposed', 'deprecated', 'quantum', 'compliant'];
    const worstOf = (x: CryptoPosture, y: CryptoPosture) => RANK[Math.min(RANK.indexOf(x), RANK.indexOf(y))];
    byAlgorithm.set(alg, prev
      ? { n: prev.n + 1, posture: worstOf(prev.posture, posture) }
      : { n: 1, posture });
  }
  const cRanked = [...byAlgorithm.entries()].sort((a, b) => b[1].n - a[1].n);
  const cHead = cRanked.slice(0, TOP);
  const cTail = cRanked.slice(TOP).reduce((n, [, v]) => n + v.n, 0);
  const crypto: CryptoSlice[] = cHead.map(([algorithm, v]) => ({
    algorithm, count: v.n, pct: (v.n / Math.max(1, cryptoTotal)) * 100, posture: v.posture,
  }));
  /* "Other" takes the worst posture among what it folds in — not a blanket "compliant". */
  const tailPosture = cRanked.slice(TOP).map(([, v]) => v.posture)
    .reduce<CryptoPosture>((w, x) => (['exposed', 'deprecated', 'quantum', 'compliant'].indexOf(x) < ['exposed', 'deprecated', 'quantum', 'compliant'].indexOf(w) ? x : w), 'compliant');
  if (cTail > 0) crypto.push({ algorithm: 'Other', count: cTail, pct: (cTail / Math.max(1, cryptoTotal)) * 100, posture: tailPosture });

  // ── certificates and models, soonest first ────────────────────────────
  const certs = [...certByName.values()]
    .map((c) => ({ ...c, reach: certCis.get(c.name)?.size ?? 1 }))
    .sort((a, b) => a.days - b.days);
  const models = [...modelByName.values()]
    .map((m) => ({ ...m, reach: modelCis.get(m.name)?.size ?? 1 }))
    .sort((a, b) => a.days - b.days);
  /* Same shape as `vulnerableProducts`: the products running at least one model that is already past
     end-of-life, each CI counted once however many such models it hosts. */
  const eolModelProducts = new Set(
    models.filter((m) => m.past).flatMap((m) => [...(modelCis.get(m.name) ?? [])]),
  ).size;

  /* Where the BOMs come from. Counted over every product in scope — a queued agent product
     already has its source decided, it just has not reported yet. */
  /* Two flows only — Endpoint and Ingest. Full-machine scans are not supported. */
  const nApp = inScope.filter((p) => p.source === 'Agent').length;
  const nIngest = inScope.filter((p) => p.source === 'Ingest').length;
  const sources: BomSourceStat[] = ([
    { kind: 'agent-app', label: 'Endpoint · application folder', products: nApp, color: '#3D8BD0' },
    { kind: 'ingest', label: 'Ingest · uploaded SBOM', products: nIngest, color: '#8B5CF6' },
  ] as BomSourceStat[]).filter((x) => x.products > 0).sort((a, b) => b.products - a.products);

  CACHE = {
    productTotal: inScope.length,
    licenceSeats: BOM_LICENSE_SEATS,
    agentProducts: inScope.filter((p) => p.source === 'Agent').length,
    ingestProducts: nIngest,
    queuedProducts: inScope.length - withBom.length,
    bomProducts: withBom.length,
    declared,
    unique: uniques.length,
    fullDetail,
    fullDetailPct: uniques.length ? (fullDetail / uniques.length) * 100 : 0,

    cveIds,
    cveBySeverity,
    vulnerableProducts,
    leadVuln,

    affected,
    sharedProduct: affected.length
      ? (affected[0].products.find((p) => affected.every((a) => a.products.includes(p))) ?? null)
      : null,
    licences,
    components,
    licenceTotal,
    licenceCounts,
    crypto,
    cryptoTotal,
    cryptoCounts,

    /* All of them, soonest first. The panel is a timeline now, not a list: every certificate is a
       dot, so slicing to five would have drawn a picture of the estate with most of it missing. */
    certs,
    certBands: [
      { key: 'expired' as const, label: 'expired', count: certs.filter((c) => c.days < 0).length },
      { key: 'd30' as const, label: '≤ 30 days', count: certs.filter((c) => c.days >= 0 && c.days <= 30).length },
      { key: 'd120' as const, label: '31–120 days', count: certs.filter((c) => c.days > 30 && c.days <= 120).length },
      { key: 'd180' as const, label: '120–180 days', count: certs.filter((c) => c.days > 120 && c.days <= 180).length },
      /* Everything else, including the certificates with no published expiry — they are tracked,
         they are simply not a rotation this cycle. */
      { key: 'beyond' as const, label: 'beyond 180d', count: certTotal - certs.filter((c) => c.days <= 180).length },
    ],
    certsDueSoon: certs.filter((c) => c.days < 120).length,
    certTotal,
    certQuantumVulnerable: certQuantum,

    models: models.slice(0, 6),
    sources,
    eolChip: eolModelChip(models),
    modelTotal: modelNames.size,
    modelsNoEol: modelNames.size - modelsWithEol.size,
    allModels: [...allModels.values()].sort((a, b) => (a.days ?? Number.MAX_SAFE_INTEGER) - (b.days ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name)),
    modelsPastEol: models.filter((m) => m.past).length,
    modelsEolWithin6m: models.filter((m) => !m.past && m.days <= 180).length,
    eolModelProducts,
  };
  return CACHE;
};
