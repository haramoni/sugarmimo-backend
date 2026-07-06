import { UsersService } from '../users/users.service';
export declare class AdminController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findPendingBabies(): import("@prisma/client").Prisma.PrismaPromise<{
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
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
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
    approveProfile(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        reviewedAt: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    rejectProfile(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        reviewedAt: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
