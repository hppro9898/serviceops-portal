# DESIGN.md — ServiceOps Design System

The explicit source of truth for Typography, Border Radius, Buttons, and Tables.

Extracted from the shipped code: `src/styles/*.css` and 224 `.tsx` files under `src/app/`.
Every value below is what the product **actually renders**, with usage counts so you can tell a
load-bearing token from an incidental one.

Scope note: [BOM-DESIGN-SYSTEM.md](BOM-DESIGN-SYSTEM.md) documents the BOM module specifically and
goes deeper on drawers, filter builders, and empty states. This file is the **product-wide**
layer; where the two differ, the conflicts are called out in §6.

---

## 0. Read this first — the two-layer reality

This codebase has **two styling systems, and the one in the CSS variables is not the one that
ships.**

| Layer | Where | Status |
|---|---|---|
| **Layer 1 — shadcn tokens** | `src/styles/theme.css` (`--primary`, `--radius`, `--muted`…) | **Present but effectively unused by product screens.** Only the `ui/*.tsx` primitives read it. |
| **Layer 2 — literal hex + Tailwind arbitrary values** | `src/app/components/**/*.tsx` | **This is the real design system.** ~8,000 uses of `#364658` alone. |

Consequences you must internalise:

- `--primary` is `#030213` (near-black). **The product's actual brand colour is `#3D8BD0`** (blue).
  If you build against the CSS variable you will ship the wrong colour.
- `--radius` is `0.625rem` (10px), making `rounded-md` = 8px. **The product's control radius is
  `rounded` = 4px.** Same trap.
- The stock `ui/button.tsx`, `ui/table.tsx`, and `ui/badge.tsx` are **unmodified shadcn defaults**.
  They are not the product's button/table/badge. Do not use them for new detail-page or listing UI —
  copy the class strings in §3 and §4 instead.
- `src/styles/globals.css` is **empty**. The real global stylesheet is `src/styles/theme.css`,
  imported via `src/styles/index.css` (`fonts.css` → `tailwind.css` → `theme.css`).

**Rule: new product UI is written with literal hex values and Tailwind arbitrary values, matching
the tables below. Do not introduce a token layer piecemeal** — a half-migrated system is worse than
either whole one.

---

## 1. Typography & Fonts

### 1.1 Font family

Loaded in `src/styles/fonts.css` from Google Fonts; applied to `body` in `theme.css`:

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

Weights fetched: **400, 500, 600, 700**.

`font-mono` is reserved for machine identity — PURLs, file paths, glob patterns, version strings,
hostnames, CVE ids, component names. Never for prose or labels.

### 1.2 Type scale

The product sizes type in **explicit pixels**, not Tailwind's `text-sm`/`text-base` scale.
Measured usage across `src/app`:

| Class | Count | Use |
|---|---:|---|
| `text-[13px]` | 3,393 | **The workhorse.** Body copy, controls, dropdown options, drawer table cells, form values. |
| `text-[12px]` | 2,492 | Listing-grid cells, table headers, metric counts, secondary lines, helper text. |
| `text-[11px]` | 796 | Pills, badges, KPI labels, uppercase field labels. |
| `text-[14px]` | 749 | Content tab labels, section titles inside a screen. |
| `text-[10px]` | 346 | Dense micro-labels, structural eyebrow labels. |
| `text-[15px]` | 196 | Section heading inside a screen. |
| `text-[18px]` | 136 | Detail-page `<h1>` (drawer subject line). |
| `text-[16px]` | 80 | Drawer/page title, one per screen. |
| `text-[20px]` | 34 | Admin page-head title, large KPI values. |

Sizes above 20px (`22`, `24`, `28`, `32`px — 10 total uses) are one-off hero numbers. **Do not add
new sizes outside the table.**

⚠️ **Legacy Tailwind scale still present:** `text-xs` (2,117) and `text-sm` (679) survive in older
code and are *not* being swept. `text-xs` = 12px and `text-sm` = 14px, so they collide with the
px scale rather than contradicting it. **New code uses the px form** so the scale stays readable in
one grep.

### 1.3 Font weight

| Class | Count | Use |
|---|---:|---|
| `font-medium` | 3,360 | Default for labels, buttons, values that need slight emphasis. |
| `font-semibold` | 2,589 | Headings, table headers, IDs, KPI values, active states. |
| `font-normal` | 149 | Explicit reset where a parent set weight. |
| `font-bold` | 60 | Rare — hero numbers only. |

There is effectively **no `font-light`/`font-thin`/`font-extrabold`** in this product.

### 1.4 Text colours

| Role | Hex | Count | Use |
|---|---|---:|---|
| **Primary text** | `#364658` | 8,067 | Every value, heading, table cell. The single most-used colour in the app. |
| **Muted text** | `#7B8FA5` | 4,596 | Labels, secondary lines, "of N" counts, uppercase section heads. |
| **Brand / link** | `#3D8BD0` | 4,500 | Links, active tabs, IDs, selected states, primary fills. |
| **Placeholder / disabled** | `#9CA3AF` | 1,565 | Input placeholders, em-dash empty values, disabled labels. |
| **Secondary grey** | `#6B7280` | 1,179 | Icon-button default, some table headers. |
| **Strong ink** | `#111827` | 237 | Icon-button hover, highest-contrast text. |
| **Slate muted** | `#64748B` | 322 | Neutral status text. |

### 1.5 Base-layer overrides & the button gotcha

`theme.css` `@layer base` sets element defaults (`h1`–`h4`, `label`, `button`, `input`) to
`var(--text-base)` at `--font-size: 16px` on `html`. Because they are in `@layer base`, any Tailwind
utility overrides them.

⚠️ **A bare `<button>` does NOT inherit its parent's font-size.** Tailwind v4 preflight leaves it at
the 16px default, so **every text button needs an explicit `text-[Npx]`**. Link-style buttons have
repeatedly shipped at 16px inside 12–13px rows. When a text button looks too big, check
`getComputedStyle` before assuming a layout bug.

---

## 2. Border Radius

**Hard product rule: a new interactive control is `rounded` (4px) — never `rounded-md`.**

A three-pass sweep (~1,090 replacements) standardised this across the detail pages. `rounded-md`
survives only inside the untouched shadcn `ui/*` primitives.

| Class | Value | Count | Use |
|---|---|---:|---|
| `rounded` | 4px | 4,965 | **Every interactive control** — buttons, icon buttons, inputs, selects, textareas, filter pills, sub-tabs, chip-input wrappers, segmented toggles, pagination controls. |
| `rounded-lg` | 8px | 1,714 | **Surfaces** — dropdown menus, popovers, modals, cards, clickable record/KPI cards. |
| `rounded-full` | 9999px | 862 | Dots, avatars, count badges, toggles, chips. |
| `rounded-sm` | 2px | 268 | Status badges and pills. |
| `rounded-md` | 6px | 260 | **Legacy / shadcn `ui/*` only.** Do not use in new product code. |
| `rounded-xl` | 12px | 122 | Large grouped containers (e.g. the bordered "Deployment" group). |
| `rounded-t-[6px]` | — | 69 | Composer card headers (the card itself must not be `overflow-hidden`). |

Deliberately **kept at their own radius**, not swept to 4px:

- Dropdown menus, popover cards, modals — surfaces, so `rounded-lg`.
- `rounded-full` toggles, avatars, chips.
- `rounded-sm` status badges.
- Clickable record/KPI cards — `rounded-lg`.
- Decorative icon badges (no border ⇒ not a control).
- The floating canvas control cards inside the two React Flow maps.

⚠️ The CSS variable `--radius: 0.625rem` and its derived `--radius-sm/md/lg/xl` in `theme.css` drive
**only** the shadcn primitives. They do not describe the product.

---

## 3. Buttons

### 3.1 Canonical variants

Copy these class strings verbatim.

```tsx
// PRIMARY (filled brand)
className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#3D8BD0] text-white text-[13px] font-medium hover:bg-[#2F7AB8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

// PRIMARY, compact (toolbar CTA)
className="px-3 py-1.5 text-[13px] font-medium text-white bg-[#3D8BD0] rounded hover:bg-[#2F7AB8] transition-colors"

// SECONDARY (bordered, white)
className="px-4 py-2 rounded border border-[#DFE5ED] text-[#364658] text-[13px] font-medium hover:bg-[#F5F7FA] transition-colors"

// SECONDARY, brand-tinted
className="inline-flex h-8 items-center gap-1.5 rounded border border-[#3D8BD0] bg-white px-3 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"

// TERTIARY (no chrome — icon + label in brand colour)
className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[13px] font-medium text-[#3D8BD0] transition-colors hover:bg-[#F5FAFF]"

// ICON BUTTON, bordered (header actions — 32px)
className="inline-flex items-center justify-center h-8 w-8 bg-white border border-[#DFE5ED] rounded hover:bg-[#F5F7FA]"

// ICON BUTTON, borderless (in-content actions)
className="flex size-8 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]"

// ICON BUTTON, filled brand
className="size-8 flex items-center justify-center rounded bg-[#3D8BD0] text-white hover:bg-[#2F7AB8] transition-colors"

// DESTRUCTIVE (confirm actions only)
className="flex items-center h-8 px-4 bg-[#DC2626] text-white text-[12px] font-medium rounded hover:bg-[#B91C1C] transition-colors"

// DESTRUCTIVE, bordered
className="inline-flex items-center justify-center h-8 w-8 rounded border border-[#FCA5A5] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
```

### 3.2 Colour reference

| Role | Hex | Notes |
|---|---|---|
| Primary fill | `#3D8BD0` | The brand blue. |
| Primary hover | `#2F7AB8` | **Canonical** — 193 uses, the plurality. See §6.1 for the variants. |
| Control border | `#DFE5ED` | Buttons, selects, popovers, drawer headers. |
| Input border | `#d1d5db` | Text inputs and checkboxes specifically — deliberately different from the control border. |
| Secondary hover | `#F5F7FA` | Bordered buttons. |
| Borderless hover | `#F3F4F6` | Icon buttons without a border. |
| Row / option hover | `#F9FAFB` | Table rows, dropdown options (2,547 uses — the most common hover in the app). |
| Brand-tint hover | `#F0F8FF` / `#F5FAFF` | Brand-tinted secondary and tertiary buttons. |
| Destructive fill | `#DC2626` → hover `#B91C1C` | |
| Focus ring | `#3D8BD0` | `focus:ring-2 focus:ring-[#3D8BD0]` — 443 uses, effectively universal. |

### 3.3 Control heights

| Height | Use |
|---|---|
| `h-9` / 36px | List-page toolbars and side-panel **forms** (internally consistent forms stay 36px). |
| `h-8` / `size-8` / 32px | **The detail-page standard.** All header controls, toolbar icon buttons, filter/action pills, detail-tab searches, 3-dot menu triggers, Add Relation and Status split-buttons. |
| `h-7` / `size-7` / 28px | In-table row actions, popover footer buttons. |

⚠️ `h-8` is border-box 32px, so a bordered `h-8` button lines up with an unbordered one. Header
controls were swept to a uniform 32px — previously they ranged 30–34px and read as ragged.

### 3.4 Rules

- **Radius is always `rounded`** (4px). No exceptions for buttons.
- **Always set an explicit `text-[Npx]`** (see §1.5).
- **Always include `transition-colors`** — every hover state in this product animates.
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed` (common), or the more explicit
  `disabled:border-[#DFE5ED] disabled:text-[#9CA3AF]` (bordered) / `disabled:bg-[#CBD5E1]` (filled).
  Give a `title` explaining *why* it is disabled.
- `theme.css` restores `cursor: pointer` on `button:not(:disabled)` and `[role='button']` globally —
  Tailwind v4 preflight sets `default`. Do not re-declare it per component.

---

## 4. Table Styles

### 4.1 The canonical table

`TicketTable.tsx` is the reference implementation. Every listing and grid in the product follows it.

```tsx
<table className="w-full min-w-[1200px]">
  <thead className="border-b border-[#e5e7eb]">
    <tr className="bg-white">
      <th className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#364658] tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-[#e5e7eb] bg-white">
    <tr className="group hover:bg-[#f9fafb] transition-colors cursor-pointer">
      <td className="px-4 py-3 text-[12px] text-[#364658]">Value</td>
    </tr>
  </tbody>
</table>
```

### 4.2 Specification

| Part | Value | Count | Notes |
|---|---|---:|---|
| **`thead`** | `border-b border-[#e5e7eb]` | 121 | Bottom hairline only. `bg-white` variant (52) is equivalent. Sticky grids add `sticky top-0` and often `bg-[#F9FAFB]`. |
| **`th` padding** | `px-4 py-2.5` | 186 | The standard. (`px-6 py-3` at 95 is a legacy wide variant.) |
| **`th` type** | `text-[12px] font-semibold text-[#364658] tracking-wider` | 160 | `text-left` on all. `whitespace-nowrap` on multi-word labels. |
| **`tbody`** | `divide-y divide-[#e5e7eb] bg-white` | 122 | Row separation is a `divide-y`, **not** per-row borders. |
| **`td` padding** | `px-4 py-3` | 980 | Overwhelmingly dominant. |
| **`td` type** | `text-[12px] text-[#364658]` | — | `whitespace-nowrap` on dates, names, status cells. |
| **Row hover** | `hover:bg-[#F9FAFB] transition-colors` | 160 | Add `group` when the row reveals hover-only actions, and `cursor-pointer` when the row opens a record. |
| **Checkbox column** | `w-[40px] px-4 py-2.5` | — | Always first when present. |
| **ID pill** | `inline-block rounded bg-[#e8f4fd] px-2 py-0.5 text-[12px] font-semibold text-[#3D8BD0] hover:bg-[#d0e8f9]` | — | The standard clickable record ID. |

### 4.3 No card wrapper

**An admin/product listing renders full-bleed on `bg-white` with NO card around the table.** The
`thead` hairline and the `tbody` `divide-y` are the only chrome. The hub's `#F7F9FC` page background
does not apply to listing panes.

Standard listing layout, top to bottom:

1. **Page head** — 20px semibold title → one-line subtitle ending in a `View Docs ↗` link. No
   breadcrumb; the nav says where you are.
2. **Toolbar** — `w-[280px]` search with the magnifier on the **left** and placeholder "Search",
   then scope tabs, then the primary CTA right-aligned. Drop tabs/CTA when the module has none
   rather than faking them.
3. **Table** — full-bleed, per §4.1.
4. **Pagination** — the shared `Pagination` component.

Horizontal padding is **`px-4`** on every admin pane and band.

### 4.4 Pagination

`Pagination.tsx` (wrapped by the auto-hiding `Paginated.tsx`):

- Page sizes 10 / 20 / 25 / 50 / 100; ellipsis page list; icon prev/next; "Showing X–Y of Z".
- ⚠️ **Returns `null` when `totalItems <= 10`** — the smallest page size means no second page is
  possible. This applies to filtered-down grids too.
- Reset to page 1 on any search/filter change, or the hidden bar strands a stale page.

### 4.5 Do not use `ui/table.tsx`

The shadcn `Table` primitive uses `text-sm`, `p-2` cells, `h-10` headers, and `bg-muted/50` hover —
none of which match the product. It is unused by product screens. Build tables from raw
`<table>` markup per §4.1.

---

## 5. Supporting tokens

These aren't in the four requested sections but buttons and tables depend on them.

### 5.1 Surfaces & borders

| Role | Hex | Count |
|---|---|---:|
| Page / card surface | `#FFFFFF` | — |
| Row hover / subtle fill | `#F9FAFB` | 3,089 |
| Divider — table & card | `#E5E7EB` | 2,124 |
| Control border | `#DFE5ED` | 2,123 |
| Borderless-control hover | `#F3F4F6` | 1,071 |
| Surface hover | `#F5F7FA` | 810 |
| Neutral chip | `#F1F5F9` | 201 |
| Divider — subtle hairline | `#F0F2F5` | 133 |
| Brand tint (hover) | `#F0F8FF` | 132 |
| ID pill background | `#E8F4FD` | 105 |
| Active chip (blue) | `#EBF5FF` | 91 |

### 5.2 Status colours

Always used as a **triple** — dot/icon, text, background.

| Status | Dot / icon | Text | Background |
|---|---|---|---|
| Success / Added / Compliant | `#22C55E` | `#22A06B` | `#ECFDF3` |
| Warning / Updated / Partial | `#F59E0B` | `#D97706` | `#FEF7E6` |
| Danger / Removed / CVE | `#EF4444` | `#DC2626` | `#FEF3F2` |
| Neutral / Unchanged | `#94A3B8` | `#64748B` | `#F1F5F9` |

Record status dots (`StatusBadge.tsx`): Open / In Progress `#3D8BD0` · Completed `#22c55e` ·
Pending `#fb923c` · Closed `#6b7280` · Cancelled `#ef4444`.

Agent-health dot: `#22C55E` online, `#EAB308` stale.

### 5.3 Global behaviours in `theme.css`

- **`.app-select`** — the only correct way to style a native `<select>`. Strips the OS arrow and
  paints a `#7B8FA5` lucide-style chevron inset `right 0.75rem`.
- **Auto-hiding scrollbars** — Tailwind's `.overflow-*` utilities get a transparent thumb until the
  scroll area is hovered (`#CBD5E1` on hover, `#94A3B8` on thumb hover). Gutter stays reserved so
  nothing shifts. This is what stops several scrollbars showing at once.
- **`.custom-scrollbar`** — opt-in 6px brand-blue (`#3D8BD0`) scrollbar.
- **Toast colours** — `[data-sonner-toast][data-type='success']` green `#16a34a`,
  `[data-type='error']` red `#dc2626`. **Style toasts globally here, never per call site.**
- **`[contenteditable]` list/heading styles** — restored because Tailwind preflight strips them and
  `execCommand` lists would otherwise render flat.
- **Tooltips** — `TooltipProvider` `delayDuration` is **700ms** (`ui/tooltip.tsx`).
  ⚠️ `TooltipContent` applies `text-balance`, which splits long text into short equal lines inside a
  wide box. Override with `text-wrap` in `className`.

---

## 6. Known inconsistencies

Recorded honestly rather than papered over. Pick the canonical value for new code.

### 6.1 Primary hover has five values

| Hex | Count | |
|---|---:|---|
| `#2F7AB8` | 193 | ✅ **Canonical — use this.** |
| `#3578B5` | 47 | |
| `#2C6B9F` | 24 | |
| `#2E6BA4` | 22 | |
| `#3479b5` | 20 | The value [BOM-DESIGN-SYSTEM.md](BOM-DESIGN-SYSTEM.md) §2.1 documents. |

The BOM doc is correct **for the BOM module** and wrong as a product-wide rule. Not worth a sweep
(the five are within a few percent of each other and visually indistinguishable in motion), but
**write `#2F7AB8` in new code**.

### 6.2 Table header colour varies

`text-[#364658]` (160) is canonical; `#6B7280` (76) and `#7B8FA5` (54) also ship. Use `#364658`.

### 6.3 Hex case is mixed

`#e5e7eb` and `#E5E7EB`, `#f9fafb` and `#F9FAFB` both appear. Purely cosmetic — CSS is
case-insensitive — but it means **any grep for a colour must be case-insensitive** (`grep -i`).

### 6.4 Two type scales coexist

`text-xs`/`text-sm` (2,796 uses) alongside the px scale (8,000+). They resolve to the same 12/14px,
so there is no visual bug — but new code should use the px form.

### 6.5 The shadcn token layer is dead weight

`theme.css` defines a full light/dark token set including a `.dark` block. **The product has no dark
mode** and no product screen reads these tokens. Deleting them is a real option; leaving them is
fine as long as nobody mistakes them for the design system (see §0).

---

## 7. Checklist for new UI

- [ ] Control radius is `rounded` (4px), surfaces are `rounded-lg`.
- [ ] Every text button has an explicit `text-[Npx]`.
- [ ] Control height is `h-8` (detail pages) or `h-9` (forms/list toolbars).
- [ ] Primary is `#3D8BD0` → hover `#2F7AB8`; text is `#364658`; muted is `#7B8FA5`.
- [ ] Borders: `#DFE5ED` on controls, `#d1d5db` on text inputs, `#E5E7EB` on dividers.
- [ ] `transition-colors` on every hover state.
- [ ] Focus is `focus:ring-2 focus:ring-[#3D8BD0]`.
- [ ] Tables: `px-4 py-2.5` headers at `text-[12px] font-semibold text-[#364658] tracking-wider`,
      `px-4 py-3` cells, `divide-y divide-[#e5e7eb]`, `hover:bg-[#F9FAFB]`, no card wrapper.
- [ ] Native `<select>` carries `.app-select`.
- [ ] Not importing from `ui/button.tsx`, `ui/table.tsx`, or `ui/badge.tsx` for product surfaces.
- [ ] Verified with `npm run build` (no standalone typecheck script exists).
