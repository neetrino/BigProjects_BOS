# Access Delivery

## Purpose

After provisioning succeeds, the participant needs access to ToonExpo.

## Recommended v1 Flow

ToonExpo should send or trigger the access email because ToonExpo owns the account.

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

## Manual Fallback

If automatic email is not implemented:

- BOS marks account created;
- admin copies/sends access details through agreed manual process;
- checklist item can be manually marked done.

## Security

- Do not store plain passwords in BOS.
- Prefer password setup link over temporary password.
- Do not include sensitive buyer/visitor data.

