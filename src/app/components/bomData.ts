/* BOM module data — the Bill of Materials generated per endpoint (CI).
 *
 * A BOM is scoped to a PRODUCT on a host: every host has an implicit "OS / base platform"
 * scope (everything no other product claims) plus zero or more application products with
 * their own scan paths. Each (endpoint × product) carries three BOM types:
 *   SBOM   — software components (libraries, frameworks, applications)
 *   CBOM   — cryptographic assets (algorithms, keys, certificates)
 *   AI BOM — AI/ML models in use
 *
 * Everything here is mock but deterministic: the same endpoint id always produces the same
 * BOM, so the listing counts and the detail page never disagree.
 */

import { mockEndpoints } from './endpointsData';
import { aiComponentsFor, toAiModel } from './aiBomCatalog';
import { RETENTION_DEFAULT } from './bomAdminData';

export type BomType = 'SBOM' | 'CBOM' | 'AI BOM';

/* The BOM screens address a host by its CI id: Component Intelligence is a CMDB-level view, and
 * the Configuration Items listing already calls these rows "Agent CIs". The Patch/Endpoint modules
 * keep their own EP-### ids for the same machines — this is a display mapping for BOM screens
 * only, so the two never have to be renumbered against each other. */
/** Deterministic stream, so a host's graph is the same shape on every render. */
const seeded = (key: string) => {
  let h = 2166136261;
  for (const ch of key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
};

export const bomCiId = (endpointId: string): string => endpointId.replace(/^EP-/, 'CI-');
export type BomStatus = 'Success' | 'In Progress' | 'Failed';

/** Stable string hash — keeps generated data identical across renders.
 *  Exported: softwareBomData.ts (current-only Software Application catalog feature) reuses it. */
export const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// ---------------------------------------------------------------------------
// Component catalogs — realistic enterprise inventory, sliced deterministically.
// ---------------------------------------------------------------------------

export interface BomComponent {
  name: string;
  version: string;
  /** Trivy's CycloneDX types for a package: `library` for every language and OS package, and
   *  `operating-system` for the OS itself. It never emits "framework" or "application" for a
   *  package (its `application` nodes are the lock files, which are not components). */
  type: 'Library' | 'Operating-System';
  ecosystem: string;
  purl: string;
  license: string;
  /** Known vulnerable — drives the Findings count and the "Security only" filter. Ids resolve
   *  through `BOM_ADVISORIES`, which holds what Trivy's `vulnerabilities[]` says about each. */
  cves?: string[];
}

/* Exported: softwareBomData.ts (current-only Software Application catalog feature) reuses it.
 *
 * Every entry is something Trivy actually reports, under the PURL type it actually emits:
 * language packages from lock files and jars (maven / npm / pypi / golang / nuget) and OS
 * packages from the dpkg database (deb). Trivy has no `pkg:generic` and no "internal"
 * ecosystem, and it cannot see Windows desktop installs (Office, Acrobat …), so none appear. */
export const SBOM_CATALOG: BomComponent[] = [
  { name: 'openssl', version: '3.0.1', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/openssl@3.0.1', license: 'Apache-2.0', cves: ['CVE-2022-3602', 'CVE-2022-3786', 'CVE-2023-0286'] },
  { name: 'zlib', version: '1.2.11', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/zlib@1.2.11', license: 'Zlib', cves: ['CVE-2018-25032'] },
  { name: 'log4j-core', version: '2.14.1', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1', license: 'Apache-2.0', cves: ['CVE-2021-44228', 'CVE-2021-45046', 'CVE-2021-44832'] },
  { name: 'spring-core', version: '5.3.18', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/org.springframework/spring-core@5.3.18', license: 'Apache-2.0', cves: ['CVE-2022-22968', 'CVE-2022-22970'] },
  { name: 'jackson-databind', version: '2.12.3', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.12.3', license: 'Apache-2.0', cves: ['CVE-2022-42003', 'CVE-2022-42004', 'CVE-2020-36518'] },
  { name: 'commons-text', version: '1.9', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/org.apache.commons/commons-text@1.9', license: 'Apache-2.0', cves: ['CVE-2022-42889'] },
  { name: 'commons-collections', version: '3.2.1', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/commons-collections/commons-collections@3.2.1', license: 'Apache-2.0', cves: ['CVE-2015-6420'] },
  { name: 'lodash', version: '4.17.20', type: 'Library', ecosystem: 'Npm', purl: 'pkg:npm/lodash@4.17.20', license: 'MIT', cves: ['CVE-2021-23337', 'CVE-2020-28500'] },
  { name: 'node-forge', version: '1.2.1', type: 'Library', ecosystem: 'Npm', purl: 'pkg:npm/node-forge@1.2.1', license: 'BSD-3-Clause OR GPL-2.0', cves: ['CVE-2022-24771', 'CVE-2022-24772', 'CVE-2022-24773'] },
  { name: 'axios', version: '1.6.2', type: 'Library', ecosystem: 'Npm', purl: 'pkg:npm/axios@1.6.2', license: 'MIT' },
  { name: 'react', version: '18.3.1', type: 'Library', ecosystem: 'Npm', purl: 'pkg:npm/react@18.3.1', license: 'MIT' },
  { name: 'pycryptodome', version: '3.9.8', type: 'Library', ecosystem: 'PyPI', purl: 'pkg:pypi/pycryptodome@3.9.8', license: 'BSD-2-Clause' },
  { name: 'requests', version: '2.31.0', type: 'Library', ecosystem: 'PyPI', purl: 'pkg:pypi/requests@2.31.0', license: 'Apache-2.0' },
  { name: 'urllib3', version: '1.26.5', type: 'Library', ecosystem: 'PyPI', purl: 'pkg:pypi/urllib3@1.26.5', license: 'MIT', cves: ['CVE-2023-43804', 'CVE-2023-45803'] },
  { name: 'golang.org/x/crypto', version: '0.16.0', type: 'Library', ecosystem: 'Golang', purl: 'pkg:golang/golang.org/x/crypto@0.16.0', license: 'BSD-3-Clause', cves: ['CVE-2023-48795'] },
  { name: 'golang.org/x/net', version: '0.17.0', type: 'Library', ecosystem: 'Golang', purl: 'pkg:golang/golang.org/x/net@0.17.0', license: 'BSD-3-Clause' },
  { name: 'Microsoft.NETCore.App.Runtime', version: '6.0.21', type: 'Library', ecosystem: 'NuGet', purl: 'pkg:nuget/Microsoft.NETCore.App.Runtime@6.0.21', license: 'MIT' },
  { name: 'Newtonsoft.Json', version: '13.0.3', type: 'Library', ecosystem: 'NuGet', purl: 'pkg:nuget/Newtonsoft.Json@13.0.3', license: 'MIT' },
  { name: 'Serilog', version: '3.1.1', type: 'Library', ecosystem: 'NuGet', purl: 'pkg:nuget/Serilog@3.1.1', license: 'Apache-2.0' },
  { name: 'System.Text.Json', version: '8.0.4', type: 'Library', ecosystem: 'NuGet', purl: 'pkg:nuget/System.Text.Json@8.0.4', license: 'MIT' },
  { name: 'apache-poi', version: '5.2.3', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/org.apache.poi/poi@5.2.3', license: 'Apache-2.0' },
  { name: 'hibernate-core', version: '6.4.1', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/org.hibernate/hibernate-core@6.4.1', license: 'LGPL-2.1' },
  /* In-house jars are still Maven artefacts to Trivy — it reads the pom inside the jar. */
  { name: 'in.hdfc.auth-sdk', version: '1.4.2', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/in.hdfc/auth-sdk@1.4.2', license: 'Not declared' },
  { name: 'com.motadata.agent-core', version: '8.7.408', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/com.motadata/agent-core@8.7.408', license: 'Proprietary' },
  { name: 'com.motadata.telemetry', version: '3.2.19', type: 'Library', ecosystem: 'Maven', purl: 'pkg:maven/com.motadata/telemetry@3.2.19', license: 'Proprietary' },
  /* OS packages, from /var/lib/dpkg/status. Desktop software shows up here only when it was
     installed as a package (Chrome's and CrowdStrike's .deb do; a Windows install never does). */
  { name: 'ca-certificates', version: '20230311ubuntu0.22.04.1', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/ca-certificates@20230311ubuntu0.22.04.1', license: 'MPL-2.0' },
  { name: 'falcon-sensor', version: '7.14.0-18110', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/falcon-sensor@7.14.0-18110', license: 'Proprietary' },
  { name: 'google-chrome-stable', version: '138.0.7204.97-1', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/google-chrome-stable@138.0.7204.97-1', license: 'Not declared' },
  { name: 'firefox', version: '141.0.2', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/firefox@141.0.2', license: 'MPL-2.0' },
  { name: 'p7zip-full', version: '16.02', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/p7zip-full@16.02', license: 'LGPL-2.1' },
  { name: 'libxml2', version: '2.9.13', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/libxml2@2.9.13', license: 'MIT' },
  { name: 'libc6', version: '2.35', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/libc6@2.35', license: 'LGPL-2.1' },
  { name: 'nginx', version: '1.24.0', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/nginx@1.24.0', license: 'BSD-2-Clause' },
  { name: 'postgresql-15', version: '15.6', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/postgresql-15@15.6', license: 'PostgreSQL' },
  { name: 'redis-server', version: '7.2.4', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/redis-server@7.2.4', license: 'BSD-3-Clause' },
  { name: 'tomcat9', version: '9.0.85', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/tomcat9@9.0.85', license: 'Apache-2.0' },
  { name: 'openjdk-17-jre-headless', version: '17.0.10', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/openjdk-17-jre-headless@17.0.10', license: 'GPL-2.0-with-classpath-exception' },
  { name: 'python3.11', version: '3.11.8', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/python3.11@3.11.8', license: 'PSF-2.0' },
  { name: 'nodejs', version: '20.11.1', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/nodejs@20.11.1', license: 'MIT' },
  { name: 'libcurl4', version: '8.4.0', type: 'Library', ecosystem: 'Deb', purl: 'pkg:deb/ubuntu/libcurl4@8.4.0', license: 'curl', cves: ['CVE-2023-46218'] },
];

/* A CBOM asset, shaped by what CBOMkit-theia actually reports for a folder scan (validated against
 * a real theia run, Oct 2026): certificates (with issuer, validity, public-key algorithm and size,
 * signature algorithm — the last two followed through the certificate's refs), keys and secrets
 * found on disk (gitleaks rules, with file:line), and the odd standalone algorithm from a
 * java.security / openssl config. A folder scan does NOT report ciphers in use, TLS protocols,
 * Windows certificate stores or what a certificate is for — so nothing here claims them. */
export interface CryptoAsset {
  /** Certificate subject CN, key name, gitleaks rule id, or algorithm name — as theia names it. */
  name: string;
  primitive: 'Certificate' | 'Public key' | 'Private key' | 'Secret' | 'Token' | 'Key material'
    | 'Hash' | 'Signature' | 'Cipher' | 'Key agreement' | 'Public-key encryption' | 'MAC' | 'Protocol' | 'Algorithm';
  /** Public-key algorithm for a certificate or key (RSA, ECDSA); the algorithm itself otherwise; '—' for a secret. */
  algorithm: string;
  /** The KEY size. Never the digest size of a hash or signature. '—' when theia gives none (ECDSA). */
  keyLength: string;
  /** Certificate signature algorithm, e.g. SHA256-RSA. */
  signature?: string;
  issuer?: string;
  validFrom?: string | null;
  expiry: string | null;
  /** File the asset was found in, relative to the scan path. */
  location: string;
  /** Line in that file — secrets carry one. */
  line?: number;
  oid?: string;
  /** gitleaks rule description, for secrets. */
  description?: string;
  /** Only when an OpenSSL config declared one (rare in a folder scan). */
  protocol?: string;
  /** Post-quantum / hygiene posture — derived, see cryptoPosture(). */
  posture: 'Compliant' | 'Deprecated' | 'Quantum-vulnerable' | 'Exposed secret';
}

const DEPRECATED_RE = /\b(MD5|SHA-?1|3?DES|RC4)\b/i;
const QUANTUM_RE = /\b(RSA|ECDSA|ECDH|EdDSA|Ed25519|DSA|DH|X25519|EC|secp\d+r1|P-\d{3})\b/i;
/** Posture from the asset's real fields: a secret or private key sitting on disk is exposed
 *  whatever its algorithm; a SHA-1 / MD5 / DES / RC4 algorithm or certificate signature is
 *  deprecated; an RSA / ECC / DH public-key algorithm falls to a quantum computer; the rest pass.
 *  A certificate is judged by its public key and signature, never by the word "X.509". */
export const cryptoPosture = (a: Omit<CryptoAsset, 'posture'>): CryptoAsset['posture'] => {
  if (a.primitive === 'Secret' || a.primitive === 'Token' || a.primitive === 'Private key') return 'Exposed secret';
  const isAlgo = !['Certificate', 'Public key', 'Key material'].includes(a.primitive);
  const text = `${a.algorithm} ${a.signature ?? ''} ${isAlgo ? a.name : ''}`;
  if (DEPRECATED_RE.test(text)) return 'Deprecated';
  if (QUANTUM_RE.test(text)) return 'Quantum-vulnerable';
  return 'Compliant';
};
const cryptoAsset = (a: Omit<CryptoAsset, 'posture'>): CryptoAsset => ({ ...a, posture: cryptoPosture(a) });

/* 26 entries — NOT a multiple of 3, so `slice` (which steps by 3) never repeats an asset. Paths are
   relative to the application's scan path, as theia reports them. Expiries are fixed dates read
   against DASH_TODAY (17 Aug 2026), so the dashboard's countdown is repeatable. */
const CBOM_CATALOG: CryptoAsset[] = [
  cryptoAsset({ name: '*.paymentsweb.internal', primitive: 'Certificate', algorithm: 'RSA', keyLength: '3072 bit', signature: 'SHA256-RSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Mar 14, 2025', expiry: 'Mar 14, 2027', location: 'conf/ssl/paymentsweb.crt' }),
  cryptoAsset({ name: 'RSA-3072', primitive: 'Private key', algorithm: 'RSA', keyLength: '3072 bit', expiry: null, location: 'conf/ssl/paymentsweb.key' }),
  cryptoAsset({ name: 'generic-api-key', primitive: 'Secret', algorithm: '—', keyLength: '—', expiry: null, location: 'config/application.properties', line: 42, description: 'Detected a Generic API Key, potentially exposing access to various services and sensitive operations.' }),
  cryptoAsset({ name: 'db-replication', primitive: 'Certificate', algorithm: 'RSA', keyLength: '2048 bit', signature: 'SHA256-RSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Aug 30, 2024', expiry: 'Aug 30, 2026', location: 'conf/db/replication-client.pem' }),
  cryptoAsset({ name: 'SHA256', primitive: 'Hash', algorithm: 'SHA256', keyLength: '—', expiry: null, location: 'jre/conf/security/java.security', oid: '2.16.840.1.101.3.4.2.1' }),
  cryptoAsset({ name: 'partner-mtls-client', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA256-ECDSA', issuer: 'Partner Gateway CA', validFrom: 'Dec 01, 2025', expiry: 'Dec 01, 2026', location: 'conf/partners/mtls-client.crt' }),
  cryptoAsset({ name: 'jwt', primitive: 'Token', algorithm: '—', keyLength: '—', expiry: null, location: 'tests/fixtures/session.json', line: 7, description: 'Uncovered a JSON Web Token, which may lead to unauthorized access to web applications and sensitive user data.' }),
  cryptoAsset({ name: 'kafka-broker', primitive: 'Certificate', algorithm: 'RSA', keyLength: '2048 bit', signature: 'SHA256-RSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Apr 18, 2025', expiry: 'Apr 18, 2027', location: 'config/kafka/broker.crt' }),
  cryptoAsset({ name: 'ISRG Root X1', primitive: 'Certificate', algorithm: 'RSA', keyLength: '4096 bit', signature: 'SHA256-RSA', issuer: 'ISRG Root X1', validFrom: 'Jun 04, 2015', expiry: 'Jun 04, 2035', location: 'lib/python3.11/site-packages/certifi/cacert.pem' }),
  cryptoAsset({ name: 'code-signing-2026', primitive: 'Certificate', algorithm: 'RSA', keyLength: '4096 bit', signature: 'SHA384-RSA', issuer: 'DigiCert Trusted G4 Code Signing RSA4096 SHA384 2021 CA1', validFrom: 'Sep 02, 2025', expiry: 'Sep 02, 2026', location: 'build/signing/codesign.pem' }),
  cryptoAsset({ name: 'aws-access-token', primitive: 'Secret', algorithm: '—', keyLength: '—', expiry: null, location: 'scripts/backup.sh', line: 12, description: 'Identified a pattern that may indicate AWS credentials, risking unauthorized cloud resource access and data breaches on AWS platforms.' }),
  cryptoAsset({ name: 'connector-mtls-client', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA256-ECDSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Dec 03, 2025', expiry: 'Dec 03, 2026', location: 'conf/connectors/client.crt' }),
  cryptoAsset({ name: 'SHA1', primitive: 'Hash', algorithm: 'SHA1', keyLength: '—', expiry: null, location: 'jre/conf/security/java.security', oid: '1.3.14.3.2.26' }),
  cryptoAsset({ name: 'vpn-gateway', primitive: 'Certificate', algorithm: 'RSA', keyLength: '2048 bit', signature: 'SHA1-RSA', issuer: 'Legacy Enterprise Root CA', validFrom: 'Aug 19, 2023', expiry: 'Aug 19, 2026', location: 'conf/vpn/gateway.crt' }),
  cryptoAsset({ name: 'RSA-4096', primitive: 'Public key', algorithm: 'RSA', keyLength: '4096 bit', expiry: null, location: 'conf/jwt/public.pem' }),
  cryptoAsset({ name: 'sso-saml-signing', primitive: 'Certificate', algorithm: 'RSA', keyLength: '2048 bit', signature: 'SHA256-RSA', issuer: 'sso-saml-signing', validFrom: 'Aug 22, 2024', expiry: 'Aug 22, 2026', location: 'conf/saml/idp-signing.crt' }),
  cryptoAsset({ name: 'curl-auth-header', primitive: 'Secret', algorithm: '—', keyLength: '—', expiry: null, location: 'scripts/healthcheck.sh', line: 5, description: 'Discovered a potential authorization token provided in a curl command header, which could compromise the curl accessed resource.' }),
  cryptoAsset({ name: 'internal-ca-issuing', primitive: 'Certificate', algorithm: 'RSA', keyLength: '4096 bit', signature: 'SHA256-RSA', issuer: 'Bank Internal Root CA', validFrom: 'Sep 10, 2021', expiry: 'Sep 10, 2026', location: 'conf/ca/issuing-ca.pem' }),
  cryptoAsset({ name: 'payments-api', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA256-ECDSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Oct 05, 2025', expiry: 'Oct 05, 2026', location: 'conf/ssl/payments-api.crt' }),
  cryptoAsset({ name: 'MD5', primitive: 'Hash', algorithm: 'MD5', keyLength: '—', expiry: null, location: 'jre/conf/security/java.security', oid: '1.2.840.113549.2.5' }),
  cryptoAsset({ name: 'ldap-directory', primitive: 'Certificate', algorithm: 'RSA', keyLength: '3072 bit', signature: 'SHA1-RSA', issuer: 'Legacy Enterprise Root CA', validFrom: 'Dec 28, 2023', expiry: 'Dec 28, 2026', location: 'conf/ldap/ldaps.crt' }),
  cryptoAsset({ name: 'private-key', primitive: 'Secret', algorithm: '—', keyLength: '—', expiry: null, location: 'docs/setup.md', line: 88, description: 'Identified a Private Key, which may compromise cryptographic security and sensitive data encryption.' }),
  cryptoAsset({ name: 'mq-broker', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA384-ECDSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Jan 30, 2026', expiry: 'Jan 30, 2027', location: 'config/mq/broker.crt' }),
  cryptoAsset({ name: 'ingress-wildcard', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA256-ECDSA', issuer: 'Bank Internal Issuing CA 2', validFrom: 'Feb 14, 2026', expiry: 'Feb 14, 2027', location: 'deploy/ingress/tls.crt' }),
  cryptoAsset({ name: 'ECDSA', primitive: 'Private key', algorithm: 'ECDSA', keyLength: '—', expiry: null, location: 'deploy/ingress/tls.key' }),
  cryptoAsset({ name: 'device-enrolment-ca', primitive: 'Certificate', algorithm: 'ECDSA', keyLength: '—', signature: 'SHA384-ECDSA', issuer: 'Bank Internal Root CA', validFrom: 'Jun 20, 2024', expiry: 'Jun 20, 2027', location: 'conf/ca/enrolment-ca.pem' }),
];

export interface AiModel {
  /** AIROM bom-ref — the identity of an AI component (names repeat: openai on PyPI and on npm). */
  ref?: string;
  purl?: string;
  /** AIROM `scope: excluded` — found in tests, fixtures or vendored code; not counted. */
  excluded?: boolean;
  /** AIROM's lifecycle verdict (airom:eol.state), when it has one. */
  eolState?: 'supported' | 'deprecated' | 'retired';
  name: string;
  provider: string;
  version: string;
  task: string;
  license: string;
  parameters: string;
  source: 'Hosted API' | 'Local weights' | 'Embedded';
  usage: string;
  /** End-of-life date. A model past it receives no security fixes — that is the whole reason an
   *  AI BOM tracks lifecycle. `undefined` means the supplier publishes no EOL for it. */
  eol?: string;
  /** Whether the model ships a model card (provenance, training data, intended use). Absent on
   *  in-house models more often than on hosted ones, which is itself the finding. */
  modelCard?: boolean;
  /** Why this one carries extra risk beyond its age — e.g. a pickled artefact executes on load. */
  risk?: string;

  /* ── the wider AI BOM ────────────────────────────────────────────────
   * An AI Bill of Materials is not only the models. It is the frameworks that load them, the
   * runtime they execute on, and the data they were trained on — each with its own licence,
   * provenance and end-of-life. These fields describe that wider set; entries without a `kind`
   * are models, which is what `bomAiModels` and the dashboard still mean by the word. */
  kind?: 'hosted-llm' | 'local-model-file' | 'embedding-model' | 'framework' | 'vector-db'
    | 'prompt' | 'dataset' | 'infra' | 'rag-pipeline';
  /** The line under the name — what this asset IS, in the register's own words. */
  subtitle?: string;
  /** Whether the artefact's origin can be attested. Internal = ours, so there is nobody to verify
   *  it against; Unverified = came from somewhere with nothing to check it by. */
  provenance?: 'Verified' | 'Unverified' | 'Internal';
  /** How much the licence constrains what may be built on it. Unknown licences are HIGH: an
   *  unanswered licence question is a worse position than a restrictive but known one. */
  licenseRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
}

const AIBOM_CATALOG: AiModel[] = [
  { name: 'claude-sonnet-4-5', provider: 'Anthropic', version: '2025-09-29', task: 'Text generation', license: 'Commercial API', parameters: 'Undisclosed', source: 'Hosted API', usage: 'Ticket summarisation' },
  { name: 'text-embedding-3-large', provider: 'OpenAI', version: '3.0', task: 'Embeddings', license: 'Commercial API', parameters: 'Undisclosed', source: 'Hosted API', usage: 'Knowledge search index' },
  { name: 'all-MiniLM-L6-v2', provider: 'Sentence-Transformers', version: '2.2.2', task: 'Embeddings', license: 'Apache-2.0', parameters: '22.7 M', source: 'Local weights', usage: 'Duplicate-request detection' },
  { name: 'distilbert-base-uncased', provider: 'Hugging Face', version: '1.0', task: 'Classification', license: 'Apache-2.0', parameters: '66 M', source: 'Local weights', usage: 'Request category prediction' },
  { name: 'xgboost-anomaly', provider: 'Motadata', version: '4.1.2', task: 'Anomaly detection', license: 'Proprietary', parameters: '1.8 M', source: 'Embedded', usage: 'Endpoint behaviour scoring' },
  { name: 'whisper-small', provider: 'OpenAI', version: '1.0', task: 'Speech-to-text', license: 'MIT', parameters: '244 M', source: 'Local weights', usage: 'Call-log transcription' },
  { name: 'prophet-forecast', provider: 'Meta', version: '1.1.5', task: 'Forecasting', license: 'MIT', parameters: 'N/A', source: 'Embedded', usage: 'SLA breach prediction' },
  { name: 'yolov8n', provider: 'Ultralytics', version: '8.1.0', task: 'Object detection', license: 'AGPL-3.0', parameters: '3.2 M', source: 'Local weights', usage: 'Asset label recognition' },
  /* Models carrying a published lifecycle. Dates are fixed rather than relative so the dashboard
     reports the same thing on every run — see DASH_TODAY in bomDashboardData.ts. */
  { name: 'legacy-credit-scorer', provider: 'In-house ML platform', version: '0.9.4', task: 'Credit scoring', license: 'Proprietary', parameters: '4.1 M', source: 'Local weights', usage: 'Loan pre-approval', eol: 'Mar 31, 2026', modelCard: false },
  { name: 'logreg-baseline (retired)', provider: 'In-house ML platform', version: '0.2.0', task: 'Classification', license: 'Proprietary', parameters: '0.1 M', source: 'Local weights', usage: 'Baseline comparison', eol: 'Dec 31, 2025', modelCard: false },
  { name: 'legacy-scorer.pkl', provider: 'In-house (legacy)', version: '0.1.0', task: 'Credit scoring', license: 'Proprietary', parameters: 'Unknown', source: 'Local weights', usage: 'Nightly batch scoring', eol: 'Jun 30, 2025', modelCard: false, risk: 'pickle-import risk' },
  { name: 'gpt-4o (loan-assist API)', provider: 'OpenAI', version: '2024-08-06', task: 'Text generation', license: 'Commercial API', parameters: 'Undisclosed', source: 'Hosted API', usage: 'Loan assistant', eol: 'Nov 12, 2026', modelCard: false },
  { name: 'report-summariser', provider: 'OpenAI', version: '1.2', task: 'Summarisation', license: 'Commercial API', parameters: 'Undisclosed', source: 'Hosted API', usage: 'Report summaries', eol: 'Feb 13, 2027', modelCard: true },

  /* The stack around the models. A model that is fine on its own still runs on a framework with
     its own licence and its own end-of-life, and was trained on data with its own provenance —
     which is the whole argument for an AI BOM being wider than a model list. */
  { name: 'langchain', provider: 'OSS', version: '0.1.16', task: 'Orchestration', license: 'MIT', parameters: 'N/A', source: 'Embedded', usage: 'Agent orchestration', kind: 'framework', subtitle: 'ML framework', provenance: 'Verified', licenseRisk: 'LOW', eol: 'Jun 25, 2026' },
  { name: 'transformers', provider: 'OSS', version: '4.38.2', task: 'Model runtime', license: 'Apache-2.0', parameters: 'N/A', source: 'Embedded', usage: 'Local model loading', kind: 'framework', subtitle: 'ML framework', provenance: 'Verified', licenseRisk: 'LOW' },
  { name: 'scikit-learn', provider: 'OSS', version: '1.4.0', task: 'Classical ML', license: 'BSD-3-Clause', parameters: 'N/A', source: 'Embedded', usage: 'Feature pipelines', kind: 'framework', subtitle: 'ML framework', provenance: 'Verified', licenseRisk: 'LOW', eol: 'Jul 10, 2026' },
  { name: 'onnxruntime', provider: 'OSS', version: '1.17.0', task: 'Inference runtime', license: 'MIT', parameters: 'N/A', source: 'Embedded', usage: 'Model inference', kind: 'infra', subtitle: 'Inference runtime', provenance: 'Verified', licenseRisk: 'LOW', eol: 'Jan 25, 2026' },
  { name: 'torch', provider: 'OSS', version: '2.2.1', task: 'Model runtime', license: 'BSD-3-Clause', parameters: 'N/A', source: 'Embedded', usage: 'Tensor runtime', kind: 'infra', subtitle: 'Inference runtime', provenance: 'Verified', licenseRisk: 'LOW' },
  { name: 'interest-rate-predictor', provider: 'In-house ML platform', version: '0.8.0', task: 'Forecasting', license: 'Proprietary', parameters: '0.6 M', source: 'Local weights', usage: 'Rate forecasting', kind: 'local-model-file', subtitle: 'Model · no model card', provenance: 'Unverified', licenseRisk: 'LOW', modelCard: false },
  { name: 'aml-alerts-history', provider: 'In-house', version: '2023-2025', task: 'Training data', license: 'Proprietary · PII', parameters: 'N/A', source: 'Embedded', usage: 'Fraud model training', kind: 'dataset', subtitle: 'Training data', provenance: 'Internal', licenseRisk: 'HIGH' },
  { name: 'kyc-documents-sample', provider: 'In-house', version: '2024-Q4', task: 'Training data', license: 'Proprietary · PII', parameters: 'N/A', source: 'Embedded', usage: 'KYC model evaluation', kind: 'dataset', subtitle: 'Training data · PII', provenance: 'Internal', licenseRisk: 'HIGH' },
  { name: 'ticket-corpus-2025', provider: 'In-house', version: '2025', task: 'Training data', license: 'Unknown', parameters: 'N/A', source: 'Embedded', usage: 'Summariser fine-tuning', kind: 'dataset', subtitle: 'Training data', provenance: 'Unverified', licenseRisk: 'HIGH' },

  { name: 'pgvector', provider: 'OSS', version: '0.7.0', task: 'Vector store', license: 'PostgreSQL', parameters: 'N/A', source: 'Embedded', usage: 'Knowledge embeddings', kind: 'vector-db', subtitle: 'Vector store · embeddings at rest', provenance: 'Verified', licenseRisk: 'LOW' },
  { name: 'qdrant', provider: 'Qdrant', version: '1.9.0', task: 'Vector store', license: 'Apache-2.0', parameters: 'N/A', source: 'Embedded', usage: 'Similarity search', kind: 'vector-db', subtitle: 'Vector store · embeddings at rest', provenance: 'Verified', licenseRisk: 'LOW', eol: 'Apr 30, 2026' },
  { name: 'ticket-summary-prompt', provider: 'In-house', version: 'v3', task: 'Prompt template', license: 'Proprietary', parameters: 'N/A', source: 'Embedded', usage: 'Ticket summarisation', kind: 'prompt', subtitle: 'Prompt template · sends ticket text', provenance: 'Internal', licenseRisk: 'LOW' },
  { name: 'kyc-extraction-prompt', provider: 'In-house', version: 'v1', task: 'Prompt template', license: 'Proprietary · PII', parameters: 'N/A', source: 'Embedded', usage: 'Document field extraction', kind: 'prompt', subtitle: 'Prompt template · sends PII', provenance: 'Unverified', licenseRisk: 'HIGH' },
  { name: 'kb-search-rag', provider: 'In-house', version: '2.1', task: 'Retrieval pipeline', license: 'Proprietary', parameters: 'N/A', source: 'Embedded', usage: 'Knowledge-base answers', kind: 'rag-pipeline', subtitle: 'RAG pipeline · retrieval + generation', provenance: 'Internal', licenseRisk: 'LOW' },
  { name: 'loan-docs-rag', provider: 'In-house ML platform', version: '0.4', task: 'Retrieval pipeline', license: 'Proprietary', parameters: 'N/A', source: 'Embedded', usage: 'Loan document Q&A', kind: 'rag-pipeline', subtitle: 'RAG pipeline · no evaluation record', provenance: 'Unverified', licenseRisk: 'LOW' },
  { name: 'bge-small-en', provider: 'BAAI', version: '1.5', task: 'Embeddings', license: 'MIT', parameters: '33 M', source: 'Local weights', usage: 'Ticket similarity', kind: 'embedding-model', subtitle: 'Embedding model', provenance: 'Verified', licenseRisk: 'LOW' },
];

// ---------------------------------------------------------------------------
// Products — the scan scopes on a host.
// ---------------------------------------------------------------------------

export interface BomProduct {
  key: string;
  name: string;
  /** null for the implicit OS scope — it has no product version of its own. */
  version: string | null;
  path: string;
  source: string;
  status: 'Scanned' | 'Pending' | 'Failed';
  lastScan: string;
  findings: number;
  /** Paths skipped under THIS product's root — exclusions are per-product, not host-wide. */
  excludePaths: string[];
  /** The scope whose versions the BOM tab lands on. Exactly one product per host. */
  isDefault?: boolean;
  /** Declared by a person in Manage products, rather than found by the agent. The distinction is
   *  about who created the scope, not where its data comes from — a manually declared path is
   *  still scanned by the agent on its next check-in. */
  addedManually?: boolean;
}

export const OS_PRODUCT_KEY = 'os-base';

const APP_PRODUCTS: { key: string; name: string; version: string; path: string }[] = [
  { key: 'payments-web', name: 'Payments Web', version: '2.4.1', path: '/opt/payments' },
  { key: 'reporting-service', name: 'Reporting Service', version: '3.1.0', path: '/opt/reporting' },
  { key: 'claims-portal', name: 'Claims Portal', version: '5.2.0', path: 'C:\\inetpub\\claims' },
  { key: 'ledger-api', name: 'Ledger API', version: '1.8.3', path: '/srv/ledger' },
  { key: 'identity-broker', name: 'Identity Broker', version: '2.0.7', path: '/opt/identity' },
];

/* ── the many-products host ───────────────────────────────────────────────
 * A products PICKER is easy at three scopes and unusable at forty, so one host in the fleet is
 * an application server carrying 41 — the case the overview exists to handle. Everything about
 * it is behind this one constant: delete `MANY_PRODUCT_HOST` and the fleet is exactly as it was.
 *
 * Their component counts are deliberately SMALL (`smallScope`): forty scopes on one host means
 * forty narrow application roots, not forty platforms. Sizing them like the ordinary scopes would
 * have added ~6,000 components to a fleet of ~6,900 and roughly doubled every dashboard total for
 * a demo about a dropdown. */
export const MANY_PRODUCT_HOST = 'EP-408';

const MANY_PRODUCT_NAMES: { name: string; version: string; root: string }[] = [
  { name: 'Payments Web', version: '2.4.1', root: '/opt/payments' },
  { name: 'Claims Portal', version: '5.2.0', root: 'C:\\inetpub\\claims' },
  { name: 'Ledger API', version: '1.8.3', root: '/srv/ledger' },
  { name: 'Identity Broker', version: '2.0.7', root: '/opt/identity' },
  { name: 'Reporting Service', version: '3.1.0', root: '/opt/reporting' },
  { name: 'Settlement Engine', version: '4.6.2', root: '/srv/settlement' },
  { name: 'Card Tokeniser', version: '1.2.9', root: '/opt/tokeniser' },
  { name: 'Fraud Scoring', version: '2.9.4', root: '/opt/fraud' },
  { name: 'KYC Verifier', version: '3.3.1', root: '/srv/kyc' },
  { name: 'Statement Renderer', version: '1.7.0', root: '/opt/statements' },
  { name: 'Notification Hub', version: '5.0.3', root: '/srv/notify' },
  { name: 'Batch Scheduler', version: '2.2.8', root: '/opt/batch' },
  { name: 'Recon Service', version: '1.4.6', root: '/srv/recon' },
  { name: 'Mandate Manager', version: '3.0.1', root: '/opt/mandates' },
  { name: 'Dispute Workflow', version: '2.5.5', root: 'C:\\inetpub\\disputes' },
  { name: 'Merchant Onboarding', version: '4.1.2', root: '/opt/onboarding' },
  { name: 'Payout Router', version: '1.9.7', root: '/srv/payouts' },
  { name: 'FX Rate Service', version: '2.3.4', root: '/opt/fx' },
  { name: 'Limit Engine', version: '1.1.3', root: '/srv/limits' },
  { name: 'Audit Collector', version: '3.8.0', root: '/opt/audit' },
  { name: 'Document Vault', version: '2.7.2', root: '/srv/vault' },
  { name: 'Customer Portal', version: '6.0.4', root: 'C:\\inetpub\\portal' },
  { name: 'Agent Console', version: '4.4.9', root: 'C:\\inetpub\\console' },
  { name: 'Rules Authoring', version: '1.6.1', root: '/opt/rules' },
  { name: 'Ledger Archiver', version: '2.0.0', root: '/srv/archive' },
  { name: 'Sanctions Screening', version: '5.5.3', root: '/opt/sanctions' },
  { name: 'Chargeback Handler', version: '1.3.8', root: '/srv/chargeback' },
  { name: 'Interest Calculator', version: '2.8.1', root: '/opt/interest' },
  { name: 'Statement Mailer', version: '1.0.6', root: '/srv/mailer' },
  { name: 'Data Masking Proxy', version: '3.2.2', root: '/opt/masking' },
  { name: 'Session Broker', version: '2.1.5', root: '/srv/session' },
  { name: 'Config Distributor', version: '1.5.4', root: '/opt/configd' },
  { name: 'Health Prober', version: '4.0.9', root: '/srv/health' },
  { name: 'Metrics Shipper', version: '2.6.7', root: '/opt/metrics' },
  { name: 'Log Forwarder', version: '3.4.0', root: '/srv/logfwd' },
  { name: 'Backup Agent', version: '5.1.8', root: '/opt/backup' },
  { name: 'Certificate Rotator', version: '1.8.2', root: '/srv/certrot' },
  { name: 'Secrets Sidecar', version: '2.4.3', root: '/opt/secrets' },
  { name: 'Queue Bridge', version: '3.7.6', root: '/srv/queue' },
  { name: 'Legacy COBOL Gateway', version: '1.0.1', root: 'C:\\legacy\\gateway' },
];

/** Hand-declared scopes on the demo host — see MANY_PRODUCT_HOST. Two existing products are
 *  marked rather than new ones added, so no count anywhere else moves. */
const MANUALLY_ADDED = ['Legacy COBOL Gateway', 'Data Masking Proxy'];

const manyProducts = (endpointId: string): { key: string; name: string; version: string; path: string }[] =>
  MANY_PRODUCT_NAMES.map((p) => ({
    key: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: p.name, version: p.version, path: p.root,
  }));

/** True for a scope on the many-products host — see `MANY_PRODUCT_HOST` for why it is sized down. */
export const smallScope = (endpointId: string, productKey: string): boolean =>
  endpointId === MANY_PRODUCT_HOST && productKey !== OS_PRODUCT_KEY;

// Dates used across the module — kept as a fixed spread so the demo never drifts.
const SCAN_DATES = ['Jun 16, 2026', 'Jun 15, 2026', 'Jun 14, 2026', 'Jun 12, 2026', 'Jun 09, 2026', 'Jun 04, 2026'];

/* An APPLICATION's BOM history cannot start before the application was added to BOM scope. Each
   application registers the moment it was added; its scan dates are then spread between that
   moment and today (newest = index 0), so "first SBOM generated" always follows "added". Hosts
   that registered nothing keep the fixed SCAN_DATES. */
const SCOPE_START = new Map<string, Date>();
const SCOPE_END = new Date(2026, 9, 6, 18, 0);
export const registerScopeStart = (id: string, start: string | Date) => {
  const d = start instanceof Date ? start : new Date(start);
  if (!isNaN(d.getTime())) SCOPE_START.set(id, d);
};
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const scanDay = (endpointId: string, idx: number): string => {
  const start = SCOPE_START.get(endpointId);
  if (!start) return SCAN_DATES[idx];
  const first = start.getTime() + 864e5;                       // first scan: the day after it was added
  const span = Math.max(0, SCOPE_END.getTime() - first);
  const d = new Date(first + ((SCAN_DATES.length - 1 - idx) / (SCAN_DATES.length - 1)) * span);
  return `${MON3[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
};

/** The exclusions a new product starts with when the admin opts into the defaults — runtime
 *  noise that is never part of a Bill of Materials. */
export const DEFAULT_EXCLUDE_PATHS = [
  '**/logs', '**/temp', '**/cache', '**/node_modules', '**/*.log', '**/*.tmp', '**/.git',
];

/** Glob patterns a scan skips. Exclusions are configured per product, under its own root. */
const EXCLUDE_POOL = [
  '**/logs', '**/temp', '**/cache', '**/node_modules', '**/*.log', '**/*.tmp',
  'C:\\Windows\\Temp', 'C:\\pagefile.sys', '**/.git', '**/dist', '**/coverage', '**/vendor',
];

/** The exclude patterns configured on ONE product scope — deterministic per host + product. */
const productExcludePaths = (endpointId: string, productKey: string): string[] => {
  const h = hash(`${endpointId}:${productKey}:exclude`);
  const n = 2 + (h % 4); // 2-5 patterns per product
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = EXCLUDE_POOL[(h + i * 5) % EXCLUDE_POOL.length];
    if (!out.includes(p)) out.push(p);
  }
  return out;
};

// ---------------------------------------------------------------------------
// Per-endpoint BOM record — what the Configuration Items listing shows.
// ---------------------------------------------------------------------------

/** How the CI itself got into the inventory — separate from where its BOM content came from. */
export type BomOrigin = 'Agent' | 'Manual';

export interface BomRecord {
  endpointId: string;
  status: BomStatus;
  origin: BomOrigin;
  products: BomProduct[];
  /** Total SBOM components across every product on the host. */
  components: number;
  /** Vulnerable components found across the host. */
  findings: number;
  cryptoAssets: number;
  aiModels: number;
  lastGenerated: string | null;
}

/** How many components a given (endpoint, product, type) scope reports. */
/* ── Each application's AI BOM — from the AIROM-shaped catalog (aiBomCatalog.ts) ──────────────
   Keyed by the application (APS-N). Ingested SBOMs and queued scans have no AI BOM. */
const isAiModel = (m: AiModel) => !m.excluded && (!m.kind || m.kind === 'local-model-file' || m.kind === 'hosted-llm' || m.kind === 'embedding-model');
/** The AI BOM's unit everywhere — tab badge, listing, grids, panel, version cards: every AI
 *  component (models, datasets, frameworks, SDKs …) except what AIROM marked `scope: excluded`. */
const inAiScope = (m: AiModel) => !m.excluded;
/** APS-N without an AI BOM entry has NO AI BOM — never a generated one. */
const curatedAi = (id: string): AiModel[] | null => {
  const rows = INGEST_ROWS.get(id)?.['AI BOM'];
  if (rows?.length) return rows.map(rowToAiModel);   // an ingested AI BOM lists what its file holds
  if (INGEST_COUNTS.get(id)?.['AI BOM']) return null; // ingested, but its rows could not be read — sized by the count
  return aiComponentsFor(id)?.map(toAiModel) ?? (id.startsWith('APS-') ? [] : null);
};

/* An INGESTED application's BOM sizes come from the files that were uploaded (the parsed count),
   not from the generator. A type that was not uploaded has none. */
const INGEST_COUNTS = new Map<string, Partial<Record<BomType, number>>>();
export const registerIngestCounts = (id: string, counts: Partial<Record<BomType, number>>) => { INGEST_COUNTS.set(id, counts); };

/* ── An ingested file's own rows ──────────────────────────────────────────────
   When the upload could be read component by component (CycloneDX / SPDX JSON), its tabs list THOSE
   components — not generated samples — so "CycloneDX 1.5 · 3 components" on the upload slot is
   exactly what the SBOM tab shows. Known CVEs are matched from the catalog by exact name@version. */
export interface IngestRow {
  name: string;
  version?: string;
  /** The raw CycloneDX type, or 'package' for SPDX. */
  type: string;
  purl?: string;
  license?: string;
  /** AIROM-style properties (airom:kind, airom:model.provider …) — read by the AI BOM mapping. */
  props?: Record<string, string>;
  /** CycloneDX bom-ref — the only key that tells apart AIROM's same-named components. */
  bomRef?: string;
  /** CycloneDX scope — AIROM marks tests, fixtures and vendored code `excluded`. */
  scope?: string;
  /** First evidence / occurrence location, and its line when the tool gives one. */
  location?: string;
  line?: number;
  description?: string;
  crypto?: {
    assetType?: string;
    /** algorithmProperties.primitive (algorithms). */
    primitive?: string;
    /** relatedCryptoMaterialProperties.type — public-key, private-key, secret-key, token … */
    materialType?: string;
    /** Public-key algorithm of a certificate or key (followed through its refs), e.g. RSA, ECDSA. */
    algorithm?: string;
    /** Certificate signature algorithm, e.g. SHA256-RSA. */
    signature?: string;
    keyBits?: string;
    protocol?: string;
    oid?: string;
    issuer?: string;
    notValidBefore?: string;
    notValidAfter?: string;
    /** bom-refs this asset points at (signature / public key / algorithm). */
    refs?: string[];
  };
}
const INGEST_ROWS = new Map<string, Partial<Record<BomType, IngestRow[]>>>();
export const registerIngestRows = (id: string, rows: Partial<Record<BomType, IngestRow[]>>) => { INGEST_ROWS.set(id, rows); };

/* An entry added in THIS session has exactly one version — the one it arrived with — dated when it
   was added. Without this the generator gave a just-ingested file a v3, future scan dates and
   versions "deleted by retention". */
const FRESH = new Map<string, string>();
const FRESH_FORMAT = new Map<string, string>();
export const registerFresh = (id: string, stamp: string, formats: Partial<Record<BomType, string>> = {}) => {
  FRESH.set(id, stamp);
  Object.entries(formats).forEach(([t, f]) => FRESH_FORMAT.set(`${id}:${t}`, f!));
};

/* ── Ingesting a further BOM into an existing application ────────────────────
   An ingested application can take a NEW VERSION of a BOM type it already has, or a BOM type it
   did not have yet (the first CBOM / AI BOM after an SBOM-only ingest). Each upload appends a
   version to that type's history; nothing already there is rewritten. The versions shown before
   the first upload in this session (a seeded application's history, or a session-added entry's
   v1) are snapshotted as the BASE, so the new version is numbered after them and diffed against
   the inventory they ended on. One licence still covers the application, whatever it adds. */
interface PoolItem { name: string; version: string; ecosystem: string; cves?: string[]; purl?: string; license?: string; origin?: string; type: string;
  /** CBOM only — the asset itself, so a diff row shows crypto fields instead of SBOM ones. */
  crypto?: CryptoAsset }
export interface IngestUpload { file: string; format: string; count: number; rows?: IngestRow[]; tool?: string }
interface IngestVersion extends IngestUpload { at: string; by: string; pool: PoolItem[] | null }
const UPLOADS = new Map<string, IngestVersion[]>();          // `${id}:${type}`
const UPLOAD_BASE = new Map<string, { versions: BomVersion[]; pool: PoolItem[] }>();

/** Append uploaded versions to an ingested application. `existing` names the BOM types it already
 *  has, so a first CBOM does not reset the SBOM's count. */
export const addIngestVersions = (
  id: string, productKey: string, existing: BomType[], uploads: Partial<Record<BomType, IngestUpload>>, at: string, by: string,
): Partial<Record<BomType, number>> => {
  /* The other types keep their size: the counts registry is per application, so pin them first. */
  const counts = { ...(INGEST_COUNTS.get(id) ?? Object.fromEntries(existing.map((t) => [t, componentCount(id, productKey, t)]))) };
  const rows = { ...(INGEST_ROWS.get(id) ?? {}) };
  const out: Partial<Record<BomType, number>> = {};
  (Object.entries(uploads) as [BomType, IngestUpload][]).forEach(([t, u]) => {
    const k = `${id}:${t}`;
    if (!UPLOAD_BASE.has(k)) {
      const had = existing.includes(t);
      UPLOAD_BASE.set(k, { versions: had ? bomVersions(id, productKey, t) : [], pool: had ? diffPool(id, productKey, t) : [] });
    }
    counts[t] = u.count;
    if (u.rows?.length) rows[t] = u.rows; else delete rows[t];
    INGEST_COUNTS.set(id, counts); INGEST_ROWS.set(id, rows);
    const pool = u.rows?.length ? diffPool(id, productKey, t) : null;
    UPLOADS.set(k, [...(UPLOADS.get(k) ?? []), { ...u, at, by, pool }]);
    out[t] = bomVersions(id, productKey, t)[0]?.v;
  });
  return out;
};

/** The current inventory's signature — to refuse an upload identical to the current version. */
export const inventorySignature = (id: string, productKey: string, type: BomType): string =>
  diffPool(id, productKey, type).map((c) => `${c.name}@${c.version}`).sort().join('|');
export const rowsSignature = (type: BomType, rows: IngestRow[]): string =>
  (type === 'SBOM' ? rows.map(rowToComponent).map((c) => `${c.name}@${c.version}`)
    : type === 'CBOM' ? rows.map(rowToCrypto).map((c) => `${c.name}@${cryptoIdentity(c)}`)
    : rows.map(rowToAiModel).filter(inAiScope).map((m) => `${m.name}@${m.version}`)).sort().join('|');

/** The pool a version ended on, when it is known: the base's last, or an upload's own. */
const poolAt = (id: string, type: BomType, v: number): PoolItem[] | null | undefined => {
  const base = UPLOAD_BASE.get(`${id}:${type}`);
  if (!base) return undefined;
  const baseTop = base.versions.length ? Math.max(...base.versions.map((x) => x.v)) : 0;
  if (v <= baseTop) return base.pool;                    // older generated versions read as the base they led to
  return UPLOADS.get(`${id}:${type}`)?.[v - baseTop - 1]?.pool ?? null;
};
const uploadedDiff = (id: string, type: BomType, from: number, to: number): BomDiff | null => {
  const base = UPLOAD_BASE.get(`${id}:${type}`);
  if (!base) return null;
  const baseTop = base.versions.length ? Math.max(...base.versions.map((x) => x.v)) : 0;
  if (to <= baseTop) return null;                        // both inside the generated history
  const a = poolAt(id, type, from), b = poolAt(id, type, to);
  if (!a || !b) return null;                             // a count-only upload has no rows to diff
  return diffPools(a, b);
};

/** Versions for a type that has had uploads this session: the base, then one per upload. */
const uploadedVersions = (id: string, productKey: string, type: BomType): BomVersion[] | null => {
  const ups = UPLOADS.get(`${id}:${type}`);
  if (!ups?.length) return null;
  const base = UPLOAD_BASE.get(`${id}:${type}`)!;
  const baseTop = base.versions.length ? Math.max(...base.versions.map((x) => x.v)) : 0;
  const unit = type === 'SBOM' ? 'component' : type === 'CBOM' ? 'crypto asset' : 'model';
  const out: BomVersion[] = base.versions.map((v) => ({
    ...v, state: 'Superseded',
    expiresInDays: v.expiresInDays ?? RETENTION_DEFAULT.deleteAfterDays,
  }));
  let prev: PoolItem[] | null = base.pool;
  let prevCount = base.pool.length;
  ups.forEach((u, i) => {
    const v = baseTop + i + 1;
    const last = i === ups.length - 1;
    const d = prev && u.pool ? diffPools(prev, u.pool) : null;
    const added = d ? d.added.length : Math.max(0, u.count - prevCount);
    const removed = d ? d.removed.length : Math.max(0, prevCount - u.count);
    const updated = d ? d.updated.length : 0;
    const cves = d ? [...d.added, ...d.updated].reduce((n, e) => n + (e.cves?.length ?? 0), 0) : 0;
    const first = v === 1;
    out.unshift({
      v, generatedAt: u.at, state: last ? 'Current' : 'Superseded',
      expiresInDays: last ? null : RETENTION_DEFAULT.deleteAfterDays,
      added, removed, updated, cves,
      change: first ? `${type} ingested`
        : [added ? `+${added} ${unit}${added === 1 ? '' : 's'}` : null, updated ? `${updated} updated` : null, removed ? `${removed} removed` : null].filter(Boolean).join(' · ') || 'no change',
      format: u.format,
      runs: [{ timestamp: u.at, trigger: 'manual', duration: '0m 01s', result: 'Success', outcome: `${u.file} uploaded → v${v}` }],
      gapLabel: `Uploaded by ${u.by} · ${u.file}`,
    });
    prev = u.pool; prevCount = u.count;
  });
  void productKey;
  return out;
};

/* PURL type → the ecosystem label. Only types Trivy emits; it has no `pkg:generic`. */
const ECOSYSTEM: Record<string, string> = { maven: 'Maven', npm: 'Npm', pypi: 'PyPI', nuget: 'NuGet', golang: 'Golang', gem: 'RubyGems', cargo: 'Cargo', deb: 'Deb', rpm: 'RPM', apk: 'APK', composer: 'Composer' };
const SBOM_TYPE: Record<string, BomComponent['type']> = { 'operating-system': 'Operating-System' };
const rowToComponent = (r: IngestRow): BomComponent => {
  const known = SBOM_CATALOG.find((c) => c.name === r.name && c.version === r.version);
  /* A row without a PURL keeps none — inventing `pkg:generic/…` would claim an identity the
     file never gave (Trivy's OS node is the only package-like row without one). */
  const purl = r.purl ?? '';
  const eco = purl.match(/^pkg:([a-z]+)\//)?.[1];
  return {
    name: r.name,
    version: r.version ?? '—',
    type: SBOM_TYPE[r.type] ?? 'Library',
    ecosystem: eco ? ECOSYSTEM[eco] ?? eco : 'Not reported',
    purl,
    license: r.license ?? 'Not declared',
    cves: known?.cves,
  };
};
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PRIMITIVE: Record<string, CryptoAsset['primitive']> = {
  ae: 'Cipher', 'block-cipher': 'Cipher', 'stream-cipher': 'Cipher', hash: 'Hash', signature: 'Signature',
  'key-agree': 'Key agreement', kem: 'Key agreement', mac: 'MAC', pke: 'Public-key encryption',
};
const MATERIAL: Record<string, CryptoAsset['primitive']> = {
  'public-key': 'Public key', 'private-key': 'Private key', token: 'Token', 'secret-key': 'Secret',
};
const fmtCertDate = (iso?: string): string | null => {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(d.getTime()) ? `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}` : null;
};
/** One ingested CBOM row → a crypto asset, from the fields theia really fills (see bomIngestFile). */
const rowToCrypto = (r: IngestRow): CryptoAsset => {
  const c = r.crypto ?? {};
  const primitive: CryptoAsset['primitive'] =
    c.assetType === 'certificate' ? 'Certificate'
    : c.assetType === 'protocol' ? 'Protocol'
    : c.assetType === 'related-crypto-material'
      /* theia's secrets plugin reports gitleaks hits as material of type key / token / unknown,
         with the rule's description and the line — that is a secret, not key material. */
      ? MATERIAL[c.materialType ?? ''] ?? (r.description || r.line != null ? 'Secret' : 'Key material')
    : PRIMITIVE[c.primitive ?? ''] ?? 'Algorithm';
  const secret = primitive === 'Secret' || primitive === 'Token';
  const base: Omit<CryptoAsset, 'posture'> = {
    name: r.name,
    primitive,
    algorithm: secret ? '—'
      : c.algorithm ?? (primitive === 'Protocol' ? c.protocol ?? r.name : r.name.replace(/[-_ ]\d{3,5}$/, '')),   // RSA-2048 → RSA, but SHA-1 stays SHA-1
    keyLength: c.keyBits ? `${c.keyBits} bit` : '—',
    signature: c.signature,
    issuer: c.issuer,
    validFrom: fmtCertDate(c.notValidBefore),
    expiry: fmtCertDate(c.notValidAfter),
    location: r.location ?? '—',
    line: r.line,
    oid: c.oid,
    description: r.description,
    protocol: c.protocol,
  };
  return { ...base, posture: cryptoPosture(base) };
};
/** Where a crypto asset is: `file:line` when the tool gave a line. */
export const cryptoWhere = (a: CryptoAsset) => (a.line != null ? `${a.location}:${a.line}` : a.location);
/** What makes two crypto rows the SAME asset across versions. A certificate is its subject and
 *  expiry (a renewal is a new expiry), a key or secret is what was found where, an algorithm is
 *  its name. Name + key length (the old key) merged every ECDSA certificate theia reports. */
const cryptoIdentity = (a: CryptoAsset) =>
  a.primitive === 'Certificate' ? a.expiry ?? ''
    : ['Public key', 'Private key', 'Secret', 'Token', 'Key material'].includes(a.primitive) ? cryptoWhere(a)
      : '';
const AI_KINDS = ['hosted-llm', 'local-model-file', 'embedding-model', 'framework', 'vector-db', 'prompt', 'dataset', 'infra', 'rag-pipeline'] as const;
const rowToAiModel = (r: IngestRow): AiModel => {
  const p = r.props ?? {};
  const raw = p['airom:kind'] ?? (r.type === 'machine-learning-model' ? 'local-model-file' : r.type === 'data' ? 'dataset' : r.type === 'framework' || r.type === 'library' ? 'framework' : 'infra');
  const kind = (AI_KINDS as readonly string[]).includes(raw) ? raw as AiModel['kind'] : raw === 'library' ? 'framework' : raw === 'service' ? 'infra' : 'dataset';
  const eol = p['airom:eol.state'];
  return {
    ref: r.bomRef,
    purl: r.purl,
    excluded: r.scope === 'excluded',
    eolState: eol === 'supported' || eol === 'deprecated' || eol === 'retired' ? eol : undefined,
    name: r.name,
    provider: p['airom:model.provider'] ?? p['airom:provider'] ?? '—',
    version: r.version ?? p['airom:model.id'] ?? '—',
    task: raw,
    license: r.license ?? 'Not reported',
    parameters: '—',
    source: raw === 'hosted-llm' || raw === 'service' ? 'Hosted API' : raw === 'local-model-file' || raw === 'embedding-model' ? 'Local weights' : 'Embedded',
    usage: r.location ? `${r.location}${r.line != null ? `:${r.line}` : ''}` : '—',
    kind,
    subtitle: raw,
  };
};

export const componentCount = (endpointId: string, productKey: string, type: BomType): number => {
  const ingest = INGEST_COUNTS.get(endpointId);
  if (ingest) {
    /* AI components — the same unit the upload slot counted (excluded ones left out). */
    if (type === 'AI BOM' && INGEST_ROWS.get(endpointId)?.['AI BOM']?.length) return curatedAi(endpointId)!.filter(inAiScope).length;
    return INGEST_ROWS.get(endpointId)?.[type]?.length ?? ingest[type] ?? 0;
  }
  if (type === 'AI BOM' && curatedAi(endpointId)) return curatedAi(endpointId)!.filter(inAiScope).length;
  const h = hash(`${endpointId}:${productKey}:${type}`);
  // Forty narrow application roots on one host, not forty platforms — see MANY_PRODUCT_HOST.
  if (smallScope(endpointId, productKey)) return type === 'SBOM' ? 8 + (h % 34) : type === 'CBOM' ? h % 4 : h % 3;
  if (type === 'SBOM') return productKey === OS_PRODUCT_KEY ? 24 + (h % 190) : 42 + (h % 210);
  if (type === 'CBOM') return 3 + (h % 9);
  // AI BOM only exists where an application actually ships models.
  return productKey === OS_PRODUCT_KEY ? 0 : h % 6;
};

/** The BOM record for one endpoint — deterministic from its id. */
export const bomForEndpoint = (endpointId: string): BomRecord => {
  const h = hash(endpointId);
  // ~1 in 9 hosts has not produced a BOM yet; ~1 in 4 of the rest is mid-scan.
  const status: BomStatus = h % 9 === 0 ? 'Failed' : h % 4 === 0 ? 'In Progress' : 'Success';

  /* Origin and sources are the three states the product supports, and no others:
   *
   *   Agent   →  Agent                 the agent found the CI and scanned it
   *   Agent   →  Agent · Ingested      agent-discovered, plus a document ingested for one product
   *   Manual  →  Manually Ingested     the CI exists because someone ingested a BOM for it
   *
   * A CI with no BOM is always agent-discovered: a manual CI exists BECAUSE something was
   * ingested for it, so "Manual with nothing generated" is not a reachable state.
   * ~1 in 6 CIs is manual; ~1 in 3 of the agent ones carries an extra ingested document. */
  const origin: BomOrigin = status !== 'Failed' && hash(`${endpointId}:origin`) % 6 === 0 ? 'Manual' : 'Agent';
  const extraIngest = origin === 'Agent' && hash(`${endpointId}:ingest`) % 3 === 0;
  const agentSource = origin === 'Manual' ? 'manual · file upload' : 'agent · directory scan';

  // 0-2 application products — except the one application server, which carries forty.
  const many = endpointId === MANY_PRODUCT_HOST && status !== 'Failed';
  const pool = many ? manyProducts(endpointId) : APP_PRODUCTS;
  const appCount = status === 'Failed' ? 0 : many ? pool.length : h % 3;
  const products: BomProduct[] = [];
  for (let i = 0; i < appCount; i++) {
    const p = many ? pool[i] : pool[(h + i * 7) % pool.length];
    if (products.some((x) => x.key === p.key)) continue;
    products.push({
      ...p,
      /* The ingested document lands on the FIRST application scope, never on the OS one — so a
         CI in that state always shows both sources rather than only "Ingested". */
      source: extraIngest && i === 0 ? 'ingested · file upload' : agentSource,
      status: status === 'In Progress' && i === appCount - 1 ? 'Pending' : 'Scanned',
      lastScan: SCAN_DATES[(h + i) % SCAN_DATES.length],
      /* On the many-products host most scopes are clean and a handful are not — which is both
         realistic and the whole point: the overview has to make those few findable among forty. */
      findings: many
        ? (hash(`${endpointId}:${p.key}:find`) % 6 === 0 ? 1 + (hash(`${endpointId}:${p.key}:n`) % 3) : 0)
        : (hash(`${endpointId}:${p.key}:find`) % 5),
      addedManually: many && MANUALLY_ADDED.includes(p.name),
      excludePaths: productExcludePaths(endpointId, p.key),
    });
  }
  if (status !== 'Failed') {
    products.push({
      key: OS_PRODUCT_KEY,
      name: 'OS / base platform',
      version: null,
      path: '/',
      source: agentSource,
      status: 'Scanned',
      lastScan: SCAN_DATES[h % SCAN_DATES.length],
      findings: hash(`${endpointId}:${OS_PRODUCT_KEY}:find`) % 4,
      excludePaths: productExcludePaths(endpointId, OS_PRODUCT_KEY),
    });
  }
  // Exactly one scope is the default — the one the BOM tab lands on. The OS scope is the
  // sensible default since every host has it and it rolls up everything unclaimed.
  const def = products.find((p) => p.key === OS_PRODUCT_KEY) ?? products[0];
  if (def) def.isDefault = true;

  const components = products.reduce((n, p) => n + componentCount(endpointId, p.key, 'SBOM'), 0);
  const cryptoAssets = products.reduce((n, p) => n + componentCount(endpointId, p.key, 'CBOM'), 0);
  const aiModels = products.reduce((n, p) => n + componentCount(endpointId, p.key, 'AI BOM'), 0);
  const findings = products.reduce((n, p) => n + p.findings, 0);

  // Host-level "last generated" = the newest current version across every product scope, so the
  // listing can never claim a date the detail page's timeline does not show.
  const currentDates = products
    .map((p) => bomVersions(endpointId, p.key, 'SBOM').find((v) => v.state === 'Current'))
    .filter(Boolean)
    .map((v) => v!.generatedAt.split(' ').slice(0, 3).join(' '));
  const lastGenerated = currentDates.length
    ? currentDates.reduce((a, b) => (SCAN_DATES.indexOf(a) <= SCAN_DATES.indexOf(b) ? a : b))
    : null;

  return { endpointId, status, origin, products, components, findings, cryptoAssets, aiModels, lastGenerated };
};

/** Short labels for where a CI's BOM actually came from — the listing's "BOM Sources" column.
 *
 *  Derived from the `source` already on each product scope rather than stored separately, so the
 *  column cannot claim a source the CI's own scan-paths panel does not show. A CI with no BOM has
 *  no products and therefore no sources, which is why that cell reads "—" rather than "Agent". */
export const bomSourceLabels = (bom: BomRecord): string[] => {
  const out: string[] = [];
  for (const p of bom.products) {
    const label = p.source.startsWith('manual') ? 'Manually Ingested'
      : p.source.startsWith('ingested') ? 'Ingested'
      : 'Agent';
    if (!out.includes(label)) out.push(label);
  }
  /* Fixed order, not product order. The ingested document sits on an application scope and the
     agent scan on the OS one, which is stored second — so left to itself the pair rendered
     "Ingested · Agent", reading as though the ingest were the primary source. */
  const RANK = ['Agent', 'Ingested', 'Manually Ingested'];
  return out.sort((a, b) => RANK.indexOf(a) - RANK.indexOf(b));
};

/** BOM records for the whole fleet, in the Endpoints listing's order. */
export const bomInventory = (): BomRecord[] => mockEndpoints.map((e) => bomForEndpoint(e.id));

// ---------------------------------------------------------------------------
// Versions — a version only appears when a scan found a CHANGE.
// ---------------------------------------------------------------------------

export interface BomScanRun {
  timestamp: string;
  trigger: 'scheduled' | 'manual' | 'agent check-in';
  duration: string;
  result: 'Success' | 'Failed';
  outcome: string;
}

export interface BomVersion {
  v: number;
  generatedAt: string;
  state: 'Current' | 'Superseded';
  /** Human summary of what this version changed. */
  change: string;
  /** What this version changed vs the previous one — rendered as the card's finding dots.
   *  On v1 everything is "added", since the first scan discovers the whole inventory. */
  added: number;
  removed: number;
  updated: number;
  /** Known CVEs carried by what this version added or updated — the reason to read the change. */
  cves: number;
  format: string;
  /** Scan runs between this version and the previous one (newest first). */
  runs: BomScanRun[];
  /** Summary line rendered on the connector below the card. */
  gapLabel: string;
  /** Days until retention deletes this version. `null` on the current version, which is never
   *  aged out — a living SBOM always keeps its newest generation. */
  expiresInDays: number | null;
}

/* Retention is an ADMIN policy, so both screens read it from one place: change "delete versions
 * older than N days" under Admin › BOM Management › Retention and these expiry counts move with
 * it. Ages are measured against the newest scan date rather than the real clock, so the demo
 * never drifts into showing every version as long expired. */
const NEWEST_SCAN = new Date(2026, 5, 16); // Jun 16, 2026 — SCAN_DATES[0]

const parseScanDate = (s: string): Date | null => {
  const d = new Date(s.replace(/\s+\d{2}:\d{2}\s+[AP]M$/, ''));
  return isNaN(d.getTime()) ? null : d;
};

/** How many older versions retention has already removed for a scope, and the policy behind it. */
export const bomRetention = (endpointId: string, productKey: string, type: BomType) => {
  const { keepVersions, deleteAfterDays } = RETENTION_DEFAULT;
  // Deterministic per scope: some hosts have been enrolled long enough to have lost versions,
  // others have not.
  /* Nothing has been deleted from a history that started in this session — a fresh entry, or a
     type whose first file was ingested here (its base had no versions to age out). */
  const firstHere = UPLOAD_BASE.get(`${endpointId}:${type}`)?.versions.length === 0;
  const deleted = FRESH.has(endpointId) || firstHere ? 0 : hash(`${endpointId}:${productKey}:${type}:retained`) % 6;
  return { deleted, keepVersions, deleteAfterDays };
};

const TIMES = ['08:33 AM', '06:12 AM', '06:40 PM', '11:20 PM', '02:47 PM', '09:05 AM'];

/** The version history for one (endpoint, product, type) scope. */
/** What an endpoint scan writes, per BOM type — the scanner and the spec version it emits.
 *  Trivy 0.72 writes CycloneDX 1.7; CBOMkit-theia and AIROM write 1.6. An ingested file says
 *  its own (FRESH_FORMAT / the ingested record), so these apply to agent scans only. */
export const SCAN_FORMAT: Record<BomType, string> = { SBOM: 'CycloneDX 1.7', CBOM: 'CycloneDX 1.6', 'AI BOM': 'CycloneDX 1.6' };
export const SCAN_TOOL: Record<BomType, string> = { SBOM: 'Trivy 0.72.0', CBOM: 'CBOMkit-theia', 'AI BOM': 'AIROM 0.4.6' };

export const bomVersions = (endpointId: string, productKey: string, type: BomType): BomVersion[] => {
  const uploaded = uploadedVersions(endpointId, productKey, type);
  if (uploaded) return uploaded;
  const total = componentCount(endpointId, productKey, type);
  if (total === 0) return [];
  const h = hash(`${endpointId}:${productKey}:${type}:versions`);
  const fresh = FRESH.get(endpointId);
  if (fresh) {
    const ing = INGEST_COUNTS.has(endpointId);
    return [{
      v: 1, generatedAt: fresh, state: 'Current', expiresInDays: null,
      added: total, removed: 0, updated: 0,
      cves: type === 'SBOM' ? bomComponents(endpointId, productKey).reduce((n, c) => n + (c.cves?.length ?? 0), 0) : 0,
      change: ing ? `${type} ingested` : 'initial agent scan',
      format: FRESH_FORMAT.get(`${endpointId}:${type}`) ?? SCAN_FORMAT[type],
      runs: [{ timestamp: fresh, trigger: 'manual', duration: '0m 01s', result: 'Success', outcome: ing ? `${type} ingested` : `first ${type} generated` }],
      gapLabel: ing ? `${type} ingested` : `1 scan · initial agent scan, first ${type} generated`,
    }];
  }
  // Every scope carries three versions, with v3 as the current one.
  const count = 3;
  const out: BomVersion[] = [];
  for (let i = count; i >= 1; i--) {
    const vh = hash(`${endpointId}:${productKey}:${type}:v${i}`);
    const isFirst = i === 1;
    // Take the counts from the SAME diff the Compare screen renders, so the card summary, the
    // scan outcome and the diff can never contradict each other. The first scan discovers the
    // whole inventory, so everything in it counts as added.
    const d = isFirst ? null : bomDiff(endpointId, productKey, type, i - 1, i);
    const added = d ? d.added.length : total;
    const removed = d ? d.removed.length : 0;
    const updatedN = d ? d.updated.length : 0;
    // CVEs ride in on what a version added or updated. The first scan discovers the whole
    // inventory, so it carries every CVE already present on the host.
    const cves = d
      ? [...d.added, ...d.updated].reduce((n, e) => n + (e.cves?.length ?? 0), 0)
      : (type === 'SBOM' ? bomComponents(endpointId, productKey).reduce((n, c) => n + (c.cves?.length ?? 0), 0) : 0);
    const gapScans = isFirst ? 1 : 1 + (vh % 3);
    const noChange = Math.max(0, gapScans - 1);
    // SCAN_DATES runs newest → oldest, so a HIGHER version number must take a LOWER index.
    const dateIdx = Math.min(SCAN_DATES.length - 1, (count - i) + (h % 3));
    const runs: BomScanRun[] = [];
    for (let r = 0; r < gapScans; r++) {
      const rh = hash(`${endpointId}:${productKey}:${type}:v${i}:r${r}`);
      const failed = !isFirst && r === gapScans - 1 && rh % 5 === 0;
      runs.push({
        // Runs in this gap sit at or just before the version they produced (newest run first).
        timestamp: `${scanDay(endpointId, Math.min(SCAN_DATES.length - 1, dateIdx + r))} ${TIMES[(rh + r) % TIMES.length]}`,
        trigger: rh % 3 === 0 ? 'manual' : rh % 3 === 1 ? 'scheduled' : 'agent check-in',
        duration: `${1 + (rh % 3)}m ${String(rh % 60).padStart(2, '0')}s`,
        result: failed ? 'Failed' : 'Success',
        outcome: failed ? '—' : r === 0 ? (isFirst ? `first ${type} generated` : `+${added}${removed ? ` · −${removed}` : ''} → v${i}`) : 'no change',
      });
    }
    const generatedAt = runs[0].timestamp;
    const gen = parseScanDate(generatedAt);
    const ageDays = gen ? Math.max(0, Math.round(((SCOPE_START.has(endpointId) ? SCOPE_END : NEWEST_SCAN).getTime() - gen.getTime()) / 86_400_000)) : 0;
    out.push({
      v: i,
      // A version IS the output of its newest run, so it carries that run's timestamp.
      generatedAt,
      state: i === count ? 'Current' : 'Superseded',
      // The current version never expires; a superseded one is deleted once it passes the
      // retention window measured from when it was generated.
      expiresInDays: i === count ? null : Math.max(0, RETENTION_DEFAULT.deleteAfterDays - ageDays),
      added,
      removed,
      updated: updatedN,
      cves,
      change: isFirst
        ? 'initial agent scan'
        : [
            added ? `+${added} component${added === 1 ? '' : 's'}` : null,
            updatedN ? `${updatedN} updated` : null,
            removed ? `${removed} removed` : null,
          ].filter(Boolean).join(' · ') || 'metadata only',
      format: SCAN_FORMAT[type],
      runs,
      gapLabel: isFirst
        ? `1 scan · initial agent scan, first ${type} generated`
        : `${gapScans} scan${gapScans === 1 ? '' : 's'} between v${i - 1} and v${i}${noChange ? ` · ${noChange} found no change` : ''}`,
    });
  }
  return out;
};

// ---------------------------------------------------------------------------
// Component / crypto / model lists for one scope.
// ---------------------------------------------------------------------------

/** Deterministic slice of a catalog, capped at the catalog size (used where n never exceeds it). */
function slice<T>(catalog: T[], seed: number, n: number): T[] {
  const take = Math.min(n, catalog.length);
  return Array.from({ length: take }, (_, i) => catalog[(seed + i * 3) % catalog.length]);
}

/** Nudge a semver-ish string by `round`, so a repeated component reads as a different build. */
const variant = (v: string, round: number): string => {
  const parts = v.split('.');
  const last = parts.length - 1;
  const n = parseInt(parts[last].replace(/\D/g, ''), 10);
  if (isNaN(n)) return `${v}-${round}`;
  parts[last] = parts[last].replace(/\d+/, String(n + round));
  return parts.join('.');
};

/* A real host carries far more components than any hand-written catalog: hundreds of transitive
 * dependencies, and commonly several BUILDS of the same library side by side. So the catalog is
 * cycled to reach the reported count, bumping the version (and its PURL) on each pass — which is
 * what a large SBOM genuinely looks like, and keeps the count and the list in agreement. */
/** How common a component is across an estate, 0–100.
 *
 *  Reach is a property of the COMPONENT, not of the host: openssl is on nearly everything, an
 *  internal auth SDK is on a handful of app servers. Without this the generator had no basis on
 *  which to include one component and not another. */
const PREVALENCE: Record<string, number> = {
  // ubiquitous runtime and transport
  openssl: 94, zlib: 92, libcurl4: 88, 'Microsoft.NETCore.App.Runtime': 74, 'openjdk-17-jre-headless': 62,
  'python3.11': 58, nodejs: 52,
  // fleet-wide agents and host packages
  'falcon-sensor': 86, 'com.motadata.agent-core': 84, 'com.motadata.telemetry': 78,
  'google-chrome-stable': 80, 'p7zip-full': 66, libxml2: 60, firefox: 44,
  libc6: 56, 'ca-certificates': 34,
  // common libraries
  'Newtonsoft.Json': 64, 'System.Text.Json': 58, lodash: 62, axios: 46, react: 38,
  requests: 50, urllib3: 54, 'golang.org/x/net': 36, 'golang.org/x/crypto': 34,
  'node-forge': 24, pycryptodome: 22, Serilog: 30,
  // server-side, present only where that role runs
  nginx: 30, 'postgresql-15': 24, 'redis-server': 22, tomcat9: 28, 'apache-poi': 20,
  'hibernate-core': 18, 'spring-core': 32,
  // the vulnerable set — deliberately spread so exposure differs row to row
  'log4j-core': 48, 'jackson-databind': 40, 'commons-text': 26, 'commons-collections': 20,
  'in.hdfc.auth-sdk': 12,
};
const prevalenceOf = (name: string) => PREVALENCE[name] ?? 30;
/* Software that lives on the MACHINE, not inside an application's folder — endpoint agents and
   desktop apps. An application BOM (scan of one application folder, or a vendor's SBOM) never
   carries these; only a host-level scope does. */
const HOST_LEVEL = new Set(['falcon-sensor', 'com.motadata.agent-core', 'com.motadata.telemetry',
  'google-chrome-stable', 'p7zip-full', 'libxml2', 'firefox', 'libc6', 'ca-certificates']);
/** BOM-scope applications are keyed APS-N; everything else is a host. */
const isAppScope = (id: string) => id.startsWith('APS-');

/* OS packages follow the host's OS. Trivy reads them from the host's package database — dpkg on
   Debian/Ubuntu, rpm on RHEL-family — and cannot read Windows or macOS installs at all. The
   catalogue holds them as Deb; on an RPM host they are reported under their RPM name, an .elN
   release and a pkg:rpm PURL; on Windows/macOS they are not reported. A scope with no known host
   (an ingested SBOM) keeps what its document says. */
const SCOPE_OS = new Map<string, string>();
/** The OS of the machine an application scope was scanned on — registered by bomProductsData. */
export const registerScopeOs = (id: string, os: string | null) => { if (os) SCOPE_OS.set(id, os); else SCOPE_OS.delete(id); };
type PkgDb = 'deb' | 'rpm' | 'none';
const pkgDbOf = (os: string | null): PkgDb | null =>
  !os ? null : /windows|mac\s?os|darwin/i.test(os) ? 'none'
    : /red hat|rhel|oracle linux|centos|rocky|alma|fedora|suse/i.test(os) ? 'rpm' : 'deb';
const RPM_NAME: Record<string, string> = {
  libcurl4: 'libcurl', libc6: 'glibc', 'postgresql-15': 'postgresql', 'redis-server': 'redis', tomcat9: 'tomcat',
  'openjdk-17-jre-headless': 'java-17-openjdk-headless', 'p7zip-full': 'p7zip',
};
const asRpm = (c: BomComponent, os: string): BomComponent => {
  const el = os.match(/\b(\d+)\./)?.[1] ?? '9';
  const vendor = /oracle/i.test(os) ? 'oracle' : 'redhat';
  const name = RPM_NAME[c.name] ?? c.name;
  const version = `${c.version.replace(/ubuntu.*$/, '')}-${1 + (hash(`${name}@${c.version}:el${el}`) % 40)}.el${el}`;
  return { ...c, name, version, ecosystem: 'RPM', purl: `pkg:rpm/${vendor}/${name}@${version}?distro=${vendor === 'oracle' ? 'ol' : 'rhel'}-${el}` };
};

export const bomComponents = (endpointId: string, productKey: string): BomComponent[] => {
  const ingestedRows = INGEST_ROWS.get(endpointId)?.SBOM;
  if (ingestedRows?.length) return ingestedRows.map(rowToComponent);
  const total = componentCount(endpointId, productKey, 'SBOM');
  const seed = hash(`${endpointId}:${productKey}:sbom`);
  const ep = mockEndpoints.find((e) => e.id === endpointId);
  const withOs = productKey === OS_PRODUCT_KEY && !!ep;
  const hostOs = ep?.osName ?? SCOPE_OS.get(endpointId) ?? null;
  const pkgDb = pkgDbOf(hostOs);
  const n = withOs ? Math.max(0, total - 1) : total; // the OS row counts toward the total

  /* WHICH components this scope carries.
   *
   * This used to be a contiguous walk of the catalog from a seed offset, wrapping. A scope
   * declares 24–251 components and the catalog holds 40, so every scope wrapped several times
   * and therefore contained EVERY component — membership was not a choice, and every component
   * had the same reach. A ranked exposure list built on that has nothing to rank.
   *
   * Now the catalog is ranked per scope by a deterministic key biased by prevalence, and only the
   * head of that ranking is carried. A common library wins the draw on most hosts, a niche one on
   * few, and reach varies the way it does in a real estate. The COUNT is unchanged — the extra
   * slots are further versions of the components this scope does carry, which is also truer:
   * hosts run several versions of the same library. */
  const ranked = SBOM_CATALOG
    .filter((c) => !isAppScope(endpointId) || !HOST_LEVEL.has(c.name))
    .filter((c) => c.ecosystem !== 'Deb' || pkgDb !== 'none')
    .map((c) => ({ c, k: (hash(`${endpointId}:${productKey}:${c.name}`) % 1000) / 10 - prevalenceOf(c.name) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.c);
  /* 8–18 distinct names per scope, chosen by a sweep rather than by feel. The value trades two
     things off: a SMALL head is what lets prevalence select (a large one hands the scope the whole
     catalog again and every component's reach collapses back to identical), while a small head
     also forces more version rounds to reach the declared count. Measured across the fleet:
        6–14  → reach 23,23,20,20,19,18,18,17 but up to 38 versions of one library
        8–18  → reach 25,25,24,23,21,20,20,20 and up to 22          <- chosen
       10–24  → reach 25,24,24,23,22,22,21,21, flatter at the top
     The residual — a library appearing at up to 22 versions on one host — is a fixture limit, not
     a rendering one: `componentCount` declares up to 251 components per scope and SBOM_CATALOG
     holds 40 names, so SOMETHING has to repeat. Growing the catalog is the real fix. */
  const distinct = Math.min(ranked.length, 8 + (seed % 11));
  const picked = ranked.slice(0, distinct);

  const list: BomComponent[] = [];
  for (let i = 0; i < n; i++) {
    const base = picked[i % distinct];
    const round = Math.floor(i / distinct);
    if (round === 0) { list.push(base); continue; }
    const version = variant(base.version, round);
    /* A LATER build of the same component, and it does not inherit the advisory. An advisory
       applies to a version range; spreading `base` carried its `cves` onto every generated
       version, so one library reported the same CVE at nine different versions — including the
       ones that would be the fix. The catalogue's version is the one that carries the finding. */
    const { cves: _fixed, ...clean } = base;
    list.push({ ...clean, version, purl: base.purl.replace(/@[^@]*$/, `@${version}`) });
  }

  if (pkgDb === 'rpm' && hostOs) list.forEach((c, i) => { if (c.ecosystem === 'Deb') list[i] = asRpm(c, hostOs); });

  // The OS scope also reports the host OS itself, as the first component.
  if (withOs && ep) {
    list.unshift({
      name: ep.osName,
      version: ep.version ?? '—',
      type: 'Operating-System',
      /* Trivy's OS node carries a name and version but no PURL and no licence. */
      ecosystem: 'Operating System',
      purl: '',
      license: 'Not declared',
    });
  }
  return list;
};

export const bomCryptoAssets = (endpointId: string, productKey: string): CryptoAsset[] =>
  INGEST_ROWS.get(endpointId)?.CBOM?.length ? INGEST_ROWS.get(endpointId)!.CBOM!.map(rowToCrypto) : slice(CBOM_CATALOG, hash(`${endpointId}:${productKey}:cbom`), componentCount(endpointId, productKey, 'CBOM'));

/** MODELS only — what the dashboard and a CI's AI BOM tab mean by the word. Frameworks, runtimes
 *  and datasets are AI assets but not models, and folding them in here would have turned the
 *  dashboard's "3 of 13 models past EOL" into a different claim without anyone saying so. */
export const bomAiModels = (endpointId: string, productKey: string): AiModel[] =>
  curatedAi(endpointId)?.filter(isAiModel) ?? slice(AIBOM_CATALOG.filter((m) => !m.kind || m.kind === 'local-model-file' || m.kind === 'hosted-llm'),
    hash(`${endpointId}:${productKey}:aibom`), componentCount(endpointId, productKey, 'AI BOM'));

/** The WHOLE AI bill of materials for a scope — models plus the stack around them. Includes what
 *  AIROM marked `excluded` (each carries `excluded: true`); use `bomAiInScope` for what counts. */
export const bomAiAssets = (endpointId: string, productKey: string): AiModel[] =>
  curatedAi(endpointId) ?? slice(AIBOM_CATALOG, hash(`${endpointId}:${productKey}:aibom`),
    Math.min(AIBOM_CATALOG.length, componentCount(endpointId, productKey, 'AI BOM')));
/** The AI components that COUNT — the list behind every AI BOM number (badge, listing, grids,
 *  version cards). Same length as componentCount(…, 'AI BOM'). */
export const bomAiInScope = (endpointId: string, productKey: string): AiModel[] =>
  bomAiAssets(endpointId, productKey).filter(inAiScope);

// ---------------------------------------------------------------------------
// Version diff — powers the Compare versions modal.
// ---------------------------------------------------------------------------

export interface BomDiffEntry {
  kind: 'Added' | 'Updated' | 'Removed' | 'Unchanged';
  name: string;
  ecosystem: string;
  version: string;
  /** Previous version — only on Updated rows. */
  fromVersion?: string;
  /** patch / minor / major — only on Updated rows. */
  bump?: 'patch' | 'minor' | 'major';
  cves?: string[];
  /** Carried through from the component so a diff row can show its full identity. */
  purl?: string;
  license?: string;
  origin?: string;
  componentType?: string;
  /** CBOM only — the crypto asset behind the row (its `version` is the asset's identity, not a version). */
  crypto?: CryptoAsset;
}

export interface BomDiff {
  added: BomDiffEntry[];
  updated: BomDiffEntry[];
  removed: BomDiffEntry[];
  /** Everything the two versions have in common, so a comparison can list it, not just count it. */
  unchangedEntries: BomDiffEntry[];
  unchanged: number;
}

const bumpVersion = (v: string, kind: 'patch' | 'minor' | 'major'): string => {
  const parts = v.split('.');
  const idx = kind === 'major' ? 0 : kind === 'minor' ? 1 : 2;
  while (parts.length <= idx) parts.push('0');
  const n = parseInt(parts[idx].replace(/\D/g, ''), 10);
  parts[idx] = String((isNaN(n) ? 0 : n) + 1);
  for (let i = idx + 1; i < parts.length; i++) parts[i] = '0';
  return parts.join('.');
};

/** The diff between two versions of one scope. */
/** One scope's CURRENT inventory as diff identities — what a version is compared on. */
const diffPool = (endpointId: string, productKey: string, type: BomType): PoolItem[] =>
  type === 'SBOM'
    ? bomComponents(endpointId, productKey).map((c) => ({ name: c.name, version: c.version, ecosystem: c.ecosystem, cves: c.cves, purl: c.purl, license: c.license, type: c.type }))
    : type === 'CBOM'
      /* A crypto asset is compared on its identity (cryptoIdentity), and carries itself rather than
         being relabelled into SBOM fields (key length as "version", location as "purl" …). */
      ? bomCryptoAssets(endpointId, productKey).map((c) => ({ name: c.name, version: cryptoIdentity(c), ecosystem: c.algorithm, cves: undefined, type: c.primitive, crypto: c }))
      /* EVERY AI component that counts — a framework or SDK upgrade (transformers 4.44 → 4.48, the
         fix for its CVEs) is a change too, not only a model. `purl` carries the identity (purl, else
         bom-ref), so two same-named components (openai on PyPI and on npm) stay two. */
      : bomAiInScope(endpointId, productKey)
          .map((m) => ({ name: m.name, version: m.version, ecosystem: m.provider, cves: undefined, purl: m.purl ?? m.ref, license: m.license, origin: m.source, type: m.task }));

/** The real diff between two inventories — used once a version came from an uploaded file. */
const diffPools = (a: PoolItem[], b: PoolItem[]): BomDiff => {
  /* Keyed name@version, NOT name: an inventory can hold several builds of one library, and a
     name-keyed map collapses them (203 generated components read as ~40). A build only in the new
     file is added, only in the old one removed; an added and a removed build of the SAME name
     pair up as one update. */
  const identity = (c: PoolItem) => ({ name: c.name, ecosystem: c.ecosystem, cves: c.cves, purl: c.purl, license: c.license, origin: c.origin, componentType: c.type, crypto: c.crypto });
  const key = (c: PoolItem) => `${c.name}@${c.version ?? ''}`;
  const left = new Map<string, PoolItem[]>();
  a.forEach((c) => left.set(key(c), [...(left.get(key(c)) ?? []), c]));
  const unchangedEntries: BomDiffEntry[] = [];
  const onlyNew: PoolItem[] = [];
  b.forEach((c) => {
    const same = left.get(key(c));
    if (same?.length) { same.pop(); unchangedEntries.push({ kind: 'Unchanged', ...identity(c), version: c.version }); }
    else onlyNew.push(c);
  });
  const onlyOld: PoolItem[] = [...left.values()].flat();
  const updated: BomDiffEntry[] = [], added: BomDiffEntry[] = [];
  onlyNew.forEach((c) => {
    /* Same name AND same package (purl without its version) first: two components can share a
       name — openai on PyPI and on npm — and an upgrade of one must not pair with the other. */
    const base = (x: PoolItem) => x.purl?.replace(/@[^@?#]*([?#].*)?$/, '');
    const j = onlyOld.findIndex((o) => o.name === c.name && base(o) === base(c));
    const i = j >= 0 ? j : onlyOld.findIndex((o) => o.name === c.name);
    if (i >= 0) { const o = onlyOld.splice(i, 1)[0]; updated.push({ kind: 'Updated', ...identity(c), fromVersion: o.version, version: c.version }); }
    else added.push({ kind: 'Added', ...identity(c), version: c.version });
  });
  const removed: BomDiffEntry[] = onlyOld.map((c) => ({ kind: 'Removed', ...identity(c), version: c.version }));
  return { added, updated, removed, unchangedEntries, unchanged: unchangedEntries.length };
};

export const bomDiff = (endpointId: string, productKey: string, type: BomType, from: number, to: number): BomDiff => {
  /* A version that came from an uploaded file is diffed for real against what came before it. */
  const up = uploadedDiff(endpointId, type, from, to);
  if (up) return up;
  const pool = diffPool(endpointId, productKey, type);
  if (!pool.length) return { added: [], updated: [], removed: [], unchangedEntries: [], unchanged: 0 };

  const h = hash(`${endpointId}:${productKey}:${type}:${from}-${to}`);
  // Shifts MUST be unsigned (>>>): `hash` returns a full uint32, and the signed `>>` turns any
  // value above 2^31 negative, which made nUpdated 0 and nRemoved -1 — and Array.from({length:-1})
  // is silently empty, so updated/removed rows disappeared everywhere.
  const nAdded = 1 + (h % 3);
  const nUpdated = 1 + ((h >>> 3) % 2);
  const nRemoved = (h >>> 6) % 2;

  const pick = (offset: number, n: number) =>
    Array.from({ length: n }, (_, i) => pool[(h + offset + i * 5) % pool.length]);

  // Every entry carries the component's full identity, so a diff row can be expanded without
  // going back to the component list.
  const identity = (c: any) => ({
    name: c.name, ecosystem: c.ecosystem, cves: c.cves,
    purl: c.purl, license: c.license, origin: c.origin, componentType: c.type, crypto: c.crypto,
  });

  const added: BomDiffEntry[] = pick(11, nAdded).map((c) => ({
    kind: 'Added', ...identity(c), version: c.version,
  }));
  /* A crypto asset has no version to bump. The one real "update" a CBOM shows is a certificate
     RENEWAL — same subject, new expiry — so CBOM updates are certificates, a year apart. */
  const certs = type === 'CBOM' ? pool.filter((c) => c.crypto?.primitive === 'Certificate' && c.crypto.expiry) : [];
  const updated: BomDiffEntry[] = type === 'CBOM'
    ? (certs.length ? Array.from({ length: Math.min(nUpdated, certs.length) }, (_, i) => certs[(h + 41 + i * 5) % certs.length]) : [])
      .filter((c, i, xs) => xs.indexOf(c) === i)
      .map((c) => ({ kind: 'Updated' as const, ...identity(c), fromVersion: c.version.replace(/\d{4}$/, (y) => String(+y - 1)), version: c.version }))
    : pick(41, nUpdated).map((c, i) => {
    const bump: 'patch' | 'minor' | 'major' = (h + i) % 5 === 0 ? 'major' : (h + i) % 3 === 0 ? 'minor' : 'patch';
    return {
      kind: 'Updated', ...identity(c),
      fromVersion: c.version, version: bumpVersion(c.version, bump), bump,
    };
  });
  const removed: BomDiffEntry[] = pick(83, nRemoved).map((c) => ({
    kind: 'Removed', ...identity(c), version: c.version,
  }));

  // Whatever the diff did not touch is unchanged — derived from the same pool so the five
  // comparison tabs always sum to the pool size.
  const touched = new Set([...added, ...updated, ...removed].map((e) => e.name));
  const unchangedEntries: BomDiffEntry[] = pool
    .filter((c) => !touched.has(c.name))
    .map((c) => ({ kind: 'Unchanged' as const, ...identity(c), version: c.version }));

  return { added, updated, removed, unchangedEntries, unchanged: unchangedEntries.length };
};

// ---------------------------------------------------------------------------
// Point-in-time inventory + the CycloneDX document, for the side-by-side diff.
// ---------------------------------------------------------------------------

/** A component as it stood at one version, flattened across the three BOM types. */
export interface DocComponent {
  name: string;
  version: string;
  type: string;
  purl?: string;
  license?: string;
  /** CBOM only — the asset, so the document can carry real cryptoProperties. */
  crypto?: CryptoAsset;
}

const asDocComponents = (endpointId: string, productKey: string, type: BomType): DocComponent[] => {
  if (type === 'SBOM') {
    return bomComponents(endpointId, productKey).map((c) => ({
      name: c.name, version: c.version, type: c.type.toLowerCase(), purl: c.purl, license: c.license,
    }));
  }
  if (type === 'CBOM') {
    return bomCryptoAssets(endpointId, productKey).map((c) => ({
      name: c.name, version: cryptoIdentity(c), type: 'cryptographic-asset', crypto: c,
    }));
  }
  return bomAiInScope(endpointId, productKey).map((m) => ({
    name: m.name, version: m.version, type: m.task.toLowerCase(), purl: m.purl, license: m.license,
  }));
};

/** The inventory as it stood at `version`. The catalog represents the newest version, so older
 *  ones are reconstructed by walking the diffs backwards — remove what that version added,
 *  restore what it updated, put back what it removed. */
/* ── the dependency graph ────────────────────────────────────
   A component list says WHAT is installed; it cannot say why. The graph answers the question
   that actually blocks a remediation: this library is vulnerable — is it something we chose,
   or something four levels down that we inherited? Those need different responses, and the
   flat list makes them look identical.

   Built from the same catalogue the list renders, so a component can never appear in one and
   not the other. Shape is deterministic per host + product. */

export interface DepNode {
  /** `name@version` — the graph's identity. See the keying note in `bomDependencies`. */
  key: string;
  name: string;
  version: string;
  /** Searchable alongside the name: an admin chasing an advisory usually has the PURL. */
  purl: string;
  /** How many parents in the whole graph depend on this build. >1 renders as "xN". */
  uses: number;
  cves: number;
  children: DepNode[];
  /** Already expanded elsewhere in the tree — shown once, then referenced, so a shared
   *  component cannot make the tree look bigger than the estate actually is. */
  repeat?: boolean;
}

export interface DepGraph {
  rootLabel: string;
  direct: number;
  transitive: number;
  maxDepth: number;
  /** Components the scanner found on disk but could not attach to the graph — vendored
   *  copies, OS packages, anything with no manifest. Worth stating: they are still installed. */
  notInGraph: number;
  /** Those same components, as nodes. The count alone was a dead end — it told you how many
   *  could not be placed and gave you no way to look at them. */
  standalone: DepNode[];
  /** Every component in the scope. `direct + transitive + notInGraph` sums to exactly this,
   *  and this equals the row count of the Components tab — so "N not in graph" always has a
   *  denominator the user can see, rather than floating against a number twice its size. */
  total: number;
  edges: number;
  tree: DepNode[];
}

export const bomDependencies = (endpointId: string, productKey: string): DepGraph => {
  /* Keyed by `name@version`, NOT by name.
     A host genuinely carries several BUILDS of the same library — that is what the version-drift
     work in this module is about — and they are distinct components with distinct PURLs, often
     pulled in by different parents. Keying by name alone merged those builds into one node,
     which folded the levels back on themselves and produced 30-hop chains out of a 6-level
     shape. Keying by build makes every node unique, so the level structure below cannot cycle,
     and it makes the graph count the same things the component list counts. */
  const all = bomComponents(endpointId, productKey);
  const idOf = (c: BomComponent) => `${c.name}@${c.version}`;
  /** The library behind a build id — `name@version` back to `name`. */
  const byName = (id: string) => id.slice(0, id.lastIndexOf('@'));
  const r = seeded(`${endpointId}:${productKey}:deps`);

  /* Roughly a third are declared directly; the rest are pulled in by something else. A real
     manifest looks like this — a handful of choices dragging a long tail behind them.

     The product root is a PARENT, and the same one-build-per-library rule applies to it. The
     catalogue cycles builds, so taking every third row blindly declared `zlib@1.2.11` and
     `zlib@1.2.12` side by side at the top of the tree: two rows, same visible name — exactly
     the duplicate that gets reported. Skipped builds fall through to `rest`, so the totals
     still reconcile with the component list. */
  const direct: BomComponent[] = [];
  const declared = new Set<string>();
  all.forEach((c, i) => {
    if (i % 3 !== 0 || declared.has(c.name)) return;
    declared.add(c.name);
    direct.push(c);
  });
  const directSet = new Set(direct.map(idOf));
  const rest = all.filter((c) => !directSet.has(idOf(c)));
  const notInGraph = Math.round(rest.length * 0.25);
  const attachable = rest.slice(0, rest.length - notInGraph);
  /* The tail that could not be attached, kept rather than counted away. */
  const unplaced = rest.slice(rest.length - notInGraph);

  /* Levels are built explicitly rather than inferred. Assigning parents at random and hoping
     the depth stays sane produced those 30-hop chains — a tree indented thirty times is
     unreadable, which defeats the point of drawing one. Real manifests are wide and shallow:
     most of the weight sits one or two hops in, thinning out fast. */
  const parentOf = new Map<string, string[]>();
  const useCount = new Map<string, number>();
  const SHAPE = [0.34, 0.22, 0.16, 0.12, 0.09, 0.07];  // share of transitive deps per level, 2..7
  let level: string[] = direct.map(idOf);
  let cursor = 0;
  SHAPE.forEach((share, li) => {
    const take = li === SHAPE.length - 1
      ? attachable.length - cursor
      : Math.round(attachable.length * share);
    const slice = attachable.slice(cursor, cursor + take);
    cursor += take;
    if (!slice.length || !level.length) return;
    slice.forEach((c) => {
      const id = idOf(c);
      const n = 1 + (r() < 0.18 ? 1 : 0);          // a few are shared by two parents
      const parents: string[] = [];
      for (let k = 0; k < n; k++) {
        const p = level[Math.floor(r() * level.length)];
        if (p !== id && !parents.includes(p)) parents.push(p);
      }
      parents.forEach((p) => {
        const kids = parentOf.get(p) ?? [];
        /* ONE edge per (parent, child), and one BUILD of a library per parent. The first guard
           stops two picks landing on the same parent. The second stops `color-name@1.4.0` and
           `color-name@1.4.1` sitting under one parent as consecutive rows that read as a
           duplicate — a resolver would have collapsed them to a single build anyway. Drift
           between DIFFERENT parents is real and stays. */
        if (kids.some((k) => k === id || byName(k) === c.name)) return;
        parentOf.set(p, [...kids, id]);
        useCount.set(id, (useCount.get(id) ?? 0) + 1);
      });
    });
    level = slice.map(idOf);                       // the next level hangs off this one
  });

  const byId = new Map(all.map((c) => [idOf(c), c]));
  const seen = new Set<string>();
  let maxDepth = 0;
  let edges = 0;

  const build = (id: string, depth: number): DepNode => {
    const c = byId.get(id);
    maxDepth = Math.max(maxDepth, depth);
    const node: DepNode = {
      key: id,
      name: c?.name ?? id,
      version: c?.version ?? '—',
      purl: c?.purl ?? '',
      uses: useCount.get(id) ?? 1,
      cves: c?.cves?.length ?? 0,
      children: [],
    };
    /* A component is expanded the first time it appears and referenced afterwards. Without
       this a diamond in the graph renders as an infinite tree. */
    if (seen.has(id)) { node.repeat = true; return node; }
    seen.add(id);
    const kids = parentOf.get(id) ?? [];
    edges += kids.length;
    node.children = kids.map((k) => build(k, depth + 1));
    return node;
  };

  const tree = direct.map((c) => build(idOf(c), 1));
  return {
    rootLabel: productKey === OS_PRODUCT_KEY ? 'OS / base platform' : productKey,
    direct: direct.length,
    transitive: attachable.length,
    maxDepth,
    notInGraph,
    /* Leaves by definition: nothing hangs off a component with no manifest. `uses: 0`
       distinguishes "nothing depends on this" from the graph's "one parent". */
    standalone: unplaced.map((c) => ({
      key: idOf(c), name: c.name, version: c.version, purl: c.purl,
      uses: 0, cves: c.cves?.length ?? 0, children: [],
    })),
    total: all.length,
    edges: edges + direct.length,
    tree,
  };
};

/* ── what a version is carrying ──────────────────────────────
   The version card used to say only what CHANGED. That answers "what did this scan do",
   not "how bad is this host right now" — which is the question the card is opened with.
   These three read the components present AT a version, so they describe the state the
   version left the host in rather than the delta that produced it. */

export type BomSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export const BOM_SEVERITIES: BomSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

/* ── Advisories: what Trivy's `vulnerabilities[]` says about each id ─────────
   Real records for the catalogue's real advisories — a CVE number is checkable, and a demo that
   invents one reads as fiction the moment anyone looks it up. The shape is Trivy's:
     ratings         several per advisory (NVD, GHSA, distro vendors), and they disagree — 7 of
                     the 33 in a real scan. ONE severity is picked by a fixed precedence,
                     NVD → GHSA → vendor, and the source is kept so the UI can say who rated it.
     cwes            → `cwe` (Trivy carries it on ~80 % of advisories; null = not reported)
     published       → `published`
     description     → `description`; there is no title field, so a title is its first sentence
     recommendation  verbatim — "Upgrade urllib3 to version 1.26.17, 2.0.6": one fixed version
                     per release branch, which `fixOnBranch` resolves for a given install.
   `kev` is NOT Trivy's: it is the platform's CISA Known Exploited Vulnerabilities enrichment,
   the same feed the Vulnerability module reads. EPSS, risk scores and NVD analysis status are
   not in a Trivy scan and are not shown. */
type RatingSource = 'nvd' | 'ghsa' | 'vendor';
interface AdvisoryRecord {
  ratings: { source: RatingSource; severity: BomSeverity; score?: number }[];
  cwe: string | null;
  published: string;
  description: string;
  recommendation: string | null;
  kev?: boolean;
}
const ADVISORIES: Record<string, AdvisoryRecord> = {
  'CVE-2021-44228': { ratings: [{ source: 'nvd', severity: 'Critical', score: 10.0 }, { source: 'ghsa', severity: 'Critical', score: 10.0 }], cwe: 'CWE-917', published: 'Dec 10, 2021', kev: true,
    description: 'Apache Log4j2 JNDI features used in configuration, log messages and parameters do not protect against attacker-controlled LDAP and other JNDI endpoints. An attacker who can control log messages can execute arbitrary code loaded from those servers when message lookup substitution is enabled.',
    recommendation: 'Upgrade log4j-core to version 2.15.0, 2.3.1, 2.12.2' },
  'CVE-2021-45046': { ratings: [{ source: 'nvd', severity: 'Critical', score: 9.0 }], cwe: 'CWE-917', published: 'Dec 14, 2021', kev: true,
    description: 'The fix for CVE-2021-44228 in Apache Log4j 2.15.0 was incomplete in certain non-default configurations. Attackers controlling Thread Context Map input can still craft malicious input using a JNDI lookup pattern.',
    recommendation: 'Upgrade log4j-core to version 2.16.0, 2.12.2' },
  'CVE-2021-44832': { ratings: [{ source: 'nvd', severity: 'Medium', score: 6.6 }], cwe: 'CWE-20', published: 'Dec 28, 2021',
    description: 'Apache Log4j2 versions up to 2.17.0 are vulnerable to remote code execution when an attacker with permission to modify the logging configuration file sets up a JDBC Appender with a JNDI URI.',
    recommendation: 'Upgrade log4j-core to version 2.17.1, 2.12.4, 2.3.2' },
  'CVE-2022-3602': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-787', published: 'Nov 01, 2022',
    description: 'A buffer overrun can be triggered in X.509 certificate verification, specifically in name constraint checking. A crafted email address in a certificate can overflow four attacker-controlled bytes on the stack.',
    recommendation: 'Upgrade openssl to version 3.0.7' },
  'CVE-2022-3786': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-120', published: 'Nov 01, 2022',
    description: 'A buffer overrun can be triggered in X.509 certificate verification, specifically in name constraint checking. A crafted email address can overflow an arbitrary number of bytes containing the "." character on the stack.',
    recommendation: 'Upgrade openssl to version 3.0.7' },
  'CVE-2023-0286': { ratings: [{ source: 'nvd', severity: 'High', score: 7.4 }], cwe: 'CWE-843', published: 'Feb 08, 2023',
    description: 'There is a type confusion vulnerability relating to X.400 address processing inside an X.509 GeneralName. An attacker may be able to read memory contents or cause a denial of service.',
    recommendation: 'Upgrade openssl to version 3.0.8, 1.1.1t' },
  'CVE-2022-22968': { ratings: [{ source: 'nvd', severity: 'Medium', score: 5.3 }], cwe: 'CWE-178', published: 'Apr 14, 2022',
    description: 'In Spring Framework, the patterns for disallowedFields on a DataBinder are case sensitive, so a field is not effectively protected unless it is listed with both upper and lower case for its first character.',
    recommendation: 'Upgrade spring-core to version 5.3.19, 5.2.21' },
  'CVE-2022-22970': { ratings: [{ source: 'nvd', severity: 'Medium', score: 5.3 }], cwe: 'CWE-770', published: 'May 12, 2022',
    description: 'Applications that handle file uploads are vulnerable to a denial-of-service attack if they rely on data binding to set a MultipartFile or javax.servlet.Part to a field in a model object.',
    recommendation: 'Upgrade spring-core to version 5.3.20, 5.2.22' },
  'CVE-2022-42003': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-502', published: 'Oct 02, 2022',
    description: 'In FasterXML jackson-databind, resource exhaustion can occur because of a lack of a check in primitive value deserializers to avoid deep wrapper array nesting, when the UNWRAP_SINGLE_VALUE_ARRAYS feature is enabled.',
    recommendation: 'Upgrade jackson-databind to version 2.12.7.1, 2.13.4.2' },
  'CVE-2022-42004': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-502', published: 'Oct 02, 2022',
    description: 'In FasterXML jackson-databind, resource exhaustion can occur because of a lack of a check in BeanDeserializer._deserializeFromArray to prevent use of deeply nested arrays.',
    recommendation: 'Upgrade jackson-databind to version 2.12.7.1, 2.13.4' },
  'CVE-2020-36518': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-787', published: 'Mar 11, 2022',
    description: 'jackson-databind before 2.13.0 allows a Java StackOverflow exception and denial of service via a large depth of nested objects.',
    recommendation: 'Upgrade jackson-databind to version 2.12.6.1, 2.13.2.1' },
  'CVE-2022-42889': { ratings: [{ source: 'nvd', severity: 'Critical', score: 9.8 }], cwe: 'CWE-94', published: 'Oct 13, 2022',
    description: 'Apache Commons Text performs variable interpolation, and the default lookups "script", "dns" and "url" can execute arbitrary code or contact remote servers when the interpolated input is untrusted.',
    recommendation: 'Upgrade commons-text to version 1.10.0' },
  'CVE-2015-6420': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-502', published: 'Dec 15, 2015',
    description: 'Serialized-object interfaces in certain Java applications using the Apache Commons Collections library allow remote attackers to execute arbitrary commands via a crafted serialized Java object.',
    recommendation: 'Upgrade commons-collections to version 3.2.2' },
  'CVE-2021-23337': { ratings: [{ source: 'nvd', severity: 'High', score: 7.2 }, { source: 'ghsa', severity: 'High', score: 7.2 }], cwe: 'CWE-94', published: 'Feb 15, 2021',
    description: 'Lodash versions prior to 4.17.21 are vulnerable to Command Injection via the template function.',
    recommendation: 'Upgrade lodash to version 4.17.21' },
  'CVE-2020-28500': { ratings: [{ source: 'nvd', severity: 'Medium', score: 5.3 }], cwe: null, published: 'Feb 15, 2021',
    description: 'Lodash versions prior to 4.17.21 are vulnerable to Regular Expression Denial of Service (ReDoS) via the toNumber, trim and trimEnd functions.',
    recommendation: 'Upgrade lodash to version 4.17.21' },
  'CVE-2022-24771': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-347', published: 'Mar 18, 2022',
    description: 'Prior to version 1.3.0, RSA PKCS#1 v1.5 signature verification code in node-forge is lenient in checking the digest algorithm structure, which can allow a crafted structure to forge a signature.',
    recommendation: 'Upgrade node-forge to version 1.3.0' },
  'CVE-2022-24772': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }], cwe: 'CWE-347', published: 'Mar 18, 2022',
    description: 'Prior to version 1.3.0, RSA PKCS#1 v1.5 signature verification code in node-forge does not check for trailing garbage bytes after decoding a DigestInfo ASN.1 structure.',
    recommendation: 'Upgrade node-forge to version 1.3.0' },
  'CVE-2022-24773': { ratings: [{ source: 'nvd', severity: 'Medium', score: 5.3 }], cwe: 'CWE-347', published: 'Mar 18, 2022',
    description: 'Prior to version 1.3.0, RSA PKCS#1 v1.5 signature verification code in node-forge does not properly check DigestInfo for a proper ASN.1 structure.',
    recommendation: 'Upgrade node-forge to version 1.3.0' },
  'CVE-2023-43804': { ratings: [{ source: 'nvd', severity: 'High', score: 8.1 }, { source: 'ghsa', severity: 'Medium' }], cwe: 'CWE-200', published: 'Oct 04, 2023',
    description: 'urllib3 does not treat the Cookie HTTP header specially, so a Cookie header set on a request can leak to a different host when a cross-origin redirect is followed.',
    recommendation: 'Upgrade urllib3 to version 1.26.17, 2.0.6' },
  'CVE-2023-45803': { ratings: [{ source: 'nvd', severity: 'Medium', score: 4.2 }], cwe: 'CWE-200', published: 'Oct 17, 2023',
    description: 'urllib3 did not remove the HTTP request body when a 303 "See Other" redirect changed the request method to GET, which could leak a sensitive body to the redirect target.',
    recommendation: 'Upgrade urllib3 to version 1.26.18, 2.0.7' },
  'CVE-2023-48795': { ratings: [{ source: 'nvd', severity: 'Medium', score: 5.9 }], cwe: 'CWE-354', published: 'Dec 18, 2023',
    description: 'The SSH transport protocol with certain OpenSSH extensions allows remote attackers to bypass integrity checks so that some packets are omitted from the extension negotiation message (Terrapin).',
    recommendation: 'Upgrade golang.org/x/crypto to version 0.17.0' },
  'CVE-2018-25032': { ratings: [{ source: 'nvd', severity: 'High', score: 7.5 }, { source: 'vendor', severity: 'Medium' }], cwe: 'CWE-787', published: 'Mar 25, 2022',
    description: 'zlib before 1.2.12 allows memory corruption when deflating (compressing) if the input has many distant matches.',
    recommendation: 'Upgrade zlib to version 1.2.12' },
  'CVE-2024-3094': { ratings: [{ source: 'nvd', severity: 'Critical', score: 10.0 }], cwe: 'CWE-506', published: 'Mar 29, 2024',
    description: 'Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0. Through a series of obfuscations, the liblzma build process extracts a prebuilt object file that modifies functions in the liblzma code.',
    recommendation: 'Upgrade xz-utils to version 5.6.1+really5.4.5-1' },
  'CVE-2023-46218': { ratings: [{ source: 'nvd', severity: 'Medium', score: 6.5 }], cwe: null, published: 'Dec 07, 2023',
    description: 'A flaw in curl\'s cookie handling lets a malicious HTTP server set "super cookies" that are then passed back to more origins than allowed, because of a mixed-case domain check.',
    recommendation: 'Upgrade libcurl4 to version 8.5.0' },
};

const RATING_ORDER: RatingSource[] = ['nvd', 'ghsa', 'vendor'];
const RATED_BY: Record<RatingSource, string> = { nvd: 'NVD', ghsa: 'GHSA', vendor: 'Vendor' };

/** One advisory as every screen reads it. Null when the id is not one Trivy reported to us. */
export interface BomAdvisory {
  id: string;
  severity: BomSeverity;
  /** Who the severity came from — NVD, else GHSA, else a distro vendor. */
  ratedBy: string;
  /** CVSS base score from the same rating; null when that rating has none. */
  cvss: number | null;
  cwe: string | null;
  published: string;
  description: string;
  /** The description's first sentence — Trivy has no title field. */
  title: string;
  recommendation: string | null;
  /** CISA KEV — platform enrichment, not part of the Trivy document. */
  kev: boolean;
}
export const bomAdvisory = (id: string): BomAdvisory | null => {
  const a = ADVISORIES[id];
  if (!a) return null;
  const r = RATING_ORDER.map((src) => a.ratings.find((x) => x.source === src)).find(Boolean)!;
  return {
    id, severity: r.severity, ratedBy: RATED_BY[r.source], cvss: r.score ?? null, cwe: a.cwe,
    published: a.published, description: a.description,
    title: a.description.split(/(?<=\.)\s/)[0], recommendation: a.recommendation, kev: !!a.kev,
  };
};
/** The precedence-picked severity, or null for an id we hold no rating for — never guessed. */
export const cveSeverity = (id: string): BomSeverity | null => bomAdvisory(id)?.severity ?? null;
export const isKevListed = (id: string) => !!ADVISORIES[id]?.kev;

const verParts = (v: string) => v.split(/[.\-+]/).map((x) => parseInt(x, 10)).map((n) => (Number.isNaN(n) ? 0 : n));
const cmpVer = (a: string, b: string) => {
  const x = verParts(a), y = verParts(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};
/** Trivy writes one fixed version per release branch ("… to version 2.15.0, 2.3.1, 2.12.2").
 *  The fix for THIS install is the lowest listed version at or above it on its own major line;
 *  failing that, the lowest one above it at all. Null when the advisory names no fix. */
export const fixOnBranch = (recommendation: string | null, current: string): string | null => {
  const listed = recommendation?.match(/version (.+)$/)?.[1]?.split(/,\s*/).filter(Boolean) ?? [];
  const above = listed.filter((v) => cmpVer(v, current) > 0).sort(cmpVer);
  if (!above.length) return null;
  const major = verParts(current)[0];
  return above.find((v) => verParts(v)[0] === major) ?? above[0];
};
/** The version that clears every advisory on a component: the highest of the per-advisory fixes,
 *  or null when any advisory has no fix (no single upgrade then clears the row). */
export const componentFix = (ids: string[], current: string): string | null => {
  const fixes = ids.map((id) => fixOnBranch(bomAdvisory(id)?.recommendation ?? null, current));
  if (!fixes.length || fixes.some((f) => f === null)) return null;
  return (fixes as string[]).sort(cmpVer).pop()!;
};

/* Licences that need a lawyer's opinion before this build ships. Strong copyleft and
   anything bespoke — not a defect, but the one licence fact worth surfacing next to the
   security ones. */
const BLOCKED_LICENSES = ['AGPL-3.0', 'GPL-3.0', 'SSPL-1.0', 'Commercial API', 'Proprietary'];
export const isBlockedLicense = (l: string) => BLOCKED_LICENSES.includes(l);

export interface BomVersionStats {
  /** CVE count per severity across every component present at this version. */
  bySeverity: Record<BomSeverity, number>;
  cves: number;
  /** Components carrying at least one CVE, and the total present. */
  vulnerablePackages: number;
  totalPackages: number;
  /** Components on a licence that needs review. */
  blockedLicenses: number;
}

export const bomVersionStats = (
  endpointId: string, productKey: string, type: BomType, version: number,
): BomVersionStats => {
  const present = componentsAtVersion(endpointId, productKey, type, version);
  /* Keyed name@version, NOT name. A scope carries several builds of one library and only the
     catalogue's build carries the advisory (later builds are the fix). Keyed by name, the last
     build won the map — a clean one — and every current version reported 0 CVEs. The name-only
     map remains as a fallback for the licence of a component the catalogue lists once. */
  const all = bomComponents(endpointId, productKey);
  const byBuild = new Map(all.map((c) => [`${c.name}@${c.version}`, c]));
  const byName = new Map(all.map((c) => [c.name, c]));
  const bySeverity: Record<BomSeverity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  let cves = 0, vulnerablePackages = 0, blockedLicenses = 0;

  present.forEach((p) => {
    const src = byBuild.get(`${p.name}@${p.version}`) ?? byName.get(p.name);
    const ids = byBuild.get(`${p.name}@${p.version}`)?.cves ?? [];
    if (ids.length) { vulnerablePackages++; cves += ids.length; }
    ids.forEach((id) => { const sev = cveSeverity(id); if (sev) bySeverity[sev]++; });
    if (isBlockedLicense(p.license ?? src?.license ?? '')) blockedLicenses++;
  });

  return { bySeverity, cves, vulnerablePackages, totalPackages: present.length, blockedLicenses };
};

export const componentsAtVersion = (
  endpointId: string, productKey: string, type: BomType, version: number,
): DocComponent[] => {
  const versions = bomVersions(endpointId, productKey, type);
  const newest = versions.length ? Math.max(...versions.map((v) => v.v)) : 1;
  let list = asDocComponents(endpointId, productKey, type);

  for (let v = newest; v > version; v--) {
    const d = bomDiff(endpointId, productKey, type, v - 1, v);
    /* Keyed by name AND version: a host carries several builds of one library, and stepping back
       past "openssl 3.0.13 added" must take out that build only — not every openssl. */
    const at = (c: { name: string; version: string }) => `${c.name}@${c.version}`;
    const added = new Set(d.added.map(at));
    list = list.filter((c) => !added.has(at(c)));
    const revert = new Map(d.updated.map((e) => [at(e), e.fromVersion ?? e.version]));
    /* A CBOM "update" is a certificate renewal, so reverting it restores the earlier expiry. */
    list = list.map((c) => (revert.has(at(c))
      ? { ...c, version: revert.get(at(c))!, crypto: c.crypto?.primitive === 'Certificate' ? { ...c.crypto, expiry: revert.get(at(c))! } : c.crypto }
      : c));
    d.removed.forEach((e) => {
      if (!list.some((c) => at(c) === at(e))) {
        list.push({ name: e.name, version: e.version, type: e.crypto ? 'cryptographic-asset' : 'library', purl: e.purl, license: e.license, crypto: e.crypto });
      }
    });
  }
  /* A reverted update can land on a build the list already holds — one entry per name@version. */
  return [...new Map(list.map((c) => [`${c.name}@${c.version}`, c])).values()];
};

/** The CycloneDX 1.6 document for one version — what a download would actually produce, and
 *  what the diff view compares line by line. */
export const bomDocument = (
  endpointId: string, productKey: string, type: BomType, version: number,
): string => {
  if (type === 'CBOM') return cbomDocument(endpointId, productKey, version);
  const comps = componentsAtVersion(endpointId, productKey, type, version);
  const v = bomVersions(endpointId, productKey, type).find((x) => x.v === version);
  const ep = mockEndpoints.find((e) => e.id === endpointId);
  const h = hash(`${endpointId}:${productKey}:${type}`);
  const uuid = `urn:uuid:${h.toString(16).padStart(8, '0')}-4b2a-4f6c-9d31-${(h >>> 3).toString(16).padStart(8, '0')}`;

  const lines: string[] = [];
  /* The scanner that wrote the document is named as itself (Trivy for an SBOM), with the spec
     version it actually emits — not a generic "ServiceOps Agent, CycloneDX 1.6". */
  const [toolName, toolVersion] = SCAN_TOOL[type].split(' ');
  lines.push('{');
  lines.push('  "bomFormat": "CycloneDX",');
  lines.push(`  "specVersion": "${SCAN_FORMAT[type].replace('CycloneDX ', '')}",`);
  lines.push(`  "serialNumber": "${uuid}",`);
  lines.push(`  "version": ${version},`);
  lines.push('  "metadata": {');
  lines.push(`    "timestamp": "${v?.generatedAt ?? '—'}",`);
  lines.push('    "tools": {');
  lines.push(`      "components": [{ "type": "application", ${type === 'SBOM' ? '"group": "aquasecurity", ' : ''}"name": "${toolName.toLowerCase()}", "version": "${toolVersion ?? ''}" }]`);
  lines.push('    },');
  lines.push('    "component": {');
  if (type === 'SBOM') {
    /* Trivy's root is the scanned path, as an `application` — not the host OS. */
    lines.push('      "type": "application",');
    lines.push(`      "name": "${productKey === OS_PRODUCT_KEY ? '/' : productKey}"`);
  } else {
    lines.push('      "type": "operating-system",');
    lines.push(`      "name": "${ep?.osName ?? 'Unknown'}",`);
    lines.push(`      "version": "${ep?.version ?? '—'}"`);
  }
  lines.push('    }');
  lines.push('  },');
  lines.push('  "components": [');
  comps.forEach((c, i) => {
    const last = i === comps.length - 1;
    lines.push('    {');
    lines.push(`      "type": "${c.type}",`);
    lines.push(`      "name": "${c.name}",`);
    lines.push(`      "version": "${c.version}",`);
    /* A licence the scanner never reported is left out, not written as "Not declared"; a
       dual licence goes back out as the expression it came in as. */
    if (c.license && c.license !== 'Not declared') {
      lines.push(/ (OR|AND) /.test(c.license)
        ? `      "licenses": [{ "expression": "${c.license}" }],`
        : `      "licenses": [{ "license": { "id": "${c.license}" } }],`);
    }
    lines.push(`      "purl": "${c.purl ?? ''}"`);
    lines.push(last ? '    }' : '    },');
  });
  lines.push('  ]');
  lines.push('}');
  return lines.join('\n');
};

/* ── the CBOM document ───────────────────────────────────────────────────────
   A real CycloneDX 1.6 CBOM, shaped like CBOMkit-theia's own output: every asset is a
   `cryptographic-asset` with `cryptoProperties`, a certificate points at its signature algorithm
   and public key by ref (emitted as their own components, as theia does), and the tool is named.
   Re-ingesting the download therefore detects as a CBOM with the same asset count. */
const CDX_PRIMITIVE: Partial<Record<CryptoAsset['primitive'], string>> = {
  Hash: 'hash', Signature: 'signature', Cipher: 'block-cipher', 'Key agreement': 'key-agree',
  'Public-key encryption': 'pke', MAC: 'mac', Algorithm: 'other',
};
/** 'Mar 14, 2027' → ISO at midday UTC, so no timezone can move it to another day. */
const isoDay = (d?: string | null) => {
  const t = d ? new Date(d) : null;
  return t && !isNaN(t.getTime())
    ? `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}T12:00:00Z` : undefined;
};
const cbomDocument = (endpointId: string, productKey: string, version: number): string => {
  const assets = componentsAtVersion(endpointId, productKey, 'CBOM', version).map((c) => c.crypto).filter(Boolean) as CryptoAsset[];
  const v = bomVersions(endpointId, productKey, 'CBOM').find((x) => x.v === version);
  const h = hash(`${endpointId}:${productKey}:CBOM`);
  const components: any[] = [];
  assets.forEach((a, i) => {
    const ref = `crypto-${i + 1}`;
    const evidence = a.location && a.location !== '—'
      ? { occurrences: [{ location: a.location, ...(a.line != null ? { line: a.line } : {}) }] } : undefined;
    const bits = parseInt(a.keyLength, 10);
    const base = { type: 'cryptographic-asset', 'bom-ref': ref, name: a.name, ...(a.description ? { description: a.description } : {}), ...(evidence ? { evidence } : {}) };
    if (a.primitive === 'Certificate') {
      const sigRef = a.signature ? `${ref}-sig` : undefined;
      const keyRef = a.algorithm !== '—' ? `${ref}-key` : undefined;
      components.push({ ...base, cryptoProperties: { assetType: 'certificate', certificateProperties: {
        subjectName: `CN=${a.name}`, ...(a.issuer ? { issuerName: `CN=${a.issuer}` } : {}),
        ...(isoDay(a.validFrom) ? { notValidBefore: isoDay(a.validFrom) } : {}), ...(isoDay(a.expiry) ? { notValidAfter: isoDay(a.expiry) } : {}),
        ...(sigRef ? { signatureAlgorithmRef: sigRef } : {}), ...(keyRef ? { subjectPublicKeyRef: keyRef } : {}), certificateFormat: 'X.509',
      } } });
      if (sigRef) components.push({ type: 'cryptographic-asset', 'bom-ref': sigRef, name: a.signature, cryptoProperties: { assetType: 'algorithm', algorithmProperties: { primitive: 'signature' } } });
      if (keyRef) components.push({ type: 'cryptographic-asset', 'bom-ref': keyRef, name: isNaN(bits) ? a.algorithm : `${a.algorithm}-${bits}`, cryptoProperties: { assetType: 'related-crypto-material', relatedCryptoMaterialProperties: { type: 'public-key', ...(isNaN(bits) ? {} : { size: bits }) } } });
    } else if (['Public key', 'Private key', 'Secret', 'Token', 'Key material'].includes(a.primitive)) {
      const type = a.primitive === 'Public key' ? 'public-key' : a.primitive === 'Private key' ? 'private-key' : a.primitive === 'Token' ? 'token' : a.primitive === 'Secret' ? 'key' : 'unknown';
      components.push({ ...base, cryptoProperties: { assetType: 'related-crypto-material', relatedCryptoMaterialProperties: { type, ...(isNaN(bits) ? {} : { size: bits }) } } });
    } else if (a.primitive === 'Protocol') {
      components.push({ ...base, cryptoProperties: { assetType: 'protocol', protocolProperties: { type: a.protocol ?? a.name } } });
    } else {
      components.push({ ...base, cryptoProperties: { assetType: 'algorithm', algorithmProperties: { primitive: CDX_PRIMITIVE[a.primitive] ?? 'other', ...(isNaN(bits) ? {} : { parameterSetIdentifier: String(bits) }) }, ...(a.oid ? { oid: a.oid } : {}) } });
    }
  });
  return JSON.stringify({
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${h.toString(16).padStart(8, '0')}-4b2a-4f6c-9d31-${(h >>> 5).toString(16).padStart(8, '0')}`,
    version,
    metadata: {
      timestamp: v?.generatedAt ?? '—',
      tools: { components: [{ type: 'application', name: 'cbomkit-theia', version: 'edge' }] },
    },
    components,
  }, null, 2);
};

// ---------------------------------------------------------------------------
// Host-wide exclude paths — shared by every product scan on the host.
// ---------------------------------------------------------------------------

/** The exclude patterns that actually bit while scanning ONE component — i.e. paths under that
 *  component's own root that the scanner skipped. Deterministic, so the grid is stable. */
export const excludedPathsFor = (endpointId: string, productKey: string, componentName: string): string[] => {
  const h = hash(`${endpointId}:${productKey}:${componentName}:excl`);
  const n = 1 + (h % 4); // 1-4 patterns hit per component
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = EXCLUDE_POOL[(h + i * 3) % EXCLUDE_POOL.length];
    if (!out.includes(p)) out.push(p);
  }
  return out;
};

/** Products that can still be added to a host's scan config (not already scanned). */
export const availableProducts = (taken: string[]) => APP_PRODUCTS.filter((p) => !taken.includes(p.key));
