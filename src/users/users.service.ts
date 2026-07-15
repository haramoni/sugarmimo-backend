import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateProfilePhotos } from './profile-photo.validation';

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

const UserRole = {
  SugarDaddy: 'SUGAR_DADDY',
  SugarBaby: 'SUGAR_BABY',
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  findAuthStateById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
      },
    });
  }

  async checkAvailability(username: string, email: string) {
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

  findById(id: string) {
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

  async create(data: CreateUserInput) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already registered');
    }

    const { appearance, preferences, photos, ...userData } = data;
    const approvalStatus =
      userData.role === UserRole.SugarBaby
        ? 'PENDING'
        : userData.approvalStatus;
    const hasAppearance =
      appearance &&
      Object.values(appearance).some(
        (value) => value !== undefined && value !== '',
      );
    const filteredPreferences = Object.fromEntries(
      Object.entries(preferences ?? {}).filter(
        ([, value]) => value !== undefined && value !== '',
      ),
    );
    const hasPreferences = Object.keys(filteredPreferences).length > 0;

    return this.prisma.user.create({
      data: {
        ...userData,
        approvalStatus,
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

  async updateApprovalStatus(
    id: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
  ) {
    const profile = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!profile) {
      throw new NotFoundException('Perfil nao encontrado.');
    }

    if (profile.role !== UserRole.SugarBaby) {
      throw new BadRequestException(
        'A aprovacao manual se aplica apenas a Sugar Babies.',
      );
    }

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

  async findMatchesForUser(viewerId: string, search?: string) {
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true, username: true, approvalStatus: true },
    });

    const targetRole = this.resolveMatchRole(viewer?.role);

    if (!targetRole || viewer?.approvalStatus !== 'APPROVED') {
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
      orderBy: [{ lastActiveAt: 'desc' }, { createdAt: 'desc' }],
      select: this.publicProfileSelect(),
    });

    return matches.map((match) =>
      this.sanitizePublicProfile(match, viewer.username),
    );
  }

  async findActiveDaddySuggestions(viewerId: string, search?: string) {
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true, approvalStatus: true },
    });

    if (
      viewer?.role !== UserRole.SugarBaby ||
      viewer.approvalStatus !== 'APPROVED'
    ) {
      throw new ForbiddenException(
        'A selecao de contatos esta disponivel para Sugar Babies aprovadas.',
      );
    }

    const normalizedSearch = search?.trim().replace(/^@+/, '').slice(0, 50);

    return this.prisma.user.findMany({
      where: {
        role: UserRole.SugarDaddy,
        approvalStatus: 'APPROVED',
        ...(normalizedSearch
          ? { username: { contains: normalizedSearch.toLowerCase() } }
          : {}),
      },
      orderBy: { username: 'asc' },
      take: 8,
      select: {
        id: true,
        username: true,
        city: true,
        state: true,
      },
    });
  }

  async touchPresence(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
      select: { id: true },
    });

    return { online: true };
  }

  async findMatchProfileForUser(viewerId: string, identifier: string) {
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      select: { role: true, username: true, approvalStatus: true },
    });

    const targetRole = this.resolveMatchRole(viewer?.role);

    if (
      !targetRole ||
      viewer?.approvalStatus !== 'APPROVED' ||
      !viewer.username
    ) {
      return null;
    }

    const normalizedIdentifier = identifier.trim().replace(/^@+/, '');

    const profile = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: normalizedIdentifier },
          { username: normalizedIdentifier.toLowerCase() },
        ],
        role: targetRole,
        approvalStatus: 'APPROVED',
      },
      select: this.publicProfileSelect(),
    });

    if (!profile) {
      return null;
    }

    const daddyId = viewer.role === UserRole.SugarDaddy ? viewerId : profile.id;
    const babyId = viewer.role === UserRole.SugarBaby ? viewerId : profile.id;
    const profileLike = await this.prisma.profileLike.findUnique({
      where: { daddyId_babyId: { daddyId, babyId } },
      select: {
        id: true,
        createdAt: true,
        daddyLikedAt: true,
        babyLikedAt: true,
        contactsReleasedAt: true,
      },
    });

    return {
      ...this.sanitizePublicProfile(profile, viewer.username),
      interaction: {
        liked:
          viewer.role === UserRole.SugarDaddy
            ? Boolean(profileLike?.daddyLikedAt)
            : Boolean(profileLike?.babyLikedAt),
        likeId: profileLike?.id ?? null,
        likedAt:
          viewer.role === UserRole.SugarDaddy
            ? (profileLike?.daddyLikedAt ?? null)
            : (profileLike?.babyLikedAt ?? null),
        daddyLiked: Boolean(profileLike?.daddyLikedAt),
        daddyLikedAt: profileLike?.daddyLikedAt ?? null,
        babyLiked: Boolean(profileLike?.babyLikedAt),
        babyLikedAt: profileLike?.babyLikedAt ?? null,
        contactsReleased: Boolean(profileLike?.contactsReleasedAt),
        contactsReleasedAt: profileLike?.contactsReleasedAt ?? null,
      },
    };
  }

  async updateProfile(id: string, data: UpdateUserProfileInput) {
    const currentUser = await this.findById(id);

    if (!currentUser) {
      return null;
    }

    const activeContactViewerUsernames =
      data.contactViewerUsernames === undefined
        ? undefined
        : await this.filterActiveDaddyUsernames(data.contactViewerUsernames);
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
      contactViewerUsernames: activeContactViewerUsernames,
    };
    const preferences = Object.fromEntries(
      Object.entries(selectedPreferences).filter(
        ([key, value]) =>
          value !== undefined &&
          (key === 'customInterests' ||
            key === 'visibleContactChannels' ||
            key === 'contactViewerUsernames' ||
            (Array.isArray(value) ? value.length > 0 : value !== '')),
      ),
    );
    const slugs = Object.fromEntries(
      Object.entries(preferences).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.map((item) => this.toSlug(String(item)))
          : this.toSlug(String(value)),
      ]),
    );

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
            ...(currentUser.preferences?.preferences as object | null),
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
        if (
          currentUser.role === UserRole.SugarBaby &&
          data.profilePhotos.length === 0
        ) {
          throw new BadRequestException(
            'Sugar Babies precisam manter pelo menos uma foto.',
          );
        }
        validateProfilePhotos(data.profilePhotos);
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

  private toSlug(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private resolveMatchRole(viewerRole?: string | null) {
    if (viewerRole === UserRole.SugarBaby) {
      return UserRole.SugarDaddy;
    }

    if (viewerRole === UserRole.SugarDaddy) {
      return UserRole.SugarBaby;
    }

    return null;
  }

  private publicProfileSelect() {
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
      lastActiveAt: true,
      photos: {
        orderBy: { sortOrder: 'asc' as const },
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

  private normalizeContactViewerUsernames(value?: string[]) {
    if (!Array.isArray(value)) {
      return undefined;
    }

    return Array.from(
      new Set(
        value
          .map((username) => username.trim().replace(/^@+/, '').toLowerCase())
          .filter(Boolean),
      ),
    ).slice(0, 50);
  }

  private async filterActiveDaddyUsernames(value: string[]) {
    const normalizedUsernames =
      this.normalizeContactViewerUsernames(value) ?? [];

    if (normalizedUsernames.length === 0) {
      return [];
    }

    const activeDaddies = await this.prisma.user.findMany({
      where: {
        username: { in: normalizedUsernames },
        role: UserRole.SugarDaddy,
        approvalStatus: 'APPROVED',
      },
      select: { username: true },
    });
    const activeUsernames = new Set(
      activeDaddies.map((profile) => profile.username.toLowerCase()),
    );

    return normalizedUsernames.filter((username) =>
      activeUsernames.has(username),
    );
  }

  private sanitizePublicProfile<
    T extends {
      whatsapp: string | null;
      telegram: string | null;
      instagram: string | null;
      lastActiveAt: Date | null;
      preferences: {
        preferences: unknown;
      } | null;
    },
  >(profile: T, viewerUsername?: string) {
    const preferences = profile.preferences?.preferences;
    const visibleContactChannels =
      preferences &&
      typeof preferences === 'object' &&
      'visibleContactChannels' in preferences &&
      Array.isArray(preferences.visibleContactChannels)
        ? preferences.visibleContactChannels
        : [];
    const contactViewerUsernames =
      preferences &&
      typeof preferences === 'object' &&
      'contactViewerUsernames' in preferences &&
      Array.isArray(preferences.contactViewerUsernames)
        ? preferences.contactViewerUsernames
        : [];
    const canViewContacts =
      viewerUsername &&
      contactViewerUsernames.includes(viewerUsername.trim().toLowerCase());

    return {
      ...profile,
      isOnline: this.isOnline(profile.lastActiveAt),
      whatsapp:
        canViewContacts && visibleContactChannels.includes('whatsapp')
          ? profile.whatsapp
          : null,
      telegram:
        canViewContacts && visibleContactChannels.includes('telegram')
          ? profile.telegram
          : null,
      instagram:
        canViewContacts && visibleContactChannels.includes('instagram')
          ? profile.instagram
          : null,
    };
  }

  private isOnline(lastActiveAt: Date | null) {
    return Boolean(
      lastActiveAt && Date.now() - lastActiveAt.getTime() <= 2 * 60_000,
    );
  }
}
