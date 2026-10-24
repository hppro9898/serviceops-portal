import type { BomType, IngestRow } from './bomData';

/* Reading an ingested BOM file in the browser (UI review, Oct 2026).
 *
 * The BOM TYPE is detected from the file's contents, never from the slot it was dropped on, so a
 * misfiled file is caught before ingest instead of landing under the wrong type. The generating
 * tool is the strongest signal, so it is read first:
 *   metadata.tools names trivy                                   → SBOM
 *   metadata.tools names cbomkit-theia                           → CBOM
 *   metadata.tools names airom                                   → AI BOM
 * and only then the components:
 *   CycloneDX with any `cryptographic-asset` component           → CBOM
 *   CycloneDX with `machine-learning-model` or `data` components → AI BOM
 *   CycloneDX whose components carry AIROM's `airom:kind`         → AI BOM
 *   any other CycloneDX, and every SPDX (JSON or tag-value)      → SBOM
 * Reading the tool first is what lets an EMPTY result through: a scan that found nothing (14 of the
 * 16 AIROM scans of one laptop) is a valid answer, not "an SBOM with 0 components". A file with no
 * components and no known tool is taken as the type of the slot it was put in.
 * ⚠️ These rules are the mock's; the backend has to confirm them (open question in the review).
 *
 * COUNTING — one rule per type, so the slot, the tab badge and the grids quote the same number:
 *   SBOM    packages only (library + operating-system), one per PURL. Trivy also lists every
 *           lock file it read as an `application` component, and repeats a package once per lock
 *           file that pulls it in — neither is a component.
 *   CBOM    distinct assets: a certificate once (by subject + expiry + key, wherever the bundle is
 *           copied), each key / secret where it was found, each algorithm once — and NOT the
 *           algorithm rows CBOMkit-theia emits for each certificate's signature and key.
 *   AI BOM  every AI component (models, datasets, frameworks, SDKs, vector DBs …), leaving out the
 *           ones AIROM itself marks `scope: excluded` (tests, fixtures, vendored code).
 *
 * Each slot then checks the format version: older CycloneDX cannot carry crypto or model data, so
 * a CBOM needs 1.6 and an AI BOM 1.5 — catching that at upload beats an empty BOM after ingest. */

export interface IngestSlot {
  type: BomType;
  /** Article for "This is an SBOM …" / "not a CBOM". */
  art: 'a' | 'an';
  what: string;
  fmt: string;
  one: string;
  many: string;
  minCdx: number;
}

export const INGEST_SLOTS: IngestSlot[] = [
  { type: 'SBOM', art: 'an', what: 'Software components and dependencies', fmt: 'SPDX 2.3 or CycloneDX 1.4–1.7', one: 'component', many: 'components', minCdx: 1.4 },
  { type: 'CBOM', art: 'a', what: 'Certificates, keys, secrets and algorithms', fmt: 'CycloneDX 1.6+', one: 'crypto asset', many: 'crypto assets', minCdx: 1.6 },
  { type: 'AI BOM', art: 'an', what: 'Models, datasets, AI frameworks and SDKs', fmt: 'CycloneDX 1.5+', one: 'AI component', many: 'AI components', minCdx: 1.5 },
];
export const slotOf = (t: BomType) => INGEST_SLOTS.find((s) => s.type === t)!;
export const unitOf = (t: BomType, n: number) => (n === 1 ? slotOf(t).one : slotOf(t).many);

/** Placeholder: the in-browser parse limit (open question in the review). */
export const MAX_INGEST_BYTES = 50 * 1024 * 1024;

export interface ParsedBom {
  kind: BomType; format: string; spec: number | null; count: number;
  /** The generating tool as the file names it — 'trivy 0.72.0', 'cbomkit-theia edge', 'airom 0.4.6'. */
  tool?: string;
  /** No components and no tool to tell the type by — the slot it was dropped on decides. */
  untyped?: boolean;
  /** Overrides the slot's unit. */
  unit?: string;
  /** The file's own rows, when it could be read component by component (JSON). */
  rows?: IngestRow[];
}

export type SlotState =
  | { status: 'empty' }
  | { status: 'reading'; file: string }
  | { status: 'ok'; file: string; format: string; count: number; rows?: IngestRow[]; unit?: string; tool?: string }
  /** `result` is kept when the file parsed but belongs in another slot — it is what Move uses. */
  | { status: 'error'; file: string; message: string; result?: ParsedBom };

const TOOL_KIND: [RegExp, BomType][] = [[/\btrivy\b/i, 'SBOM'], [/cbomkit/i, 'CBOM'], [/\bairom\b/i, 'AI BOM']];
/** `metadata.tools` — an array before CycloneDX 1.5, `{ components, services }` after. */
function toolOf(o: any): string | undefined {
  const t = o?.metadata?.tools;
  const list: any[] = Array.isArray(t) ? t : [...(Array.isArray(t?.components) ? t.components : []), ...(Array.isArray(t?.services) ? t.services : [])];
  const x = list.find((c) => c?.name);
  return x ? `${x.name}${x.version ? ` ${x.version}` : ''}` : undefined;
}
const kindOfTool = (tool?: string): BomType | null => (tool ? TOOL_KIND.find(([re]) => re.test(tool))?.[1] ?? null : null);

/** SBOM: packages only, one per PURL (name@version when there is none). */
function sbomRows(rows: IngestRow[]): IngestRow[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (r.type === 'application' || r.type === 'file') return false;
    const k = r.purl ?? `${r.name}@${r.version ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}
/** CBOM: distinct assets — see the counting note at the top. */
function cbomRows(rows: IngestRow[]): IngestRow[] {
  const linked = new Set(rows.flatMap((r) => r.crypto?.refs ?? []));
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (r.type !== 'cryptographic-asset') return false;
    const c = r.crypto ?? {};
    /* A certificate's signature algorithm and public key are part of the certificate, not assets of their own. */
    if (c.assetType !== 'certificate' && r.bomRef && linked.has(r.bomRef)) return false;
    const k = c.assetType === 'certificate' ? `cert|${r.name}|${c.notValidAfter ?? ''}|${c.algorithm ?? ''}|${c.keyBits ?? ''}`
      : c.assetType === 'algorithm' ? `alg|${r.name}`
      : `${c.assetType}|${c.materialType ?? ''}|${r.name}|${r.location ?? ''}|${r.line ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

function fromCdx(spec: string, types: (string | undefined)[], comps?: any[], tool?: string): ParsedBom {
  const base = { format: `CycloneDX ${spec}`, spec: parseFloat(spec), tool };
  const all = comps?.map(cdxRow);
  if (all) {
    const byRef = new Map(all.filter((r) => r.bomRef).map((r) => [r.bomRef!, r]));
    all.forEach((r) => resolveCryptoRefs(r, byRef));
  }
  const kind: BomType | null = kindOfTool(tool)
    ?? (types.some((t) => t === 'cryptographic-asset') ? 'CBOM'
      : types.some((t) => t === 'machine-learning-model' || t === 'data') ? 'AI BOM'
      : comps?.some((c) => Array.isArray(c?.properties) && c.properties.some((p: any) => p?.name === 'airom:kind')) ? 'AI BOM'
      : types.length ? 'SBOM' : null);
  /* Nothing in the file, and no tool to tell the type by: the slot decides (see validateFor). */
  if (!kind) return { ...base, kind: 'SBOM', count: 0, rows: [], untyped: true };
  if (kind === 'CBOM') {
    const rows = all ? cbomRows(all) : undefined;
    return { ...base, kind, count: rows?.length ?? types.filter((t) => t === 'cryptographic-asset').length, rows };
  }
  if (kind === 'AI BOM') {
    const n = all ? all.filter((r) => r.scope !== 'excluded').length : types.length;
    return { ...base, kind, count: n, rows: all };
  }
  const rows = all ? sbomRows(all) : undefined;
  return { ...base, kind, count: rows?.length ?? types.filter((t) => t !== 'application' && t !== 'file').length, rows };
}

/** Every licence the component declares — Trivy lists dual-licensed packages as several entries. */
const licenceOf = (c: any): string | undefined => {
  const ls: string[] = (Array.isArray(c?.licenses) ? c.licenses : [])
    .map((l: any) => l?.license?.id ?? l?.license?.name ?? l?.expression).filter(Boolean);
  return ls.length ? [...new Set(ls)].join(' OR ') : undefined;
};
/** One CycloneDX component → the fields the BOM tabs read. Missing fields stay missing. */
function cdxRow(c: any): IngestRow {
  const props: Record<string, string> = {};
  (Array.isArray(c?.properties) ? c.properties : []).forEach((p: any) => { if (p?.name && !(p.name in props)) props[p.name] = String(p.value ?? ''); });
  const cp = c?.cryptoProperties;
  const occ = c?.evidence?.occurrences?.[0];
  const alg = cp?.algorithmProperties, cert = cp?.certificateProperties, rcm = cp?.relatedCryptoMaterialProperties;
  /* parameterSetIdentifier is a KEY size only for ciphers and public-key schemes; on a hash or a
     signature it is the digest size ("1" for SHA1, "160" for SHA1-RSA), which is not a key length. */
  const keyFromParam: string | undefined = alg && ['block-cipher', 'stream-cipher', 'ae', 'pke', 'kem'].includes(alg.primitive) ? alg.parameterSetIdentifier : undefined;
  const pv = (k: string) => props[k] || undefined;
  const crypto: IngestRow['crypto'] = cp ? {
    assetType: cp.assetType,
    primitive: alg?.primitive ?? pv('crypto:primitive'),
    materialType: rcm?.type,
    keyBits: rcm?.size != null ? String(rcm.size) : keyFromParam ?? pv('crypto:keysize'),
    protocol: cp.protocolProperties ? `${cp.protocolProperties.type ?? ''} ${cp.protocolProperties.version ?? ''}`.trim() : undefined,
    oid: cp.oid,
    notValidBefore: cert?.notValidBefore,
    notValidAfter: cert?.notValidAfter,
    issuer: cert?.issuerName,
    refs: [cert?.signatureAlgorithmRef, cert?.subjectPublicKeyRef, rcm?.algorithmRef].filter(Boolean),
  } : pv('crypto:primitive') || pv('crypto:algorithm') ? {
    /* Property-style CBOMs (no cryptoProperties block) carry the same facts as `crypto:*` properties. */
    assetType: pv('crypto:assetType') ?? 'algorithm',
    primitive: pv('crypto:primitive'),
    keyBits: pv('crypto:keysize'),
    protocol: pv('crypto:protocol'),
  } : undefined;
  return {
    name: String(c?.name ?? 'unnamed'),
    version: c?.version ? String(c.version) : undefined,
    type: String(c?.type ?? 'library'),
    bomRef: c?.['bom-ref'] ? String(c['bom-ref']) : undefined,
    scope: c?.scope,
    purl: c?.purl,
    license: licenceOf(c),
    props,
    location: occ?.location ?? props['crypto:locations']?.split(/[,;]/)[0]?.trim() ?? undefined,
    line: typeof occ?.line === 'number' ? occ.line : undefined,
    description: c?.description,
    crypto,
  };
}
/** A certificate names its algorithm and key only by reference — follow the refs so the row reads
 *  "RSA · 2048 bit · signed SHA256-RSA" instead of "X.509". */
function resolveCryptoRefs(r: IngestRow, byRef: Map<string, IngestRow>) {
  const c = r.crypto;
  if (!c || !c.refs?.length) return;
  const refd = c.refs.map((x) => byRef.get(x)).filter(Boolean) as IngestRow[];
  if (c.assetType === 'certificate') {
    const key = refd.find((x) => x.crypto?.assetType === 'related-crypto-material');
    const sig = refd.find((x) => x.crypto?.assetType === 'algorithm');
    const keyAlg = key?.crypto?.refs?.map((x) => byRef.get(x)).find(Boolean);
    c.algorithm = (keyAlg?.name ?? key?.name)?.replace(/-\d+$/, '');
    c.keyBits = c.keyBits ?? key?.crypto?.keyBits;
    c.signature = sig?.name;
  } else if (c.assetType === 'related-crypto-material') {
    const a = refd.find((x) => x.crypto?.assetType === 'algorithm');
    if (a) c.algorithm = a.name.replace(/-\d+$/, '');
  }
}
/** One SPDX package → the same row shape. */
function spdxRow(p: any): IngestRow {
  const purl = (Array.isArray(p?.externalRefs) ? p.externalRefs : []).find((r: any) => r?.referenceType === 'purl')?.referenceLocator;
  const lic = [p?.licenseConcluded, p?.licenseDeclared].find((l) => l && l !== 'NOASSERTION' && l !== 'NONE');
  return { name: String(p?.name ?? 'unnamed'), version: p?.versionInfo, type: 'package', purl, license: lic };
}

/** Throws an Error whose message is the plain-language reason shown on the slot. */
export function parseBom(text: string): ParsedBom {
  const t = text.trim();
  if (!t) throw new Error('This file is empty.');
  if (t[0] === '{') {
    let o: any;
    try { o = JSON.parse(t); } catch { throw new Error("This JSON file has a syntax error, so it can't be read."); }
    if (o?.bomFormat === 'CycloneDX') {
      const comps: any[] = Array.isArray(o.components) ? o.components : [];
      return fromCdx(String(o.specVersion ?? ''), comps.map((c) => c?.type), comps, toolOf(o));
    }
    if (typeof o?.spdxVersion === 'string') {
      const pk: any[] = Array.isArray(o.packages) ? o.packages : [];
      const creators: string[] = Array.isArray(o.creationInfo?.creators) ? o.creationInfo.creators : [];
      const tool = creators.find((c) => /^Tool:/.test(c))?.replace(/^Tool:\s*/, '').replace(/-(\d)/, ' $1');
      /* Packages only: the scanned root, the OS and each lock file are SPDX packages too, but carry no PURL. */
      const rows = sbomRows(pk.map(spdxRow).filter((r) => r.purl));
      return { kind: 'SBOM', format: o.spdxVersion.replace('SPDX-', 'SPDX '), spec: null, count: rows.length, rows, tool };
    }
    throw new Error("This JSON file isn't SPDX or CycloneDX.");
  }
  if (t[0] === '<') {
    const m = t.match(/cyclonedx\.org\/schema\/bom\/(\d+(?:\.\d+)?)/);
    if (!m) throw new Error("This XML file isn't a CycloneDX BOM.");
    const types: string[] = [];
    const re = /<component\b[^>]*\btype="([^"]+)"/g;
    let x: RegExpExecArray | null;
    while ((x = re.exec(t))) types.push(x[1]);
    return fromCdx(m[1], types);
  }
  if (/^SPDXVersion:/m.test(t)) {
    const v = t.match(/^SPDXVersion:\s*(\S+)/m)?.[1] ?? 'SPDX';
    return { kind: 'SBOM', format: v.replace('SPDX-', 'SPDX '), spec: null, count: (t.match(/^PackageName:/gm) ?? []).length };
  }
  throw new Error("Couldn't read this file. Use SPDX or CycloneDX, as JSON or XML.");
}

/** Judge a parsed file against the slot it was put in. */
export function validateFor(type: BomType, r: ParsedBom, file: string): SlotState {
  const slot = slotOf(type);
  if (r.untyped) return { status: 'ok', file, format: r.format, count: 0, rows: [], tool: r.tool };
  if (r.kind !== type) {
    const k = slotOf(r.kind);
    return { status: 'error', file, result: r,
      message: `This is ${k.art} ${k.type} with ${r.count.toLocaleString()} ${r.unit ?? unitOf(r.kind, r.count)}, not ${slot.art} ${slot.type}.` };
  }
  if (r.spec != null && !isNaN(r.spec) && r.spec < slot.minCdx)
    return { status: 'error', file, message: `${slot.type} needs CycloneDX ${slot.minCdx} or later. This file is ${r.format}.` };
  /* An empty result of the right type is a valid scan — "AIROM found nothing" is an answer. */
  return { status: 'ok', file, format: r.format, count: r.count, rows: r.rows, unit: r.unit, tool: r.tool };
}

export async function readBomFile(type: BomType, file: File): Promise<SlotState> {
  if (file.size > MAX_INGEST_BYTES) return { status: 'error', file: file.name, message: "Files over 50 MB can't be read in the browser." };
  let text: string;
  try { text = await file.text(); } catch { return { status: 'error', file: file.name, message: "Couldn't open this file." }; }
  try { return validateFor(type, parseBom(text), file.name); }
  catch (e) { return { status: 'error', file: file.name, message: (e as Error).message }; }
}
