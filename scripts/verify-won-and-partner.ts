import { config as loadEnv } from 'dotenv';
import path from 'node:path';

loadEnv({ path: path.resolve(__dirname, '../.env') });

const API = process.env.API_URL ?? 'http://localhost:4000';
const ORIGIN = process.env.WEB_URL ?? 'http://localhost:3000';
let cookie = '';

async function api(method: string, p: string, body?: object) {
  const r = await fetch(`${API}${p}`, {
    method,
    headers: {
      Accept: 'application/json',
      Origin: ORIGIN,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const part = c.split(';')[0];
    if (part?.startsWith('bos_session=')) cookie = part;
  }
  const t = await r.text();
  return { status: r.status, body: t ? JSON.parse(t) : null };
}

async function main() {
  await api('POST', '/api/v1/auth/login', {
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  });
  const cycles = (await api('GET', '/api/v1/cycles')).body as Array<{ id: string; code: string }>;
  const cycle = cycles.find((c) => c.code === 'DEMO-07241424');
  if (!cycle) throw new Error('demo cycle missing');

  const deals = (await api('GET', `/api/v1/deals?cycleId=${cycle.id}`)).body as Array<{
    id: string;
    stage: string;
  }>;
  const deal = deals[0];
  const notes = (await api('GET', `/api/v1/notes?ownerType=BUILDER_DEAL&ownerId=${deal.id}`))
    .body as Array<{ body: string }>;
  console.log('Deal stage:', deal.stage);
  console.log('Notes count:', notes.length);
  console.log(
    'Has UI note:',
    notes.some((n) => n.body.includes('UI browser QA')),
  );

  const won = await api('PATCH', `/api/v1/deals/${deal.id}`, { stage: 'WON' });
  console.log('WON without area:', won.status, won.body?.message ?? won.body);

  const partners = (await api('GET', `/api/v1/partners?cycleId=${cycle.id}`)).body as Array<{
    id: string;
    partnerType: string | null;
  }>;
  const bank = partners.find((p) => p.partnerType === 'Bank');
  if (!bank) throw new Error('bank partner missing');
  const bankDetail = (await api('GET', `/api/v1/partners/${bank.id}`)).body as {
    organization: { name: string };
    primaryContact: { name: string } | null;
    stage: string;
    assignedStaff: { name: string } | null;
  };
  console.log(
    'Bank partner detail:',
    bankDetail.organization.name,
    '|',
    bankDetail.primaryContact?.name,
    '|',
    bankDetail.assignedStaff?.name,
    '|',
    bankDetail.stage,
  );

  const plan = (await api('GET', `/api/v1/venue-plans?cycleId=${cycle.id}`)).body as {
    plan: { id: string; eventCycleId: string; title: string } | null;
  };
  console.log('Venue plan:', plan.plan?.id, plan.plan?.title, 'cycle=', plan.plan?.eventCycleId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
