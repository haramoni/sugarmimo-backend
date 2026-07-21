import { getRegistrationThrottleTracker } from './registration-throttle';

describe('getRegistrationThrottleTracker', () => {
  it('gives different registrations independent limits behind the same proxy', () => {
    const firstRegistration = getRegistrationThrottleTracker({
      ip: '127.0.0.1',
      body: { email: 'maria@example.com', username: 'maria' },
    });
    const secondRegistration = getRegistrationThrottleTracker({
      ip: '127.0.0.1',
      body: { email: 'joao@example.com', username: 'joao' },
    });

    expect(firstRegistration).not.toBe(secondRegistration);
  });

  it('normalizes equivalent emails to the same limit', () => {
    expect(
      getRegistrationThrottleTracker({
        ip: '127.0.0.1',
        body: { email: ' Maria@Example.com ' },
      }),
    ).toBe(
      getRegistrationThrottleTracker({
        ip: '127.0.0.1',
        body: { email: 'maria@example.com' },
      }),
    );
  });

  it('uses the username when the email is missing', () => {
    expect(
      getRegistrationThrottleTracker({
        ip: '127.0.0.1',
        body: { username: ' Maria ' },
      }),
    ).toBe('127.0.0.1:maria');
  });
});
