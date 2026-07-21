type LoginRequest = {
  ip?: unknown;
  body?: {
    identifier?: unknown;
    email?: unknown;
    username?: unknown;
  };
};

/**
 * Keep brute-force protection scoped to the account being accessed.
 *
 * Login requests arrive through the Next.js server, so throttling only by IP
 * would make every visitor share the same small global login allowance.
 */
export function getLoginThrottleTracker(request: LoginRequest) {
  const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
  const rawIdentifier =
    request.body?.identifier ?? request.body?.email ?? request.body?.username;
  const identifier =
    typeof rawIdentifier === 'string'
      ? rawIdentifier.trim().toLowerCase()
      : 'missing-identifier';

  return `${ip}:${identifier}`;
}
