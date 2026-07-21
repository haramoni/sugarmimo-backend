type LoginRequest = {
    ip?: unknown;
    body?: {
        identifier?: unknown;
        email?: unknown;
        username?: unknown;
    };
};
export declare function getLoginThrottleTracker(request: LoginRequest): string;
export {};
