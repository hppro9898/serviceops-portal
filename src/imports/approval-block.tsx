Design a modern Approval Block component inside the “Approval” tab of a Service Request detail page.

I have already selected the Approval tab area in the canvas.
Use the attached reference screenshots to understand layout, behavior, and structure.

Reference Screenshots (Attached)

Need to Set.png → Shows the location of the Approval tab where the block must be placed.

existing_approval.png → Current approval accordion implementation.

compititor.png → Competitor approval UI reference for functional inspiration.

accordion_design.png → Current accordion design style used in my Figma file. The new approval block must follow this style for visual consistency.

Create_approval.png → Reference for how approvals are created and what configuration fields exist.

Objective

Design a clean, professional, SaaS-style Approval accordion component that displays approval workflow details for a Service Request.

The design must follow modern product UI trends similar to Linear, Jira, Notion, and modern ITSM tools, while staying consistent with the existing accordion component used in the file.

Focus on:

clarity

hierarchy

quick status visibility

scalable multi-level approvals

clean spacing and typography

minimal visual noise

Component Structure
1. Approval Accordion (Collapsed State)

Each approval should appear as a single accordion card.

Collapsed card should display:

Left Section

Approval Subject (bold)

Created by (user name)

Created time

Right Section

Approval Type Badge
(Unanimous / Majority / Anyone / First Approval)

Overall Approval Status
(Pending / Approved / Rejected)

Optional status indicator:

small progress indicator if multiple levels exist

Example layout:

[Subject: Approval Required for TSR-00812237]

Created by Rakesh Rathod • Mar 11, 6:34 PM

[Unanimous]     [Pending]

▼

Design notes:

Use rounded card container

subtle border

hover elevation

accordion arrow on right

2. Accordion Expanded State

When opened, show approval workflow details.

Structure inside accordion:

Approval Level Tabs

If multiple levels exist, show horizontal level selector:

Approval Level

[Level 1] [Level 2] [Level 3]

Selected level highlighted.

3. Approver List Table

For the selected level display approvers.

Columns:

Approver	Email	Status	Action

Status badges:

Pending (orange)

Approved (green)

Rejected (red)

Ignored (gray)

4. Approver Actions

If user is an approver show primary actions:

Primary buttons:

Approve (green)

Reject (red)

Secondary row actions:

Icons:

Ignore

Remind

Delete

Use compact icon buttons with tooltip.

5. Approval Metadata

Show at top of expanded accordion:

Approval type

Total approvers

Group decision logic

Created by

Timestamp

Visual Style Requirements

Follow the style of accordion_design.png.

Design must be:

minimal

modern SaaS UI

soft borders

subtle shadows

8px spacing grid

rounded cards

clear typography hierarchy

Use design principles similar to:

Linear

Atlassian

Slack admin panels

modern ITSM tools

UX Enhancements

Add small improvements:

status color indicators

progress indicator for approval completion

hover row highlighting

sticky level tabs

avatar circle for approver

Example:

🟢 Approved
🟠 Pending
🔴 Rejected
Layout Behavior

Support:

single level approvals

multi level approvals

group approvals

individual approvals

Accordion must scale cleanly for many approvers.

Deliverables

Create a reusable Approval Accordion Component with:

Variants:

collapsed

expanded

pending

approved

rejected

Component should be reusable for multiple approvals in the Approval tab.

Design Goal

Produce a clean enterprise SaaS approval workflow UI that feels:

modern

intuitive

enterprise-grade

scalable for ITSM workflows

The UI should clearly communicate:

who created the approval

approval type

approval progress

approver decisions

available actions