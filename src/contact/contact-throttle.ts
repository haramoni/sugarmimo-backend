type ContactRequest = {
  ip?: unknown;
  body?: { email?: unknown };
};

/**
 * As mensagens passam pelo servidor Next.js. Incluir o e-mail no identificador
 * evita que todas as visitantes compartilhem o mesmo limite de envio.
 */
export function getContactThrottleTracker(request: ContactRequest) {
  const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
  const email =
    typeof request.body?.email === 'string' && request.body.email.trim()
      ? request.body.email.trim().toLowerCase()
      : 'missing-email';

  return `${ip}:${email}`;
}
