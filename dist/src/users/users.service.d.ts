import { PrismaService } from '../prisma/prisma.service';
type CreateUserPhotoInput = {
    dataUrl: string;
    fileName?: string;
    mimeType?: string;
    sortOrder: number;
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
        reviewedAt: Date | null;
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
        reviewedAt: Date | null;
        createdAt: Date | null;
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
    updateApprovalStatus(id: string, approvalStatus: 'APPROVED' | 'REJECTED'): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        username: string;
        email: string;
        role: string | null;
        approvalStatus: string;
        reviewedAt: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findMatchesForUser(viewerId: string, search?: string): Promise<({
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
        }[];
    } & {
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
    })[]>;
    findMatchProfileForUser(viewerId: string, identifier: string): Promise<({
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
        }[];
    } & {
        whatsapp: string | null;
        telegram: string | null;
        instagram: string | null;
    }) | null>;
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
        }[];
    } | null>;
    private toSlug;
    private getOppositeRole;
    private publicProfileSelect;
    private normalizeContactViewerUsernames;
    private sanitizePublicProfile;
}
export {};
