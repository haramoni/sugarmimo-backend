"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactThrottleTracker = getContactThrottleTracker;
function getContactThrottleTracker(request) {
    const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
    const email = typeof request.body?.email === 'string' && request.body.email.trim()
        ? request.body.email.trim().toLowerCase()
        : 'missing-email';
    return `${ip}:${email}`;
}
//# sourceMappingURL=contact-throttle.js.map