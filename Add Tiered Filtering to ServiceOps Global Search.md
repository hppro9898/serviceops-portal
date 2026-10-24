# Add Tiered Filtering to ServiceOps Global Search

Extend the existing **Global Search experience in Motadata ServiceOps** with a **tiered filtering system** that is simple, fast, module-aware, and consistent with the existing ServiceOps list-filter model.

Use the existing **ServiceOps Design System, components, filter chips, dropdown patterns, typography, spacing, icons, and interaction behavior**.

The filtering experience must feel like a natural extension of current ServiceOps list filters rather than a new search language.

---

# Filtering Product Goal

The filtering system should help users narrow Global Search results without forcing them to understand database fields, automation conditions, or advanced query syntax.

Use this principle:

**"Show the most useful filters first. Keep the rest available, but out of the way."**

The filtering experience should support three levels:

- **Tier 1 - Default filters**
- **Tier 2 - Full filters**
- **Tier 3 - Excluded automation-only predicates**

---

# Source of Truth for Filters

Use the **existing module list-filter model** as the source of truth for Global Search filters.

Do not use:

- Approval Workflow condition fields as the main search filter source
- Scenario Builder automation predicates
- SLA/event/time-elapsed predicates intended for workflow logic

These fields are designed for automation and routing, not known-item retrieval.

Global Search filters should align with the user's existing list-filter mental model.

Where possible, reuse the same backend qualification/search grammar already used by module lists.

---

# Why This Model

The filtering model should preserve continuity between:

**Global Search → See All in Module → Module List**

If a user applies filters in Global Search and then selects:

**See all 47 in Requests**

the same filters should carry into the Requests list without requiring the user to recreate them.

Global Search should find.

Module lists should refine.

---

# Tier 1 - Default Filters

Tier 1 filters should be based on the **default columns shown in each module's list view**.

These filters represent the most useful attributes users already see when scanning records.

Render Tier 1 filters as easily accessible chips or controls near the result-group header.

Keep the number of visible filters small, approximately **5-7 per module**.

Do not show every available filter by default.

---

# Tier 1 Filter Sets

## Requests

Show:

- Requester
- Created Date
- Assignee
- Status
- Priority
- Due By Status

Example:

`Requester: Me`

`Status: Open`

`Priority: High`

`+ Filter`

---

## Projects

Show:

- Status
- Priority
- Owner
- Start Date
- End Date

Example:

`Status: Active`

`Owner: Me`

`+ Filter`

---

## Hardware Assets

Show:

- Asset Type
- Status
- Host Name
- IP Address
- Used By
- Managed By Group
- Managed By

---

## CMDB

Show:

- CI Type
- Status
- Host Name
- IP Address
- Used By
- Managed By Group
- Managed By

---

## Non-IT Assets

Show:

- Asset Type
- Status
- Impact
- Used By
- Managed By Group
- Managed By

---

## Knowledge

The default Knowledge list shows:

- ID
- Subject
- Created Date

Since ID and Subject are already strongly covered by text search, expose:

- Created Date

as the primary Tier 1 filter.

If future product data confirms additional useful list filters, add them without changing the tier model.

---

# Modules Without Confirmed Tier 1 Sets

For these modules, do not invent filter fields without confirmed source data:

- Problem
- Change
- Release
- Task
- Contract
- Purchase
- Patch

Until their default columns and list-filter sets are confirmed:

- Show only generic safe filters if already supported by the existing list model
- Or show `+ Filter` using confirmed available fields
- Do not fabricate module-specific Tier 1 chips

The design should support adding their Tier 1 sets later without structural redesign.

---

# Tier 1 Interaction Pattern

For each result group, show:

**Module Name**

then a compact row of Tier 1 filters.

Example:

### Requests

`Status`

`Priority`

`Assignee`

`Requester`

`Created Date`

`+ Filter`

The user can select a Tier 1 filter and immediately choose a value.

Example:

`Status` → `Open`

The chip becomes:

`Status: Open ×`

Allow users to:

- Add filters
- Remove filters
- Edit an active filter
- Clear all filters
- Combine multiple filters

---

# Filter Logic

Multiple active filters should use predictable AND logic.

Example:

`Status: Open`

AND

`Priority: High`

AND

`Assignee: Me`

Result:

Only records matching all three conditions.

If a filter supports multiple values:

Example:

`Priority: High, Critical`

treat values inside the same filter as OR where that matches existing ServiceOps list-filter behavior.

Do not invent different Boolean behavior from the current list experience.

---

# Status Must Be First-Class

Treat **Status** as a real, visible filter in Global Search.

Do not inherit any list-view behavior where Status is hidden from the filter picker because a persistent view already has a Status chip applied.

Global Search does not begin from a saved list view.

Therefore:

**Status must be directly available in the Tier 1 filter set wherever the module supports it.**

---

# Tier 2 - Full Filter Set

Provide a **+ Filter** action for each searchable module.

Selecting `+ Filter` opens a searchable filter picker.

Tier 2 should contain the module's complete confirmed list-filter set.

Organize the picker into sections such as:

## Common

Examples:

- Status
- Priority
- Assignee
- Requester
- Created Date
- Updated Date

## Module-Specific

Examples:

- Project Risk
- CI Type
- Asset Type
- Vendor
- Managed By Group
- Impact

## Custom Fields

Include tenant-specific custom fields where supported.

Examples:

- Checkbox
- Text Input
- Date
- DateTime
- Dropdown
- Multi-Select
- Other configured custom field types

---

# Tier 2 Filter Picker UX

The `+ Filter` picker should support:

- Search/type-ahead
- Keyboard navigation
- Grouped sections
- Recently used filters where useful
- Clear indication of active filters

Example:

User clicks:

`+ Filter`

Picker opens:

**Search filters...**

### Common
- Status
- Priority
- Assignee
- Created Date

### Module-Specific
- Request Type
- Service Category
- Vendor

### Custom
- Region
- Business Unit
- Cost Center

---

# Tier 3 - Excluded Predicates

Do not expose automation-specific predicates in Global Search.

Exclude fields such as:

- Since Requester Responded
- Since Ticket is Overdue
- Since Feedback is Pending
- First Response Overdue Requests
- Workflow-only conditions
- Scenario-only elapsed-time predicates
- Routing-only approval conditions

These belong in:

- Scenario Builder
- Workflow
- Automation
- SLA logic

not Global Search.

Do not make the Global Search filter picker a copy of automation configuration.

---

# Filter Visibility by Module

Filters should appear only where they are relevant.

Example:

`Requester`

should appear for Requests but not automatically for Assets unless the module supports an equivalent field.

`CI Type`

belongs to CMDB.

`Asset Type`

belongs to Assets.

Do not create one universal filter list for every module.

---

# Cross-Module Search With Filters

When Global Search returns multiple groups, filters may be applied at two levels.

## Global-level filter

Use only when a field safely maps across multiple modules.

Examples could include:

- Created Date
- Updated Date
- Status only if semantic mapping is valid

Do not assume fields with the same label mean the same thing across modules.

## Group-level filter

Each module group should support its own Tier 1 and Tier 2 filters.

Example:

Global query:

`VPN`

Requests filters:

`Status: Open`

Knowledge filters:

`Created Date: Last 30 days`

These filters should not incorrectly affect unrelated module groups.

---

# Filter Scope Clarity

Clearly show whether a filter applies to:

- All searchable modules
- One result group
- The current module scope

Avoid hidden scope.

Example label:

**Requests filters**

`Status: Open`

rather than a floating `Status: Open` chip that appears to affect everything.

---

# See All Handoff

This is a mandatory behavior.

When a user clicks:

**See all 47 in Requests**

carry the current Global Search state into the Requests list.

Carry:

- Search query
- Active filters
- Supported sort/relevance context where appropriate

The module list should open already filtered.

Example:

Global Search:

Query:
`VPN`

Filters:
`Status: Open`
`Priority: High`

User selects:

**See all 47 in Requests**

Requests list opens with:

Search:
`VPN`

Filters:
`Status: Open`
`Priority: High`

The user must not rebuild the search.

---

# Filter Chips

Use ServiceOps' existing chip language where possible.

Example:

`Status: Open ×`

`Assignee: Me ×`

`Priority: High ×`

Requirements:

- Visually compact
- Easy to scan
- Easy to remove
- Clearly distinguishable from result content
- Keyboard accessible
- Tooltip where labels are truncated

Do not overload the search overlay with a large horizontal wall of chips.

If there are many active filters:

- Wrap cleanly
- Or collapse into a summary such as `+3 filters`

while keeping them accessible.

---

# Filter Values

The value control should match the field type.

Examples:

## Status
Use single-select or multi-select list.

## Assignee
Use searchable person picker.

## Requester
Use searchable person picker.

## Priority
Use known priority options.

## Created Date
Use date presets and optional custom range.

Suggested presets:

- Today
- Last 7 days
- Last 30 days
- This month
- Custom range

## Asset Type / CI Type
Use searchable select.

## Custom Dropdown
Use configured tenant options.

## Date / DateTime
Use date/date-time picker.

Do not use one generic input for every filter type.

---

# Query + Filter Combination

Text search and filters should work together.

Example:

Query:

`VPN`

Filters:

`Status: Open`

`Assignee: Me`

The system should interpret this as:

Find records matching `VPN`
AND
Status = Open
AND
Assignee = Me

The user should always understand:

- What they searched
- Which filters are active
- Which module the filters apply to

---

# Empty Results After Filtering

If a query had results before filters but filters remove them all, do not show a generic failure.

Show:

**No results match these filters**

Actions:

- Remove a filter
- Clear all filters
- Broaden search

Example:

> No open High Priority Requests match "VPN".

This is different from:

> No results for "VPN".

---

# Filter Loading State

If applying a filter requires a backend request:

- Keep existing results visible
- Show loading feedback
- Dim stale results if needed
- Do not blank the panel

Maintain the same stale-response protection already required for Global Search.

---

# Filter Error State

If one module's filtered request fails:

Example:

**Requests couldn't be filtered - Retry**

Do not fail unrelated groups.

Preserve successful module results.

---

# Permission and Governance

Filtering must inherit all existing Global Search governance rules.

Filters must never bypass:

- Role permissions
- Custom Scope Configuration
- Company/MSP isolation
- Requester visibility rules
- Report/Dashboard access levels
- PII restrictions
- Archived/spam visibility rules

Filters must be applied together with the user's authorized data scope server-side.

Never retrieve unauthorized records and hide them only in the interface.

---

# Custom Fields

Tenant-added custom fields should appear only in Tier 2.

Group them clearly under:

**Custom Fields**

Do not automatically promote tenant custom fields into Tier 1.

If future usage data shows a custom field is extremely common, consider personalization later.

---

# Admin and Destination Results

Do not show filters for Admin Settings or navigation-only destinations.

Examples:

- SLA
- Business Hours
- Auto Assignment
- Privacy Settings

These should use fuzzy/name matching only.

Selecting them should navigate directly to the destination.

No Tier 1 or Tier 2 filters are needed.

---

# Responsive Behavior

The filter experience must work inside the Global Search overlay without making it visually dense.

Prioritize:

1. Query field
2. Results
3. Tier 1 filters
4. `+ Filter`
5. Advanced filter controls

On smaller screens or narrower overlays:

- Collapse Tier 1 filters into a horizontally scrollable or compact control
- Keep active filters visible
- Do not allow filters to push search results excessively below the fold

---

# UX Laws and Principles

Apply the following principles.

## Recognition Over Recall

Show relevant filter choices.

Do not require users to memorize query syntax.

## Hick's Law

Limit Tier 1 to approximately 5-7 high-value fields.

Place the full field set behind `+ Filter`.

## Progressive Disclosure

Tier 1 = immediately visible.

Tier 2 = available when needed.

Tier 3 = intentionally absent.

## Consistency

Reuse existing ServiceOps:

- Filter terminology
- Chip styles
- Field labels
- Qualification semantics
- Value selectors

## Visibility of System Status

Always show:

- Active filters
- Filter scope
- Loading
- Empty filtered result
- Error state
- Truncated results

## User Control

Users must be able to:

- Add a filter
- Edit a filter
- Remove a filter
- Clear filters
- Return to unfiltered results

---

# Analytics to Instrument

Track filter usage so Product can validate the Tier 1 assumptions.

Capture:

- Most-used Tier 1 filters by module
- Most-used Tier 2 filters
- Filters rarely used
- `+ Filter` usage rate
- Number of active filters per search
- Searches with filters vs without filters
- Filter removal rate
- Empty-after-filter rate
- See All handoff rate
- Filter state carried into module lists
- Search success after filtering

Use this data to refine Tier 1 later.

Do not permanently assume default list columns are perfect if real usage proves otherwise.

---

# V1 Scope

For V1 prioritize:

1. Tier 1 filters for modules with confirmed default list columns
2. Status as a first-class filter
3. `+ Filter` entry
4. Tier 2 using confirmed list-filter fields
5. Search + filter combination
6. Filter chip editing/removal
7. Permission-safe backend filtering
8. See All handoff with query + filters preserved
9. Empty-after-filter state
10. Analytics instrumentation

Do not block V1 waiting for every module's full field inventory.

---

# Future Scope

Possible later enhancements:

- Recently used filters
- Suggested filters based on query
- Saved filter combinations
- Personalized Tier 1 ordering
- Filter recommendations from usage history
- More confirmed module-specific filter sets
- Natural language → filter conversion
- Ask AI fallback for complex analytical intent

Do not include these in V1 unless they are already supported.

---

# Screens / States to Design

Produce the following:

1. Global Search with no filters
2. Global Search with Tier 1 filter chips
3. Opening a Tier 1 filter
4. Active Tier 1 filters
5. `+ Filter` picker
6. Common / Module-Specific / Custom filter groups
7. Filter type-ahead
8. Multiple active filters
9. Empty result after filtering
10. Partial module filter failure
11. Cross-module query with different group filters
12. See All handoff preserving filters
13. Narrow responsive filter state
14. Keyboard navigation through filters
15. Permission-restricted filtering behavior

For every state define:

- User goal
- Entry point
- Interaction
- Selected filter state
- Result behavior
- Empty/error behavior
- Keyboard interaction
- Accessibility behavior

The final solution should preserve the simplicity of Global Search.

Filtering should help users narrow results quickly, not turn Global Search into an automation builder.