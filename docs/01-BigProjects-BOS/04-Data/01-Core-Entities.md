# BOS Core Entities

## Status

Accepted Release 1 conceptual baseline

## Main Entities

- organization;
- contact;
- event cycle;
- cycle engagement;
- builder deal;
- partner participation;
- venue plan;
- venue plan revision;
- venue plan cell;
- venue landmark;
- space area;
- space area cell;
- space allocation;
- venue map publication;
- staff user;
- note;
- attachment;
- audit log;
- ToonExpo provisioning request.

Auth also requires server-side session, invitation and password-reset token tables. The accepted logical table baseline is [Database Schema Baseline](../../00-Development-Start/04-Database-Schema-Draft.md).

## Attachment Rule

Documents and files are attachments to entities.

There is no separate Files/Documents module in Release 1.

## Future Entities

Task, process, onboarding checklist, KPI and report entities belong to documented later phases and are not part of the Release 1 schema baseline.
