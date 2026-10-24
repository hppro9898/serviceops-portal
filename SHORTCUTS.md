# Keyboard Shortcuts

Reference for developers. This file is the **single source of truth** for every keyboard
shortcut in the ServiceOps Ticket Detail app. Keep it in sync whenever a shortcut is
added, removed, or changed.

> **Why `Alt`-based?** This is a web app. `Ctrl+W`, `Ctrl+Tab`, `Ctrl+T`, `Ctrl+L`, `Ctrl+D`
> and `Ctrl+PageUp/Down` are **reserved by the browser and cannot be intercepted** (they'd
> close the browser tab, switch browser tabs, focus the address bar, etc.). So drawer
> shortcuts use `Alt`+key combos plus a couple of safe single keys (`?`, `Esc`).
>
> **All shortcuts are disabled while typing** in an `<input>`, `<textarea>`, `<select>`, or
> any `contentEditable` element.
>
> **A few `Alt` combos may be claimed by the browser or its extensions** and cannot be
> overridden by a web page — e.g. `Alt+G` triggers **Gemini in Chrome**. Where that clashes,
> we pick a free key (that's why AI Summary is `Alt+Z`, not `Alt+G`).

---

## 1. Detail Drawer (all detail pages)

Works in every detail drawer — Ticket, Problem, Change, Release, Hardware / Software /
Non-IT / Consumable Asset, Software License, Contract, Purchase, CMDB.

Implemented once in **`src/app/components/DrawerShortcuts.tsx`**, mounted by
`DrawerStackProvider` (`DrawerStack.tsx`).

| Shortcut | Action |
|---|---|
| `Alt + M` | Minimize / restore drawer (toggle — collapses to the right rail, press again to reopen) |
| `Alt + W` | Close the current item tab |
| `Alt + Shift + W` | Close all item tabs |
| `Alt + F` | Toggle Small / Full view |
| `Alt + ]` / `Alt + [` | Next / Previous record (open item tab) |
| `Alt + ↓` / `Alt + ↑` | Switch right-panel group (Ticket Properties → Activity → Suggestions → Notifications → …) |
| `Alt + .` / `Alt + ,` | Next / Previous content tab (Overview → Properties → …) |
| `Alt + I` | Open / close the AI chat (“Ask AI”) — toggle |
| `Alt + C` | Copy record ID |
| `Alt + U` | Copy record link (URL) |
| `Alt + S` | Change status (opens the status dropdown — Ticket / Problem / Change / Release) |
| `Alt + E` | Edit record |
| `Alt + R` | Reply — opens the reply editor in the Conversation tab |
| `Alt + N` | Add Note |
| `Alt + A` | Expand / collapse the AI Summary card (Ticket / Problem / Change / Release) |
| `Alt + O` | Open the 3-dot actions menu |
| `Shift + ?` | Show the shortcuts cheat-sheet popup |

**Notes**
- Open items *are* the records in the drawer-stack architecture, so **next/prev record**
  (`Alt + ↓/↑`) and **next/prev open tab** (`Alt + ]/[`) act on the same set.
- Window/tab actions use the host's own state (the same handlers the tab strip UI uses).
  In-drawer actions (view toggle, AI, edit, add relation, note, menu, content-tab switch)
  are triggered by scoped DOM lookups against the visible `[data-drawer]` element and are a
  graceful no-op if the target isn't present on that page.

---

## 2. Relationship / Dependency Map canvas

Works when the Relationship tab (or the CMDB **Dependency Map** view) is active. These are
**single-key** shortcuts (no `Alt`) — they do not conflict with the drawer shortcuts above.

Implemented in **`src/app/components/RelationshipGraph.tsx`** (canvas) and the drawer's
relationship toolbar effect.

| Shortcut | Action |
|---|---|
| `↑ ↓ ← →` | Pan the graph |
| `+` / `−` | Zoom in / out |
| `F` | Fit & center all nodes |
| `1` / `2` / `3` | Full / Tree / Grid view |
| `Ctrl + Shift + F` | Toggle fullscreen |
| `M` | Toggle minimap |
| `L` | Toggle type legend |
| `R` | Reset layout (collapse all, clear pins, re-fit) |
| `Ctrl + F` | Focus the node search |
| `Esc` | Clear search / deselect |

The full list is also shown in the canvas's on-screen **keyboard-shortcuts popup**
(the ⌨ button in the top-right canvas controls).

---

## 3. Patch Superseded map canvas

Works when the Patch detail page's **Superseded** tab is active. Same single-key model as
the Dependency Map (section 2), minus the features that map doesn't have (no minimap /
legend / view modes) and plus `E` for expand/collapse-all.

Implemented in **`src/app/components/PatchSupersededTab.tsx`** (canvas keys need the canvas
focused — click it once; `Ctrl+F` / `Ctrl+Shift+F` / `E` work tab-wide).

| Shortcut | Action |
|---|---|
| `↑ ↓ ← →` | Pan the canvas |
| `+` / `−` | Zoom in / out |
| `F` | Fit & center all nodes |
| `E` | Expand / collapse all versions |
| `R` | Reset layout (collapse all, re-fit) |
| `Ctrl + Shift + F` | Toggle fullscreen |
| `Ctrl + F` | Focus the node search |
| `Esc` | Clear search (in the field) / hide the hover card (on canvas) |

Also listed in the tab's own ⌨ keyboard-shortcuts popup (top-right canvas controls).

---

## 4. Deployment Topology canvas

Works when a Deployment tab's **Topology** view is active (Patch / Patch Deployment /
Vulnerability / Detected CVE detail pages). Same single-key model as the other canvases.

Implemented in **`src/app/components/DeploymentTopologyView.tsx`** (canvas keys) and
`PatchInstallationTab.tsx` (`Ctrl+F` search focus while the Topology view is active).

| Shortcut | Action |
|---|---|
| `↑ ↓ ← →` | Pan the canvas |
| `+` / `−` | Zoom in / out |
| `F` | Fit & center all nodes |
| `R` | Reset view (expand all, re-fit) |
| `Ctrl + F` | Focus the node search |
| `Esc` | Clear search (in the field) / close the shortcuts popup |

Also listed in the view's own ⌨ keyboard-shortcuts popup (top-right canvas controls).

---

## Maintenance

When you add, change, or remove a shortcut:
1. Update the implementation (`DrawerShortcuts.tsx` for drawer-wide,
   `RelationshipGraph.tsx` for the Relationship/Dependency Map canvas,
   `PatchSupersededTab.tsx` for the Superseded map, or
   `DeploymentTopologyView.tsx` for the Deployment Topology canvas).
2. Update the in-app cheat-sheet (`SHORTCUTS` array in `DrawerShortcuts.tsx`, and/or the
   matching canvas shortcuts popup).
3. Update **this file**.
