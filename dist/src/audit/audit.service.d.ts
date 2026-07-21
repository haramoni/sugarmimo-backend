import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
type CreateActivityLogInput = {
    userId?: string | null;
    action: string;
    method: string;
    path: string;
    statusCode?: number;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Prisma.InputJsonValue;
};
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    record(input: CreateActivityLogInput): Promise<void>;
    findLatest(limit?: number): Prisma.PrismaPromise<({
        user: {
            id: string;
            username: string;
            email: string;
            role: string | null;
        } | null;
    } & {
        path: string;
        id: string;
        createdAt: Date | null;
        userId: string | null;
        method: string;
        action: string;
        statusCode: number | null;
        ip: string | null;
        userAgent: string | null;
        metadata: Prisma.JsonValue | null;
    })[]>;
}
export {};
