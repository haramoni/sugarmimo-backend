"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const UserRole = {
    SugarDaddy: 'SUGAR_DADDY',
    SugarBaby: 'SUGAR_BABY',
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
    async checkAvailability(username, email) {
        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUsers = await this.prisma.user.findMany({
            where: {
                OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
            },
            select: {
                username: true,
                email: true,
            },
        });
        const usedUsernames = new Set(existingUsers.map((user) => user.username));
        const usedEmails = new Set(existingUsers.map((user) => user.email));
        return {
            usernameAvailable: !usedUsernames.has(normalizedUsername),
            emailAvailable: !usedEmails.has(normalizedEmail),
        };
    }
    findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                reviewedAt: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                    },
                },
                appearance: {
                    select: {
                        bodyType: true,
                        ethnicity: true,
                        hairColor: true,
                        eyeColor: true,
                        heightCm: true,
                    },
                },
                preferences: {
                    select: {
                        preferences: true,
                        introductionPhrase: true,
                        aboutMe: true,
                        lookingFor: true,
                    },
                },
            },
        });
    }
    async create(data) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email or username already registered');
        }
        const { appearance, preferences, photos, ...userData } = data;
        const hasAppearance = appearance &&
            Object.values(appearance).some((value) => value !== undefined && value !== '');
        const filteredPreferences = Object.fromEntries(Object.entries(preferences ?? {}).filter(([, value]) => value !== undefined && value !== ''));
        const hasPreferences = Object.keys(filteredPreferences).length > 0;
        return this.prisma.user.create({
            data: {
                ...userData,
                appearance: hasAppearance
                    ? {
                        create: appearance,
                    }
                    : undefined,
                preferences: hasPreferences
                    ? {
                        create: {
                            preferences: filteredPreferences,
                        },
                    }
                    : undefined,
                photos: photos
                    ? {
                        create: photos,
                    }
                    : undefined,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                reviewedAt: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                    },
                },
            },
        });
    }
    findPendingBabies() {
        return this.prisma.user.findMany({
            where: {
                role: 'SUGAR_BABY',
                approvalStatus: 'PENDING',
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                gender: true,
                lookingFor: true,
                birthDate: true,
                country: true,
                state: true,
                city: true,
                whatsapp: true,
                telegram: true,
                instagram: true,
                approvalStatus: true,
                createdAt: true,
                photos: {
                    orderBy: { sortOrder: 'asc' },
                    select: {
                        id: true,
                        dataUrl: true,
                        fileName: true,
                        mimeType: true,
                        sortOrder: true,
                    },
                },
            },
        });
    }
    updateApprovalStatus(id, approvalStatus) {
        return this.prisma.user.update({
            where: { id },
            data: {
                approvalStatus,
                reviewedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                approvalStatus: true,
                reviewedAt: true,
            },
        });
    }
    async findMatchesForUser(viewerId, search) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { role: true, username: true },
        });
        if (!viewer?.role) {
            return [];
        }
        const targetRole = this.getOppositeRole(viewer.role);
        if (!targetRole) {
            return [];
        }
        const normalizedSearch = search?.trim();
        const matches = await this.prisma.user.findMany({
            where: {
                id: { not: viewerId },
                role: targetRole,
                approvalStatus: 'APPROVED',
                ...(normalizedSearch
                    ? {
                        OR: [
                            { username: { contains: normalizedSearch } },
                            { city: { contains: normalizedSearch } },
                            { state: { contains: normalizedSearch } },
                        ],
                    }
                    : {}),
            },
            orderBy: { createdAt: 'desc' },
            select: this.publicProfileSelect(),
        });
        return matches.map((match) => this.sanitizePublicProfile(match, viewer.username));
    }
    async findMatchProfileForUser(viewerId, identifier) {
        const viewer = await this.prisma.user.findUnique({
            where: { id: viewerId },
            select: { username: true },
        });
        if (!viewer?.username) {
            return null;
        }
        const normalizedIdentifier = identifier.trim().replace(/^@+/, '');
        const profile = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: normalizedIdentifier },
                    { username: normalizedIdentifier.toLowerCase() },
                ],
                role: { in: [UserRole.SugarDaddy, UserRole.SugarBaby] },
                approvalStatus: 'APPROVED',
            },
            select: this.publicProfileSelect(),
        });
        return profile ? this.sanitizePublicProfile(profile, viewer.username) : null;
    }
    async updateProfile(id, data) {
        const currentUser = await this.findById(id);
        if (!currentUser) {
            return null;
        }
        const selectedPreferences = {
            lookingFor: data.lookingFor,
            bodyType: data.bodyType,
            ethnicity: data.ethnicity,
            hairColor: data.hairColor,
            eyeColor: data.eyeColor,
            smoke: data.smoke,
            drink: data.drink,
            relationship: data.relationship,
            children: data.children,
            education: data.education,
            occupation: data.occupation,
            customInterests: data.customInterests,
            visibleContactChannels: data.visibleContactChannels,
            contactViewerUsernames: this.normalizeContactViewerUsernames(data.contactViewerUsernames),
        };
        const preferences = Object.fromEntries(Object.entries(selectedPreferences).filter(([key, value]) => value !== undefined &&
            (key === 'customInterests' ||
                key === 'visibleContactChannels' ||
                key === 'contactViewerUsernames' ||
                (Array.isArray(value) ? value.length > 0 : value !== ''))));
        const slugs = Object.fromEntries(Object.entries(preferences).map(([key, value]) => [
            key,
            Array.isArray(value)
                ? value.map((item) => this.toSlug(String(item)))
                : this.toSlug(String(value)),
        ]));
        const hasAppearance = [
            data.bodyType,
            data.ethnicity,
            data.hairColor,
            data.eyeColor,
            data.heightCm,
        ].some((value) => value !== undefined && value !== '');
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    username: data.username?.toLowerCase(),
                    lookingFor: data.lookingFor,
                    birthDate: data.birthDate
                        ? new Date(`${data.birthDate}T00:00:00.000Z`)
                        : undefined,
                    country: data.country,
                    state: data.state,
                    city: data.city,
                    whatsapp: data.whatsapp,
                    telegram: data.telegram,
                    instagram: data.instagram,
                },
            });
            if (hasAppearance) {
                await tx.userAppearance.upsert({
                    where: { userId: id },
                    update: {
                        bodyType: data.bodyType,
                        ethnicity: data.ethnicity,
                        hairColor: data.hairColor,
                        eyeColor: data.eyeColor,
                        heightCm: data.heightCm,
                    },
                    create: {
                        userId: id,
                        bodyType: data.bodyType,
                        ethnicity: data.ethnicity,
                        hairColor: data.hairColor,
                        eyeColor: data.eyeColor,
                        heightCm: data.heightCm,
                    },
                });
            }
            await tx.userPreference.upsert({
                where: { userId: id },
                update: {
                    preferences: {
                        ...currentUser.preferences?.preferences,
                        ...preferences,
                        slugs,
                    },
                    introductionPhrase: data.introductionPhrase,
                    aboutMe: data.aboutMe,
                    lookingFor: data.lookingForText,
                },
                create: {
                    userId: id,
                    preferences: {
                        ...preferences,
                        slugs,
                    },
                    introductionPhrase: data.introductionPhrase,
                    aboutMe: data.aboutMe,
                    lookingFor: data.lookingForText,
                },
            });
            if (data.profilePhotos) {
                await tx.userPhoto.deleteMany({ where: { userId: id } });
                if (data.profilePhotos.length > 0) {
                    await tx.userPhoto.createMany({
                        data: data.profilePhotos.map((photo, index) => ({
                            userId: id,
                            dataUrl: photo.dataUrl,
                            fileName: photo.fileName,
                            mimeType: photo.mimeType,
                            sortOrder: photo.sortOrder ?? index + 1,
                        })),
                    });
                }
            }
        });
        return this.findById(id);
    }
    toSlug(value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    getOppositeRole(role) {
        if (role === UserRole.SugarDaddy) {
            return UserRole.SugarBaby;
        }
        if (role === UserRole.SugarBaby) {
            return UserRole.SugarDaddy;
        }
        return null;
    }
    publicProfileSelect() {
        return {
            id: true,
            username: true,
            role: true,
            gender: true,
            lookingFor: true,
            birthDate: true,
            country: true,
            state: true,
            city: true,
            whatsapp: true,
            telegram: true,
            instagram: true,
            createdAt: true,
            photos: {
                orderBy: { sortOrder: 'asc' },
                select: {
                    id: true,
                    dataUrl: true,
                    fileName: true,
                    mimeType: true,
                    sortOrder: true,
                },
            },
            appearance: {
                select: {
                    bodyType: true,
                    ethnicity: true,
                    hairColor: true,
                    eyeColor: true,
                    heightCm: true,
                },
            },
            preferences: {
                select: {
                    preferences: true,
                    introductionPhrase: true,
                    aboutMe: true,
                    lookingFor: true,
                },
            },
        };
    }
    normalizeContactViewerUsernames(value) {
        if (!Array.isArray(value)) {
            return undefined;
        }
        return Array.from(new Set(value
            .map((username) => username.trim().replace(/^@+/, '').toLowerCase())
            .filter(Boolean))).slice(0, 50);
    }
    sanitizePublicProfile(profile, viewerUsername) {
        const preferences = profile.preferences?.preferences;
        const visibleContactChannels = preferences &&
            typeof preferences === 'object' &&
            'visibleContactChannels' in preferences &&
            Array.isArray(preferences.visibleContactChannels)
            ? preferences.visibleContactChannels
            : [];
        const contactViewerUsernames = preferences &&
            typeof preferences === 'object' &&
            'contactViewerUsernames' in preferences &&
            Array.isArray(preferences.contactViewerUsernames)
            ? preferences.contactViewerUsernames
            : [];
        const canViewContacts = viewerUsername &&
            contactViewerUsernames.includes(viewerUsername.trim().toLowerCase());
        return {
            ...profile,
            whatsapp: canViewContacts && visibleContactChannels.includes('whatsapp')
                ? profile.whatsapp
                : null,
            telegram: canViewContacts && visibleContactChannels.includes('telegram')
                ? profile.telegram
                : null,
            instagram: canViewContacts && visibleContactChannels.includes('instagram')
                ? profile.instagram
                : null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map