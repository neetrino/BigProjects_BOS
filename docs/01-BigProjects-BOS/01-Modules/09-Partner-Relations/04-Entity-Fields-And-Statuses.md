# Entity Fields And Statuses

## PartnerParticipation

- `id`;
- `cycle_engagement_id` unique;
- `stage`;
- `partner_category`;
- `conditions` optional;
- `contribution_amount` optional;
- `currency` optional;
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

Initial values:

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

Categories may be extended without changing the pipeline model.

