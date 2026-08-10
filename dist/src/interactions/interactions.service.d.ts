import { PrismaService } from '../prisma/prisma.service';
export declare class InteractionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    likeProfile(daddyId: string, babyId: string): Promise<{
        id: string;
        liked: boolean;
        daddyLiked: boolean;
        daddyLikedAt: Date | null;
        babyLiked: boolean;
        babyLikedAt: Date | null;
        createdAt: Date | null;
        contactsReleased: boolean;
        contactsReleasedAt: Date | null;
    }>;
    releaseContacts(babyId: string, daddyId: string): Promise<{
        id: string;
        liked: boolean;
        daddyLiked: boolean;
        daddyLikedAt: Date | null;
        babyLiked: boolean;
        babyLikedAt: Date | null;
        createdAt: Date | null;
        contactsReleased: boolean;
        contactsReleasedAt: Date | null;
    }>;
    likeDaddyAndReleaseContacts(babyId: string, daddyId: string): Promise<{
        id: string;
        liked: boolean;
        daddyLiked: boolean;
        daddyLikedAt: Date | null;
        babyLiked: boolean;
        babyLikedAt: Date | null;
        createdAt: Date | null;
        contactsReleased: boolean;
        contactsReleasedAt: Date | null;
    }>;
    listNotifications(userId: string): Promise<{
        items: {
            id: string;
            createdAt: Date | null;
            type: string;
            readAt: Date | null;
            actor: {
                id: string;
                username: string;
                role: string | null;
                state: string | null;
                city: string | null;
                photos: {
                    id: string;
                    sortOrder: number;
                    dataUrl: string;
                }[];
            };
        }[];
        unreadCount: number;
    }>;
    markNotificationRead(userId: string, notificationId: string): Promise<{
        success: boolean;
    }>;
    private serializeLike;
}
