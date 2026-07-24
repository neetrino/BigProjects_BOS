/**
 * One-off demo data bootstrap for local QA.
 * Usage (from repo root): pnpm exec tsx scripts/bootstrap-demo-data.ts
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv({ path: path.resolve(__dirname, '../.env') });

const API = process.env.API_URL ?? 'http://localhost:4000';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@bigprojects.local';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
const ORIGIN = process.env.WEB_URL ?? 'http://localhost:3000';
const stamp = new Date().toISOString().slice(5, 16).replace(/[-:T]/g, '');

type Json = Record<string, unknown>;

let cookie = '';

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
    if (raw) {
      setCookie.push(raw);
    }
  }
  for (const entry of setCookie) {
    const part = entry.split(';')[0];
    if (part?.startsWith('bos_session=')) {
      cookie = part;
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${pathName} → ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function main(): Promise<void> {
  console.log(`Bootstrapping demo data via ${API}…`);

  const me = await api<{ id: string; name: string; role: string }>('POST', '/api/v1/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  });
  console.log(`Logged in as ${me.name} (${me.role})`);

  const cycle = await api<{ id: string; name: string; code: string; status: string }>(
    'POST',
    '/api/v1/cycles',
    {
      name: `ToonExpo Demo ${stamp}`,
      code: `DEMO-${stamp}`,
      startsAt: '2026-09-01T00:00:00.000Z',
      endsAt: '2026-09-05T00:00:00.000Z',
    },
  );
  console.log(`Cycle created: ${cycle.name} (${cycle.code})`);

  const activated = await api<{ id: string; status: string }>('PATCH', `/api/v1/cycles/${cycle.id}`, {
    status: 'ACTIVE',
  });
  console.log(`Cycle status → ${activated.status}`);

  const builder = await api<{ id: string; name: string }>('POST', '/api/v1/organizations', {
    name: `Ararat Builders ${stamp}`,
    type: 'BUILDER',
    phone: '+37411000001',
    email: `builder-${stamp}@example.com`,
    website: 'https://ararat-builders.example',
  });
  console.log(`Builder org: ${builder.name}`);

  const bank = await api<{ id: string; name: string }>('POST', '/api/v1/organizations', {
    name: `Cascade Bank ${stamp}`,
    type: 'BANK',
    phone: '+37411000002',
    email: `bank-${stamp}@example.com`,
  });
  console.log(`Bank org: ${bank.name}`);

  const partnerOrg = await api<{ id: string; name: string }>('POST', '/api/v1/organizations', {
    name: `Media Partner ${stamp}`,
    type: 'PARTNER',
    email: `partner-${stamp}@example.com`,
  });
  console.log(`Partner org: ${partnerOrg.name}`);

  const builderContact = await api<{ id: string; name: string }>(
    'POST',
    `/api/v1/organizations/${builder.id}/contacts`,
    {
      name: 'Anna Builder',
      phone: '+37491111111',
      email: `anna-${stamp}@example.com`,
      position: 'Sales Director',
      isPrimary: true,
    },
  );
  console.log(`Builder contact: ${builderContact.name}`);

  const bankContact = await api<{ id: string; name: string }>(
    'POST',
    `/api/v1/organizations/${bank.id}/contacts`,
    {
      name: 'Karen Banker',
      phone: '+37492222222',
      email: `karen-${stamp}@example.com`,
      position: 'Partnerships',
      isPrimary: true,
    },
  );
  console.log(`Bank contact: ${bankContact.name}`);

  const deal = await api<{ id: string; stage: string }>('POST', '/api/v1/deals', {
    eventCycleId: cycle.id,
    organizationId: builder.id,
    primaryContactId: builderContact.id,
    assignedStaffId: me.id,
    expectedSqm: 48,
    agreedAmount: '12000',
    description: 'Corner booth near main entrance.',
  });
  console.log(`Deal created (stage=${deal.stage})`);

  const contacted = await api<{ id: string; stage: string }>('PATCH', `/api/v1/deals/${deal.id}`, {
    stage: 'CONTACTED',
  });
  console.log(`Deal stage → ${contacted.stage}`);

  const negotiated = await api<{ id: string; stage: string }>('PATCH', `/api/v1/deals/${deal.id}`, {
    stage: 'NEGOTIATION',
  });
  console.log(`Deal stage → ${negotiated.stage}`);

  const bankPartner = await api<{ id: string; stage: string }>('POST', '/api/v1/partners', {
    eventCycleId: cycle.id,
    organizationId: bank.id,
    primaryContactId: bankContact.id,
    assignedStaffId: me.id,
    partnerType: 'Bank',
    description: 'Sponsorship package A.',
  });
  console.log(`Bank partner created (stage=${bankPartner.stage})`);

  const mediaPartner = await api<{ id: string; stage: string }>('POST', '/api/v1/partners', {
    eventCycleId: cycle.id,
    organizationId: partnerOrg.id,
    assignedStaffId: me.id,
    partnerType: 'Media',
    description: 'Press wall + newsletter.',
  });
  console.log(`Media partner created (stage=${mediaPartner.stage})`);

  await api('PATCH', `/api/v1/partners/${bankPartner.id}`, { stage: 'CONTACTED' });
  console.log('Bank partner stage → CONTACTED');

  await api('POST', '/api/v1/notes', {
    ownerType: 'BUILDER_DEAL',
    ownerId: deal.id,
    body: 'Demo note: waiting for area assignment on venue map before WON.',
  });
  console.log('Note added on deal');

  await api('POST', '/api/v1/notes', {
    ownerType: 'PARTNER_PARTICIPATION',
    ownerId: bankPartner.id,
    body: 'Demo note: sponsorship draft sent.',
  });
  console.log('Note added on partner');

  const plan = await api<{ id: string }>('POST', '/api/v1/venue-plans', {
    eventCycleId: cycle.id,
    title: `Demo Plan ${stamp}`,
  });
  console.log(`Venue plan created: ${plan.id}`);

  const deals = await api<Array<{ id: string; organization: { name: string }; stage: string }>>(
    'GET',
    `/api/v1/deals?cycleId=${cycle.id}`,
  );
  const partners = await api<
    Array<{ id: string; organization: { name: string }; stage: string; partnerType: string | null }>
  >('GET', `/api/v1/partners?cycleId=${cycle.id}`);
  const orgs = await api<Array<{ id: string; name: string; type: string; contacts: unknown[] }>>(
    'GET',
    '/api/v1/organizations',
  );

  console.log('\n—— Demo ready ——');
  console.log(`Cycle:     ${cycle.name} [${cycle.code}] id=${cycle.id}`);
  console.log(`Web:       ${ORIGIN}/builder-sales?cycle=${cycle.id}`);
  console.log(`Partners:  ${ORIGIN}/partners?cycle=${cycle.id}`);
  console.log(`Venue map: ${ORIGIN}/venue-map?cycle=${cycle.id}`);
  console.log(`Deals:     ${deals.length} → ${deals.map((d) => `${d.organization.name}:${d.stage}`).join(', ')}`);
  console.log(
    `Partners:  ${partners.length} → ${partners.map((p) => `${p.organization.name}:${p.stage}`).join(', ')}`,
  );
  console.log(
    `Orgs:      ${orgs.filter((o) => o.name.includes(stamp)).map((o) => `${o.name} (${o.type})`).join(', ')}`,
  );
  console.log('\nNext in UI: upload plan image → calibrate → create area → assign to deal → move deal to WON.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
