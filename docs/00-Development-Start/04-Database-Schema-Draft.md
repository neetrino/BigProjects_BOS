# BOS Database Schema Draft

## Ownership

PostgreSQL 18.x on Neon is accessed only by the NestJS `apps/api` runtime through Prisma ORM 7.x in `packages/db`. Next.js must not import Prisma, execute SQL or run migrations.

## Core Tables

- users;
- staff_profiles;
- companies;
- contacts;
- event_cycles;
- deals;
- deal_notes;
- attachments;
- onboarding_checklist_templates;
- onboarding_checklist_template_items;
- deal_onboarding_checklist_items;
- workspaces;
- tasks;
- task_comments;
- process_templates;
- process_template_tasks;
- process_instances;
- kpi_snapshots;
- toonexpo_provisioning_requests;
- audit_logs.

## Key Relationships

```text
companies 1..n contacts
companies 1..n deals
event_cycles 1..n deals
deals 1..n deal_onboarding_checklist_items
deals 1..n tasks
workspaces 1..n tasks
process_templates 1..n process_template_tasks
process_instances 1..n tasks
users 1..n assigned tasks/deals/checklist items
deals 0..n toonexpo_provisioning_requests
```

## Important Rules

- company is long-lived;
- deal is cycle-specific;
- checklist item belongs to deal and cycle;
- task can link to workspace and optional business context;
- attachments belong to real entities;
- provisioning must be idempotent by request id / BOS company id / primary email.

## Needs Confirmation

- exact auth/session tables;
- attachment storage metadata;
- audit log granularity;
- soft delete policy;
- database timeout/pool settings.
