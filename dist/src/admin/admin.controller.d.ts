import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
export declare class AdminController {
    private readonly usersService;
    private readonly auditService;
    constructor(usersService: UsersService, auditService: AuditService);
    findPendingBabies(): import("@prisma/client").Prisma.PrismaPromise<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        email: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        approvalStatus: string;
        createdAt: Date | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    }[]>;
    findActivityLogs(limit?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
        action: string;
        method: string;
        statusCode: number | null;
        ip: string | null;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    approveProfile(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        reviewedAt: Date | null;
    }>;
    rejectProfile(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        reviewedAt: Date | null;
    }>;
}
