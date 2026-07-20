# Entity Fields And Statuses

## PartnerParticipation

- `id`;
- `cycle_engagement_id` unique;
- `stage`;
- `partner_category`;
- `conditions` optional;
- `contribution_amount` optional;
- `currency` required when contribution_amount exists;
- `confirmed_at` optional;
- `declined_at` optional;
- timestamps.

## Stage

```text
identified
invited
discussing
confirmed
declined
cancelled
```

These stages are independent from BuilderDeal stages.

## Partner Category

Release 1 values:

```text
bank
sponsor
service_company
supplier
insurance
legal
technology
other
```

New categories require a documented enum/API migration but do not change the pipeline model.
