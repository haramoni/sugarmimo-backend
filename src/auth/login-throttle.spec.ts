import { getLoginThrottleTracker } from './login-throttle';

describe('getLoginThrottleTracker', () => {
  it('gives different users independent login limits behind the same proxy', () => {
    const firstUser = getLoginThrottleTracker({
      ip: '127.0.0.1',
      body: { identifier: 'maria@example.com' },
    });
    const secondUser = getLoginThrottleTracker({
      ip: '127.0.0.1',
      body: { identifier: 'joao@example.com' },
    });

    expect(firstUser).not.toBe(secondUser);
  });

  it('normalizes equivalent identifiers to the same limit', () => {
    expect(
      getLoginThrottleTracker({
        ip: '127.0.0.1',
        body: { identifier: ' Maria@Example.com ' },
      }),
    ).toBe(
      getLoginThrottleTracker({
        ip: '127.0.0.1',
        body: { identifier: 'maria@example.com' },
      }),
    );
  });
});
