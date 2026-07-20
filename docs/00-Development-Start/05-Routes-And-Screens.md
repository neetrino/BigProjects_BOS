# BOS Routes And Screens

## Web Routes

These are Next.js frontend routes only. Product API endpoints are separate NestJS routes under `/api/v1`; do not create matching Next.js route handlers.

```text
/login
/
/cycles
/builder-sales
/organizations
/contacts
/partners
/venue-map
/venue-map/publications
/provisioning
/settings
```

`/` redirects authenticated users to `/builder-sales` and unauthenticated users to `/login`. Release 1 has no full Dashboard route.

## Sheet Routes / Deep Links

```text
?deal=:dealId
?organization=:organizationId
?contact=:contactId
?partnerParticipation=:partnerParticipationId
?spaceArea=:spaceAreaId
?cycle=:cycleId
?provisioning=:requestId
```

## First Screens

- login;
- Builder Sales board/list;
- BuilderDeal sheet;
- Organization sheet;
- event cycles list;
- Partner Relations board/list and sheet;
- Venue Sales Map editor and area sheet;
- provisioning worklist.

## Navigation Rule

Full pages are workspaces. Entity details open in sheets.

Canonical NestJS routes are listed in [Release 1 API Surface](./08-API-Surface.md).
