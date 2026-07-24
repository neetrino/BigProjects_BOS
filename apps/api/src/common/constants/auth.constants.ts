const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;

/** Name of the HTTP-only session cookie. */
export const SESSION_COOKIE_NAME = 'bos_session';

/** Session lifetime, and the sliding-renewal window, expressed in days. */
export const SESSION_TTL_DAYS = 7;
export const SESSION_RENEWAL_THRESHOLD_DAYS = 6;

/** Same values in milliseconds, for use with `Date` arithmetic. */
export const SESSION_TTL_MS = SESSION_TTL_DAYS * MS_PER_DAY;
export const SESSION_RENEWAL_THRESHOLD_MS = SESSION_RENEWAL_THRESHOLD_DAYS * MS_PER_DAY;

/** Size of the random opaque session token, in bytes, before encoding. */
export const SESSION_TOKEN_BYTES = 32;

/** Strict rate limit applied to the login route only. */
export const LOGIN_RATE_LIMIT_TTL_MS = MS_PER_MINUTE;
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;

/** Default rate limit for API routes (Size B: ~20 staff; Next SSR fans out several calls per page). */
export const DEFAULT_RATE_LIMIT_TTL_MS = MS_PER_MINUTE;
export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 300;

/** Single, generic message for all login failures so responses do not reveal account existence or status. */
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

/**
 * Precomputed Argon2id hash of a fixed, non-secret placeholder value.
 *
 * When a login attempt uses an email that does not match any user, we still run an Argon2
 * verification against this hash instead of short-circuiting immediately. This keeps the
 * response time for "unknown email" close to the response time for "known email, wrong
 * password", so response timing cannot be used to enumerate valid accounts.
 */
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$MqNfLfQ2/5+ZjbEYV9J7Rw$uw8qGvMOvCYoMZ25PQ7Y1zmxcWcSDiHMYCtHhNOKP00';
