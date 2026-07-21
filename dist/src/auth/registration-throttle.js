"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistrationThrottleTracker = getRegistrationThrottleTracker;
function getRegistrationThrottleTracker(request) {
    const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
    const email = normalize(request.body?.email);
    const username = normalize(request.body?.username);
    const identity = email ?? username ?? 'missing-identity';
    return `${ip}:${identity}`;
}
function normalize(value) {
    return typeof value === 'string' && value.trim()
        ? value.trim().toLowerCase()
        : null;
}
//# sourceMappingURL=registration-throttle.js.map