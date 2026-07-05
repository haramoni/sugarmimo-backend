declare class RegisterPhotoDto {
    dataUrl: string;
    fileName?: string;
    mimeType?: string;
}
export declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    role?: string;
    profileType?: string;
    interest?: string;
    lookingFor?: string;
    birthDate?: string;
    country?: string;
    state?: string;
    city?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    source?: string;
    termsAccepted?: boolean;
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
    profilePhotos: RegisterPhotoDto[];
}
export {};
