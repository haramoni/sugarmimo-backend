"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginThrottleTracker = getLoginThrottleTracker;
function getLoginThrottleTracker(request) {
    const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
    const rawIdentifier = request.body?.identifier ?? request.body?.email ?? request.body?.username;
    const identifier = typeof rawIdentifier === 'string'
        ? rawIdentifier.trim().toLowerCase()
        : 'missing-identifier';
    return `${ip}:${identifier}`;
}
//# sourceMappingURL=login-throttle.js.map