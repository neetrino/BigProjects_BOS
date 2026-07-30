# Screens And UX

## Product Navigation

Desktop sidebar:

1. Builder Sales
2. Partners
3. Venue Map
4. Event Cycles
5. Organizations
6. Settings (`/settings` — profile; expandable submenu)
   - Staff (`/settings/staff`, admin only)

There is no separate Dashboard in Release 1. After login, open Builder Sales for the active cycle.

## Shared Page Pattern

Working modules use:

```text
Page -> toolbar and filters -> Kanban or list -> card -> side sheet
```

- Kanban is the default for Builder Sales and Partners.
- List view is an alternate dense view.
- Clicking a card opens a sheet from the left on desktop.
- On a narrow screen, the sheet becomes full-screen.
- Opening a related company or map area may stack one additional sheet without leaving the module.
- Dedicated full pages are reserved for the Venue Map and settings.

## Builder Sales Screen

Toolbar:

- active cycle;
- Kanban/list switch;
- search;
- responsible staff filter;
- create deal.

Card:

- organization name;
- main contact;
- expected square meters;
- assigned areas and total square meters;
- agreed amount optional;
- responsible staff.

Deal sheet:

- details;
- organization and contacts;
- areas;
- notes;
- attachments;
- ToonExpo account action.

## Partner Screen

Toolbar:

- active cycle;
- Kanban/list switch;
- search;
- partner type filter;
- create partner record.

Card:

- organization;
- partner type;
- main contact;
- assigned area when present;
- responsible staff.

Partner sheet:

- details;
- organization and contacts;
- optional area;
- notes;
- attachments;
- ToonExpo account action.

## Venue Map Screen

Layout:

- cycle selector and map controls at the top;
- full available canvas area;
- compact area list or detail panel;
- no decorative preview card around the map.

Controls:

- upload or replace background image;
- calibrate pixels per meter;
- select cells;
- create area;
- rename area;
- edit public display mode;
- delete a free area;
- assign or release an area;
- publish map for Admin.

Visual states:

- free;
- assigned to builder;
- assigned to partner;
- selected;
- hidden from public map.

The map must support pan and zoom. Labels should remain readable at practical zoom levels.

## Event Cycles

- simple list;
- create/edit cycle sheet;
- mark one cycle active;
- close completed cycle;
- open CRM, Partners or Map already filtered to that cycle.

## Organizations

- searchable table;
- organization sheet;
- contacts tab;
- deals/participations for the selected cycle;
- ToonExpo link status.

Contacts are managed inside the organization sheet. A separate Contacts module is not required.

## Settings

- current user profile and language (`/settings`);
- Admin-only staff accounts (`/settings/staff`, sidebar submenu);
- create, disable and reactivate staff.

No MFA setup screen exists in Release 1.

## Visual Style Reference

The Kanban / card / side-sheet visual language follows a simplified version of the
[neetrino/nbos](https://github.com/neetrino/nbos) UI standards ("Kanban Board and List Standard",
"Entity Detail Sheet Standard"). nbos is a style reference only; scope and fields come from this
document and the module specifications.

Adopted style rules:

- one shared board component and one shared card shell (rounded card, thin border, hover shadow)
  for both Kanban boards, so Builder Sales and Partners feel like one product;
- card layout: title (organization) -> key meta -> status badge; color signals state only,
  never decoration;
- terminal outcomes (`won`/`lost`, `confirmed`/`declined`) are visually separated from active
  stage columns;
- list view reuses one table component and mirrors board data;
- drag and drop via `@dnd-kit`;
- entity detail opens in a side sheet; the user stays on the board;
- sheet style is compact and operational: no duplicated labels, small muted labels only where
  ambiguous, no nested bordered boxes, dense spacing inside sections;
- sheet editing uses a local draft with a Save/Cancel footer that appears when dirty and sends
  one update request;
- short create/confirm flows use a small focused dialog, never a duplicate of the sheet;
- related entities render as compact rows; clicking stacks one child sheet above the parent.

Deliberately not adopted from nbos: rich-text editors, floating action rails, Active/Closed/All
scope engines, deep-link infrastructure, sockets and charts.

## UX Priorities

- desktop-first and dense;
- minimal navigation;
- common actions visible;
- no nested cards;
- no tutorial text for obvious controls;
- loading, empty, validation and error states for every working screen.
