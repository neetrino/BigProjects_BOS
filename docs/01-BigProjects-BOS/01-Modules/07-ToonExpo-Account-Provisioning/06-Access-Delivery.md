# Access Delivery

## Purpose

After provisioning succeeds, the participant needs access to ToonExpo.

## Release 1 Flow

ToonExpo sends or triggers the access email because ToonExpo owns the account.

Email should include:

- ToonExpo login link;
- account email;
- password setup link or temporary access flow;
- company name;
- support/contact instruction.

## BOS Visibility

BOS can show:

- access email sent status if returned;
- ToonExpo company id;
- ToonExpo primary user id/email;
- provisioning success time.

## Delivery Failure

If ToonExpo reports that delivery failed:

- BOS keeps provisioning success and shows the delivery failure summary;
- Admin opens ToonExpo to resend/reset access through the owning system;
- BOS never generates, stores or sends ToonExpo credentials.

## Security

- Do not store plain passwords in BOS.
- ToonExpo must use a single-use password setup/access flow rather than returning a password to BOS.
- Do not include sensitive buyer/visitor data.
