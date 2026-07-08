# BigProjects BOS Brief

## Product

BigProjects BOS is the internal business operating system for BigProjects.

It manages internal ToonExpo participant sales, event cycles, onboarding checklist work, internal tasks/processes, staff KPI, reporting and ToonExpo account provisioning.

## Repository Boundary

This repository is only for BigProjects BOS.

Do not implement ToonExpo public website, builder portal, Constructor CRM, readiness, QR/check-in or project/apartment inventory here.

## Users

- BOS Admin;
- BOS Staff;
- BOS Viewer.

Builders, partners, buyers and entrance staff do not access BOS.

## MVP Scope

- internal auth and role-based access;
- event cycles;
- internal company/contact/deal CRM;
- deal onboarding checklist;
- task workspaces and global tasks;
- staff/team KPI summaries;
- reports;
- ToonExpo account provisioning request/status.

## Project Size

Size C — large, monorepo layout.

Rationale: BOS has several internal modules, cross-module reporting, task/workspace flows, account provisioning integration and long-term growth across repeated ToonExpo cycles.

## References

- [Documentation Hub](./00-Documentation-Hub.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Development Start Pack](./00-Development-Start/01-MVP-Scope-Freeze.md)

