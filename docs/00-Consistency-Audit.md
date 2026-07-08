# BigProjects BOS Consistency Audit

## Status

Updated after modular documentation pass.

## Canonical v1 Decisions

- BigProjects BOS is separate from ToonExpo Ecosystem.
- BOS owns internal dashboard, event cycles, internal CRM/deals, tasks/processes, staff/team KPI, deal onboarding checklist, reports and ToonExpo account provisioning.
- ToonExpo owns public website/app, builder portal, Constructor CRM, readiness, QR/check-in, project/apartment inventory and public content.
- The main v1 integration is BOS -> ToonExpo account/company provisioning.
- BOS does not sync full ToonExpo product, buyer, Constructor CRM, readiness, QR/check-in or public content data in v1.
- No separate Files/Documents module in v1.
- No separate Internal Communication module in v1.
- No separate Expo Operations module in v1; event preparation work uses Tasks & Processes.
- Deal Onboarding Checklist lives inside the deal sheet, not as a standalone onboarding board.

## Canonical Roles

v1 roles:

- BOS Admin;
- BOS Staff;
- BOS Viewer.

Detailed roles are later:

- BigProjects Super Admin;
- BigProjects Manager;
- Staff Lead;
- read-only/report-only variants.

## Canonical Status Groups

- Event cycle: planning, active, completed, archived, cancelled.
- Deal: new, contacted, negotiation, contract_pending, approved_participant, lost, cancelled.
- Task: todo, in_progress, blocked, done, cancelled.
- Work Space: active, archived, disabled.
- Deal onboarding checklist item: open, done, blocked, not_applicable, archived.
- ToonExpo provisioning: not_started, pending, success, failed, linked_existing, cancelled.

## Naming Decisions

- Company is long-lived.
- Deal is cycle-specific participation attempt.
- Event Cycle is the operational container for one ToonExpo iteration.
- Work Space is a visual/organizational task container, not a separate task system.
- DealOnboardingChecklistItem replaces the older ambiguous OnboardingStep naming.
- Deal detail opens as a sheet from CRM board/list.

## Checked Areas

- roles and permissions;
- status enums;
- entity model names;
- navigation and sitemap labels;
- v1 vs coming soon boundaries;
- ToonExpo integration contracts;
- provisioning response statuses.

## Remaining Watch Items

- If BigProjects later wants event production as a larger module, promote it from Tasks & Processes deliberately.
- If checklist items become complex work, link them to Tasks instead of turning checklist into a task system.
- If BOS needs ToonExpo analytics, define a narrow report contract first instead of broad sync.

