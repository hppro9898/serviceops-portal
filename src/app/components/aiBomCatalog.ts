import type { AiModel } from './bomData';

/* AI BOM — in the shape AIROM actually emits.
 *
 * Every field below maps to something in an AIROM CycloneDX 1.6 document (see aibom.json):
 *
 *   ref               bom-ref                         "airom:0049797abd62738c"
 *   type              type                            machine-learning-model · data · framework · library · application
 *   kind              property airom:kind             hosted-llm · embedding-model · local-model-file · framework · …
 *   provider          airom:model.provider / airom:provider
 *   modelId           airom:model.id                  (models)
 *   version · purl    version · purl                  (frameworks / SDKs; model files get pkg:generic/<name>?checksum=sha256:…)
 *   confidence        airom:confidence                detection confidence, 0–1
 *   eol               airom:eol.state · shutdownDate · replacement · sourceUrl · verified   (hosted models)
 *   file              airom:model.format · hashes SHA-256 · airom:pickle.risk · airom:pickle.imports
 *   params            airom:param.temperature · airom:param.max_tokens   (hosted-LLM call sites)
 *   dataset           airom:dataset.types · airom:dataset.size
 *   uses / contains   airom:rel.uses · rel.contains · rel.embeds-with
 *   evidence          evidence.occurrences[] → location · line · additionalContext
 *   scope             scope                           "excluded" = tests, fixtures, vendored code (63 % of aibom.json)
 *   findings          vulnerabilities[] → CVE-* (osv.dev) and AIROM-RISK-* (model-file risks)
 *                     risk.symbols → symbol (absent on UNSAFE-LOAD) · risk.evidence → evidence (file[:line])
 *
 * AIROM does NOT report a licence, provenance, model card (1 in 221), task or "used for" — so none
 * of those are shown as facts any more. The entries are a bank's estate, built from real AIROM
 * findings (the CVE ids, scores, fixed versions and risk ids are the ones AIROM reported).
 * Evidence paths are RELATIVE to the application's scan path. */

export type AiromKind = 'hosted-llm' | 'embedding-model' | 'local-model-file' | 'framework' | 'library'
  | 'vector-db' | 'prompt' | 'dataset' | 'ai-config' | 'infra' | 'service' | 'rag-pipeline';
export type CdxType = 'machine-learning-model' | 'data' | 'framework' | 'library' | 'application';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export interface AiromFinding {
  /** CVE-… from osv.dev, or AIROM-RISK-… for a risk AIROM found in the artefact itself. */
  id: string;
  severity: FindingSeverity;
  score?: number;
  fixedVersion?: string;
  description: string;
  /** `airom:risk.symbols` — the symbol that triggered an AIROM-RISK finding (os.system, Lambda,
   *  PyFunc …). AIROM gives UNSAFE-LOAD none: that finding is about a call site, not a symbol. */
  symbol?: string;
  /** `airom:risk.evidence` — where the risk is: the artefact, or the call site as file:line. */
  evidence?: string;
}
export interface AiromEvidence { file: string; line?: number; snippet?: string }
export interface AiromComponent {
  ref: string;
  name: string;
  type: CdxType;
  kind: AiromKind;
  provider: string;
  modelId?: string;
  version?: string;
  purl?: string;
  confidence: number;
  eol?: { state: 'supported' | 'deprecated' | 'retired'; shutdown?: string; replacement?: string; sourceUrl?: string; verified: string };
  file?: { format: string; sha256: string; pickleRisk?: 'high' | 'medium' | 'low'; pickleImports?: string[] };
  params?: { temperature?: string; maxTokens?: string };
  dataset?: { type: string; size: number };
  uses?: string[];
  evidence: AiromEvidence[];
  findings?: AiromFinding[];
  /** CycloneDX `scope` — AIROM sets `excluded` on what it found in tests, fixtures and vendored
   *  code. Excluded components are not counted as the application's AI BOM. */
  scope?: 'excluded';
}

const ANTHROPIC_EOL = 'https://platform.claude.com/docs/en/docs/about-claude/model-deprecations';
const OPENAI_EOL = 'https://platform.openai.com/docs/deprecations';

const TRANSFORMERS_CVES: AiromFinding[] = [
  { id: 'CVE-2026-5241', severity: 'critical', score: 9.6, fixedVersion: '5.5.0', description: 'Arbitrary code execution during model initialization in the LightGlue model loading path' },
  { id: 'CVE-2024-11392', severity: 'high', score: 8.8, fixedVersion: '4.48.0', description: 'Deserialization of untrusted data in Hugging Face Transformers' },
  { id: 'CVE-2024-11393', severity: 'high', score: 8.8, fixedVersion: '4.48.0', description: 'Deserialization of untrusted data in Hugging Face Transformers' },
  { id: 'CVE-2024-11394', severity: 'high', score: 8.8, fixedVersion: '4.48.0', description: 'Deserialization of untrusted data in Hugging Face Transformers' },
  { id: 'CVE-2026-1839', severity: 'high', score: 7.8, fixedVersion: '5.0.0rc3', description: 'Arbitrary code execution in the Trainer class' },
  { id: 'CVE-2026-4372', severity: 'high', score: 7.8, fixedVersion: '5.3.0', description: 'Remote code execution in HuggingFace transformers' },
  { id: 'CVE-2025-2099', severity: 'high', score: 7.5, fixedVersion: '4.50.0', description: 'Regular expression denial of service' },
  { id: 'CVE-2026-9856', severity: 'high', score: 7.1, fixedVersion: '5.10.0', description: 'save_pretrained path traversal allows arbitrary file writes through chat template names' },
  { id: 'CVE-2024-12720', severity: 'medium', score: 5.3, fixedVersion: '4.48.0', description: 'Regular expression denial of service (ReDoS)' },
  { id: 'CVE-2025-3263', severity: 'medium', score: 5.3, fixedVersion: '4.51.0', description: 'ReDoS in get_configuration_file can lead to catastrophic backtracking' },
  { id: 'CVE-2025-3777', severity: 'low', score: 3.5, fixedVersion: '4.52.1', description: 'Improper input validation exploitable through username injection' },
];

export const AI_CATALOG: AiromComponent[] = [
  /* ── hosted models (call sites in code) ─────────────────────────────── */
  { ref: 'airom:692bd1a7c92cf6ac', name: 'claude-sonnet-4-6', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'anthropic', modelId: 'claude-sonnet-4-6', confidence: 0.85,
    eol: { state: 'supported', sourceUrl: ANTHROPIC_EOL, verified: '2026-09-28' }, params: { temperature: '0.2', maxTokens: '1024' },
    evidence: [{ file: 'assistant/summarise.py', line: 42, snippet: 'client.messages.create(model="claude-sonnet-4-6", max_tokens=1024' }, { file: 'assistant/triage.py', line: 18, snippet: 'MODEL = "claude-sonnet-4-6"' }] },
  { ref: 'airom:5a0c2e7d91b3f604', name: 'claude-3-5-sonnet-20241022', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'anthropic', modelId: 'claude-3-5-sonnet-20241022', confidence: 0.85,
    eol: { state: 'retired', shutdown: '2025-10-28', replacement: 'claude-sonnet-4-6', sourceUrl: ANTHROPIC_EOL, verified: '2026-09-28' }, params: { temperature: '0.0', maxTokens: '1024' },
    evidence: [{ file: 'legacy/kb_answer.py', line: 23, snippet: 'model="claude-3-5-sonnet-20241022", temperature=0.0' }] },
  { ref: 'airom:3f1b9c04e2d7a815', name: 'gpt-4o-mini', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'openai', modelId: 'gpt-4o-mini', version: '2024-07-18', confidence: 0.9,
    params: { temperature: '0.1', maxTokens: '400' },
    evidence: [{ file: 'gateway/router.py', line: 20, snippet: 'completion(model="gpt-4o-mini", temperature=0.1, max_tokens=400)' }] },
  { ref: 'airom:8d24e6b1f0c39a72', name: 'gpt-4', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'openai', modelId: 'gpt-4', confidence: 0.81,
    eol: { state: 'deprecated', shutdown: '2026-10-23', replacement: 'gpt-5.6-sol', sourceUrl: OPENAI_EOL, verified: '2026-09-28' }, params: { maxTokens: '800' },
    evidence: [{ file: 'web/src/loan-assist/chat.ts', line: 31, snippet: 'model: "gpt-4", max_tokens: 800' }] },
  { ref: 'airom:c7e05a3b2f914d68', name: 'gpt-4o', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'azure-openai', modelId: 'prod-gpt4o', confidence: 0.8,
    params: { temperature: '0.2', maxTokens: '1024' },
    evidence: [{ file: 'web/src/kyc/extract.ts', line: 14, snippet: 'deployment: "prod-gpt4o"' }] },

  /* ── embedding models ───────────────────────────────────────────────── */
  { ref: 'airom:0edfb677d0cc0659', name: 'sentence-transformers/all-minilm-l6-v2', type: 'machine-learning-model', kind: 'embedding-model', provider: 'sentence-transformers', modelId: 'sentence-transformers/all-minilm-l6-v2', confidence: 0.86,
    evidence: [{ file: 'kb/index.py', line: 12, snippet: 'SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")' }] },
  { ref: 'airom:41a9f2c6d8e07b35', name: 'text-embedding-3-small', type: 'machine-learning-model', kind: 'embedding-model', provider: 'openai', modelId: 'text-embedding-3-small', confidence: 0.85,
    evidence: [{ file: 'web/src/search/embed.ts', line: 9, snippet: 'model: "text-embedding-3-small"' }] },
  { ref: 'airom:9b6e1d0a4c27f583', name: 'intfloat/e5-large-v2', type: 'machine-learning-model', kind: 'embedding-model', provider: 'intfloat', modelId: 'intfloat/e5-large-v2', confidence: 0.8,
    evidence: [{ file: 'services/docs/embedder.py', line: 6, snippet: 'AutoModel.from_pretrained("intfloat/e5-large-v2")' }] },

  /* ── model files on disk ────────────────────────────────────────────── */
  { ref: 'airom:243c3c460eb1aeda', name: 'credit-scorer.pt', type: 'machine-learning-model', kind: 'local-model-file', provider: 'local', purl: 'pkg:generic/credit-scorer.pt?checksum=sha256:7072e107c42927b16285ea4e9b6464b5420faab96560e10a41ca435bee8985fd', confidence: 0.95,
    file: { format: 'torch-pickle', sha256: '7072e107c42927b16285ea4e9b6464b5420faab96560e10a41ca435bee8985fd', pickleRisk: 'high', pickleImports: ['os.system'] },
    evidence: [{ file: 'models/credit-scorer.pt' }],
    findings: [{ id: 'AIROM-RISK-PICKLE-IMPORT', severity: 'high', symbol: 'os.system', evidence: 'models/credit-scorer.pt', description: 'A pickle GLOBAL resolves to a code-execution callable; loading this artifact runs code before any model is produced.' }] },
  { ref: 'airom:6e3d8a1f5b0c9274', name: 'rate-forecast.onnx', type: 'machine-learning-model', kind: 'local-model-file', provider: 'local', purl: 'pkg:generic/rate-forecast.onnx?checksum=sha256:ef8c667baca385c035a7bbfd30a4c3abf7b474c01c91d6364633ea75ccd7e44a', confidence: 0.95,
    file: { format: 'onnx', sha256: 'ef8c667baca385c035a7bbfd30a4c3abf7b474c01c91d6364633ea75ccd7e44a' },
    evidence: [{ file: 'models/rate-forecast.onnx' }] },
  { ref: 'airom:a1f07c3e9d2b4685', name: 'fraud-detector.h5', type: 'machine-learning-model', kind: 'local-model-file', provider: 'local', purl: 'pkg:generic/fraud-detector.h5?checksum=sha256:3b9e4f0a7c21d58e6f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70', confidence: 0.85,
    file: { format: 'hdf5', sha256: '3b9e4f0a7c21d58e6f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70' },
    evidence: [{ file: 'scoring/models/fraud-detector.h5' }],
    findings: [{ id: 'AIROM-RISK-KERAS-LAMBDA', severity: 'high', symbol: 'Lambda', evidence: 'scoring/models/fraud-detector.h5', description: 'The Keras model config declares a Lambda layer, which marshals arbitrary Python that executes when the model is loaded.' }] },

  /* ── frameworks & SDKs (the only components that carry versions) ─────── */
  { ref: 'airom:113e832148731168', name: 'sentence-transformers', type: 'library', kind: 'library', provider: 'huggingface', version: '3.1.1', purl: 'pkg:pypi/sentence-transformers@3.1.1', confidence: 0.9,
    evidence: [{ file: 'requirements.txt', line: 7, snippet: 'sentence-transformers==3.1.1' }],
    findings: [{ id: 'CVE-2026-68770', severity: 'critical', score: 9.8, fixedVersion: '5.6.0', description: 'Local model loading bypasses trust_remote_code and executes custom Python' }] },
  { ref: 'airom:d2a6f81b0e3c7945', name: 'transformers', type: 'framework', kind: 'framework', provider: 'huggingface', version: '4.44.2', purl: 'pkg:pypi/transformers@4.44.2', confidence: 0.9,
    evidence: [{ file: 'requirements.txt', line: 8, snippet: 'transformers==4.44.2' }], findings: TRANSFORMERS_CVES },
  { ref: 'airom:5c8e2b7a1d4f9036', name: 'langchain', type: 'framework', kind: 'framework', provider: 'langchain', version: '0.2.16', purl: 'pkg:pypi/langchain@0.2.16', confidence: 0.9,
    evidence: [{ file: 'requirements.txt', line: 4, snippet: 'langchain==0.2.16' }, { file: 'kb/chain.py', line: 3, snippet: 'from langchain.chains import RetrievalQA' }],
    findings: [
      { id: 'CVE-2026-45134', severity: 'high', score: 7.1, fixedVersion: '0.3.30', description: 'Public prompt pull deserializes untrusted manifests without a trust-boundary warning' },
      { id: 'CVE-2026-55443', severity: 'medium', score: 5.5, fixedVersion: '1.3.9', description: 'Path traversal and sandbox escape in file-search middleware and loaders' },
    ] },
  { ref: 'airom:e48b1c6d3a2f0975', name: 'torch', type: 'framework', kind: 'framework', provider: 'pytorch', version: '2.1.0', purl: 'pkg:pypi/torch@2.1.0', confidence: 0.9,
    evidence: [{ file: 'scoring/load.py', line: 7, snippet: 'model = torch.load(path, weights_only=False)' }],
    findings: [{ id: 'AIROM-RISK-UNSAFE-LOAD', severity: 'medium', evidence: 'scoring/load.py:7', description: 'A call site deserializes a model through an unsafe path (torch.load with weights_only=False); a malicious file runs code on load.' }] },
  { ref: 'airom:7f2d0a9c4b1e6853', name: 'scikit-learn', type: 'framework', kind: 'framework', provider: 'scikit-learn', version: '1.4.0', purl: 'pkg:pypi/scikit-learn@1.4.0', confidence: 0.8,
    evidence: [{ file: 'requirements.txt', line: 11, snippet: 'scikit-learn==1.4.0' }] },
  { ref: 'airom:2b9c4e7f0a1d3586', name: 'onnxruntime', type: 'framework', kind: 'framework', provider: 'microsoft', version: '1.17.0', purl: 'pkg:pypi/onnxruntime@1.17.0', confidence: 0.8,
    evidence: [{ file: 'scoring/infer.py', line: 2, snippet: 'import onnxruntime as ort' }] },
  { ref: 'airom:0da81e6721608c1a', name: 'anthropic', type: 'library', kind: 'library', provider: 'anthropic', version: '0.34.2', purl: 'pkg:pypi/anthropic@0.34.2', confidence: 0.75,
    uses: ['claude-sonnet-4-6', 'claude-3-5-sonnet-20241022'],
    evidence: [{ file: 'requirements.txt', line: 2, snippet: 'anthropic>=0.34.0' }] },
  { ref: 'airom:4e7a2c9b1f0d6385', name: 'openai', type: 'library', kind: 'library', provider: 'openai', version: '1.40.0', purl: 'pkg:pypi/openai@1.40.0', confidence: 0.75,
    uses: ['gpt-4o-mini'],
    evidence: [{ file: 'requirements.txt', line: 3, snippet: 'openai>=1.40.0' }] },
  { ref: 'airom:91c3e5a7b2d04f68', name: 'litellm', type: 'library', kind: 'library', provider: 'litellm', version: '1.90.1', purl: 'pkg:pypi/litellm@1.90.1', confidence: 0.8,
    uses: ['gpt-4o-mini', 'claude-sonnet-4-6'],
    evidence: [{ file: 'gateway/router.py', line: 1, snippet: 'from litellm import completion' }],
    findings: [{ id: 'CVE-2026-84377', severity: 'medium', score: 6.5, fixedVersion: '1.90.7', description: 'Authenticated SSRF and provider-credential exfiltration via unvalidated request-body routing parameters' }] },
  /* Same name as the PyPI SDK above — AIROM tells the two apart only by bom-ref and purl, so they
     are two components, never one row. */
  { ref: 'airom:b3f8d1e6a0c27954', name: 'openai', type: 'library', kind: 'library', provider: 'openai', version: '4.28.4', purl: 'pkg:npm/openai@4.28.4', confidence: 0.75,
    uses: ['gpt-4', 'text-embedding-3-small'],
    evidence: [{ file: 'web/package.json', line: 22, snippet: '"openai": "^4.28.4"' }] },
  { ref: 'airom:6a0e9c2d4b7f1385', name: 'langchain4j', type: 'framework', kind: 'framework', provider: 'langchain', version: '0.36.2', purl: 'pkg:maven/dev.langchain4j/langchain4j@0.36.2', confidence: 0.75,
    uses: ['gpt-4o'],
    evidence: [{ file: 'api/pom.xml', line: 88, snippet: '<artifactId>langchain4j-open-ai</artifactId>' }] },

  /* ── retrieval, prompts, data, services ─────────────────────────────── */
  { ref: 'airom:3e3a9735550d6b44', name: 'chroma', type: 'application', kind: 'vector-db', provider: 'chroma', version: '0.5.3', confidence: 0.7,
    evidence: [{ file: 'kb/store.py', line: 5, snippet: 'chromadb.PersistentClient(path=INDEX_DIR)' }] },
  { ref: 'airom:8c1f4a6e2b9d0735', name: 'pgvector', type: 'application', kind: 'vector-db', provider: 'pgvector', confidence: 0.7,
    evidence: [{ file: 'services/docs/schema.sql', line: 3, snippet: 'CREATE EXTENSION IF NOT EXISTS vector;' }] },
  { ref: 'airom:1d7789e0b7e68c35', name: 'rag-pipeline', type: 'application', kind: 'rag-pipeline', provider: '', confidence: 0.6,
    uses: ['chroma', 'sentence-transformers/all-minilm-l6-v2'],
    evidence: [{ file: 'kb/chain.py', line: 14 }] },
  { ref: 'airom:0c70f96ec3738a5b', name: 'system-prompt', type: 'data', kind: 'prompt', provider: '', confidence: 0.66,
    evidence: [{ file: 'assistant/prompts.py', line: 8, snippet: 'SYSTEM_PROMPT = (' }, { file: 'assistant/triage.py', line: 31, snippet: 'system=SYSTEM_PROMPT' }] },
  { ref: 'airom:5f2a8d0c6e1b4973', name: 'kyc-extraction', type: 'data', kind: 'prompt', provider: '', confidence: 0.66,
    dataset: { type: 'prompt-template', size: 4120 },
    evidence: [{ file: 'web/src/kyc/prompts/kyc-extraction.txt' }] },
  { ref: 'airom:2a7d9e4c0b6f1358', name: 'ticket-corpus-2025.jsonl', type: 'data', kind: 'dataset', provider: '', confidence: 0.85,
    dataset: { type: 'jsonl', size: 18432210 },
    evidence: [{ file: 'data/ticket-corpus-2025.jsonl' }] },
  { ref: 'airom:00a52bad3582cb19', name: 'aml-alerts-history.csv', type: 'data', kind: 'dataset', provider: '', confidence: 0.85,
    dataset: { type: 'csv', size: 58611200 },
    evidence: [{ file: 'data/aml-alerts-history.csv' }] },
  { ref: 'airom:b7157e00a3ef8f98', name: 'azure-openai', type: 'application', kind: 'service', provider: 'azure-openai', confidence: 0.72,
    evidence: [{ file: 'api/src/main/resources/application.yml', line: 41, snippet: 'endpoint: https://nb-prod.openai.azure.com/' }] },

  /* ── found in tests, fixtures and vendored code — AIROM marks these `scope: excluded` ── */
  { ref: 'airom:7b2e0f94c1d36a58', name: 'gpt-4-turbo', type: 'machine-learning-model', kind: 'hosted-llm', provider: 'openai', modelId: 'gpt-4-turbo', confidence: 0.81, scope: 'excluded',
    evidence: [{ file: 'tests/assistant/test_router.py', line: 27, snippet: 'mock_completion(model="gpt-4-turbo")' }] },
  { ref: 'airom:c49a1e7d2b05f836', name: 'tiny-random-bert.safetensors', type: 'machine-learning-model', kind: 'local-model-file', provider: 'local',
    purl: 'pkg:generic/tiny-random-bert.safetensors?checksum=sha256:5d1c3b7e9f0a2c4e6b8d0f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e', confidence: 0.95, scope: 'excluded',
    file: { format: 'safetensors', sha256: '5d1c3b7e9f0a2c4e6b8d0f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e' },
    evidence: [{ file: 'tests/fixtures/models/tiny-random-bert.safetensors' }] },
  { ref: 'airom:e81f5a03b6c2d947', name: 'umath-validation-set-sin.csv', type: 'data', kind: 'dataset', provider: '', confidence: 0.85, scope: 'excluded',
    dataset: { type: 'csv', size: 412870 },
    evidence: [{ file: 'vendor/numpy/_core/tests/data/umath-validation-set-sin.csv' }] },
];

/* Which application's AI BOM carries which components. A bank's ITSM platform runs an assistant,
   knowledge search and an LLM gateway; core banking ships local credit and rate models; the
   net-banking portal calls hosted models for loan assistance and KYC; the payment switch scores
   fraud with a local model. Ingested SBOMs and queued scans carry no AI BOM. */
export const APP_AI: Record<string, string[]> = {
  'APS-001': ['claude-sonnet-4-6', 'claude-3-5-sonnet-20241022', 'gpt-4o-mini', 'sentence-transformers/all-minilm-l6-v2',
    'anthropic', 'pkg:pypi/openai@1.40.0', 'litellm', 'langchain', 'transformers', 'sentence-transformers', 'chroma', 'rag-pipeline',
    'system-prompt', 'ticket-corpus-2025.jsonl', 'gpt-4-turbo', 'umath-validation-set-sin.csv'],
  'APS-002': ['credit-scorer.pt', 'rate-forecast.onnx', 'torch', 'onnxruntime', 'scikit-learn', 'aml-alerts-history.csv', 'tiny-random-bert.safetensors'],
  'APS-003': ['gpt-4', 'gpt-4o', 'azure-openai', 'pkg:npm/openai@4.28.4', 'langchain4j', 'text-embedding-3-small',
    'intfloat/e5-large-v2', 'pgvector', 'kyc-extraction', 'transformers'],
  'APS-004': ['fraud-detector.h5', 'onnxruntime', 'scikit-learn', 'aml-alerts-history.csv'],
};

/** The key a component is told apart by — its bom-ref. Names are NOT unique in a real AIROM BOM
 *  (openai, anthropic, langchain, ollama each appear several times, told apart by purl). */
export const aiKeyOf = (c: Pick<AiromComponent, 'ref'>) => c.ref;
/** An APP_AI entry: a bom-ref, a purl, or a name that is unique in the catalogue. */
export const aiComponentByKey = (k: string) =>
  AI_CATALOG.find((c) => c.ref === k) ?? AI_CATALOG.find((c) => c.purl === k) ?? AI_CATALOG.find((c) => c.name === k) ?? null;
/** By bom-ref only — no name fallback, so a component read from a file is never confused with a
 *  catalogue entry that merely shares its name. */
export const aiComponentByRef = (ref: string) => AI_CATALOG.find((c) => c.ref === ref) ?? null;
/** By name — first match only; prefer `aiComponentByKey` wherever a bom-ref or purl is known. */
export const aiComponentByName = (name: string) => AI_CATALOG.find((c) => c.name === name) ?? null;
export const aiComponentsFor = (appId: string): AiromComponent[] | null =>
  APP_AI[appId] ? APP_AI[appId].map(aiComponentByKey).filter((c): c is AiromComponent => !!c) : null;
/** Where AIROM found it, as file[:line] — the first occurrence. */
export const foundAt = (c: Pick<AiromComponent, 'evidence'>) =>
  c.evidence[0] ? `${c.evidence[0].file}${c.evidence[0].line != null ? `:${c.evidence[0].line}` : ''}` : undefined;

/* What wrote the AI BOM. One place for the endpoint scan's tool and format; an ingested AI BOM
   reports its own (ProductRecord.ingested['AI BOM'].tool / .format, read from the file). */
export const AIROM_SCAN = { tool: 'AIROM 0.4.6', format: 'CycloneDX 1.6', cveLookup: true } as const;
export const isModelKind = (k: AiromKind) => k === 'hosted-llm' || k === 'embedding-model' || k === 'local-model-file';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** 2026-10-23 → "Oct 23, 2026" — the shape the dashboard parses. */
export const fmtIso = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}, ${y}`; };

/** The older screens (an application's AI BOM tab, its Overview, the dashboard) read the legacy
 *  AiModel shape. This fills it ONLY from AIROM fields — licence reads "Not reported" because AIROM
 *  does not report one, rather than inventing it. */
export const toAiModel = (c: AiromComponent): AiModel => ({
  ref: c.ref,
  purl: c.purl,
  excluded: c.scope === 'excluded',
  eolState: c.eol?.state,
  name: c.name,
  provider: c.provider,
  version: c.version ?? c.modelId ?? '—',
  task: c.kind,
  license: 'Not reported',
  parameters: c.params ? [c.params.temperature && `temperature ${c.params.temperature}`, c.params.maxTokens && `max_tokens ${c.params.maxTokens}`].filter(Boolean).join(' · ') || '—' : '—',
  source: c.kind === 'hosted-llm' || c.kind === 'service' || (c.kind === 'embedding-model' && c.provider === 'openai') ? 'Hosted API' : c.kind === 'local-model-file' || c.kind === 'embedding-model' ? 'Local weights' : 'Embedded',
  usage: foundAt(c) ?? '—',
  eol: c.eol?.shutdown ? fmtIso(c.eol.shutdown) : undefined,
  risk: c.file?.pickleRisk ? `pickle-import risk (${c.file.pickleImports?.join(', ')})` : undefined,
  kind: (['hosted-llm', 'local-model-file', 'embedding-model', 'framework', 'vector-db', 'prompt', 'dataset', 'infra', 'rag-pipeline'] as const).includes(c.kind as never)
    ? (c.kind as AiModel['kind']) : c.kind === 'library' ? 'framework' : c.kind === 'service' ? 'infra' : 'dataset',
  subtitle: c.kind,
});
