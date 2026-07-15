import { Request } from 'express';
import { InteractionsService } from './interactions.service';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};
export declare class InteractionsController {
    private readonly interactionsService;
    constructor(interactionsService: InteractionsService);
    likeProfile(request: AuthenticatedRequest, babyId: string): Promise<{
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
    releaseContacts(request: AuthenticatedRequest, daddyId: string): Promise<{
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
    likeDaddyAndReleaseContacts(request: AuthenticatedRequest, daddyId: string): Promise<{
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
    notifications(request: AuthenticatedRequest): Promise<{
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
    markNotificationRead(request: AuthenticatedRequest, id: string): Promise<{
        success: boolean;
    }>;
}
export {};
