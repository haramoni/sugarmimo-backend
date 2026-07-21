type RegistrationRequest = {
    ip?: unknown;
    body?: {
        email?: unknown;
        username?: unknown;
    };
};
export declare function getRegistrationThrottleTracker(request: RegistrationRequest): string;
export {};
