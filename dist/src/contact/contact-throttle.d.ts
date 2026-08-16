type ContactRequest = {
    ip?: unknown;
    body?: {
        email?: unknown;
    };
};
export declare function getContactThrottleTracker(request: ContactRequest): string;
export {};
