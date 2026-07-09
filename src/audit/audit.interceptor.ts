import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { catchError, tap, throwError } from 'rxjs';
import { AuditService } from './audit.service';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    role?: string | null;
  };
};

type AuthResponse = {
  user?: {
    id?: string;
  };
};

type ErrorWithStatus = Error & {
  status?: number;
  statusCode?: number;
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        this.record(request, response.statusCode, Date.now() - startedAt, {
          responseBody,
        });
      }),
      catchError((error: ErrorWithStatus) => {
        const statusCode = error.status ?? error.statusCode ?? 500;
        this.record(request, statusCode, Date.now() - startedAt, {
          errorMessage: error.message,
        });

        return throwError(() => error);
      }),
    );
  }

  private record(
    request: AuthenticatedRequest,
    statusCode: number,
    durationMs: number,
    outcome: { responseBody?: unknown; errorMessage?: string },
  ) {
    const action = this.resolveAction(request);

    if (!action) {
      return;
    }

    const responseUserId = this.extractResponseUserId(outcome.responseBody);

    void this.auditService.record({
      userId: request.user?.id ?? responseUserId,
      action,
      method: request.method,
      path: request.originalUrl,
      statusCode,
      ip: this.extractIp(request),
      userAgent: this.toHeaderString(request.headers['user-agent']),
      metadata: {
        durationMs,
        params: request.params,
        query: this.sanitizeObject(request.query),
        ...this.extractTargetMetadata(request),
        ...(outcome.errorMessage ? { errorMessage: outcome.errorMessage } : {}),
      } as Prisma.InputJsonObject,
    });
  }

  private resolveAction(request: AuthenticatedRequest) {
    const routePath = this.getRoutePath(request);
    const method = request.method.toUpperCase();

    if (method === 'GET' && routePath === '/auth/availability') {
      return null;
    }

    const actions: Record<string, string> = {
      'POST /auth/register': 'USER_REGISTERED',
      'POST /auth/login': 'USER_LOGIN',
      'POST /auth/admin/login': 'ADMIN_LOGIN',
      'POST /admin/login': 'ADMIN_LOGIN',
      'GET /auth/me': 'CURRENT_USER_VIEWED',
      'PATCH /auth/me': 'PROFILE_UPDATED',
      'GET /auth/matches': 'MATCHES_VIEWED',
      'GET /auth/matches/:identifier': 'PROFILE_VIEWED',
      'GET /admin/pending-babies': 'PENDING_PROFILES_VIEWED',
      'PATCH /admin/profiles/:id/approve': 'PROFILE_APPROVED',
      'PATCH /admin/profiles/:id/reject': 'PROFILE_REJECTED',
      'GET /admin/activity-logs': 'ACTIVITY_LOGS_VIEWED',
      'GET /chat/conversations': 'CHAT_CONVERSATIONS_VIEWED',
      'POST /chat/conversations': 'CHAT_CONVERSATION_STARTED',
      'GET /chat/conversations/:conversationId/messages': 'CHAT_MESSAGES_VIEWED',
      'POST /chat/conversations/:conversationId/messages': 'CHAT_MESSAGE_SENT',
    };

    return actions[`${method} ${routePath}`] ?? `${method} ${routePath}`;
  }

  private getRoutePath(request: Request) {
    const routePath = request.route?.path as string | undefined;

    if (routePath?.startsWith('/')) {
      return routePath;
    }

    return request.path;
  }

  private extractResponseUserId(responseBody: unknown) {
    if (!responseBody || typeof responseBody !== 'object') {
      return undefined;
    }

    const body = responseBody as AuthResponse;
    return typeof body.user?.id === 'string' ? body.user.id : undefined;
  }

  private extractIp(request: Request) {
    const forwardedFor = this.toHeaderString(request.headers['x-forwarded-for']);

    return forwardedFor?.split(',')[0]?.trim() || request.ip || null;
  }

  private extractTargetMetadata(request: Request) {
    if (request.method === 'POST' && request.path.endsWith('/messages')) {
      return { bodyKeys: this.getBodyKeys(request.body), messageBodyLogged: false };
    }

    return {
      bodyKeys: this.getBodyKeys(request.body),
    };
  }

  private getBodyKeys(body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return [];
    }

    return Object.keys(body).filter(
      (key) =>
        !['password', 'passwordHash', 'accessToken', 'token', 'body'].includes(
          key,
        ),
    );
  }

  private sanitizeObject(value: unknown): Prisma.InputJsonObject {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value).filter(
        ([key]) =>
          !['password', 'passwordHash', 'accessToken', 'token'].includes(key),
      ),
    );
  }

  private toHeaderString(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  }
}
