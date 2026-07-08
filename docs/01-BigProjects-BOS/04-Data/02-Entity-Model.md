# BOS Entity Model

## Purpose

This is a conceptual data model for BigProjects BOS.

It is not a final SQL schema yet.

## Core Entities

```text
Company
Contact
EventCycle
Deal
Task
WorkSpace
ProcessTemplate
ProcessInstance
StaffUser
KpiRecord
OnboardingChecklistTemplate
OnboardingChecklistTemplateItem
DealOnboardingChecklistItem
Note
Attachment
Report
ToonExpoProvisioningRequest
```

## Relationships

```text
Company 1..n Contacts
EventCycle 1..n Deals
Company 1..n Deals
Company 1..n Tasks
WorkSpace 1..n Tasks
Deal 1..n Tasks
Deal 1..n Notes
Deal 1..n Attachments
Deal 1..n DealOnboardingChecklistItems
ProcessTemplate 1..n ProcessInstances
ProcessInstance 1..n Tasks
StaffUser 1..n AssignedTasks
StaffUser 1..n KpiRecords
OnboardingChecklistTemplate 1..n OnboardingChecklistTemplateItems
```

## Event Cycle Rule

Company and Contact records can live across many cycles.

Deal and DealOnboardingChecklistItem records belong to a specific EventCycle.

## Attachment Rule

Files/documents are not a separate module in v1.

They are attached to:

- company;
- contact;
- deal;
- task;
- process instance;
- deal onboarding checklist item.

## Source Of Truth

BOS owns internal companies, deals, tasks and KPI.

ToonExpo owns ToonExpo public/builder/CRM/readiness data.
