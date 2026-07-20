# BigProjects BOS Brief

## Product

BigProjects BOS is the internal business operating system for BigProjects.

Release 1 manages builder venue-space sales, a separate partner pipeline, event cycles, interactive venue-map authoring, allocations and ToonExpo provisioning/public-map publication.

## Repository Boundary

This repository is only for BigProjects BOS.

Do not implement ToonExpo public website, builder portal, Constructor CRM, readiness, QR/check-in or project/apartment inventory here.

## Users

- BOS Admin;
- BOS Staff;
- BOS Viewer.

Builders, partners, buyers and entrance staff do not access BOS.

## Production Scope

BOS is a full production product, not an MVP or prototype. The list below defines the initial production release, not a reduced-quality implementation.

- internal auth and role-based access;
- event cycles;
- Organizations and Contacts;
- Builder Sales CRM;
- separate Partner Relations pipeline;
- calibrated 1 m x 1 m Venue Sales Map;
- space allocations and BuilderDeal `won` enforcement;
- ToonExpo account provisioning;
- versioned public venue-map publication.

## Project Size

Size C — large, monorepo layout.

Rationale: BOS has two business pipelines, a domain-specific graphical map editor, cross-system publication/provisioning contracts and long-term growth across repeated ToonExpo cycles.

## References

- [Documentation Hub](./00-Documentation-Hub.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Development Start Pack](./00-Development-Start/01-Production-Scope.md)
