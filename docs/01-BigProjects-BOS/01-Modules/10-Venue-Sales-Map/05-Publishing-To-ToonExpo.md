# Publishing To ToonExpo

## Ownership

BOS owns the editable map, grid, allocations and publication decision. ToonExpo owns its public read model and public rendering.

ToonExpo must not query BOS during a public page request.

## Manual Publication

Only BOS Admin can publish:

```text
BOS draft
-> validate snapshot
-> create immutable VenueMapSnapshotV1
-> send idempotent publish request to ToonExpo
-> ToonExpo stores snapshot and asset copy
-> ToonExpo activates version
-> BOS records result
```

Draft edits never appear publicly until publication succeeds.

## Public Data Minimization

The snapshot contains:

- cycle and map external identifiers;
- version;
- normalized background asset reference;
- public area geometry and labels;
- public landmarks;
- confirmed public organization/project references;
- routing-ready cell classifications/access points where configured.

The snapshot excludes:

- deal stages and values;
- staff identity;
- notes and attachments;
- private allocation identity;
- internal activity history.

## Allocation Display Mode

```text
organization
custom_label
hidden
```

New allocations default to `organization`. Staff/Admin must explicitly select `custom_label` or `hidden`.

For `hidden`, BOS omits organization identity from the payload. For `custom_label`, only the approved label is sent.

## Reliability

- request is idempotent by map id and version;
- ToonExpo rejects an older version replacing a newer active version;
- retries reuse the same snapshot checksum;
- BOS records pending, success and failed attempts;
- failed publication leaves the prior ToonExpo version active.
