# Handoff — 2026-08-13 19:11

## Read first
`CLAUDE.md` → the **Admin listing layout** bullet (still the standard for every admin listing) and
the V2 rule ("version 2" asks → `TicketDrawerV2.tsx` only). Then `DESIGN.md` — it is the
product-wide authority for typography, radius, buttons and tables, and it overrides
`BOM-DESIGN-SYSTEM.md` where the two disagree (see its §6).

**This project now has its own repo.** [Nikhil482008/serviceops-portal](https://github.com/Nikhil482008/serviceops-portal),
live at <https://nikhil482008.github.io/serviceops-portal/>. It used to sit inside the `Test4`
repo; it is git-ignored there now, because the same files in two repos only drift.

## What we worked on this session
The BOM module: rebuilt the endpoint drawer's **Dependencies tab**, renamed a column on BOM
Inventory, restyled the **Compare versions** path control, mounted two prototypes from `public/`
(**Compliance Reports** and **Request Form Rules**), and published the app.

## Completed

**Dependencies tab** — `bomData.ts`, `BomDependencyTree.tsx`, `BomComponentsPanel.tsx`
- The graph is keyed by **`name@version`**, not by name. That single change fixed two faults: 30-hop
  chains (name-keying merged several builds of one library into one node, folding the levels back on
  themselves) and a "Not in graph" count floating against a total twice its size. `direct +
  transitive + notInGraph` now equals the Components tab's row count exactly.
- Guide rails per level, branch tint, parent-vs-leaf affordance visible **at rest**, dep pills beside
  the name, Expand all bounded by a 200-row budget with an `IntersectionObserver` tail, search that
  auto-expands to its matches, full ARIA tree keyboard model.

**BOM Inventory** — `BomInventoryTable.tsx:58`, column header "Findings" → **Vulnerabilities**.

**Compare versions** — `BomCompareVersionsPanel.tsx`, the scanned path is a control
(`in [🗀 OS / base platform ⌄]`) rather than a read-out plus a "Change path" link.

**Two prototypes mounted from `public/`**
- **Compliance Reports** — `ComplianceReportsModule.tsx`, BOM flyout → Compliance Reports. Iframes
  `public/bom-reports/index.html?embed=1#/bom/reports`. The flyout row was a dead placeholder.
- **Request Form Rules** — `AdminFormRulesModule.tsx`, Admin › Request Management › Request Form
  Rule. Iframes `public/request-form-rules/index.html`. That card had an href and no screen.
- Both follow `AdminBomModule`'s pattern: **the prototype IS the screen**, not a React
  re-implementation of it, so a rule's behaviour has one home.

## BOM Inventory: two records, two destinations — and a crash nobody could have seen

**A row addresses two different things, and they now have separate homes.** The listing had one
clickable id doing double duty: the column was headed CI, so the endpoint drawer rewrote its own
header to a CI id to stop `CI-408` landing on a page titled `EP-408`. That was a workaround for a
missing column, not a design.

| Column | Record | Opens |
|---|---|---|
| **CI** | the asset the components hang off | Asset › Hardware Asset, on its **BOM** tab |
| **End Point** | the machine the agent scanned | the endpoint detail page, on its BOM tab |

Both land on the same `EndpointBomTab`, so one host's Bill of Materials cannot show two different
answers depending on the door. The asset carries `bomEndpointId` — without it the CI id would seed
the deterministic generator and produce a second, unrelated BOM. The header rewriting in
`EndpointDrawer` and the `displayId` rewriting in `DrawerStack` are both **deleted**: each record
carries its own id now, which is the change the report asked for as "just the heading will change".

The Hardware Asset drawer gained a **BOM tab immediately after Software** — both answer "what is
installed on this asset", Software from the inventory agent and BOM at component depth.

**Other changes in this pass.** `BomStatus` `Partial` → `In Progress` (the type, the generator and
the pill; the many `Partial<T>` utility types in the codebase are unrelated and untouched).
The Ingest drawer is headed **Ingest BOM** and says out loud that only SBOMs can be ingested today
— the title names the family, so the subtext has to name the member. The **API-paste path is gone**
(file upload is the only source, and `IngestResult.source` stays a union so a second one can return
without touching consumers), and **Product / application → Product name**. The New CI drawer drops
IP address and Operating system and gains a **CI type** tree (Base CI › Hardware › Server /
Desktops / Laptops / Network Devices / Storage Devices); branches expand, leaves select, and only
branches draw a chevron — a chevron that opens nothing is a broken affordance. On the detail page
the **Scanned paths** control is now **Product**: it selects a product, and the path it was scanned
at is a property of that product, so it stays in the hint where it explains rather than labels.

### ⚠ The CI picker threw on every click, in the build that is deployed right now

`BomIngestPanel` called `setShowTypeMenu(false)` in the CI picker's `onClick` and **never declared
it**. Clicking the picker raised `ReferenceError: setShowTypeMenu is not defined`. It is in `HEAD`;
it has been shipping.

Nothing caught it because nothing could: **`vite build` strips types without checking them**, the
project has no `typescript` dependency and no typecheck script, so `npx tsc` cannot even run. A
green build is not evidence about identifiers. The fix is item 5's own state — the leftover call
was a half-finished CI-type dropdown — so implementing what was asked for is what repaired it.

**Verified by rendering, not by building.** `bomprobe.mjs` bundles the changed components with
esbuild (`figma:asset/*` and CSS stubbed) and drives them in jsdom — 43 checks: the two columns and
their two destinations, the status pill, the drawer's heading and subtext, the removed API field,
the CI-type tree, the required name, the renamed control. `teeth.mjs` adds 13 more, and the first
of them matters most: it re-bundles `BomIngestPanel` **exactly as committed** and asserts the click
DOES throw. A check that cannot fail is not evidence, and this one was worth proving — the first
attempt at it deleted the declaration from the CURRENT file instead, which breaks on mount rather
than on click, so it was testing a different bug.

### ⚠ The BOM tab did not appear — `HardwareAssetDrawer` keeps TWO tab lists

The content loaded and the tab did not, which is the signature of this file's tab plumbing:

| | Where | What it does |
|---|---|---|
| `baseTabsForOthers` / `baseTabsForINC35` | inside the overflow-measuring effect | **the list that RENDERS.** It is measured into `visibleTabs` / `overflowTabs`. |
| `tabConfig` | in the JSX | labels and conditions. It only **filters** the above: `visibleTabs.filter(id => allowedTabIds.includes(id))`. |

Adding a tab to `tabConfig` alone gives it a label it never gets to use. `'bom'` is in both now,
plus `tabWidths` — an unmeasured tab falls back to a guessed 80px and mis-sizes the overflow point.

**The check said it would work, and the check was wrong.** It asserted `tabConfig` — the list I had
just edited — rather than the list that renders. Asserting the thing you changed proves you changed
it, nothing more. `tabcheck.mjs` now reads BOTH lists, asserts `bom` sits after `software` in each,
and asserts every id the renderer emits survives `tabConfig`'s filter, so the two cannot diverge
again without failing.

**And jsdom CAN see the strip, once it has a width.** The earlier note that it could not was
half-right: the strip is measurement-driven, and with `offsetWidth` reporting 0 every tab is sent
to overflow and the row renders empty — which is exactly what happened, and is why the miss went
unnoticed. Stubbing `HTMLElement.prototype.offsetWidth` makes the whole strip observable, and it
now reads `Overview | Properties | Hardware | Software | BOM | Baseline | …`. A measurement-driven
component is testable in jsdom; it just needs a measurement.

Two more corrections worth keeping, both in the checks rather than the product:
- `teeth.mjs` pinned its reproduction to `HEAD`, which stopped reproducing anything the moment the
  fix was committed. It walks the file's history in Node now and takes the newest revision that
  still lacks the declaration. It does NOT use `git log -S`: `execSync` goes through cmd.exe on
  Windows, which mangles the quoting on a pickaxe argument and returns the wrong commit silently.
- Scope a DOM query to the thing it names — counting every `<button>` on the page pulled in the
  asset-type VALUE "Hardware" and reported it as a tab.

Two things jsdom cannot answer, recorded rather than papered over:
- The asset drawer's **tab strip is measurement-driven** (ResizeObserver splits visible/overflow),
  and jsdom has no layout, so no tab button renders. Tab ORDER is asserted on the source; the DOM
  is only asked what it can answer — that the drawer LANDS on BOM and renders that content.
- Adjacent elements concatenate in `textContent` with no separator, so `SBOM` + `Product` reads as
  `SBOMProduct` and a `\bProduct\b` test on the body is false while the label is right there.
  **Assert on the `<label>`, not on the body text.**

## BOM Management (admin): the KPI grid, and a provenance problem

**The reported bug had two causes, both in `.kpis`.** It carried no `max-width`, so the cards
stretched to the full 1760px page while every other block (`.lcards`, `.card`, `.adgroup`) caps
at 1500px; and it dropped from **three columns straight to one** at 1280px with no two-column
step. The module is mounted in an IFRAME beside the settings sidebar, so its viewport is far
narrower than a standalone window and that breakpoint fires at ordinary screen sizes — which is
how three reading-cards became a stack of full-width banners.

Fixed by matching `.lcards`, which is the same kind of card strip on the Licensing screen and
already did it correctly: capped at 1500px, stepping 3 → 2 → 1. `.kpis.four` (Retention) steps
too. **Four screens had been running two different card systems.**

Two smaller DESIGN.md deviations went with it:
- **§4.2 rows are DIVIDED, not bordered.** `tr.row` had a bottom border with no `:last-child`
  reset, so the final row drew a line a pixel above the card's own edge.
- **A tab no longer re-weights when selected.** 500 → 600 on select re-measures the label, so
  every tab to its right shifts as you move along the row. Colour and the 2px underline carry it.

**A second pass, after the first was reported as not fixed — correctly.** The first pass only
sized the GRID; the cards were still oversized and the Scheduler table was still falling out of
the page. Checking CSS values against §4.2 and calling it aligned missed the thing that actually
mattered: whether the table FITS.

- **The Scheduler table had no scroll wrapper.** Every other table in the file sits in one
  (`.twrap`, or an inline `overflow-x:auto`); Scheduler's was a bare `<table>`, so six columns
  pushed the whole PAGE sideways instead of scrolling inside their own box. BOM Inventory is the
  reference — the table may exceed the pane, the WRAPPER is what scrolls.
- **`.knum` 40px → 26px**, the same cut made on the Software Components cards for the same reason.
  It was carried as a "sanctioned exception fixed at 40px by an approved product spec", but the
  file already defined a 26px `.knum.sm`, so it was never really fixed. Card padding and the
  stacked margins came down with it.
- **Licensing's cards were bigger again** — `border-radius:14px` (§2 gives surfaces 8px) and
  `padding:20px 22px`, half again what every other card on the page uses. Its grid also fell to
  two columns at 1280px, orphaning the third card on a row of its own; it steps like `.kpis` now.

**A verification bug worth recording.** Both the probe and the suite queried the DOCUMENT for the
card strip and the table. Six views live in this file at once with only one visible, so a
document-wide query returns whichever comes first in source order — every screen reported
Inventory's cards, and Scheduler's "table is wrapped" check could have been satisfied by
Retention's table. Both are scoped to the visible view now. This is the third time the same
mistake has appeared in a suite here; scope the query to the thing it names.

**A third pass — and the table was falling out for a reason neither earlier pass found.**
`table{width:100%;border-collapse:collapse;min-width:1240px}` is a BARE ELEMENT selector. The
inventory grid has fourteen columns and genuinely needs that floor. Nothing else in the file does,
and nothing else declared a `min-width` to escape it, so the rule was silently setting the width of
every table in the document:

| Table | Columns | Sat in | Forced to |
|---|---|---|---|
| `#grid` (inventory) | 14 | the page | 1240px — correct |
| `.sc-table` × 4 (BOM Management) | 5–8 | an admin pane | 1240px |
| `.mini` | 4 | a **560px** drawer | 1240px |
| `.cbt` | 5 | a **608px** drawer | 1240px |

Two drawer tables were permanently scrolling sideways inside panels half their forced width. The
floor is scoped to `#grid` now; `.sc-table` carries 720px and `.sc-table.wide` 1040px, which
Licensing (9 columns) and Policies (8) opt into. Wrapping Scheduler last pass only decided WHETHER
the page or the box did the scrolling — it never addressed why there was anything to scroll.

**§4.2 across all four tables.** They ran 13px text on 14px padding over `--line-soft`, against the
inventory's 12px on 12px over `--line-tbl` one screen away — which is what made them read as a
different product. Sizing the `<td>` alone would have changed nothing: every value in these tables
is wrapped in `.sc-name` / `.sc-cov` / `.sc-trig` / `.sc-when` / `.sc-stat` / `.rulesum`, all of
which were 13px and carried the visible size. Name and sub-line now land on the same 12px and
separate by weight and colour, as `.cname` / `.csub` already do. Row hover gained the
`transition-colors` §3.4 requires, and `.sc-table th` declares its own `sticky`/`background`
instead of borrowing them from the inventory's `thead th`.

**§2.2 dropdowns / §2.3 drawers / §3.3 heights.** The dropdown was already close to spec — h-9
trigger, click-away catcher, blue check for selection, menu matching its trigger width — so only
`px-3` padding and the italic placeholder were wrong. The drawer had drifted to 14/18/20 padding
with a control-border footer, against the spec's `px-5 py-3` / `px-5 py-4` and the SUBTLE `#F0F2F5`
hairline; the inventory's own `.dhead` was already correct at `12px 20px`. Weekday toggles moved
34 → 36px to sit level with the `.finput` and `.ddbtn` beside them, and a stray
`.tabs .right .search input{height:30px}` override was dropped so tab-row searches are the §3.3
detail-tab 32px.

**A file-wide assertion found a bug a scoped one would have missed.** The italic-placeholder check
was written for `.ddbtn.ph` but tested the whole file, and failed on a SECOND one:
`.finput.ph::placeholder`. Same deviation, on the text input sitting next to the dropdown in the
same drawer form. Both are gone, all three placeholders now carry the §1.4 colour, and the check
stays file-wide and reports the offending line.

### ⚠ jsdom's `getComputedStyle` is LAST-WINS, not specificity-aware

Proven with a two-rule fixture — `.k{min-width:720px}` written BEFORE `table{min-width:1240px}`
returns **1240px** here and would return 720px in any browser. jsdom is trustworthy for DOM shape
and behaviour; it is **not** a cascade engine.

This matters twice over. It nearly sent the min-width fix out the door unverified, and the fix that
survived it is better for it: rather than relying on `.sc-table` out-specifying `table`, the 1240px
floor is scoped so **every table matches exactly one min-width rule** and no width depends on a
specificity contest at all. `admbomcheck.js` now opens with a guard that re-proves jsdom is still
last-wins and fails loudly if that changes, because the computed-style assertions after it are only
evidence while exactly one rule can match.

### The table squared off the card's corners

`.sc-wrap` is deliberately `overflow:visible` — that is how a row's action menu escapes the card.
A card that cannot clip cannot round either, so whatever ENDS the card has to carry the corners
itself. `.twrap` already does this for the inventory grid (`border-radius:0 0 8px 8px`); the four
BOM Management scrollers were bare `style="overflow-x:auto"` divs with no radius at all, so the
table cut square across the rounded card.

The two screens were reported separately because they genuinely need different corners:

| Screen | Card holds | Table is | Corners |
|---|---|---|---|
| Scheduler | toolbar (`.tabs`) + table | the END of the card | bottom two |
| Policies | the table only (toolbar sits outside in `.sechd`) | the WHOLE card | all four |
| Retention | same shape as Policies | the WHOLE card | all four |
| Licensing | `#licWrap`, a plain div; a pager may follow | neither | none |

Now one `.sc-scroll` class at all five call sites, with `.sc-wrap .sc-scroll` taking the bottom two
and `.sc-wrap > .sc-scroll:first-child` taking all four. `:first-child` decides it, so a bulk bar or
an empty state appearing above the table corrects the corners without another rule, and Licensing
and the drawer preview match neither selector — they keep the scrolling and gain no corners.

### ⚠ Open: the scroll wrapper traps the row action menus

Confirmed in a real DOM on all four screens. `.sc-menu` and `.confirm` are `position:absolute`
inside `.sc-acts` in a cell, and a scroll container **clips at its padding box** — so wrapping the
table put every row popover inside the very box `.sc-wrap`'s `overflow:visible` existed to let it
escape. A menu on a row near the bottom is cut off at the table's edge.

Pre-existing on Retention, Policies and Licensing; extended to Scheduler when its table was wrapped
two passes ago. **Not fixed — it needs a decision, not a tweak**, because there is no CSS answer:
`overflow-x:auto` forces `overflow-y` from `visible` to `auto` (only `clip` pairs with `visible`,
and `clip` does not scroll). A `padding-bottom` / negative-`margin-bottom` pair would let the menus
out but would strand the horizontal scrollbar below the card exactly when scrolling is needed. The
real fix is to render those popovers outside the scroller — measure the trigger on open and place
them `position:fixed` — which is ~10 lines at each of six call sites and changes how they behave on
scroll. Worth doing; worth doing deliberately.

Note the tables now floor at 720px (Scheduler, Retention) and 1040px (Licensing, Policies) rather
than the inherited 1240px, so in a normal admin pane they no longer scroll at all — which makes the
clipping less visible but no less real.

### The toolbar did not line up with the table under it

The screenshot was cropped to exactly two rows -- the toolbar and the column headings -- because
that is the fault: they sit on different insets. DESIGN.md §4.3 is explicit, "Horizontal padding is
px-4 on every admin pane and band", and the table obeys it (§4.2 cells are px-4). The toolbar did
not, and neither did three other bands:

| | Inset | |
|---|---|---|
| `.tabs` 20px + `.tabs-lead` 2px | **22px** | the toolbar title |
| `.tabs` 20px + `.right` 2px | **22px** | search and Filter |
| `.seatbar`, `.rtools`/`.rbulk`, `.rrow` | **20px** | |
| `.bulkbar`, `.pager`, `.sc-table` | **16px** | correct |

So "Schedule Policies" sat 6px right of "Policy" directly beneath it, and the Filter button stopped
6px short of the table's right edge. All of them are on 16 now, verified by measuring the cumulative
inset from the card edge on both sides. For the rows that hold real tabs this also puts the selected
tab's underline on the table's left edge instead of 4px inside it.

Two surfaces keep 20px deliberately: a drawer is `px-5` by §2.3, a different surface from an admin
pane, and `.estate` centres its content so it aligns with nothing.

**Worth noting for the next pass:** the first report of this said "scheduler table, also policies
table radius". The radius half was fixed and the screenshot came back unchanged -- the alignment was
the scheduler half all along, and it was in the same crop both times. Two faults named in one line
are still two faults.

### The Scheduler toolbar was not the Licensing toolbar

Same `.tabs .right`, same 10px gap, same 220px search -- and the controls in the opposite
order. Licensing reads `[N shown] [Filter] [Search]`; Scheduler read `[Search] [Filter]`.

One structural difference went with it. Licensing makes `.fwrap` a direct child of `.right`,
so a flex container blockifies it and the filter box is exactly the 32px button. Scheduler
wrapped it in an extra `<span id="bsFilter">`, leaving `.fwrap` inline inside that span and
carrying a line box's descender space. `#bsFilter` IS the `.fwrap` now, and the filter's
markup writes the button and popover straight into it -- the same shape Licensing renders.
The popover right-aligns for the same reason it does there: it hangs off a control with the
search to its right, so opening leftward keeps it inside the card.

Policies is the third toolbar and was on its own numbers again -- a 230px search where the
other two use 220, in a `.sechd .r` with `gap:8` against `.tabs .right`'s 10.

The check compares the two toolbars **side by side** -- gap, order, search width, whether
`.fwrap` is the flex item, and how the popover anchors -- rather than asserting each against
a remembered number. A parity bug is a relationship between two screens, so the assertion is
too; neither can drift without the other now.

### Three passes on one screenshot

The same crop came back three times: radius (fixed, but that was the Policies half), band
alignment (fixed), and only then the toolbar order. Each pass fixed something real and each
one missed what was actually being pointed at, because I checked the Scheduler card against
the SPEC instead of against the screen it was supposed to match. **When the report names a
reference -- "same as licensing" -- diff the two, do not audit one.** The parity check above
is that lesson made permanent.

### The controls crowded the border because the row had no height of its own

Diagnosed by walking the box model out from the input rather than adding another padding
value. **Seven of the eight usual causes were absent**, and the horizontal axis turned out
not to be broken at all:

| Hypothesis | Finding |
|---|---|
| negative margin in the chain | none — every margin is 0 or `auto` |
| `width:100%` input in an unpadded wrapper | input IS `width:100%`, but `.search` is `width:220px;flex:none` — width-capped, so it cannot reach the edge |
| asymmetric padding on the toolbar row | no — `padding:0 16px`, symmetric |
| a parent zeroing padding / class-order conflict | `.right` and `.sc-wrap` are 0 by design; `.tabs` carries the inset |
| `overflow:hidden` clipping margin | no — the card is `overflow:visible` |
| absolute positioning at `right:0` | no — everything is in flex flow |
| toolbar outside the bordered element | no — `.tabs` is a child of `.sc-wrap` |
| global `input` full-bleed rule | no bare `input` rule exists in the file |

Measured chain: title 16px / first column 16px, controls 16px / last column 16px. Horizontally
symmetric and already matching the table.

**The real cause is on the vertical axis, and it is none of the eight.** `.tabs` declares
`padding:0 16px` — zero top and bottom — and takes its height from a `.tab` child instead:
13 + 20 (the count badge) + 11 = 44, plus the row's 1px border = 45. That works on Inventory
and Licensing, which hold real tabs. **The Scheduler row holds no tabs** — a `.tabs-lead`
title and the controls — so with nothing to borrow from it collapsed onto its tallest child,
which IS the 32px search and filter. They became the row and touched the border top and
bottom with zero clearance. Crowded on two sides reads as "no breathing room" generally,
which is why the report also described the right edge.

Fixed on the **shared component**, not the instance: `.tabs` gets `min-height:45px`, which is
the statement "this row's height does not depend on which screen is using it". 45 is exactly
what the tabbed screens already measured, so neither of them moves. Verified on all three
users of `.tabs` at 1600 / 1024 / 768: identical `padL=16 padR=16`, table `L=16 R=16`, 6px
clearance above and below the controls. No media query reaches the toolbar or the table at
any width, so there is no breakpoint where it re-breaks.

### ⚠ Why it "hadn't landed": `dist/` was three days stale and nothing was pushed

`public/bom-admin/index.html` is a Vite **public asset** — the dev server reads it directly,
but the built app and the deployed site read `dist/bom-admin/index.html`. That copy was from
**Aug 12 14:33** and still carried `padding:0 20px`, the value from before the alignment pass.
Combined with nothing having been committed (a standing "don't push until I tell you"), every
earlier fix existed only in the working tree. Anyone looking at the built app or the live URL
was looking at the pre-fix file.

**`npm run build` before judging a change to anything under `public/`.** The source being right
is not the same as the thing on screen being right, and three passes were spent on a screenshot
that could not have shown the fixes.

**172 checks in `admbomcheck.js`**, loading all four screens (Policies · Licensing · Scheduler ·
Retention) in a real DOM — this file killed its own script with a load-time null-deref once and
eight rounds of static checks blessed it. One assertion was corrected rather than the product:
Scheduler's third card reports a STATE ("Automatic BOM generation · Running"), not a count, so
demanding a `.knum` on it was the check being wrong.

### ⚠ `public/bom-admin/index.html` has no source

`sync-bom-reports.sh` copies `component-inventory.html` → `public/bom-reports/` and
`rule-studio-v0.html` → `public/request-form-rules/`. **`bom-admin/index.html` is in neither.**
It is 422KB against the concept file's 405KB and contains BOM Policies, which
`component-inventory.html` does not have at all — so it is a FORK, not a copy, and `public/`
(a build-artifact directory) is the only place it exists outside `dist/`.

That breaks the module's own one-source-one-copy rule. Worth resolving before the next edit:
either move it to `Test4/BOM/concepts/bom-admin.html` and add the sync line, or write down that
this one file is authored in `public/` on purpose. Edits meanwhile go to `public/bom-admin/`,
because there is nowhere else for them to go.

## Remediate is disabled when there is nothing to remediate

The button used to be live on every component and answered a click with *"X has no published fix
yet"* — a primary CTA whose only outcome is being told it cannot help. It is disabled now, with
a title that says which case it is.

**Keyed on the FIX, not on the vulnerability count.** In today's fixture the two sets coincide
exactly (`requests` and `Newtonsoft.Json` are both clean AND fix-less), but *"vulnerable, no
published fix"* is a real state the Software Components KPI card already counts. Gating on
`!c.fixVersion` handles it; gating on `vulnerabilities === 0` would leave a live button that
still cannot do anything. The reason text distinguishes the two — "no known vulnerabilities"
versus "no published fix yet" — because a disabled control with no explanation is a dead end.

Asserted from **both** sides: `cdcheck` drives the clean component (disabled, reason names the
clean case, no longer styled as primary) and `vercheck` drives the drifted one (enabled, still
primary, tooltip names the upgrade). A gate that disables everything would pass the first and
fail the second.

## A version picker on the Installed-on tab

Drift is why this drawer exists — log4j-core runs four builds across 23 CIs — so "show me only
the CIs on 2.13.2" is a question the table could not answer. A **version dropdown** now sits
beside the endpoint picker, mirroring it exactly (same height, same active treatment, same
`role="listbox"` menu, Escape to close). No search box in it: a component runs a handful of
builds, not fifteen offices, and a search field would imply a longer list than exists.

**The per-build CI counts moved onto its options** rather than being deleted. In the properties
rail they were a second column of numbers to read past; on the picker they are the reason to
choose one. The rail still lists every build and still marks the primary — it lost the counts,
not the drift information.

**31 checks in `vercheck.js`**, driven against the most-drifted component: the menu offers every
build with the counts the rail used to print, picking one narrows the table, every surviving row
carries that build, and the row count equals what the option promised.

## "Affected CIs" → "Installed on"

The component drawer's first tab counted `c.cis`, whose own comment reads *"CIs carrying this
exact version"* — an INSTALLED-ON figure, not an at-risk one. Two components in the fixture have
zero vulnerabilities and 54 and 37 CIs respectively, so the tab was calling 91 machines
"affected" by something that is not wrong with them.

Renamed in **both** places it appeared — the tab and the detail field — since a drawer whose tab
and field disagree is worse than one that is merely wrong. Harm language stays on the
Vulnerabilities tab, which has earned it.

**Not** made conditional on `vulnerabilities > 0`: a tab whose name changes with the data cannot
be learned or referred to. One neutral name that is always true beats two that are each right
half the time. `affectedCis()` in `softwareComponentDetail.ts` keeps its name — internal, and
renaming it reaches three more call sites for no user-visible gain.

**23 checks in `cdcheck.js`**, driven against the clean component specifically. Two harness gaps
found on the way: the drawer takes `openAssets` + `activeAssetId` rather than a single
`component` (passing the wrong shape threw on `.find` before anything rendered), and jsdom ships
no `ResizeObserver`, which the drawer measures itself with.

## Software Components: shorter KPI cards, internet-facing removed

- **The headline figure came down from 40px to 26px**, in two passes. 40 was the sanctioned exception for an
  attention number, and it was buying presence at the cost of cards tall enough to push the table
  — the point of the screen — below the fold. It is still the largest thing on a card. Padding
  and the stacked `mt-[7px]` margins tightened with it (→ `mt-1`), the card padding went
  `py-3.5` → `py-2.5`, the progress bar 2px → 1.5px, and the action's clearance `pt-3` → `pt-2`.
  **Nothing was removed to get the height**: all three cards keep their supporting line and action,
  which a check enforces so a later "make it shorter" cannot quietly delete content instead.
- **"all upgrade paths known" is gone** — it restated "10 of 10" directly above it. The other
  branch of that same line stays: "N with no published fix" restates nothing and is the only place
  the card admits to components the headline figure cannot help with. It now renders only when
  `noFix > 0`.
- **Internet-facing is gone** from the first card's chip row and from the table row's globe icon;
  the `Globe` import went with its only use. KEV stays — it was the other urgency signal, not the
  same one. The field survives in `softwareComponentsData`, so this is a display change rather
  than a schema one and the drawer still shows it.

**28 checks in `sccheck.js`.**

## The component drawer: Dependencies leads, and the tree got three ways in

- **Dependencies is the first tab, Components the second**, and both moved from a segmented pill
  box to the product's **content-tab treatment** (2px underline, count badge) — the same one the
  change tabs directly below them use. Two levels of tab in two different shapes read as two
  different KINDS of control.
- **The SELECTION still follows what was clicked.** Opening the drawer from a CVE count lands on
  Components filtered to it, not on the tree. A number you clicked should give you the list it
  counted; tab ORDER and default SELECTION are separate decisions.
- **A change filter on the tree** — All / Added / Updated / Removed / Unchanged, in the order the
  Components tab uses. It is **subtree-scoped** like the vulnerability filter: a component that
  changed four levels down is only useful if the path to it survives, since "what pulled this in"
  is the one question the tree exists to answer. The panel hands its OWN change map down
  (`changeOf` prop) rather than the tree deriving a second one — two derivations are how the
  counts start disagreeing. A kind with no members renders disabled rather than as an empty tree.
- **Standalone components are viewable, not just counted.** `DepGraph` now carries
  `standalone: DepNode[]`; "Not in graph" was a dead end that told you how many could not be
  placed and gave you no way to look at them. The toggle sits beside Vulnerable paths and **swaps
  the view** rather than filtering it — these components have no edges, so rendering them as
  orphan tree roots would claim a structure the scanner never found.
- **The KPI strip came off** (Direct / Transitive / Max depth / Not in graph), and `Stat` with
  it. The only fact it uniquely carried is the direct count, which the root line above the tree
  already states; "Not in graph" survives as the Standalone control's own count and tooltip.
- **The change filter became a DROPDOWN**, sitting after Standalone. It is one choice, and five
  mutually exclusive pills spent a whole row saying so. It is **disabled** rather than hidden
  while the standalone list is up — it does not apply there, and removing it made the row jump.
  Escape closes it; the scrim behind handles click-away.
- **Expand all / Collapse all are tertiary and pushed to the far edge.** They act on the whole
  tree rather than narrowing it, so they do not belong in the run of filters, and borderless
  keeps them from reading as one more thing that changes what is shown.
- **An expandable row is a CARD.** Bordered box, name on its own line, and a muted meta line under
  it (`N dependencies · pulled in by N parents · N CVEs in this build`) so the decision to open is
  made before the click. **Leaves stay light one-line rows** — a card on every row would make the
  card mean nothing.
- **A childless DIRECT dependency is not a STANDALONE component**, and the tree was letting them
  look identical — both a bare dotted row. They are disjoint sets: 15 of the 26 direct
  dependencies have no children (the root DECLARES them, one edge each), against 13 standalone
  components with no edges at all. The root line reads "N declared directly" and the Standalone
  tooltip says what it is NOT ("not the same as a declared dependency that happens to pull nothing
  in — that one is in the tree"). Putting the deeper levels' rail and tint behind the direct list
  was tried and **reverted**: a grey band the width of the drawer behind a row of white cards read
  worse than the ambiguity it fixed. The rail stays where it earns its place, further down.
- **A leaf and a card share ONE box.** First pass built them from different geometry —
  `marginLeft` vs `paddingLeft`, `mb-1` vs `mb-px`, bordered vs nothing — so a direct dependency
  with nothing under it sat between two cards looking like it had fallen out of the list. They
  are siblings. Same margin, padding, radius and left edge now; the card adds a border, a fill,
  a chevron and a meta line on top, which is plenty to say "this opens". The leaf takes a border
  on hover so it still reads as a target.
- **The shared-build tag is spelled out on cards** (`×4 used`) and stays compact on leaves (`×4`),
  with a tooltip that says what it means: fixing it once fixes all four.

**63 checks in `depcheck2.js`.** Two harness lessons, both the same shape as earlier ones: a click
dispatched before React attaches its listeners is silently dropped (the suite now waits for the
harness's ready flag, not just for paint), and the `×N` tag cannot exist on a closed tree because
sharing starts below the roots — the check expands first instead of concluding the feature is
missing.

## The endpoint BOM version card, rebuilt as one band

The card ran two metric rows: an unlabelled one (CVE count, then added/updated/removed as bare
icons) above a labelled one (Vulnerabilities · Packages with findings · License risk). They are
now **one band of labelled groups**.

- **License risk came off the card** — three groups now: Component changes · Vulnerabilities ·
  Packages with findings. `bomVersionStats` still computes `blockedLicenses`; nothing on this
  card reads it.
- **The rebuild is the CURRENT card's alone.** Superseded cards keep the row they always had
  — CVE count, then added / updated / removed as icon + count — untouched. They are history: a
  reader scanning back through them wants them uniform and small, and the carrying metrics would
  describe a state that is no longer true anyway.
- **The CVE row is gone from the current card.** Its count was already the Vulnerabilities figure
  one row below, said twice in two different treatments. `ShieldAlert` is still imported, because
  the older cards still lead with theirs.
- **No rule above the band.** The card's own border already closes it; a divider inside it was
  drawing a second boundary a few pixels in.
- **Added / updated / removed became a fourth group, "Component changes"**, and it leads the row:
  what this scan DID, before what the host is left CARRYING.
- **The carrying metrics share one way of being written.** A single `Metric` renders
  number-then-word with the colour on the NUMBER and the word as quiet uppercase text — which is how
  "19 findings" already read. The severities were tinted pills, so the breakdown shouted louder than
  the figure it breaks down. A zero is grey whatever it counts: colour here means "there is
  something of this here".
- **The change counts keep their icon + count form** (green plus, amber refresh, red minus, each a
  tooltip and a way into the matching components tab). They were briefly rewritten as
  number-then-word and reverted: the glyphs are what the reader already knows them by, and the new
  group heading supplies the naming they were missing.
- **Both overflow axes are stated.** CSS will not let one axis scroll while the other stays
  `visible` — `overflow-x:auto` silently promotes `overflow-y` to `auto`, and a band a rounding
  error taller than its box then grows a vertical scrollbar INSIDE the card. `overflow-y-hidden`
  is not decoration; leaving it off is the bug.
- **The band is ONE row.** No wrapping anywhere in it — groups are `flex-none`, the dividers no
  longer hide below `lg`, labels and units carry `whitespace-nowrap`, and the band scrolls
  horizontally rather than folding if the viewport is genuinely too narrow.
- **Both card actions take the 4px control radius.** "View components" was `rounded-full` beside a
  square download button; DESIGN.md §2 gives controls 4px.
- Four now-dead lucide imports removed (`ShieldAlert`, `CirclePlus`, `CircleMinus`, `RefreshCw`).

**56 checks in `vcardcheck.js`.** Worth knowing about the first version of that suite: its heading
assertions queried the DOCUMENT, so they passed while the current card had no band at all — any
card on the page satisfied them. They are scoped to the card they name now, and the card lookup
takes the OUTERMOST matching div (the deepest one is the header alone). Two later checks had the
same shape of fault: a source-wide regex for `flex-wrap` failed once the older cards' wrapping row
came back, and scoping it to the CARD rather than to the BAND caught the version heading, which is
supposed to wrap. Both are asserted on the rendered band now.

## In progress
Nothing mid-flight.

## Next steps
1. **`gh auth refresh -s workflow`**, then push `.github/workflows/deploy.yml` and switch Pages to
   workflow mode. Until then, deploying is manual (see Gotchas).
2. One real-browser pass on the Compliance Reports screen — its suites run in jsdom, which has no
   layout engine.
3. `AdminBomTargeting.tsx` is still dead code (383 lines) awaiting a decision.

## Decisions made
- **Builds, not names, are the dependency graph's nodes.** `log4j-core@2.14.1` and `@2.17.1` are
  distinct components with distinct PURLs — which is what the version-drift work is about.
- **Mounted prototypes, not ports.** Re-typing the compliance screen's ~700-line scoring engine in
  React would create the same screen twice and start the drift `AdminBomModule` was built to end.
- **One source, one copy.** `Test4/BOM/concepts/component-inventory.html` and
  `Test4/rule-studio-v0.html` are the sources; the files under `public/` are build artifacts,
  refreshed by `sh sync-bom-reports.sh` from the Test4 root.

## Gotchas & notes
- **Deploying is manual right now.** The token lacks the `workflow` scope, so
  `.github/workflows/deploy.yml` cannot be pushed and is git-ignored. Pages serves the **`gh-pages`
  branch**: `npm run build`, then push `dist/` to `gh-pages`.
- **The Vite `base` is `/serviceops-portal/` and must match the repo name.** Rename the repo and
  every asset 404s with a blank page.
- **`vite build` uses esbuild, which strips types without checking them.** A green build proves
  nothing about identifiers — a deleted constant or an unbound prop compiles clean and explodes at
  render as a blank screen. Verify behaviour by bundling the component and driving it in jsdom.
- **A scroll container clips at its padding box**, so padding on a scroller reserves no space —
  content scrolls straight under it. Gutters go on the wrapper.
- **A `<button>` inside a `<button>` is invalid** and browsers resolve it by dropping one; that is
  how an icon button silently stops working. Keep the inner control a sibling.
- **Declaring a component inside a render body** creates a new type each keystroke, remounts the
  input and loses focus mid-word. Use a function returning JSX.
- **158 jsdom checks** cover the dependency tree and the admin/flyout wiring; the mounted
  prototypes carry their own suites (see `Test4/BOM/HANDOFF.md`).
