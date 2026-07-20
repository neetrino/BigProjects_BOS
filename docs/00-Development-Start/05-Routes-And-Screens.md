# BOS Routes And Screens

## Web Routes

These are Next.js frontend routes only. Product API endpoints are separate NestJS routes under `/api/v1`; do not create matching Next.js route handlers.

```text
/login
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
- provisioning queue.

## Navigation Rule

Full pages are workspaces. Entity details open in sheets.
