import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { AuditService } from './audit.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditService;
    constructor(auditService: AuditService);
    intercept(context: ExecutionContext, next: CallHandler): import("rxjs").Observable<any>;
    private record;
    private resolveAction;
    private getRoutePath;
    private extractResponseUserId;
    private extractIp;
    private extractTargetMetadata;
    private getBodyKeys;
    private sanitizeObject;
    private toHeaderString;
}
