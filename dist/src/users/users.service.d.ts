import { PrismaService } from '../prisma/prisma.service';
type CreateUserPhotoInput = {
    dataUrl: string;
    fileName?: string;
    mimeType?: string;
    sortOrder: number;
    isPrivate?: boolean;
};
type CreateUserAppearanceInput = {
    bodyType?: string;
    ethnicity?: string;
    hairColor?: string;
    eyeColor?: string;
    heightCm?: number;
};
type CreateUserPreferencesInput = {
    source?: string;
    termsAccepted?: boolean;
    smoke?: string;
    drink?: string;
    relationship?: string;
    children?: string;
    education?: string;
    occupation?: string;
    customInterests?: string[];
    visibleContactChannels?: ContactChannel[];
};
type ContactChannel = 'whatsapp' | 'telegram' | 'instagram';
type CreateUserInput = {
    username: string;
    email: string;
    passwordHash: string;
    role?: string;
    gender?: string;
    lookingFor?: string;
    birthDate?: Date;
    country?: string;
    state?: string;
    city?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    approvalStatus?: string;
    appearance?: CreateUserAppearanceInput;
    preferences?: CreateUserPreferencesInput;
    photos?: CreateUserPhotoInput[];
};
type UpdateUserPhotoInput = CreateUserPhotoInput & {
    id?: string;
};
type UpdateUserProfileInput = {
    username?: string;
    lookingFor?: string;
    birthDate?: string;
    country?: string;
    state?: string;
    city?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    visibleContactChannels?: ContactChannel[];
    contactViewerUsernames?: string[];
    privatePhotoViewerUsernames?: string[];
    bodyType?: string;
    ethnicity?: string;
    hairColor?: string;
    eyeColor?: string;
    heightCm?: number;
    smoke?: string;
    drink?: string;
    relationship?: string;
    children?: string;
    education?: string;
    occupation?: string;
    customInterests?: string[];
    introductionPhrase?: string;
    aboutMe?: string;
    lookingForText?: string;
    profilePhotos?: UpdateUserPhotoInput[];
};
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        approvalStatus: string;
        isPremium: boolean;
        boostedUntil: Date | null;
        reviewedAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findByUsername(username: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        approvalStatus: string;
        isPremium: boolean;
        boostedUntil: Date | null;
        reviewedAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updatePasswordHash(id: string, passwordHash: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        email: string;
        passwordHash: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        approvalStatus: string;
        isPremium: boolean;
        boostedUntil: Date | null;
        reviewedAt: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findCredentialsById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAuthStateById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        role: string | null;
        approvalStatus: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    checkAvailability(username: string, email: string): Promise<{
        usernameAvailable: boolean;
        emailAvailable: boolean;
    }>;
    findById(id: string): import("@prisma/client").Prisma.Prisma__UserClient<{
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
        isPremium: boolean;
        reviewedAt: Date | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
            isPrivate: boolean;
        }[];
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(data: CreateUserInput): Promise<{
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
        isPremium: boolean;
        reviewedAt: Date | null;
        createdAt: Date | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
        }[];
    }>;
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
    findSugarDaddies(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        username: string;
        email: string;
        state: string | null;
        city: string | null;
        isPremium: boolean;
        createdAt: Date | null;
    }[]>;
    updatePremiumStatus(id: string, isPremium: boolean): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        isPremium: boolean;
    }>;
    updateApprovalStatus(id: string, approvalStatus: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        isPremium: boolean;
        reviewedAt: Date | null;
    }>;
    findMatchesForUser(viewerId: string, search?: string, page?: number, limit?: number): Promise<{
        items: ({
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            id: string;
            username: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            isPremium: boolean;
            boostedUntil: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date | null;
            appearance: {
                bodyType: string | null;
                ethnicity: string | null;
                hairColor: string | null;
                eyeColor: string | null;
                heightCm: number | null;
            } | null;
            preferences: {
                lookingFor: string | null;
                preferences: import("@prisma/client/runtime/client").JsonValue;
                introductionPhrase: string | null;
                aboutMe: string | null;
            } | null;
            photos: {
                id: string;
                sortOrder: number;
                fileName: string | null;
                mimeType: string | null;
                isPrivate: boolean;
            }[];
        } & {
            photos: {
                isPrivate?: boolean;
            }[] | undefined;
            canViewPrivatePhotos: boolean;
            isOnline: boolean;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
        })[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    }>;
    findBoostedProfilesForUser(viewerId: string, page?: number, limit?: number): Promise<{
        items: ({
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
            id: string;
            username: string;
            role: string | null;
            gender: string | null;
            lookingFor: string | null;
            birthDate: Date | null;
            country: string | null;
            state: string | null;
            city: string | null;
            isPremium: boolean;
            boostedUntil: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date | null;
            appearance: {
                bodyType: string | null;
                ethnicity: string | null;
                hairColor: string | null;
                eyeColor: string | null;
                heightCm: number | null;
            } | null;
            preferences: {
                lookingFor: string | null;
                preferences: import("@prisma/client/runtime/client").JsonValue;
                introductionPhrase: string | null;
                aboutMe: string | null;
            } | null;
            photos: {
                id: string;
                sortOrder: number;
                fileName: string | null;
                mimeType: string | null;
                isPrivate: boolean;
            }[];
        } & {
            photos: {
                isPrivate?: boolean;
            }[] | undefined;
            canViewPrivatePhotos: boolean;
            isOnline: boolean;
            whatsapp: string | null;
            telegram: string | null;
            instagram: string | null;
        })[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    }>;
    findMatchPhotoForUser(viewerId: string, photoId: string): Promise<{
        id: string;
        dataUrl: string;
        mimeType: string | null;
    } | null>;
    findActiveDaddySuggestions(viewerId: string, search?: string): Promise<{
        id: string;
        username: string;
        state: string | null;
        city: string | null;
    }[]>;
    findPrivatePhotoViewerSuggestions(viewerId: string, search?: string): Promise<{
        id: string;
        username: string;
        state: string | null;
        city: string | null;
    }[]>;
    touchPresence(userId: string): Promise<{
        online: boolean;
    }>;
    findMatchProfileForUser(viewerId: string, identifier: string): Promise<{
        interaction: {
            liked: boolean;
            likeId: string | null;
            likedAt: Date | null;
            daddyLiked: boolean;
            daddyLikedAt: Date | null;
            babyLiked: boolean;
            babyLikedAt: Date | null;
            contactsReleased: boolean;
            contactsReleasedAt: Date | null;
        };
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
        id: string;
        username: string;
        role: string | null;
        gender: string | null;
        lookingFor: string | null;
        birthDate: Date | null;
        country: string | null;
        state: string | null;
        city: string | null;
        isPremium: boolean;
        boostedUntil: Date | null;
        lastActiveAt: Date | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
            isPrivate: boolean;
        }[] & {
            isPrivate?: boolean;
        }[];
        canViewPrivatePhotos: boolean;
        isOnline: boolean;
    } | null>;
    updateProfile(id: string, data: UpdateUserProfileInput): Promise<{
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
        isPremium: boolean;
        reviewedAt: Date | null;
        createdAt: Date | null;
        appearance: {
            bodyType: string | null;
            ethnicity: string | null;
            hairColor: string | null;
            eyeColor: string | null;
            heightCm: number | null;
        } | null;
        preferences: {
            lookingFor: string | null;
            preferences: import("@prisma/client/runtime/client").JsonValue;
            introductionPhrase: string | null;
            aboutMe: string | null;
        } | null;
        photos: {
            id: string;
            sortOrder: number;
            dataUrl: string;
            fileName: string | null;
            mimeType: string | null;
            isPrivate: boolean;
        }[];
    } | null>;
    private toSlug;
    private resolveMatchRole;
    private publicProfileSelect;
    private publicProfileListSelect;
    private normalizeContactViewerUsernames;
    private filterActiveDaddyUsernames;
    private filterActiveMatchUsernames;
    private sanitizePublicProfile;
    private isOnline;
}
export {};
