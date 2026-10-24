import { bomProducts, productsVersion } from './bomProductsData';
import { APP_AI, aiComponentByKey } from './aiBomCatalog';
import type { AiromComponent, AiromFinding, AiromKind, CdxType, FindingSeverity } from './aiBomCatalog';
import type { AiModel } from './bomData';

/* AI Components — the fleet's AI BOM, one row per ASSET rather than per host.
 *
 * The same relationship Software Components has to Configuration Items: the inventory answers
 * "what is on this CI", this answers "where does this asset run, and what is wrong with it".
 * Nothing here is typed in — every row is rolled up from the same `bomAiAssets` a CI's own AI BOM
 * shows, so the two can never disagree.
 *
 * It is wider than a model list on purpose. A model that is fine on its own still runs on a
 * framework with its own licence and its own end-of-life, and was trained on data with its own
 * provenance — so frameworks, runtimes and datasets are rows here too, told apart by `kind`.
 *
 * Three readings decide a row: can its origin be attested (provenance), what does its licence
 * cost you (licence risk), and is it still supported (lifecycle).
 */

/** What an AI component IS. The register calls this the COMPONENT TYPE — "kind" was a word this
 *  file invented, and the product already names its classifications (CI Type, Asset Type). */
/** Legacy kinds — the older AiModel shape still read by an application's AI BOM fallback. */
export type LegacyAiKind = 'hosted-llm' | 'local-model-file' | 'embedding-model' | 'framework'
  | 'vector-db' | 'prompt' | 'dataset' | 'infra' | 'rag-pipeline';
/** What an AI component IS — AIROM's own `airom:kind`. */
export type AiKind = AiromKind;
export type AiProvenance = 'Verified' | 'Unverified' | 'Internal';
export type AiRisk = 'LOW' | 'MEDIUM' | 'HIGH';


/* Today (local midnight) — the same clock as the dashboard's DASH_TODAY and the application Overview. */
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const daysTo = (eol?: string): number | null => {
  if (!eol) return null;
  const t = new Date(`${eol} 00:00:00`).getTime();
  return Number.isNaN(t) ? null : Math.round((t - TODAY.getTime()) / 86400000);
};

/** What a component IS, when the catalog does not say. Models are the unlabelled case, and an
 *  embedding model is one whether it runs locally or behind somebody's API. */
const kindOf = (m: AiModel): LegacyAiKind => {
  if (m.kind) return m.kind;
  if (m.task === 'Embeddings') return 'embedding-model';
  return m.source === 'Hosted API' ? 'hosted-llm' : 'local-model-file';
};

/** An unknown licence is HIGH: an unanswered licence question is a worse position to be in than a
 *  restrictive but known one, because you cannot even say what it forbids. */
const RESTRICTIVE = ['AGPL-3.0', 'GPL-3.0', 'GPL-2.0', 'SSPL-1.0'];
export const isRestrictive = (license: string) => RESTRICTIVE.includes(license);
const riskOf = (m: AiModel): AiRisk => {
  if (m.licenseRisk) return m.licenseRisk;
  if (m.license === 'Unknown' || /PII/.test(m.license)) return 'HIGH';
  if (isRestrictive(m.license)) return 'HIGH';
  if (/Commercial|API/.test(m.license)) return 'MEDIUM';
  return 'LOW';
};

/** A model nobody documented well enough to approve cannot be attested either — one fact, not two
 *  flags that could drift apart. */
const provenanceOf = (m: AiModel): AiProvenance => {
  if (m.provenance) return m.provenance;
  if (/In-house|Motadata/.test(m.provider)) return m.modelCard === false ? 'Unverified' : 'Internal';
  return m.modelCard === false ? 'Unverified' : 'Verified';
};

/** Stable, six digits, irregular — reads like a real register rather than a row number. */
const assetId = (name: string) => {
  let h = 2166136261;
  for (const ch of name) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return `AIC-${String((h >>> 0) % 1000000).padStart(6, '0')}`;
};

const KIND_RANK: Record<LegacyAiKind, number> = {
  'hosted-llm': 0, 'local-model-file': 1, 'embedding-model': 2, 'rag-pipeline': 3,
  prompt: 4, 'vector-db': 5, framework: 6, infra: 7, dataset: 8,
};

/** Everything the UI judges about ONE asset, derived in one place. The fleet register and a
 *  single CI's AI BOM both read this, so a component cannot be Verified on one screen and
 *  Unverified on the other. */
export const describeAiAsset = (m: AiModel) => {
  const eolDays = daysTo(m.eol);
  return {
    kind: kindOf(m),
    subtitle: m.subtitle ?? (m.modelCard === false ? 'Model · no model card' : m.task),
    version: m.version,
    licenseRisk: riskOf(m),
    provenance: provenanceOf(m),
    eolDays,
    eol: m.eol,
    /** Plain lifecycle wording, shared by the register, the panel and the drawer. */
    lifecycleLabel: eolDays === null ? 'Unknown'
      : eolDays < 0 ? `EOL ${Math.abs(eolDays)}d ago`
      : `EOL in ${eolDays}d`,
  };
};

/** Title-case name for a component type — the register's table shows the raw token, the panel
 *  and the drawer show it as a word. */
export const KIND_TITLE: Record<LegacyAiKind, string> = {
  'hosted-llm': 'Model', 'local-model-file': 'Model', 'embedding-model': 'Model',
  framework: 'Framework', 'vector-db': 'Vector-Db', prompt: 'Prompt',
  dataset: 'Dataset', infra: 'Infra', 'rag-pipeline': 'Pipeline',
};


/* ══════════════════════════════════════════════════════════════════════════
   AI Components register — one row per AI component found in the applications in BOM scope,
   built ONLY from what AIROM reports (aiBomCatalog.ts). No licence, provenance, model card or
   "used for": AIROM does not report them, so they are not shown as facts.
   ══════════════════════════════════════════════════════════════════════════ */
export interface AiAssetRow extends AiromComponent {
  /** Display id — stable, AIC-NNNNNN. The bom-ref is `ref`. */
  id: string;
  /** Applications whose AI BOM carries it, and the endpoints they are scanned on. */
  apps: number;
  endpoints: number;
  /** Data leaves the estate — a hosted model or AI service is called. */
  hosted: boolean;
  eolState: 'supported' | 'deprecated' | 'retired' | null;
  /** Days until the provider shuts it down; negative = already shut down. Null = no date. */
  eolDays: number | null;
  lifecycleLabel: string;
  cves: AiromFinding[];
  risks: AiromFinding[];
  worst: FindingSeverity | null;
  /** AIROM `scope: excluded` — found only in tests, fixtures or vendored code. Hidden from the
   *  register by default and never counted in its KPIs. */
  excluded: boolean;
}

export const SEV_RANK: Record<FindingSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const worstOf = (fs: AiromFinding[]) => fs.reduce<FindingSeverity | null>((w, f) => (!w || SEV_RANK[f.severity] > SEV_RANK[w] ? f.severity : w), null);

const toRow = (c: AiromComponent, apps: number, endpoints: number): AiAssetRow => {
  const eolDays = c.eol?.shutdown ? daysTo(c.eol.shutdown.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m) - 1]} ${d}, ${y}`)) : null;
  const findings = c.findings ?? [];
  const cves = findings.filter((f) => f.id.startsWith('CVE-'));
  const risks = findings.filter((f) => !f.id.startsWith('CVE-'));
  return {
    /* Keyed on the bom-ref (else purl), never the name: names repeat in a real AIROM BOM. */
    ...c, id: assetId(c.ref || c.purl || c.name), apps, endpoints,
    excluded: c.scope === 'excluded',
    hosted: c.kind === 'hosted-llm' || c.kind === 'service' || (c.kind === 'embedding-model' && ['openai', 'azure-openai', 'cohere', 'voyage'].includes(c.provider)),
    eolState: c.eol?.state ?? null,
    eolDays,
    lifecycleLabel: !c.eol ? 'Not tracked'
      : c.eol.state === 'supported' ? 'Supported'
      : c.eol.state === 'retired' ? `Retired${eolDays !== null ? ` ${Math.abs(eolDays)}d ago` : ''}`
      : `Deprecated${eolDays !== null ? (eolDays < 0 ? ` · shut down ${Math.abs(eolDays)}d ago` : ` · shuts down in ${eolDays}d`) : ''}`,
    cves, risks, worst: worstOf(findings),
  };
};

const KIND_ORDER: AiromKind[] = ['hosted-llm', 'embedding-model', 'local-model-file', 'service', 'rag-pipeline', 'prompt',
  'vector-db', 'framework', 'library', 'dataset', 'ai-config', 'infra'];

const build = (): AiAssetRow[] => {
  /* Rolled up by bom-ref — two same-named components (openai on PyPI and on npm) stay two rows. */
  const hits = new Map<string, { c: AiromComponent; apps: Set<string>; eps: Set<string> }>();
  for (const p of bomProducts()) {
    if (p.source !== 'Agent' || p.scanState === 'Queued') continue;
    for (const k of APP_AI[p.id] ?? []) {
      const c = aiComponentByKey(k);
      if (!c) continue;
      let h = hits.get(c.ref);
      if (!h) { h = { c, apps: new Set(), eps: new Set() }; hits.set(c.ref, h); }
      h.apps.add(p.id);
      if (p.agent) h.eps.add(p.agent.id);
    }
  }
  return [...hits.values()]
    .map((h) => toRow(h.c, h.apps.size, h.eps.size))
    /* Worst first: retired / deprecated, then by finding severity, then by kind. */
    .sort((a, b) => {
      const life = (r: AiAssetRow) => (r.eolState === 'retired' ? 0 : r.eolState === 'deprecated' ? 1 : 2);
      return life(a) - life(b) || (b.worst ? SEV_RANK[b.worst] : 0) - (a.worst ? SEV_RANK[a.worst] : 0)
        || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name);
    });
};

let CACHE: AiAssetRow[] | null = null;
let CACHE_V = -1;
/** The AI components across every application in BOM scope — rebuilt when the scope changes. */
export const aiAssets = (): AiAssetRow[] => {
  if (!CACHE || CACHE_V !== productsVersion()) { CACHE = build(); CACHE_V = productsVersion(); }
  return CACHE;
};

export const pastEol = (r: AiAssetRow) => r.eolState === 'retired' || (r.eolDays !== null && r.eolDays < 0);
export const eolSoon = (r: AiAssetRow) => r.eolState === 'deprecated' && !pastEol(r);

/** The three readings above the register, counted from the same rows it shows — AIROM's excluded
 *  components (tests, fixtures, vendored code) are never counted. */
export const aiSummary = () => {
  const rows = aiAssets().filter((r) => !r.excluded);
  const hosted = rows.filter((r) => r.hosted);
  const vulnerable = rows.filter((r) => r.cves.length || r.risks.length);
  return {
    total: rows.length,
    pastEol: rows.filter(pastEol).length,
    eolSoon: rows.filter(eolSoon).length,
    hosted: hosted.length,
    hostedProviders: [...new Set(hosted.map((r) => r.provider))],
    vulnerable: vulnerable.length,
    cveCount: rows.reduce((n, r) => n + r.cves.length, 0),
    riskCount: rows.reduce((n, r) => n + r.risks.length, 0),
  };
};

/** Display names for AIROM kinds. */
export const AI_KIND_TITLE: Record<AiromKind, string> = {
  'hosted-llm': 'Hosted LLM', 'embedding-model': 'Embedding model', 'local-model-file': 'Model file',
  framework: 'Framework', library: 'SDK / library', 'vector-db': 'Vector DB', prompt: 'Prompt', dataset: 'Dataset',
  'ai-config': 'AI config', infra: 'Infra', service: 'AI service', 'rag-pipeline': 'RAG pipeline',
};
export const CDX_TITLE: Record<CdxType, string> = {
  'machine-learning-model': 'machine-learning-model', data: 'data', framework: 'framework', library: 'library', application: 'application',
};

/** The highest fixed version across findings — the one upgrade that clears them all. */
const cmpVer = (a: string, b: string) => {
  const pa = a.split(/[.\-]/), pb = b.split(/[.\-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = parseInt(pa[i] ?? '0', 10), y = parseInt(pb[i] ?? '0', 10);
    if (!Number.isNaN(x) && !Number.isNaN(y) && x !== y) return x - y;
  }
  return 0;
};
export const highestFix = (fs: AiromFinding[]) =>
  fs.map((f) => f.fixedVersion).filter((v): v is string => !!v).sort(cmpVer).slice(-1)[0] ?? null;

/* Which identity fields AIROM fills for which kind — measured over aibom.json + this device's
   scans (see AiComponentDrawer). Shared by the register, the AI BOM grid and the detail rail so
   a column is filled for exactly the kinds that carry it, and reads "—" (not applicable) for the
   rest rather than looking like missing data on some rows of the same kind. */
const PROVIDER_KINDS: AiromKind[] = ['hosted-llm', 'embedding-model', 'local-model-file', 'framework', 'library', 'vector-db', 'service', 'infra'];
export const hasProvider = (k: AiromKind) => PROVIDER_KINDS.includes(k);
/** Model id for models (100%), version for frameworks / SDKs (100% on an installed scan). */
export const aiIdentity = (c: { kind: AiromKind; modelId?: string; version?: string }): string | undefined =>
  c.kind === 'hosted-llm' || c.kind === 'embedding-model' ? c.modelId
  : c.kind === 'framework' || c.kind === 'library' ? c.version
  : undefined;
export const hasIdentity = (k: AiromKind) => ['hosted-llm', 'embedding-model', 'framework', 'library'].includes(k);
