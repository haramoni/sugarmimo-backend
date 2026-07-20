declare class UpdateProfilePhotoDto {
    id?: string;
    dataUrl: string;
    fileName?: string;
    mimeType: string;
    sortOrder: number;
    isPrivate?: boolean;
}
type VisibleContactChannel = 'whatsapp' | 'telegram' | 'instagram';
export declare class UpdateProfileDto {
    username?: string;
    lookingFor?: string;
    birthDate?: string;
    country?: string;
    state?: string;
    city?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    visibleContactChannels?: VisibleContactChannel[];
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
    profilePhotos?: UpdateProfilePhotoDto[];
}
export {};
