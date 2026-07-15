"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("./audit.service");
let AuditInterceptor = class AuditInterceptor {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        const startedAt = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)((responseBody) => {
            this.record(request, response.statusCode, Date.now() - startedAt, {
                responseBody,
            });
        }), (0, rxjs_1.catchError)((error) => {
            const statusCode = error.status ?? error.statusCode ?? 500;
            this.record(request, statusCode, Date.now() - startedAt, {
                errorMessage: error.message,
            });
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    record(request, statusCode, durationMs, outcome) {
        const action = this.resolveAction(request);
        if (!action) {
            return;
        }
        const responseUserId = this.extractResponseUserId(outcome.responseBody);
        const metadata = {
            durationMs,
            params: request.params,
            query: this.sanitizeObject(request.query),
            ...this.extractTargetMetadata(request),
            ...(outcome.errorMessage ? { errorMessage: outcome.errorMessage } : {}),
        };
        void this.auditService.record({
            userId: request.user?.id ?? responseUserId,
            action,
            method: request.method,
            path: request.originalUrl,
            statusCode,
            ip: this.extractIp(request),
            userAgent: this.toHeaderString(request.headers['user-agent']),
            metadata,
        });
    }
    resolveAction(request) {
        const routePath = this.getRoutePath(request);
        const method = request.method.toUpperCase();
        if ((method === 'GET' && routePath === '/auth/availability') ||
            (method === 'POST' && routePath === '/auth/presence')) {
            return null;
        }
        const actions = {
            'POST /auth/register': 'USER_REGISTERED',
            'POST /auth/login': 'USER_LOGIN',
            'POST /auth/admin/login': 'ADMIN_LOGIN',
            'POST /admin/login': 'ADMIN_LOGIN',
            'GET /auth/me': 'CURRENT_USER_VIEWED',
            'PATCH /auth/me': 'PROFILE_UPDATED',
            'GET /auth/matches': 'MATCHES_VIEWED',
            'GET /auth/contact-viewers': 'CONTACT_VIEWERS_SEARCHED',
            'GET /auth/matches/:identifier': 'PROFILE_VIEWED',
            'GET /admin/pending-babies': 'PENDING_PROFILES_VIEWED',
            'PATCH /admin/profiles/:id/approve': 'PROFILE_APPROVED',
            'PATCH /admin/profiles/:id/reject': 'PROFILE_REJECTED',
            'GET /admin/activity-logs': 'ACTIVITY_LOGS_VIEWED',
            'POST /interactions/likes/:babyId': 'PROFILE_LIKED',
            'POST /interactions/baby-likes/:daddyId': 'DADDY_LIKED_AND_CONTACTS_RELEASED',
            'POST /interactions/releases/:daddyId': 'CONTACTS_RELEASED',
            'GET /interactions/notifications': 'NOTIFICATIONS_VIEWED',
            'PATCH /interactions/notifications/:id/read': 'NOTIFICATION_READ',
        };
        return actions[`${method} ${routePath}`] ?? `${method} ${routePath}`;
    }
    getRoutePath(request) {
        const route = request.route;
        const routePath = route && typeof route === 'object' && 'path' in route
            ? route.path
            : undefined;
        if (typeof routePath === 'string' && routePath.startsWith('/')) {
            return routePath;
        }
        return request.path;
    }
    extractResponseUserId(responseBody) {
        if (!responseBody || typeof responseBody !== 'object') {
            return undefined;
        }
        const body = responseBody;
        return typeof body.user?.id === 'string' ? body.user.id : undefined;
    }
    extractIp(request) {
        const forwardedFor = this.toHeaderString(request.headers['x-forwarded-for']);
        return forwardedFor?.split(',')[0]?.trim() || request.ip || null;
    }
    extractTargetMetadata(request) {
        if (request.method === 'POST' && request.path.endsWith('/messages')) {
            return {
                bodyKeys: this.getBodyKeys(request.body),
                messageBodyLogged: false,
            };
        }
        return {
            bodyKeys: this.getBodyKeys(request.body),
        };
    }
    getBodyKeys(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return [];
        }
        return Object.keys(body).filter((key) => !['password', 'passwordHash', 'accessToken', 'token', 'body'].includes(key));
    }
    sanitizeObject(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return Object.fromEntries(Object.entries(value).filter(([key]) => !['password', 'passwordHash', 'accessToken', 'token'].includes(key)));
    }
    toHeaderString(value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return value;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map