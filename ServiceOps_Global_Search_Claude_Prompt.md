# Claude Prompt: Design Global Search for Motadata ServiceOps

Design a complete **Global Search experience for Motadata ServiceOps** using the existing **ServiceOps Design System, UI patterns, components, spacing, typography, colors, icons, interaction patterns, and accessibility standards**.

The feature should feel native to ServiceOps and should not introduce an unrelated visual language.

## Product Goal

Create a Global Search experience based on the principle:

**"One input. Find anything. Go anywhere."**

The primary use case is deterministic known-item retrieval and navigation across ServiceOps.

Global Search should help users find records, people, assets, knowledge, reports, admin settings, and destinations without first needing to know which ServiceOps module contains them.

Do not treat Global Search as the same feature as Ask AI.

Use this product boundary:

- **Global Search:** "I know it exists. Take me to it."
- **Ask AI:** "I need help understanding or solving something."

If Global Search returns no useful result, offer **Ask AI about this** as a fallback and pass the user's query into Ask AI.

---

# Primary Persona

**Name:** Rohan Mehta  
**Role:** Senior Service Desk Technician  
**Experience:** 4 years  
**Environment:** Enterprise with 5,000+ employees

Rohan frequently needs to find:

- Incidents
- Service Requests
- Problems
- Changes
- Releases
- Assets
- Configuration Items
- Knowledge Articles
- Projects
- Users
- Reports
- Dashboards
- Admin settings
- ServiceOps destinations

Rohan's biggest problem is that today he must decide which module contains the information, navigate to that module, search there, and repeat the process if he guessed the wrong module.

His goal is:

**Find any authorized ServiceOps record or destination from one place with as few actions as possible.**

---

# Global Search Entry

Place a Global Search affordance in the ServiceOps top bar, before Calendar.

Show:

**Search ServiceOps**

with keyboard shortcut hints such as:

`/`

and

`Ctrl+K`

Global Search must coexist with existing ServiceOps keyboard shortcuts and must not conflict with existing navigation chords such as `g+i`, `g+p`, or `Alt+F1`.

---

# 1. Dormant State

When Global Search is closed:

- Show search affordance in top navigation.
- Make it clearly discoverable but not visually dominant.
- Show keyboard shortcut hint.

---

# 2. Invoked State

Global Search opens when the user:

- Clicks the search control
- Presses `/`
- Presses `Ctrl+K`

Open a focused search overlay.

Requirements:

- Automatically focus the input.
- Dim the page behind without unmounting the underlying page.
- Pressing Esc closes Global Search.
- Clicking outside closes Global Search.
- Return focus to the element from which search was invoked.

---

# 3. Context-Aware Invocation

If Global Search is opened while the user is inside a module or record, show an optional scope chip such as:

`Global`

or

`Incidents`

The default must always remain **Global**.

Do not automatically limit search to the current module.

---

# 4. User With No Search Permissions

If the current role does not have access to any searchable modules, hide the Global Search affordance entirely.

Do not show a search interface that simply fails after opening.

---

# 5. Zero-Query State

When the Global Search overlay opens and the input is empty, show useful navigation content.

Include:

### Recent Records
Show approximately 5-10 recently visited records.

### Recent Searches
Show previous searches.

### Destinations
Show ServiceOps modules and commonly used destinations.

Examples:

- Requests
- Problems
- Changes
- Releases
- Assets
- Knowledge
- Projects
- Reports
- My Tasks
- Admin

### Pinned or Frequent Items
Show commonly visited destinations or records.

A user who opens Global Search and enters no query should still gain navigation value.

---

# 6. First-Time User

If Recent Records and Recent Searches are empty:

Do not show an empty panel.

Instead show:

- Destinations
- Frequently useful modules
- Short search examples
- A short hint explaining supported search operators

---

# 7. Typing Below Search Threshold

For queries of only 1-2 characters:

- Do not trigger expensive cross-module search.
- Search only local data such as:
  - Recents
  - Destinations
  - Pinned items

This prevents unnecessary backend API calls.

---

# 8. Global Search Trigger

When the user enters approximately 3 or more characters:

- Begin global cross-module search.
- Use approximately 200 ms debounce.
- Show skeleton loading states by result group.
- Preserve previously rendered results while the new query is loading.
- Dim existing results rather than blanking the entire panel.

---

# 9. Exact Identifier Recognition

Recognize ServiceOps identifiers such as:

- `INC-1042`
- `SR-88`
- `PRJ-4`
- Other valid ServiceOps record patterns

When an exact identifier is detected:

Promote the matching result to the top.

Example:

**Go to INC-1042**

Show:

- Identifier
- Subject
- Status
- Assignee
- Relevant record type

Pressing Enter should immediately open this result.

This should be one of the fastest interactions in the product.

---

# 10. Search Operators

Support keyboard-friendly filters including:

- `type:asset`
- `type:incident`
- `assignee:me`
- `status:open`
- `@person`
- `#tag`
- `include:archived`

Allow operators to be combined.

Example:

`type:incident status:open assignee:me VPN`

Design discoverability for operators without forcing users to learn syntax first.

Suggestions:

- Autocomplete
- Suggested chips
- Contextual hints

---

# 11. Cross-Module Results

Search globally across authorized ServiceOps data.

Organize results using stable groups.

Suggested group order:

1. Requests
2. Problems
3. Changes
4. Releases
5. Assets
6. Configuration Items
7. Knowledge
8. Projects
9. Users
10. Reports / Dashboards
11. Admin Settings
12. Destinations

Keep group order stable so users can build familiarity and muscle memory.

---

# 12. Result Row Design

Each result must help the user answer:

**"Is this the record I am looking for?"**

without opening it.

Each row should include:

- Record-type icon
- Record type
- Identifier
- Subject or name
- 2-3 useful secondary fields

Potential secondary fields:

- Status
- Assignee
- Requester
- Owner
- Company
- Updated date

Do not overload result rows.

Prioritize information that helps differentiate similar results.

---

# 13. Dominant Result

If one result is significantly more relevant than the rest:

- Visually promote it.
- Allow Enter to open it immediately.

---

# 14. Group Truncation

Do not show unlimited results.

Show approximately 3-5 results per group.

If more exist, provide:

**See all 47 in Requests →**

When clicked:

- Open the Requests module.
- Automatically carry the user's search query/filter into that module.
- Do not make the user type the search again.

Global Search should find.

Module lists should refine.

---

# 15. Very Broad Query

If a query produces very large result volumes:

Display explicit truncation messaging.

Example:

**Showing top 50 of 1,200+ results**

Offer:

- Refine search
- Add filters
- Open results in a particular module

Never silently truncate results.

---

# 16. Keyboard Navigation

Global Search must be fully usable without a mouse.

Support:

- Up arrow
- Down arrow
- Enter to open
- Esc to dismiss
- Ctrl/Cmd+Enter to open result in a new tab
- Tab to move through scope/group controls

Clearly show keyboard focus.

---

# 17. No Results

If nothing matches, show:

**No results for "{query}"**

Provide useful actions:

- Check spelling
- Broaden search
- Search Knowledge
- Create a new record
- Ask AI about this

Never leave the user at a dead end.

---

# 18. Unauthorized Results

Search must respect ServiceOps permissions.

If matching records exist but the current user cannot access them:

Do not expose:

- Name
- Identifier
- Count
- Owner
- Metadata

Use privacy-safe messaging such as:

**No results you have access to.**

Do not leak the existence of restricted records.

---

# 19. Role Permissions

Global Search must respect the ServiceOps role permission tree.

The backend must filter records based on permissions.

Do not retrieve unauthorized records and hide them only in the UI.

---

# 20. Custom Scope

ServiceOps Custom Scope Configuration may limit a technician's record access based on conditions.

Global Search must apply the user's custom scope server-side.

Search conditions should be combined with the user's permitted scope.

---

# 21. Company / MSP Isolation

In MSP environments or where a technician has:

**Restrict Data Access To Own Company**

Global Search must enforce company-level isolation.

Never show cross-company or cross-tenant results.

---

# 22. Requester Portal Search

Global Search behaviour must adapt for requester users.

Requester results must respect Requester Ticket Visibility rules.

For example, if a requester is allowed to see only:

**My Requests**

Global Search must return only those requests.

The same search input can exist for requesters and technicians, but their searchable universes are different.

---

# 23. Report and Dashboard Permissions

Reports and dashboards can have access settings such as:

- Public
- Private
- Restricted

Global Search must respect these access levels.

Private reports must never appear for unauthorized users.

---

# 24. Archived / Spam / Closed Records

Exclude archived, spam, or similar historical records by default where appropriate.

Allow users to explicitly include them using controls such as:

`include:archived`

or a visual toggle.

---

# 25. PII Protection

ServiceOps Privacy Settings may designate specific fields as PII.

Global Search must:

- Prevent unauthorized PII values from being searchable.
- Prevent unauthorized PII values from appearing in result previews.
- Apply PII rules consistently across modules.

---

# 26. Partial Backend Failure

If one search group fails but others succeed:

Do not fail Global Search.

Example:

Requests load successfully.

Knowledge loads successfully.

Assets fail.

Show:

**Assets couldn't be searched - Retry**

Keep all successful results visible.

Failure should degrade per group.

---

# 27. Total Search Failure

If global search services are unavailable:

Show:

**Search is unavailable**

But continue to show locally available content such as:

- Recent Records
- Destinations
- Pinned Items

The overlay should still function as a navigator.

---

# 28. Slow Results

If some modules take longer than approximately 2 seconds:

Use progressive rendering.

Show each group as soon as it becomes available.

Never wait for the slowest module before displaying all results.

---

# 29. Stale Response / Race Condition

If the user types:

`VPN`

and immediately changes it to:

`Printer`

a slow VPN response must never overwrite the newer Printer results.

Only results matching the active query should be rendered.

Design loading states so the experience remains visually stable.

---

# 30. Navigate to a Record

When a user opens a search result:

- Close Global Search.
- Navigate to the selected detail page.
- Save the query/record to recent search activity.

---

# 31. Navigate to a Destination

Global Search should also work as navigation.

Users should be able to search destinations and settings such as:

- SLA
- Business Hours
- Auto Assignment
- Reports
- Knowledge
- Assets
- Requests

Selecting a destination should take the user directly there.

---

# 32. Return to Search

If the user opens the wrong result and presses Back:

Restore:

- Global Search
- Previous query
- Previous search results
- Previous position when practical

Do not make the user start the search again.

---

# 33. Optional Preview - Phase 2

Consider a record preview interaction.

Example:

Press Space or use a Preview action.

Display a side preview with:

- Key record information
- Status
- Owner
- Important metadata

Allow the user to verify a record without leaving search.

Keep this as an optional later-phase enhancement rather than overloading V1.

---

# 34. Search History

Store Recent Searches per:

- User
- Tenant

Allow users to clear history.

Treat search history as behavioural data and align with ServiceOps privacy practices.

---

# 35. Learned Ranking

Frequently opened records or destinations may gradually rank higher.

However:

- Keep ranking explainable.
- Avoid constantly changing group ordering.
- Preserve stable module grouping.

Personalisation should improve relevance without making the interface unpredictable.

---

# UX Principles and Laws

Apply relevant UX laws and product-design principles throughout the solution.

## Hick's Law
Reduce decision overload.

Use:
- Grouping
- Progressive disclosure
- Suggested filters
- Limited top results

## Fitts's Law
Make primary interactions easy to acquire.

Prioritize:
- Large search target
- Prominent exact match
- Clear See All actions

## Jakob's Law
Use search interaction patterns users already understand from modern products.

Examples:
- Command palette behaviour
- Search suggestions
- Keyboard navigation
- Recent searches
- Search chips

Do not invent unnecessarily unfamiliar interaction models.

## Miller's Law
Avoid showing too many results simultaneously.

Use:
- 3-5 results per group
- Progressive disclosure
- See All

## Doherty Threshold
Keep interaction feedback fast.

Use:
- Debounce
- Skeleton states
- Progressive loading
- Cached recents

## Recognition Over Recall
Do not expect users to memorize:
- Module names
- Query syntax
- Record locations

Use autocomplete, suggestions, icons, recent activity, and visible operators.

## Error Prevention
Prevent:
- Permission leakage
- Cross-tenant leakage
- Stale result rendering
- Accidental scope locking

## Visibility of System Status
Always communicate:

- Searching
- Loaded
- Partial results
- Truncated results
- Failed module
- Offline state

## User Control and Freedom
Allow users to:

- Escape search
- Remove scope
- Clear history
- Return to previous search
- Refine results

---

# Design Requirements

The final design should be:

- Intuitive
- User-friendly
- Fast
- Keyboard accessible
- Permission aware
- Privacy safe
- Scalable across large tenants
- Easy for first-time users
- Efficient for expert users
- Consistent with ServiceOps visual patterns

Prioritize known-item retrieval and navigation speed over decorative UI.

Do not turn Global Search into a complex reporting/filter builder.

---

# Screens / States to Produce

Create designs or detailed UX specifications for:

1. Dormant top-bar state
2. Global Search opened
3. First-time empty state
4. Returning-user empty state
5. Below-threshold query
6. Loading state
7. Exact ID result
8. Mixed cross-module results
9. Operator/filter search
10. Broad/capped results
11. No results
12. Permission-safe no results
13. Partial module failure
14. Total search failure
15. Slow progressive loading
16. Context-scoped search
17. Requester search variation
18. See All / module handoff
19. Returned-to-search state
20. Optional Phase-2 preview panel

For each important screen, define:

- User goal
- Primary action
- Secondary action
- Information hierarchy
- Empty/error behaviour
- Keyboard interaction
- Accessibility considerations

Use ServiceOps Design System components wherever available. If a component does not currently exist, propose the smallest reusable component required rather than creating a completely separate design system.

The final solution should feel like a natural evolution of ServiceOps, not an embedded third-party search product.
