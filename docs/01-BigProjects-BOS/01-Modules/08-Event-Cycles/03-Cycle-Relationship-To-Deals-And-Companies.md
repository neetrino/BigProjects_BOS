# Cycle Relationship To Deals And Companies

## Core Relationship

Company is long-lived.

Deal is cycle-specific.

```text
Company
  -> Deal for ToonExpo 2026-1
  -> Deal for ToonExpo 2026-2
  -> Deal for ToonExpo 2027-1
```

This allows BigProjects to keep one company history while still treating every ToonExpo participation as a separate sales/onboarding process.

## Company

Company contains stable relationship data:

- company name;
- contacts;
- notes;
- history;
- source;
- general status;
- relationship owner if needed.

Company should not be duplicated for every cycle.

## Deal

Deal contains cycle-specific participation data:

- event_cycle_id;
- company_id;
- responsible manager;
- deal status;
- value/price if tracked;
- contract/payment status if tracked;
- onboarding checklist;
- notes/attachments related to this participation;
- ToonExpo provisioning status if approved.

## Same Company In Multiple Cycles

The same company can have multiple deals across cycles.

Rules:

- avoid duplicate companies when possible;
- create a new deal for a new participation cycle;
- allow reports to show company participation history across cycles;
- allow CRM board to show only deals for selected cycle;
- do not mix onboarding checklist progress from different cycles.

## New Deal Creation

When creating a deal, user must select or accept default event cycle.

Recommended default:

- current active cycle;
- if no active cycle exists, require user selection.

The selected cycle should be visible in the deal sheet/card.

## Deal Status Is Not Cycle Status

Cycle status describes the event iteration.

Deal status describes one company's participation process.

Examples:

- Cycle is active, deal is negotiation;
- Cycle is active, deal is approved_participant;
- Cycle is completed, deal remains approved_participant for historical reporting;
- Cycle is cancelled, deal can be cancelled or archived with reason.

## ToonExpo Provisioning Link

Approved participant deal can trigger ToonExpo account/company provisioning.

Provisioning should include cycle context for audit/reporting, but ToonExpo account itself is not temporary. The builder company account can continue to exist beyond one cycle.

