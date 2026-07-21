type RegistrationRequest = {
  ip?: unknown;
  body?: {
    email?: unknown;
    username?: unknown;
  };
};

/**
 * Scope registration throttling to the identity being registered.
 *
 * Registration requests are proxied by the Next.js server, so using only the
 * request IP would make every visitor share the same small registration limit.
 */
export function getRegistrationThrottleTracker(request: RegistrationRequest) {
  const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
  const email = normalize(request.body?.email);
  const username = normalize(request.body?.username);
  const identity = email ?? username ?? 'missing-identity';

  return `${ip}:${identity}`;
}

function normalize(value: unknown) {
  return typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : null;
}
