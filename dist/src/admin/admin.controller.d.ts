import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { ResolveReportDto } from '../chat/dto/resolve-report.dto';
export declare class AdminController {
    private readonly usersService;
    private readonly auditService;
    private readonly chatService;
    constructor(usersService: UsersService, auditService: AuditService, chatService: ChatService);
    findPendingBabies(page?: string, pageSize?: string): Promise<{
        items: {
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
        }[];
        pagination: {
            page: number;
            pageSize: number;
            totalItems: number;
            totalPages: number;
            hasPreviousPage: boolean;
            hasNextPage: boolean;
        };
    }>;
    findSugarDaddies(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        username: string;
        email: string;
        state: string | null;
        city: string | null;
        isPremium: boolean;
        createdAt: Date | null;
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
        method: string;
        action: string;
        statusCode: number | null;
        ip: string | null;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    findChatReports(status?: string): Promise<{
        evidenceExpiresAt: Date;
        messages: {
            body: string;
            id: string;
            createdAt: Date | null;
            senderId: string;
        }[];
        reporter: {
            id: string;
            username: string;
            role: string | null;
        };
        reported: {
            id: string;
            username: string;
            role: string | null;
            approvalStatus: string;
            accountStatus: string;
            suspendedUntil: Date | null;
        };
        reviewedBy: {
            id: string;
            username: string;
        } | null;
        id: string;
        reviewedAt: Date | null;
        createdAt: Date | null;
        category: string;
        details: string | null;
        resolution: string | null;
        conversationId: string;
        status: string;
        reporterId: string;
        reportedId: string;
        reviewedById: string | null;
    }[]>;
    resolveChatReport(request: {
        user: {
            id: string;
        };
    }, id: string, dto: ResolveReportDto): Promise<{
        success: boolean;
    }>;
    approveProfile(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        isPremium: boolean;
        reviewedAt: Date | null;
    }>;
    rejectProfile(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        isPremium: boolean;
        reviewedAt: Date | null;
    }>;
    enablePremium(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        isPremium: boolean;
    }>;
    disablePremium(id: string): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        isPremium: boolean;
    }>;
}
