# Definition And Boundaries

## Definition

Provisioning is the process where BOS asks ToonExpo to create or link company/user access for a won BuilderDeal or confirmed PartnerParticipation.

It answers:

```text
This company is approved in BOS. Does it have ToonExpo access now?
```

## In Scope

- create provisioning request from approved deal;
- send minimal participant/company data to ToonExpo;
- create/link ToonExpo company/account;
- store ToonExpo company id/user id/status in BOS;
- retry failed provisioning;
- show provisioning queue/status;
- update onboarding checklist item if appropriate.

## Out Of Scope

- full ToonExpo CRM data sync;
- full readiness data sync;
- buyer/visitor data sync;
- apartment/project inventory sync;
- QR/check-in analytics sync;
- public content/media sync;
- editing ToonExpo public profile inside BOS.

## Main Boundary

BOS owns:

- internal Organization/CycleEngagement/business subtype;
- approval decision;
- provisioning request;
- provisioning status summary.

ToonExpo owns:

- user account;
- company profile;
- builder/partner/bank portal access;
- projects/apartments/media;
- readiness;
- Constructor CRM.

## Participant Types

Provisioning can support:

- builder;
- partner;
- bank.

Each type can enable different ToonExpo modules.
