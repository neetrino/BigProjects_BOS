# BOS Roles And Access

## Status

Accepted for Release 1

## Main Roles

- BOS Admin;
- BOS Staff;
- BOS Viewer.

## Deferred Role Expansion

Add only if operationally needed:

- BigProjects Super Admin;
- BigProjects Manager;
- BigProjects Staff Lead;
- BigProjects Read-only/Viewer;
- Content/Reports-only role.

## Access Principles

- BOS is internal to BigProjects.
- Builders and buyers should not access BOS.
- BOS users can see Release 1 internal operational data based on role. Deferred modules do not add Release 1 permissions.
- ToonExpo summaries can be visible in BOS, but ToonExpo product data ownership remains in ToonExpo.

## v1 Rule

Do not overbuild internal role levels in v1. Admin manages all records, Staff sees all operational data but mutates assigned/created records, and Viewer is read-only. Module-specific elevated actions remain Admin-only.
