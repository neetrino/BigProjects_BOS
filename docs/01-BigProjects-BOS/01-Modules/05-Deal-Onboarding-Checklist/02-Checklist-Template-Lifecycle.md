# Checklist Template Lifecycle

## Purpose

The checklist template lets BigProjects improve the standard onboarding process over time.

## Template Model

There is an admin-managed default template for ToonExpo participant deals.

Template contains ordered items such as:

- contract/payment confirmed;
- company data collected;
- contact person confirmed;
- ToonExpo account created;
- project data requested;
- media requested;
- building/floor/apartment data requested;
- visual map materials requested;
- readiness started;
- public profile ready.

## Template Statuses

Recommended statuses:

```text
draft
active
archived
```

## Draft

Draft template can be edited without affecting new deals.

Use draft for preparing changes before activation.

## Active

Active template is used for newly created deals.

There should be one primary active template for ToonExpo participant deals.

## Archived

Archived templates remain available for history.

Do not delete templates that have generated deal checklist instances.

## Versioning

Every activated template version should be immutable enough for audit.

Recommended rule:

- editing draft is allowed;
- activating draft creates a new active version;
- old active version becomes archived or inactive;
- deal checklist items store template id/version/item id where they came from.

## New Deal Rule

When a new ToonExpo participant deal is created, BOS copies the latest active template items into that deal.

This copied list is the deal checklist instance.

Changing the template later does not automatically mutate old active deals.

## Template Item Fields

Template item should define:

- title;
- description optional;
- category;
- sort order;
- required flag;
- default responsible role/user optional;
- default due offset optional;
- active flag.

## Admin UX

Template management can live in settings/admin area.

Admin should be able to:

- create draft template;
- add/edit/reorder items;
- group by category;
- activate new version;
- archive old versions;
- preview item list before activation.

