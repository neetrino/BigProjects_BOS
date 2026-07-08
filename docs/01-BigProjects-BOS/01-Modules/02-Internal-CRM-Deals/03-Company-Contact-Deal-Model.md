# Company Contact Deal Model

## Core Model

```text
Company
  -> Contacts
  -> Deals
       -> Event Cycle
       -> Onboarding Checklist
       -> Notes / Attachments
       -> ToonExpo Provisioning Request
```

## Company

Company is long-lived.

It represents the organization BigProjects communicates with:

- builder;
- bank/partner;
- service participant if needed;
- other participant type if added later.

Company can participate in multiple cycles.

## Contact

Contact is a person connected to a company.

A company can have multiple contacts.

One contact can be primary for communication.

## Deal

Deal is a cycle-specific participation attempt.

Examples:

- ABC Builder wants to participate in ToonExpo 2026-1;
- same ABC Builder later joins ToonExpo 2026-2 as a separate deal.

Deal contains the operational state for that cycle.

## Why Deal Is Separate From Company

If company and deal are mixed, cycle history becomes messy.

Correct structure:

- company stores stable relationship;
- deal stores event participation process;
- cycle groups deals by ToonExpo iteration.

## Duplicate Prevention

When creating company/deal:

- search existing company first;
- warn if a company with same name/phone/email exists;
- allow new deal on existing company;
- prevent accidental duplicate deal for same company and same cycle unless admin confirms.

## Company Types

Recommended first types:

```text
builder
partner
bank
service_provider
other
```

Not every company type must receive the same ToonExpo modules after provisioning.

## Attachments

Attachments can be related to:

- company;
- contact;
- deal;
- onboarding checklist item.

Do not create a separate document management module in v1.

