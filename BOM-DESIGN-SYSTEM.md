# BOM module — design system & build guide

**Purpose.** Hand this file to a fresh Claude Code session (any account, any repo) and it should be
able to build BOM screens that are visually and behaviourally indistinguishable from the ones in
this project. Everything here is extracted from the shipped implementation, not from memory.

**Reference build:** <https://zenichakalasiya.github.io/serviceops-ticket-detail/> → BOM icon in the
left rail (the stacked-layers glyph) → open any endpoint.

**Stack assumed:** React + TypeScript, Tailwind CSS v4, `lucide-react` icons, Radix primitives for
tooltips, `sonner` for toasts. All colours are written as arbitrary hex values in Tailwind
brackets (`text-[#364658]`) — this codebase does **not** use a Tailwind theme palette, and new work
must not introduce one.

---

## 1. Foundations

### 1.1 Colour

There is no colour abstraction layer. Use these hex values literally. Frequency in the shipped
module is given so you can tell load-bearing tokens from incidental ones.

| Role | Hex | Notes |
|---|---|---|
| **Primary text** | `#364658` | Every value, heading, table cell. Most-used colour in the module. |
| **Brand / primary action** | `#3D8BD0` | Links, active tabs, primary buttons, selected states. |
| **Primary hover** | `#3479b5` | Filled-button hover only. |
| **Muted text** | `#7B8FA5` | Labels, secondary lines, "of N" counts, uppercase section heads. |
| **Placeholder / disabled** | `#9CA3AF` | Input placeholders, em-dash empty values, disabled labels. |
| **Control border** | `#DFE5ED` | Buttons, selects, popovers, drawer headers. |
| **Input border** | `#d1d5db` | Text inputs specifically (deliberately different from control border). |
| **Divider — table** | `#E5E7EB` | Table row dividers, card borders. |
| **Divider — subtle** | `#F0F2F5` | Inside-card hairlines, drawer section splits. |
| **Row hover** | `#F9FAFB` | Table rows, dropdown options. |
| **Surface hover** | `#F5F7FA` | Icon buttons, secondary buttons. |
| **Selected surface (blue)** | `#F5FAFF` | Chosen dropdown option, current version card. |
| **Active chip (blue)** | `#EBF5FF` | Applied filter chips, active icon buttons. |
| **ID pill / Current pill** | `#E8F4FD` | On `#3D8BD0` text. |
| **Neutral chip** | `#F1F5F9` | Format pills, glob chips, "Unchanged". |
| **Neutral chip (alt)** | `#EEF2F6` | Count badges. |

**Status colours.** Always used as a triple — dot/icon, text, background.

| Status | Dot / icon | Text | Background |
|---|---|---|---|
| Success / Added / Generated / Compliant | `#22C55E` | `#22A06B` | `#ECFDF3` |
| Warning / Updated / Partial / Deprecated | `#F59E0B` | `#D97706` | `#FEF7E6` |
| Danger / Removed / CVE / Quantum-vulnerable | `#EF4444` | `#DC2626` | `#FEF3F2` |
| Neutral / Unchanged / Not Generated | `#94A3B8` | `#64748B` | `#F1F5F9` |

Agent-health dot: green `#22C55E` online, amber `#EAB308` stale.

### 1.2 Type scale

Only five sizes exist. Do not introduce others.

| Size | Use |
|---|---|
| `text-[16px] font-semibold` | Drawer / page title (one per screen). |
| `text-[15px] font-semibold` | Section heading inside a screen ("Versions"). |
| `text-[14px]` | Content tab labels. |
| `text-[13px]` | **The workhorse.** Body, controls, dropdown options, table cells in drawers. |
| `text-[12px]` | Table cells in grids, metric counts, secondary lines, helper text. |
| `text-[11px]` | Pills, badges, uppercase field labels. |

Uppercase field label: `text-[11px] uppercase tracking-wide text-[#7B8FA5]`.
Monospace (`font-mono`) is reserved for machine identity: PURLs, paths, glob patterns, versions,
hostnames, CVE ids, component names.

### 1.3 Control sizing

| Height | Use |
|---|---|
| `h-9` (36px) | Form-row controls: selects and their sibling CTAs. |
| `h-8` / `size-8` (32px) | Toolbar controls: search, filter, icon buttons, secondary buttons. |
| `h-7` / `size-7` (28px) | In-table row actions, popover footer buttons. |

Icon sizes: `14`–`16` inside controls, `11`–`13` inside pills, `15` for metric icons.

### 1.4 Radius

| Class | Use |
|---|---|
| `rounded` (4px) | **Every interactive control** — buttons, inputs, selects, icon buttons, filter pills. |
| `rounded-sm` | Status pills and badges. |
| `rounded-lg` | Surfaces: popovers, dropdown menus, cards, modals. |
| `rounded-full` | Count badges, dots, avatars. |

This is a hard rule inherited from the wider product: **a new control is `rounded`, never
`rounded-md`.**

---

## 2. Component patterns

Copy these class strings verbatim.

### 2.1 Buttons

```tsx
// Primary
className="inline-flex h-9 items-center gap-1.5 rounded bg-[#3D8BD0] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#3479b5]"

// Secondary (bordered)
className="inline-flex h-8 items-center gap-1.5 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] font-medium text-[#364658] transition-colors hover:bg-[#F5F7FA]"

// Secondary, brand-tinted (used for Compare versions)
className="inline-flex h-8 items-center gap-1.5 rounded border border-[#3D8BD0] bg-white px-3 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"

// Tertiary (no chrome — icon + label in brand colour)
className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"

// Icon button
className="flex size-8 items-center justify-center rounded border border-[#DFE5ED] bg-white text-[#7B8FA5] transition-colors hover:bg-[#F5F7FA] hover:text-[#364658]"

// Destructive (popover confirm only)
className="inline-flex h-7 items-center gap-1.5 rounded bg-[#DC2626] px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#B91C1C]"
```

Disabled: `disabled:cursor-not-allowed disabled:border-[#DFE5ED] disabled:text-[#9CA3AF]` (bordered)
or `disabled:bg-[#CBD5E1]` (filled). Always give a `title` explaining *why* it is disabled.

### 2.2 Select (custom dropdown — never native `<select>`)

```tsx
<div className="relative">
  <button className="inline-flex h-9 w-[260px] items-center justify-between gap-2 rounded border border-[#DFE5ED] bg-white px-3 text-[13px] text-[#364658] transition-colors hover:border-[#3D8BD0]">
    <span className="truncate">{label}</span>
    <ChevronDown size={15} className={`flex-shrink-0 text-[#7B8FA5] transition-transform ${open ? 'rotate-180' : ''}`} />
  </button>
  {open && (
    <>
      {/* click-away catcher — REQUIRED, z-40 */}
      <div className="fixed inset-0 z-40" onClick={close} />
      <div className="absolute left-0 top-full z-50 mt-1 w-[260px] rounded-lg border border-[#DFE5ED] bg-white py-1 shadow-lg">
        <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-[#7B8FA5]">Group label</div>
        <button className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
          selected ? 'bg-[#F5FAFF] font-medium text-[#3D8BD0]' : 'text-[#364658] hover:bg-[#F9FAFB]'
        }`}>
          <span className="truncate">{option}</span>
          {selected && <Check size={15} className="flex-shrink-0 text-[#3D8BD0]" />}
        </button>
      </div>
    </>
  )}
</div>
```

Rules: dropdown width **matches** its trigger; selection is a blue check, never a checkbox; a
group header appears whenever the list needs context.

### 2.3 Side drawer

Every BOM sub-screen is a right-anchored drawer, not a centred modal.

```tsx
<div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/50">
  <div className="flex h-full w-[1240px] max-w-[96vw] flex-col bg-white shadow-xl">
    {/* header */}
    <div className="flex items-center justify-between gap-3 border-b border-[#DFE5ED] px-5 py-3">
      <div className="min-w-0">
        <h3 className="text-[16px] font-semibold text-[#364658]">{title}</h3>
        <p className="mt-0.5 text-[13px] text-[#7B8FA5]">{breadcrumbish subtitle}</p>
      </div>
      <button className="flex size-8 flex-shrink-0 items-center justify-center rounded text-[#7B8FA5] transition-colors hover:bg-[#F3F4F6] hover:text-[#364658]">
        <X size={18} />
      </button>
    </div>
    {/* toolbar (px-5 py-3) */}
    {/* body */}
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">…</div>
    {/* footer */}
    <div className="border-t border-[#F0F2F5] px-5 py-3">…</div>
  </div>
</div>
```

Widths actually in use — pick the smallest that fits the content:

| Width | Screens |
|---|---|
| `w-[1240px] max-w-[96vw]` | Components listing, Compare BOMs (wide grids) |
| `w-[1080px] max-w-[96vw]` | Manage scan paths (config table) |
| `w-[760px] max-w-[95vw]` | Scan runs (simple list) |
| `w-[560px] max-w-[95vw]` | Product form |

A drawer stacked **on top of** another uses `z-[10000]` and a lighter scrim (`bg-black/40`) so the
drawer beneath stays legible.

### 2.4 Table (inside a drawer)

Borderless, hairline-divided. Never zebra striping, never vertical rules.

```tsx
<table className="w-full min-w-[1100px]">
  <thead className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white">
    <tr>
      <th className="w-[40px] px-4 py-2.5 text-left"><input type="checkbox" … /></th>
      <th className="whitespace-nowrap px-4 py-2.5 text-left text-[12px] font-semibold tracking-wider text-[#364658]">Header</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-[#e5e7eb] bg-white">
    <tr className="transition-colors hover:bg-[#f9fafb]">
      <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#364658]">
        <span className="block max-w-[300px] truncate" title={full}>{value}</span>
      </td>
    </tr>
  </tbody>
</table>
```

Checkbox: `h-3.5 w-3.5 cursor-pointer rounded border-[#d1d5db] text-[#3D8BD0] focus:ring-[#3D8BD0] focus:ring-offset-0`.
Empty value is an em-dash in `#9ca3af`, never blank.
Empty grid: `<tr><td colSpan={n} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">…</td></tr>`.

### 2.5 Pills and badges

```tsx
// Status pill (tinted, from the status triple)
<span className="inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: bg, color: text }}><Icon size={13} />{label}</span>

// CVE pill — always this exact treatment
<span className="inline-flex items-center gap-1 rounded-sm bg-[#FEF3F2] px-1.5 py-0.5 text-[11px] font-semibold text-[#DC2626]">
  <ShieldAlert size={11} />{n} CVE
</span>

// Count badge beside a heading
<span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#EEF2F6] px-1.5 text-[12px] font-semibold text-[#64748B]">{n}</span>

// Applied filter chip
<span className="inline-flex items-center gap-1 rounded-sm bg-[#EBF5FF] px-1.5 py-0.5 text-[12px] text-[#3D8BD0]">
  <span className="font-medium">{field}</span><span className="text-[#7B8FA5]">{op}</span><span className="font-medium">{value}</span>
  <button className="text-[#3D8BD0]/70 hover:text-[#DC2626]"><X size={12} /></button>
</span>
```

### 2.6 Tooltips

Radix, and in this module **instant**:

```tsx
<Tooltip delayDuration={0}>
  <TooltipTrigger asChild><span className="cursor-help …">{trigger}</span></TooltipTrigger>
  <TooltipContent side="bottom" className="max-w-[320px] text-wrap">{text}</TooltipContent>
</Tooltip>
```

The product default is 700ms; BOM overrides it to `0` everywhere. `text-wrap` is required — the
shared `TooltipContent` applies `text-balance`, which splits long text into ragged short lines.

### 2.7 Info hint

Reference text that must exist but not be in the reading path goes behind an icon:

```tsx
<Tooltip delayDuration={0}>
  <TooltipTrigger asChild>
    <span className="inline-flex cursor-help items-center text-[#9CA3AF] transition-colors hover:text-[#3D8BD0]"><Info size={14} /></span>
  </TooltipTrigger>
  <TooltipContent side="right" className="max-w-[320px] text-wrap">{text}</TooltipContent>
</Tooltip>
```

Sits on the label it explains, not floating beside the control.

### 2.8 Confirmation popover (destructive actions)

Destructive actions never fire on first click and never open a modal. They confirm **in place**:

```tsx
<span className="relative">
  <button onClick={toggle} className="flex size-7 items-center justify-center rounded …"><Trash2 size={14} /></button>
  {confirming && (
    <>
      <div className="fixed inset-0 z-40" onClick={cancel} />
      <div className="absolute right-0 top-full z-50 mt-1 w-[280px] whitespace-normal rounded-lg border border-[#DFE5ED] bg-white p-3 text-left shadow-lg">
        <p className="text-[13px] font-medium text-[#364658]">Delete {name}?</p>
        <p className="mt-1 text-[12px] text-[#7B8FA5]">{what actually happens}</p>
        <div className="mt-3 flex items-center justify-end gap-2">{Cancel}{Delete}</div>
      </div>
    </>
  )}
</span>
```

⚠️ `whitespace-normal` is mandatory — table cells are `whitespace-nowrap` and the popover inherits
it, forcing the copy onto one line that runs off the drawer edge.

### 2.9 Search-driven filter builder

Replaces per-column selects. One search box builds `field → operator → value` conditions.

- Click the box → popup step 1: **Filter by field** (list of column names, chevron each).
- Pick a field → step 2: **Operator** — `is`, `is not`, `contains`, `does not contain`.
- Pick an operator → step 3: **Value** — a searchable list of that column's real values for
  `is`/`is not`; a free-text input (Enter to apply) for `contains`.
- Applied conditions render as chips inside the box; a "Clear all" button appears beside it.
- A breadcrumb of the in-progress selection shows in the box while stepping.

For a date field the operators are `is within` / `is before` / `is after` / `is between`, and the
value step offers quick ranges (Last 7 days, Last 30 days, This quarter, Last 6 months, This year)
plus a custom range.

Where a grid needs multi-dimensional filtering instead, use **one** filter icon opening a single
popup with checkbox groups and a count badge on the icon — never a row of selects.

### 2.10 Empty states

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <div className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-[#F5F7FA]">
    <Layers className="size-6 text-[#9CA3AF]" />
  </div>
  <p className="text-[14px] font-medium text-[#364658]">{what is empty}</p>
  <p className="mt-1 max-w-[440px] text-[13px] text-[#7B8FA5]">{why, and what to do}</p>
</div>
```

---

## 3. Screens

### 3.1 BOM Inventory (listing)

Page shell: left icon rail + header + toolbar + table + pagination.

- **Title** "BOM Inventory" (`text-[16px] font-semibold`), then a segmented scope control:
  `Agent CIs · N` / `Managed CIs · N` in a `rounded border border-[#DFE5ED] p-0.5` group; active
  segment `bg-[#3D8BD0] text-white`.
- **Right:** primary `+ Ingest BOM`, then icon buttons (Export, Download, Refresh, Columns, More).
- **Second row:** full-width search, `h-[36px]`.
- **Columns:** CI (health dot + id pill) · Host Name · IP Address · OS · BOM Status ·
  Products · Components · Findings · Crypto Assets · AI Models · Last Generated.
  - BOM Status is a tinted pill: Generated (green, `ShieldCheck`), Partial (amber, `RefreshCw`),
    Not Generated (grey, `MinusCircle`).
  - **Findings** is amber-semibold when > 0, grey when 0 — it is the reason to open a row.
  - Crypto Assets shows a `KeyRound` icon + count, em-dash when none.
- Row click opens the endpoint detail landed on its BOM tab.
- "Managed CIs" is a deliberate empty state (BOMs ingested rather than agent-scanned).

### 3.2 BOM tab (on the endpoint detail page)

**Control bar** — one row, `flex items-end gap-2`:

1. `BOM type` label + select (SBOM / CBOM / AI BOM), `w-[260px]`. **No counts on the options.**
2. `Scanned paths` label + info hint + select, `w-[260px]` (same width — they must match).
   Options list every scope with a findings badge (amber when > 0, grey at 0).
3. Settings icon button (`size-9`) → opens Manage scan paths.
4. `ml-auto self-start` primary **Scan BOM** (`ScanLine` icon). `self-start` because the labelled
   selects push the row's baseline down and the CTA has no label.

**Versions heading** — `Versions` + count badge + info hint; right side holds a search icon that
expands into the date filter, then the `Compare versions` button.

**Version rail** — cards separated by a dotted connector.

Card (`flex items-center gap-3 rounded-lg border px-4 py-2.5`, current = `border-[#3D8BD0] bg-[#F8FBFF]`):
- Line 1: `v3` (15px semibold) · timestamp (14px) · `Current` pill *(only on the current one —
  "Superseded" on every older card is noise)* · format pill (`CycloneDX 1.6`).
- Line 2 (`mt-2.5`, `gap-x-6`): CVE metric first, then added / updated / removed as **icon + count
  only** (12px semibold), no words. Icons: `CirclePlus` green, `RefreshCw` amber, `CircleMinus`
  red. Zero renders grey. Each has an instant tooltip carrying the word.
- Right block: download icon → format popover; `View components · N` link.
- The CVE metric is interactive when > 0: hovering **the card** swaps `ShieldAlert` → `ArrowRight`,
  and clicking opens the component listing sorted CVE-first.

Connector (between cards only — never after the last):
```tsx
<div className="relative">
  <span aria-hidden className="absolute bottom-0 left-[7px] top-0 border-l border-dashed border-[#CBD5E1]" />
  <button className="group relative flex w-full items-center gap-2 py-5 pl-6 text-left">
    <span className="absolute left-[3px] size-2 rounded-full border border-[#CBD5E1] bg-white" />
    <span className="text-[12px] text-[#7B8FA5]">2 scans between v1 and v2 · 1 found no change</span>
    <span className="text-[12px] font-medium text-[#3D8BD0] opacity-0 group-hover:opacity-100">View</span>
  </button>
</div>
```
The white-filled dot breaks the dashed rule so it reads as a node on the line.

### 3.3 Components drawer (`View components · N`)

`w-[1240px]`. Header carries title + context subtitle, and the Export CTA reads **"Export All"**,
switching to **"Export 12"** once rows are selected. Toolbar is the filter builder (§2.9).

Columns by BOM type — they are genuinely different objects, not one table relabelled:

| SBOM | CBOM | AI BOM |
|---|---|---|
| Change · Component · Version · Vulnerabilities · Type · Ecosystem · PURL · License · Origin | Change · Asset · Primitive · Algorithm · Key Length · Protocol · Location · Expiry · Compliance | Change · Model · Provider · Version · Task · Parameters · Source · License · Used For |

**Change** is a tinted pill (Added / Updated / Removed / Unchanged) and rows sort
Added → Updated → Removed → Unchanged, so a version's listing opens on what it changed. When
entered from the CVE metric, vulnerable components sort to the top instead (most CVEs first).

### 3.4 Compare BOMs drawer

`w-[1240px]`, titled **"Compare BOMs"**.

**Control row** — versions lead, scope is settled context:
```
Compare versions
[v3, Jun 14, 2026 (99)]  with  [v2, Jun 12, 2026 (99)]     Scanned path : OS / base platform  🔁 Change path
```
- Each version end is one line: `v{n}` semibold, `, {date} `, `({count})` muted. Same format in
  the dropdown. `w-[220px]`.
- Scanned path is an **all-grey read-out** — only the `Repeat` icon and "Change path" carry colour.
  Clicking opens the path list instantly.

**Tabs:** `All (x) · Added (y) · Updated (z) · Removed (k) · Unchanged (f)`. The four category
counts must sum to All.

**All tab body:**
1. **CRITICAL VULNERABILITY** section first — every component carrying CVEs. Rows here show
   name · category pill · CVE pill · version.
2. Then `ADDED` / `UPDATED` / `REMOVED` / `UNCHANGED` sections, each with an icon + uppercase
   title + count, `mb-10` apart. Rows here carry the colour indicator only — no category pill.

Every row: `rounded border border-[#E5E7EB] border-l-[3px]` with the left edge in the category
colour, monospace **semibold** name, and the CVE pill whenever CVEs exist *(this is independent of
the category pill — inside a single tab it is the only signal separating vulnerable from clean)*.

Expanded row — one line of six fields on the same white surface, hairline above:
`PURL · Ecosystem · License · Origin · Component Type · Version change`, laid out with
`gridTemplateColumns: '2.4fr 1fr 1.1fr 1.1fr 1.2fr 1.6fr'`, everything truncating with a `title`.
Below it, `VULNERABILITIES · n` listing each CVE as a clickable chip that opens that CVE's detail
page.

### 3.5 Manage scan paths drawer

`w-[1080px]`. Search + `+ Add product`, then a table:
`Product · Ver. · Path · Excluded Path · Source · Status · Last Scan · Actions`.

- The default scope carries a `★ Default` pill.
- Excluded Path shows **one glob inline + a `+N` chip** whose instant hover (side `bottom`) lists
  the rest.
- Row actions: edit (opens the product form) and delete (confirms in a popover, §2.8). The OS
  scope cannot be deleted — button disabled with an explanatory `title`.
- Footer: Cancel / Save changes.

### 3.6 Product form drawer

`w-[560px]`, stacked above the scan-paths drawer at `z-[10000]`. Fields: Product name\*, Version,
Path\*, "Exclude paths — this product only", plus a bordered checkbox block **"Make this the
default product"** explaining that only one scope can be the default. Required fields validate on
submit with red border + message. Title/CTA switch between Add and Update.

### 3.7 Scan runs drawer

`w-[760px]`. Table: Timestamp · Trigger · Duration · Result · Outcome. Result is a tinted pill;
outcome is monospace (`+2 · −1 → v3`).

---

## 4. Data model

`bomData.ts` is the single source of truth. **Every number on every screen derives from one
function**, so no two screens can disagree.

```ts
type BomType = 'SBOM' | 'CBOM' | 'AI BOM';
type BomStatus = 'Generated' | 'Partial' | 'Not Generated';

componentCount(endpointId, productKey, type)  // sizes a scope
bomComponents(endpointId, productKey)          // SBOM entries, exactly componentCount long
bomCryptoAssets(endpointId, productKey)        // CBOM entries
bomAiModels(endpointId, productKey)            // AI BOM entries
bomVersions(endpointId, productKey, type)      // 3 versions, v3 = Current
bomDiff(endpointId, productKey, type, from, to)// added/updated/removed/unchangedEntries
bomForEndpoint(endpointId)                     // listing row
excludedPathsFor(endpointId, productKey, name) // per-component globs
```

Determinism rules that must hold:

- Everything is derived from a **stable string hash of the endpoint id** — no `Math.random()`,
  no `Date.now()`. The same id always yields the same BOM.
- A version's **change counts come from the same `bomDiff`** the compare screen renders.
- A version's `generatedAt` **is** its newest scan run's timestamp.
- A host's `lastGenerated` is the newest current version across its scopes — the listing can
  never claim a date the timeline does not show.
- The five compare tabs sum to the pool size, because `unchangedEntries` is *derived* as
  "pool minus touched", not counted separately.
- Component lists are cycled from a catalog with version+PURL bumps to reach the reported count —
  so "View components · 183" really lists 183 rows.

---

## 5. Behavioural rules

1. **Vulnerabilities lead.** Wherever CVEs exist they come first — the CVE metric is first on a
   version card, the Critical section is first in the All tab, CVE-first sorting on that entry
   point. A BOM exists to answer "what is exposed".
2. **A version only exists when a scan found a change.** The connector between two cards accounts
   for the scans that ran and found nothing — never hide them, never fake versions for them.
3. **One control, not a row of them.** Filtering is a search that builds conditions, or a single
   filter icon. Never one select per column.
4. **Reference text lives behind an info icon**, not inline.
5. **Destructive actions confirm in place** and say what actually happens to the data.
6. **Empty ≠ missing.** An empty category section is correct when the count is genuinely 0; an
   empty section because you filtered rows out of it is a bug.
7. **Labels via tooltip, not text**, once an icon carries the meaning (the change metrics).
8. **Colour is never the only signal** — the category left-edge is paired with an icon.

---

## 6. Gotchas that cost time here

- **`vite build` does not typecheck.** A missing import passes the build and throws
  `ReferenceError` at runtime. Always open the screen in a browser before declaring done.
- **`whitespace-nowrap` on a `<td>` cascades into popovers** rendered inside it. Set
  `whitespace-normal` on the popover.
- **A `<button>` does not inherit its cell's `font-size`** in this setup — put the size on the
  button.
- **Shifts on a uint32 hash must be `>>>`, not `>>`.** A signed shift turns values above 2³¹
  negative; `Array.from({length: -1})` is silently empty, so rows vanish with no error.
- **`new Date('2026-06-12')` parses as UTC**, but `new Date('Jun 12, 2026')` parses as local. Mixing
  them lets same-day records slip past an "is before" filter. Resolve picker values to local
  midnight.
- **A single-line `flex-1` box stretches**; size it to content when it holds two short lines.
- Adding a tab to the endpoint drawer needs **four** edits: `allTabs`, `tabWidths`, `tabLabels`,
  and the `tabConfig`/`allowedTabIds` array inside the tab-strip IIFE. Missing the last silently
  hides the tab.

---

## 7. Acceptance checklist

- [ ] Every control is `rounded`; every surface is `rounded-lg`; every pill is `rounded-sm`.
- [ ] Only the five type sizes appear.
- [ ] Every dropdown has a `fixed inset-0 z-40` click-away catcher and matches its trigger width.
- [ ] Tooltips are `delayDuration={0}` and carry `text-wrap`.
- [ ] Status colours are used as the full triple (dot/icon + text + background).
- [ ] Machine identity is `font-mono`; prose is not.
- [ ] Empty values are em-dashes, not blanks.
- [ ] Counts on tabs reconcile with the rows rendered.
- [ ] Destructive actions confirm before firing.
- [ ] The screen was opened in a browser and the console is clean.
