/**
 * End-to-end relation checks against the latest ToonExpo Demo cycle.
 * Usage: pnpm exec tsx scripts/verify-demo-links.ts
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import assert from 'node:assert/strict';

loadEnv({ path: path.resolve(__dirname, '../.env') });

const API = process.env.API_URL ?? 'http://localhost:4000';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@bigprojects.local';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
const ORIGIN = process.env.WEB_URL ?? 'http://localhost:3000';

type Json = Record<string, unknown>;
let cookie = '';
const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

function pass(name: string, detail?: string): void {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name: string, detail: string): never {
  results.push({ name, ok: false, detail });
  console.error(`❌ ${name} — ${detail}`);
  throw new Error(detail);
}

async function api<T>(method: string, pathName: string, body?: Json): Promise<T> {
  const response = await fetch(`${API}${pathName}`, {
    method,
    headers: {
      Accept: 'application/json',
      Origin: ORIGIN,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  if (setCookie.length === 0) {
    const raw = response.headers.get('set-cookie');
    if (raw) setCookie.push(raw);
  }
  for (const entry of setCookie) {
    const part = entry.split(';')[0];
    if (part?.startsWith('bos_session=')) cookie = part;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${pathName} → ${response.status}: ${text}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

type Cycle = { id: string; name: string; code: string; status: string };
type Org = {
  id: string;
  name: string;
  type: string;
  contacts: Array<{ id: string; name: string; isPrimary: boolean }>;
};
type Deal = {
  id: string;
  stage: string;
  organizationId: string;
  organization: { id: string; name: string };
  primaryContact: { id: string; name: string } | null;
  assignedStaff: { id: string; name: string } | null;
  expectedSqm: number | null;
  agreedAmount: number | null;
  description: string | null;
  areas?: unknown[];
};
type Partner = {
  id: string;
  stage: string;
  partnerType: string | null;
  organization: { id: string; name: string };
  primaryContact: { id: string; name: string } | null;
  assignedStaff: { id: string; name: string } | null;
};
type Note = { id: string; body: string; author: { name: string } };
type Plan = { id: string; eventCycleId: string; title: string; areas: unknown[] };

async function main(): Promise<void> {
  console.log(`Verifying demo links via ${API}…\n`);

  const me = await api<{ id: string; name: string; role: string }>('POST', '/api/v1/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  });
  assert.equal(me.role, 'ADMIN');
  pass('Login as Admin', me.name);

  const cycles = await api<Cycle[]>('GET', '/api/v1/cycles');
  const cycle = cycles.find((c) => c.code.startsWith('DEMO-') && c.status === 'ACTIVE');
  if (!cycle) fail('Find ACTIVE DEMO cycle', 'No ACTIVE DEMO-* cycle found');
  pass('ACTIVE demo cycle', `${cycle.name} (${cycle.code})`);

  const orgs = await api<Org[]>('GET', '/api/v1/organizations');
  const stamp = cycle.code.replace('DEMO-', '');
  const builder = orgs.find((o) => o.name.includes(`Ararat Builders ${stamp}`));
  const bank = orgs.find((o) => o.name.includes(`Cascade Bank ${stamp}`));
  const media = orgs.find((o) => o.name.includes(`Media Partner ${stamp}`));
  if (!builder || !bank || !media) {
    fail('Find demo organizations', `builder=${!!builder} bank=${!!bank} media=${!!media}`);
  }
  pass('Organizations exist', `Builder/Bank/Media for ${stamp}`);

  assert.equal(builder.type, 'BUILDER');
  assert.equal(bank.type, 'BANK');
  assert.equal(media.type, 'PARTNER');
  pass('Organization types', 'BUILDER / BANK / PARTNER');

  const builderDetail = await api<Org>('GET', `/api/v1/organizations/${builder.id}`);
  const bankDetail = await api<Org>('GET', `/api/v1/organizations/${bank.id}`);
  const builderContact = builderDetail.contacts.find((c) => c.name === 'Anna Builder');
  const bankContact = bankDetail.contacts.find((c) => c.name === 'Karen Banker');
  if (!builderContact || !bankContact) {
    fail('Contacts on orgs', `Anna=${!!builderContact} Karen=${!!bankContact}`);
  }
  assert.equal(builderContact.isPrimary, true);
  assert.equal(bankContact.isPrimary, true);
  pass('Primary contacts', 'Anna Builder + Karen Banker');

  const deals = await api<Deal[]>('GET', `/api/v1/deals?cycleId=${cycle.id}`);
  assert.equal(deals.length >= 1, true);
  const deal = deals.find((d) => d.organization.id === builder.id);
  if (!deal) fail('Deal linked to builder', 'No deal for Ararat Builders');
  assert.equal(deal.organizationId, builder.id);
  assert.equal(deal.primaryContact?.id, builderContact.id);
  assert.equal(deal.assignedStaff?.id, me.id);
  assert.equal(deal.expectedSqm, 48);
  assert.equal(Number(deal.agreedAmount), 12000);
  pass('Deal ↔ org/contact/staff/amounts', `stage=${deal.stage}`);

  const dealDetail = await api<Deal>('GET', `/api/v1/deals/${deal.id}`);
  assert.equal(dealDetail.organization.name, builder.name);
  assert.equal(dealDetail.primaryContact?.name, 'Anna Builder');
  pass('Deal detail fetch', dealDetail.id);

  const partners = await api<Partner[]>('GET', `/api/v1/partners?cycleId=${cycle.id}`);
  assert.equal(partners.length >= 2, true);
  const bankPartner = partners.find((p) => p.organization.id === bank.id);
  const mediaPartner = partners.find((p) => p.organization.id === media.id);
  if (!bankPartner || !mediaPartner) fail('Partners linked', 'Missing bank or media partner');
  assert.equal(bankPartner.partnerType, 'Bank');
  assert.equal(mediaPartner.partnerType, 'Media');
  assert.equal(bankPartner.primaryContact?.id, bankContact.id);
  assert.equal(bankPartner.assignedStaff?.id, me.id);
  assert.equal(mediaPartner.assignedStaff?.id, me.id);
  pass('Partners ↔ org/contact/staff/types', `${bankPartner.stage} / ${mediaPartner.stage}`);

  const dealNotes = await api<Note[]>(
    'GET',
    `/api/v1/notes?ownerType=BUILDER_DEAL&ownerId=${deal.id}`,
  );
  assert.equal(
    dealNotes.some((n) => n.body.includes('area assignment')),
    true,
  );
  pass('Deal notes linked', `${dealNotes.length} note(s)`);

  const partnerNotes = await api<Note[]>(
    'GET',
    `/api/v1/notes?ownerType=PARTNER_PARTICIPATION&ownerId=${bankPartner.id}`,
  );
  assert.equal(
    partnerNotes.some((n) => n.body.includes('sponsorship')),
    true,
  );
  pass('Partner notes linked', `${partnerNotes.length} note(s)`);

  const plan = await api<Plan | null>('GET', `/api/v1/venue-plans?cycleId=${cycle.id}`);
  // API may return object or wrapped — handle both
  const planObj = (
    plan && 'id' in (plan as object) ? plan : (plan as { plan?: Plan } | null)?.plan
  ) as Plan | null | undefined;
  // Try alternate shapes from frontend client
  let venuePlan: Plan | null = null;
  try {
    const raw = await api<unknown>('GET', `/api/v1/venue-plans?cycleId=${cycle.id}`);
    if (raw && typeof raw === 'object' && 'id' in raw) {
      venuePlan = raw as Plan;
    } else if (raw && typeof raw === 'object' && 'plan' in raw) {
      venuePlan = (raw as { plan: Plan | null }).plan;
    } else if (Array.isArray(raw) && raw[0]) {
      venuePlan = raw[0] as Plan;
    }
  } catch (e) {
    fail('Venue plan fetch', String(e));
  }
  if (!venuePlan) fail('Venue plan for cycle', 'No plan found');
  assert.equal(venuePlan.eventCycleId, cycle.id);
  pass('Venue plan ↔ cycle', venuePlan.id);

  // Live mutation: add a verification note, bump partner stage, then restore
  const verifyNote = await api<Note>('POST', '/api/v1/notes', {
    ownerType: 'BUILDER_DEAL',
    ownerId: deal.id,
    body: `QA verify note ${new Date().toISOString()}`,
  });
  pass('Create note on deal', verifyNote.id);

  const prevPartnerStage = bankPartner.stage;
  const nextStage = prevPartnerStage === 'CONTACTED' ? 'CONFIRMED' : 'CONTACTED';
  const updatedPartner = await api<Partner>('PATCH', `/api/v1/partners/${bankPartner.id}`, {
    stage: nextStage,
  });
  assert.equal(updatedPartner.stage, nextStage);
  pass('Partner stage mutation', `${prevPartnerStage} → ${nextStage}`);

  await api('PATCH', `/api/v1/partners/${bankPartner.id}`, { stage: prevPartnerStage });
  pass('Partner stage restored', prevPartnerStage);

  // Deal stage: NEGOTIATION → CONTACTED is invalid; try CONTACTED from NEW path —
  // only move forward if currently NEGOTIATION stays (won needs area). Add note only.
  if (deal.stage === 'NEGOTIATION') {
    pass('Deal ready for area→WON path', 'stage=NEGOTIATION (area required for WON)');
  }

  // Cross-filter: deals by assigned staff
  const staffDeals = await api<Deal[]>(
    'GET',
    `/api/v1/deals?cycleId=${cycle.id}&assignedStaffId=${me.id}`,
  );
  assert.equal(
    staffDeals.some((d) => d.id === deal.id),
    true,
  );
  pass('Deal filter by assigned staff', `${staffDeals.length} deal(s)`);

  const staffPartners = await api<Partner[]>(
    'GET',
    `/api/v1/partners?cycleId=${cycle.id}&assignedStaffId=${me.id}`,
  );
  assert.equal(staffPartners.length >= 2, true);
  pass('Partner filter by assigned staff', `${staffPartners.length} partner(s)`);

  console.log('\n—— Summary ——');
  const failed = results.filter((r) => !r.ok);
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  console.log(`Cycle:     ${cycle.name}`);
  console.log(`Sales:     ${ORIGIN}/builder-sales?cycle=${cycle.id}`);
  console.log(`Partners:  ${ORIGIN}/partners?cycle=${cycle.id}`);
  console.log(`Venue map: ${ORIGIN}/venue-map?cycle=${cycle.id}`);
  if (failed.length) process.exit(1);
  console.log('\nAll relation checks passed.');
}

main().catch((error: unknown) => {
  console.error('\nVerification failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
