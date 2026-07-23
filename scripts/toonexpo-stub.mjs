#!/usr/bin/env node
/**
 * Local stand-in for ToonExpo's `bos` integration endpoints, used only for acceptance testing
 * of the BigProjects BOS -> ToonExpo integration. Plain Node http, no dependencies.
 *
 * Idempotency semantics (matching the agreed wire contract):
 * - provisioning: same `request_id` replays the exact same stored response; a new
 *   `company_name` creates fresh fake ids, a repeated `company_name` returns `linked_existing`.
 * - venue-map publish: same `request_id` replays the same response; same
 *   `snapshot_version` + same `checksum` -> `already_published`; same `snapshot_version` with a
 *   different `checksum`, or any `snapshot_version` at/below the highest accepted one for that
 *   plan, -> `rejected`; otherwise -> `published` with a fresh fake snapshot id.
 */
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = 4100;
const API_KEY = process.env.TOONEXPO_BOS_API_KEY ?? 'dev-local-key';
const PROVISIONING_PATH = '/integrations/bos/provisioning';
const VENUE_MAP_PUBLISH_PATH = '/integrations/bos/venue-map/publish';

const provisioningByRequestId = new Map();
const companiesByName = new Map();
const planPublications = new Map();

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function handleProvisioning(body) {
  const cached = provisioningByRequestId.get(body.request_id);
  if (cached) {
    return cached;
  }

  const existingCompany = companiesByName.get(body.company_name);
  const company = existingCompany ?? {
    companyId: `toon-co-${randomUUID()}`,
    userId: `toon-user-${randomUUID()}`,
  };
  companiesByName.set(body.company_name, company);

  const response = {
    request_id: body.request_id,
    toonexpo_company_id: company.companyId,
    primary_user_id: company.userId,
    status: existingCompany ? 'linked_existing' : 'success',
    created_at: new Date().toISOString(),
  };
  provisioningByRequestId.set(body.request_id, response);
  return response;
}

function resolvePublishStatus(plan, body) {
  const acceptedAtVersion = plan.byVersion.get(body.snapshot_version);
  if (acceptedAtVersion) {
    return acceptedAtVersion.checksum === body.checksum ? 'already_published' : 'rejected';
  }
  return body.snapshot_version <= plan.maxVersion ? 'rejected' : 'published';
}

function handleVenueMapPublish(body) {
  const plan = planPublications.get(body.bos_venue_plan_id) ?? {
    maxVersion: 0,
    byVersion: new Map(),
    byRequestId: new Map(),
  };
  planPublications.set(body.bos_venue_plan_id, plan);

  const cached = plan.byRequestId.get(body.request_id);
  if (cached) {
    return cached;
  }

  const status = resolvePublishStatus(plan, body);
  const snapshotId =
    status === 'published'
      ? `toon-snap-${randomUUID()}`
      : (plan.byVersion.get(body.snapshot_version)?.snapshotId ?? null);

  if (status === 'published') {
    plan.maxVersion = body.snapshot_version;
    plan.byVersion.set(body.snapshot_version, { checksum: body.checksum, snapshotId });
  }

  const response = {
    request_id: body.request_id,
    bos_venue_plan_id: body.bos_venue_plan_id,
    accepted_snapshot_version: body.snapshot_version,
    toonexpo_snapshot_id: snapshotId,
    status,
    ...(status === 'rejected' && {
      validation_errors: [
        'Snapshot version/checksum conflicts with a previously accepted snapshot.',
      ],
    }),
    ...(status !== 'rejected' && { activated_at: new Date().toISOString() }),
  };
  plan.byRequestId.set(body.request_id, response);
  return response;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  if (req.headers['x-bos-api-key'] !== API_KEY) {
    sendJson(res, 401, { error: 'Invalid or missing x-bos-api-key header' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (req.url === PROVISIONING_PATH) {
      sendJson(res, 200, handleProvisioning(body));
      return;
    }
    if (req.url === VENUE_MAP_PUBLISH_PATH) {
      sendJson(res, 200, handleVenueMapPublish(body));
      return;
    }
    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 400, { error: `Invalid JSON body: ${error.message}` });
  }
});

server.listen(PORT, () => {
  console.log(`ToonExpo stub listening on http://localhost:${PORT}`);
});
