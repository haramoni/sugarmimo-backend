import { getContactThrottleTracker } from './contact-throttle';

describe('getContactThrottleTracker', () => {
  it('normalizes the e-mail and keeps visitors independent', () => {
    expect(
      getContactThrottleTracker({
        ip: '127.0.0.1',
        body: { email: ' Maria@Example.com ' },
      }),
    ).toBe('127.0.0.1:maria@example.com');

    expect(
      getContactThrottleTracker({
        ip: '127.0.0.1',
        body: { email: 'ana@example.com' },
      }),
    ).toBe('127.0.0.1:ana@example.com');
  });
});
