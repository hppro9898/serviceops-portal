# BOM / CMDB session handoff

## ★ 2026-10-05 (latest) — BOM Dashboard counts PRODUCTS, not CIs

- `bomDashboardData.bomDashboard()` now walks **`bomProducts()`** (products in BOM scope) instead of
  `mockEndpoints`; queued products count toward scope but not reach. Each product contributes only the
  BOM types it has (`productBomTypes` — an ingest is SBOM-only). Memoised against the new
  `productsVersion()` (bomProductsData), and the page calls `useProductsVersion()`, so add/remove re-derives.
- Field renames: `ciCount`→`productTotal`/`bomProducts` (+ `licenceSeats`, `agentProducts`,
  `ingestProducts`, `queuedProducts`); `vulnerableCis`→`vulnerableProducts`; `eolModelCis`→`eolModelProducts`;
  row `cis`→`reach`; cert/model `endpointId`/`ciId`→`productId`/`productName`. Path fields
  (`pathScopes/pathProducts/pathTotal/pathCis/fullFsCis`, `PATH_PRODUCTS`, `scopeOfPath`) REMOVED →
  `sources: BomSourceStat[]` (Agent · application path / Agent · full scan / Ingest · uploaded SBOM).
- UI: new first KPI **Products in BOM scope** (N of 10 licences · queued chip · agent/ingest split), the
  other KPI contexts read "/N products"; **Managed paths → `BomSourcesCard` "BOM sources"**; exposure
  list "% of N products"; cert/model timelines count products. Cert/model rows open the **product** on
  its CBOM / AI BOM tab via `bomProductRecord()` (replaces `bomPatchRecord`) + a `landOn` field the
  product drawer honours. `DrawerStack.open` now REFRESHES an already-open item's data (so `landOn`
  reaches it). Hidden Dashboard 2 updated to compile with the same fields.
- Backup: `.backup-before-bom-dashboard-products-20261005/`.

## ★ 2026-10-05 (later) — product page full-page with SBOM/CBOM/AI BOM tabs; CI → CMDB BOM tab; Footprint removed; technician = Ingest only

- **Product detail (`BomProductDrawer`)** opens FULL PAGE (`innerWidth − 54`, small view 1080 — same as
  every module). Tabs = **Overview · SBOM · CBOM · AI BOM** (counts in badges). Each BOM tab is
  `ProductBomTypeView` (`BomTypeTabs.tsx`) = `EndpointBomTab` with the new **`lockedType`** prop (pins the
  type, hides the type select). Ingested products show an empty state on CBOM/AI BOM.
- **Software Footprint is GONE** — tab, `FootprintTab`, and all footprint data/helpers in
  `bomProductsData.ts` (`softwareFootprint`, catalog, confirm/dismiss/add). Only `isWindows` +
  `deriveProductPath` stay (used by `affectedProducts`).
- **Linked CI opens CMDB**: CI pill in the product header/CMDB-link section, BOM › Products table and
  Admin BOM Scope table → `OPEN_CI_EVENT` / `__bomStore.openCi(id)` → `BomProductHost` opens
  `'cmdb'` with `serviceCiRow(ci)` + `landOn: 'bom'`. `CmdbDrawer` lands on **CI Details › BOM** for it.
- **CMDB BOM tab** (`CiBomTab.tsx`): shown only when `linkedProductsFor(ciId)` is non-empty; added to
  BOTH tab lists (`allTabs` splice after software + `tabConfig`) and `tabLabels`; product picker (when
  several link) + the same SBOM/CBOM/AI BOM tabs + "Open product".
- **Technician side** (BOM › Products): the Add menu is now a single **Ingest BOM** button; the Agent
  flow lives only in Admin › BOM Scope.
- Backup: `.backup-before-bom-tabs-cmdb-20261005/`.

## ★ 2026-10-05 — Add form has no Agent/Ingest switch; agents are AGENT-N; new service = Name + Status

Supersedes the EP-### and owner/criticality points in the entry below.
- **Add product**: the Agent / Ingest choice is made in the Add product MENU only; the form no longer
  shows the two switch cards — its title says `Add product · Agent` / `Add product · Ingest`.
- **Agents are `AGENT-N`** (servers AGENT-1…5, then the endpoint fleet AGENT-6…35), rendered by the
  shared **`AgentIdPill`** (`BomProductFormParts`): health dot + grey `rounded-md` id pill. The agent
  dropdown shows the pill + host name (muted).
- **Create new service** asks only **Name + Status** (`SERVICE_STATUSES`: Operational /
  Non-Operational / In Maintenance / Retired); the service-type choice above it stays. `ServiceCi`
  carries `status` (owner/criticality removed); the drawer shows Status.
- **Listings (Admin › BOM Scope AND BOM › Products)**: Agent = dot + `AGENT-N` pill only, CMDB link =
  grey `CI-###` pill only (name/type in the hover title); **Scan path / Document moved to column 3,
  Manufacturer after Agent**.
- Backup: `.backup-before-bom-agent-ids-20261005/`.

## ★ 2026-10-05 (later) — Application Service Overview rebuilt (`BomProductOverview.tsx`)
Needs attention (critical CVEs, expired/expiring certs, past-EOL models, deprecated crypto, high
CVEs, licence review, agent offline, failed scan) → 5 KPIs → Vulnerable components + Licences →
Crypto posture (+cert expiry) + AI models (agent only) → Version history + Details. All derived
from the current BOM version via the same functions the tabs use; dates vs today.
**Bug fixed in `bomData.bomVersionStats`:** components were looked up by NAME, so a later CVE-free
build hid the vulnerable one and every current version showed 0 CVEs (SBOM tab too). Now keyed
`name@version`. `productBomSummary` (listing numbers) now uses the same stats — no more hash counts.

## ★ 2026-10-05 — entries are APPLICATION SERVICES (naming + CMDB link are one field)

User decision: don't call it a product. The Add form's first section is **Application Service**:
- type a name, OR **Browse CMDB** → side drawer of all Application Services (`AppServiceDrawer`
  in `BomProductFormParts.tsx`): pick one → name filled + linked; or **New** → drafted, created in
  the CMDB only on save (`resolveAppService`). Typing over a picked name unlinks it.
- The separate "Link to CMDB" section (Business / Application Service, Don't link / Link / Create)
  is GONE. Entries only ever link to Application Services.
- **No CMDB licence** (`isCmdbLicensed` / `setCmdbLicensed` in `bomProductsData.ts`; demo switch
  in the listing's ⋮ menu): same label, typed name only — no Browse, no CMDB Link column, no CMDB
  section on the detail page.
- Entry ids are `APS-N`; `productKey` is now id-based so linking/renaming never changes BOM history.
- UI wording "Product" → "Application Service" across listing, form, detail, component page,
  CMDB BOM tab, dashboard and Admin › BOM Scope. Internal identifiers (ProductRecord, bom-products)
  unchanged. Backup of the pre-change files: `.backup-before-app-service-20261005/`.
- Verify gotcha: when the Chrome window is minimised the tab is `visibilityState: hidden` and
  screenshots time out — that (not a freeze) was the cause of every "renderer frozen" error.

## ★ 2026-10-04 (later) — CMDB link = Business / Application SERVICE; agents are EP-###; Ingest has NO agent

Supersedes the "Link to CMDB = Application Instance CI" and "Ingest: agent OPTIONAL" points below.
- **Link to CMDB (optional, both flows)** links a product to ONE **Business Service or Application
  Service** — **Link existing** (picker filtered by the chosen type) or **Create new** (name prefilled
  from the product, owner, criticality → `createService()` mints the next `CI-8##` on SAVE only, so a
  cancelled form leaves no stray CI). Shared control `ServiceLinkField` (`BomProductFormParts`) is used
  by the Add form AND the product drawer's CMDB link section (Link to service / Change link / Unlink).
  Seed services `CI-801…807` (Business) + `CI-811…816` (Application) live in `bomProductsData.ts`;
  the CMDB listing shows them (and created ones) instead of the removed `APP_INSTANCE_CIS`.
- **"CI" appears only once a product is linked.** Agents are addressed by agent/endpoint id
  `EP-###` (`BomAgent`; servers EP-911/912/913/904/883). `cmdbId` is internal — only the CMDB
  listing's agent-health dot uses it (`agentByCmdbId`).
- **Ingest has no agent** — form field removed, `addProduct` forces `agent: null`, PRD-006 seed fixed;
  Agent column/KPI show "—" / "Document" for ingests.
- Files touched: `bomProductsData.ts`, `BomProductFormParts.tsx`, `BomAddProductPanel.tsx`,
  `BomProductDrawer.tsx`, `BomInventoryTable.tsx`, `BomInventoryListPage.tsx`, `ComponentDrawer.tsx`,
  `CmdbListPage.tsx`, `CmdbTable.tsx` (Application Service icon), `public/bom-admin/index.html`
  (BOM Scope text, table, CMDB-link card split by service type). Backup:
  `.backup-before-bom-service-link-20261004/`. Verified in the running app (create/link/unlink,
  listing, admin page); changed files type-check clean.

## ★ 2026-10-04 — BOM is per PRODUCT, agent-dependent (supersedes the 10-01 Business Application model)

**Concept (from the user, 10-04):** no Business Application CI. A **product** is named when it is
added (common name, version, publisher, manufacturer) and holds **1 BOM licence**. It is NOT a CMDB
record and adding one creates nothing in the CMDB. Three objects stay apart: Software Model
(catalog) · Software Installation (row on the host, not a CI) · Application Instance CI (CMDB).
- **Agent flow:** agent is MANDATORY (agent machines only) + one scan path (root = full scan).
- **Ingest flow:** SBOM upload; agent OPTIONAL.
- **Link to CMDB:** OPTIONAL in both — only **Application Instance CIs** (CMDB › Application, Web
  Server, Application Server, Database). With an agent chosen, only instances running on that
  agent's host are offered. Host is the agent link; Business/Application Service sits above.
- **Asset & CMDB pages:** BOM tab and Software-tab Components column REMOVED (no BOM linking there).

**Files:** `bomProductsData.ts` (store, `window.__bomStore`, seed PRD-001…008, agents, instance
CIs CI-701…710, footprint, `affectedProducts`) · `BomAddProductPanel.tsx` (one form, Agent/Ingest
switch) · `BomProductFormParts.tsx` (AgentPicker, InstancePicker, SeatBanner, SourcePill) ·
`BomProductDrawer.tsx` (Overview · BOM · Software Footprint; StackModule `'bom-products'`) ·
`BomProductHost.tsx` (mounted in App) · BOM › **Products** (route `'bom'`, files still
`BomInventoryListPage/Table`) · component page tab **Affected products** · Admin **BOM Scope**
(`public/bom-admin` renderLicensing). CMDB lists the instance CIs + CI-911…913 servers.
Old Business Application files are in `.backup-before-bom-products-20261004/`.

**Open:** Admin Scheduler/Retention still per CI · Dashboard/Compliance still per host · Endpoint
drawer (Patch/Vuln module) still has its host BOM tab — not covered by "asset and CMDB".

---

## (Superseded) 2026-10-01 — BOM is per Business Application now

**Concept (agreed with the user, don't re-litigate):** a BOM belongs to a **Business Application
CI** (CMDB › Services › Business Service › Business Applications), not to a machine.
1 application = 1 CI link = **1 BOM licence** (10 seats in the demo). CMDB is otherwise unchanged:
installed software stays a ROW on the host's Software tab — there is **no Software Application CI**.
- **Agent scan:** the application runs on ONE **Agent** CI, scanned at ONE path. A root path
  (`/`, `C:\`) = full scan, still 1 licence.
- **Ingest:** SBOM attaches to the Business Application; "Runs on" is optional and any origin
  (Manual / Discovery / Agent). Not deployed ⇒ status **Under Evaluation / Under Development**.
- **Software Footprint** (tab on the application) = catalog software it is built on, with how each
  row was identified (Install path / Longest path match / Package name / Declared in SBOM /
  Catalog suggestion / Added manually). Suggestions need Confirm/Dismiss. Not CIs.

**Files**
- `businessApplicationsData.ts` — THE store (seed CI-601…607 + CI-406 linked; host-CI pool;
  seats; BOM summary; footprint). Exposed as `window.__bomStore` for the admin iframe.
- `BusinessApplicationDrawer.tsx` — detail page (Overview · BOM · Software Footprint),
  StackModule `'business-applications'`.
- `BomAddApplicationPanel.tsx` (scan) + `BomIngestPanel.tsx` (rewritten) + `BomAppFormParts.tsx`
  (shared CI picker, seat banner…) — mounted ONCE by `BomApplicationHost.tsx` in `App`, opened by
  the `bom:add-application` event from BOM listing AND Admin › Licensing (one form, two doors).
- `EndpointBomTab` gained `fixedScope` / `allowedTypes` / `primaryAction` / `ingested` — locks the
  tab to one scope and renders inline (no products overview).
- BOM › **Business Applications** (route `'bom'`, files still named `BomInventoryListPage/Table`).
- CMDB: tree has Business Service › Business Applications, no Software Application node;
  listing rows come from the store; statuses Under Evaluation/Development rendered.
  `CI-501…508` Software Application ids are now **Software Catalog** ids `SW-501…508`.
- `public/bom-admin/index.html` — Licensing rewritten (`renderLicensing` → per application,
  reads `window.parent.__bomStore`); old per-CI version kept as `renderLicensingByCi` (unused).

- Component detail (`ComponentDrawer`): the "Installed on" CI tab is now **Affected business
  applications** — rows from `affectedBusinessApps(c)` (store), filters = status + version,
  row opens the application. BOM Inventory's `# CIs`/`# Products` columns → `# Business Apps`
  from the same function. (`affectedCis` in softwareComponentDetail is no longer used here.)

**Not done / follow-ups**
- Admin **Scheduler & Retention** still target enrolled CIs (`ENROLLED_CIS`), not applications.
- BOM Dashboard, BOM Inventory "installed on" and Compliance Reports are still host-based.
- Multi-host per application and running-process/port detection are deferred by decision.
- Licence count is per Business Application (1 seat), whatever the footprint holds.

**Verify gotcha:** the Claude-in-Chrome screenshot sometimes times out ("renderer frozen") right
after an interaction or a Vite HMR cascade. The page is NOT frozen — JS still runs. Reload fully
before visual checks. Backup of the pre-change source: `.backup-before-bom-business-service-20261001/`.

---


Working project: `/home/harsh-patil/Downloads/BOM/serviceops-portal-main`
Reference project (newer BOM design, partially merged): `../serviceops-portal-main-new`

```bash
pnpm install     # NOT npm — npm crashes on this pnpm tree
pnpm dev         # http://localhost:5173
```

> ⚠️ `pnpm build` uses esbuild and **does not type-check**. A green build can still render a
> blank page. Every change below was verified by driving the running app, not by the build.
> There is **no git** in this folder — the only undo is `.backup-before-new-design/`.

---

## 1. Naming decisions (settled, please don't re-litigate)

| Page | Meaning |
|---|---|
| **BOM Inventory** | one row per *thing* — Software Components + AI Models |
| **Configuration Items** | one row per *CI* — BOM status and content per machine |

- Rationale: "Inventory" belongs on the things page; the CI page is a coverage report.
- Nav labels follow the platform: module-specific name for the *things* page, entity name for
  the *machines* page — the same pattern as `Patch ▸ Patches · Endpoint`.
- `Configuration Items` is the platform's page-level term (`SEARCH_GROUPS`,
  `AddRelationshipPanel`); `CI` / `CIs` stays the inline form in tabs, columns and counts.
- **Product / Application** = the entity where a scope is *created and named*
  (Manage scan paths, ingest form). **Scan scope** = the BOM tab's selector, because there you
  are *picking a place*, not naming a thing.
- Counts renamed: `Products` → **SBOMs** (per CI) and **# SBOMs** (per component). Only
  `Scanned` scopes count — a Pending/Failed scope has produced no document.
- "Packages" means installer artifacts (MSI/EXE/AppX) on the asset Software tab **only**.
  It is never a synonym for SBOM components.

⚠️ **Filenames do not match page names** (deliberate, to avoid a risky rename mid-feature):
- `BomInventoryListPage.tsx` → renders **Configuration Items**
- `SoftwareComponentsListPage.tsx` → renders **BOM Inventory**

Routes: `bom-cis` (Configuration Items), `bom-inventory` (BOM Inventory).

---

## 2. What was built this session

### Admin (BOM prototype — `public/bom-admin/index.html`, vanilla JS in an iframe)
- **Default scan scope**: header button + 4th KPI card on BOM Licensing; drawer with
  Windows/Linux/macOS tabs, **one scan path + one optional exclude path per OS**.
  Volume root (`C:\` `/`) allowed with warning + confirm-on-save; empty scan path blocked;
  literal exclude outside the scan path warns (globs never do); draft editing, per-tab reset.

### BOM Inventory (things page)
- Two top-level tabs **Software Components | AI Models**; All/Vulnerable scope tabs removed.
- **KPIs switch with the tab** — software: Needs attention / Fixes ready / License risk;
  AI: Data leaves the estate / License risk / Governance. All are click-to-filter.
- Crypto assets are modelled and parked in `CRYPTO_ASSETS` (`softwareComponentsData.ts`),
  ready to switch on as a third tab.
- `Ingest BOM` CTA (later moved back to Configuration Items by the new design — see §4).

### Configuration Items
- Scope tabs removed; **Origin** (Agent/Manual) and **BOM Sources** (Agent/Ingested) columns.
- Ingesting onto a CI the agent already reports **merges into that row** rather than creating
  a duplicate.

### CMDB
- **CI-type tree panel** (`cmdbTree.ts`, `CmdbTreePanel.tsx`): Base CI → Hardware → Server /
  Desktops / Laptops / …, plus Infrastructure, Services, Virtualization, Cloud, Application →
  **Software Application** (first) / Web Server / Application Server / Database.
  Selecting a branch shows its **whole subtree**; chevron expands, row selects; search reveals
  rather than filters; empty branches stay listed showing `0`.
- **Software Applications are CIs** (`CI-501`–`CI-508`) with their own drawer
  (`SoftwareApplicationDrawer.tsx`): Properties · **BOM** · Components · Packages ·
  Affected CIs · Vulnerabilities · Consolidated Software · Installation · Meter ·
  Relationships · Linked Events · History · Notes · EOSL Insight.
- **Dependency map**: one **Software Application** group node that expands to the applications
  installed on that host (`application` is its own RelType, own legend entry and filter).
- CMDB drawer gained a **BOM tab** (keyed `CI-###` → `EP-###`).

### Asset / CI Software tab
- Columns: **ID · Application · Type · Version · Publisher · Origin · Packages · Components**.
- ID opens the application's Software Application CI; Packages/Components counts open
  `SoftwareBomPanel`.

### Components panel
- **ID column** resolving to the same `CMP-…` id BOM Inventory uses, matched on
  **name + version**; clicking it opens that component's detail. Components not in the
  fleet-wide list get a stable derived id and still open.

---

## 3. LAST TASK (just completed — verify before building on it)

**Problem the user reported:** the BOM tab showed 2 products, the Software tab showed 8
applications, and the dependency map showed a third set. Same host, three answers.

**Root cause:** three unrelated sources.
- Software tab: a hardcoded `softwareList` array in each drawer
- BOM tab: `APP_PRODUCTS` in `bomData.ts`, sampled `hash % 3`
- Dependency map: `appsForCi()` deterministic subset

**Fix — one source: `src/app/components/applicationsCatalog.ts`** (dependency-free on purpose:
`bomData` needs it, and `softwareApplicationsData → softwareBomData → bomData` would otherwise
close an import cycle).

- `BASE_APPLICATIONS` — the 8 applications, each with `path`, `packages`, `components`, `origin`
- `applicationsOnHost(hostId)` — base set + anything ingested onto that host
- `addIngestedApplication()` + `useApplicationsVersion()` (useSyncExternalStore re-render hook)
- `hostKey()` normalises `CI-###` / `EP-###` to the same machine

Consumers repointed: `bomData.bomForEndpoint` (scopes = the host's applications),
both drawers' Software tabs, and the CMDB dependency map.

**Also:** an ingested document now flips a `Not Generated` host to `Generated` — otherwise
ingesting produced an application on the Software tab and an empty state on the BOM tab.

**Verified live:**
- Software tab and BOM tab both list the same 8 applications (BOM shows 9 = 8 + OS catch-all)
- Ingest "Acme Suite" onto EP-406 → Software tab row `CI-901 · Acme Suite · Manual`,
  BOM tab `Products on this host 10`, Acme Suite present in both

**Not yet screenshotted** — the user interrupted before the final visual confirmation. The
scripted DOM checks above all passed; a visual pass is the only thing outstanding on this task.

---

## 4. Open items / known gaps

1. **Two ingest paths, only one feeds the catalog.**
   `BomInventoryListPage` (Configuration Items) calls `addIngestedApplication` ✅.
   `SoftwareComponentsListPage` (BOM Inventory) still uses `bomIngestStore` and does **not** ✗.
   Ingesting from BOM Inventory will not show on any Software tab. Decide whether to unify.
2. **`EP-408` is `MANY_PRODUCT_HOST`** (41 scopes) and deliberately bypasses the catalog — use
   any other host when testing catalog behaviour.
3. **Orphaned files (0 importers):** `BomScanPathsPanel.tsx`, `ComplianceReportsModule.tsx`,
   `ComplianceReports2Module.tsx`, `public/bom-reports/`. Safe to delete; kept because there is
   no git undo.
4. **Not copied from the new project** (only Configuration Items + its detail were merged):
   `BomDashboardPage`, `BomDashboard2Page`, `AiModelsTab`, `AiComponentDrawer`,
   `bomDashboardData`, `bomDashboardUi`, and the Dashboard entries in its BOM flyout.
5. `ComponentDrawer` is still software-shaped — AI Model and Crypto Asset rows opened from
   BOM Inventory show PURL / fix-version framing that does not fit.
6. Endpoint "Products & scan scopes" does **not** inherit the admin Default-scan-scope
   exclusions (needs host OS threaded through `EndpointDrawer → EndpointBomTab`).
7. Retention precedence when a CI matches two exception rules is **assumed** to follow BOM
   Policy order — never confirmed with the user.
8. `CmdbListPage` CI types are still flat strings, so the FortiGate firewall and the LaserJet
   printer sit under generic *Hardware* rather than Network Devices / Printers.

---

## 5. Deliverables outside the code

- **User story doc** (5 stories: Admin Structure, Licensing, Retention, Scheduler, Policies):
  `/home/harsh-patil/Downloads/BOM/user-story/REQ-BOM_user_story.md`
  and artifact <https://claude.ai/code/artifact/da9d35c5-457c-4608-946b-b6a2d640be5f>
- **Source zip for sharing:** `/home/harsh-patil/Downloads/BOM/serviceops-portal-source.zip`
  (excludes `node_modules`/`dist`; regenerate after these changes)
