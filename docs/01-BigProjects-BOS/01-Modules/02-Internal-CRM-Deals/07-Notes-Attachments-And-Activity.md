# Notes Attachments And Activity

## Purpose

CRM needs internal context, but it does not need a separate file/document module in v1.

## Notes

Notes can be attached to:

- company;
- contact;
- deal.

Note fields:

- author;
- body;
- created at;
- edited at optional;
- archived at/actor when archived.

All BOS notes are internal. Release 1 has no public/external visibility flag.

## Attachments

Attachments can be attached to:

- company;
- contact;
- deal.

Examples:

- signed agreement;
- payment proof;
- company documents;
- presentation/material received from participant.

## Attachment Rule

Files/documents live on the entity where they are used.

There is no separate Files/Documents module in v1.

## Activity Timeline

Deal sheet can show activity:

- status changes;
- note added;
- attachment uploaded;
- provisioning request created;
- responsible manager changed.

Activity timeline helps managers understand history without adding complex communication features.

## Communication

Internal chat/messenger is out of scope in v1.

If communication notes are needed, use notes on the deal/company.

Attachments use private R2 object keys and short-lived signed URLs. Type/size/signature validation and malware scanning must pass before download is enabled.
