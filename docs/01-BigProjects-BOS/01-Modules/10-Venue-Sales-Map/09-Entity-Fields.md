# Venue Sales Map Entity Fields

## VenuePlan

- id;
- event_cycle_id unique;
- title;
- active_revision_id optional until source setup;
- content_version;
- last_published_content_version optional;
- next_snapshot_version;
- lifecycle_status: active | archived;
- created_by_user_id;
- created_at;
- updated_at.

There is at most one VenuePlan per EventCycle and exactly one active revision after setup.

## VenuePlanRevision

- id;
- venue_plan_id;
- revision_number unique within plan;
- status: active | superseded;
- source_attachment_id;
- normalized_r2_object_key;
- normalized_mime_type;
- normalized_sha256;
- normalized_width_px;
- normalized_height_px;
- grid_origin_x_px;
- grid_origin_y_px;
- rotation_degrees;
- pixels_per_meter;
- min_row/max_row/min_column/max_column;
- created_by_user_id;
- superseded_at/by optional;
- created_at.

Source/calibration can change in place only before the revision has its first SpaceArea. After that, Admin creates a new revision. A revision can be superseded only when it has no active SpaceAllocation; prior cells, areas, allocations, assets and publications remain historical. Material plan replacement after won/confirmed allocations requires a new EventCycle in Release 1.

## VenuePlanCell

- id;
- venue_plan_revision_id;
- row;
- column;
- classification: sellable | walkable | blocked | fixed_object | unknown;
- updated_by_user_id;
- updated_at.

Unique key: revision + row + column.

## VenueLandmark

- id;
- venue_plan_revision_id;
- type: entrance | exit | wc | stairs | info_desk | zone | other;
- label;
- geometry_type: point | polygon;
- geometry JSON in calibrated meter coordinates;
- is_public;
- created_at;
- updated_at.

## SpaceArea

- id;
- venue_plan_revision_id;
- code unique within revision;
- name;
- base_price_per_sqm optional;
- currency required when base price exists;
- lifecycle_status: active | archived;
- created_by_user_id;
- archived_at/by optional;
- created_at;
- updated_at;
- version.

Square meters are derived from active SpaceAreaCell membership and are not an independently editable value.

## SpaceAreaCell

- id;
- venue_plan_revision_id;
- space_area_id;
- row;
- column;
- released_at optional.

A partial unique key on revision + row + column where `released_at IS NULL` prevents active overlap while retaining historical membership.

Revision + row + column also references the matching VenuePlanCell. Active membership is accepted only while that cell classification is `sellable`.

## SpaceAllocation

- id;
- space_area_id;
- cycle_engagement_id;
- status: active | released | archived;
- public_display_mode: organization | custom_label | hidden;
- public_label required only for custom_label;
- allocated_by_user_id/at;
- released_by_user_id/at optional;
- release_reason optional;
- created_at;
- updated_at;
- version.

A partial unique key permits at most one active allocation per SpaceArea. NestJS additionally enforces same EventCycle/revision and assignee permissions.

## VenueMapPublication

- id;
- request_id unique;
- venue_plan_id;
- venue_plan_revision_id;
- snapshot_version unique within plan;
- source_content_version;
- schema_version;
- checksum;
- immutable_payload_json;
- status: draft | publishing | published | publish_failed | archived;
- toonexpo_snapshot_id optional;
- accepted_version optional;
- attempt_count;
- next_attempt_at optional;
- processing_locked_at/by optional;
- error_code/message/validation_errors optional;
- requested_by_user_id/at;
- published_at optional;
- created_at.

Snapshot version is allocated once and never reused. Retry changes attempt/result metadata only; immutable identity, source version, checksum and payload stay unchanged except renewable signed asset transport URL excluded from the checksum.

## Content Version Rule

Every committed mutation that changes public geometry, classifications, landmarks, allocation identity/display or normalized asset increments `VenuePlan.content_version` in the same transaction. The UI is `Up to date` only when `content_version == last_published_content_version`; otherwise it shows unpublished changes.

Release 1 does not require PostGIS. Canonical sellable geometry is cell membership; landmark point/polygon coordinates are validated numeric JSON and all public render polygons are deterministic projections.
