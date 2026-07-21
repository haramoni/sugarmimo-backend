import {
  ArrayMaxSize,
  IsDateString,
  IsEmail,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RegisterPhotoDto {
  @IsString()
  @MaxLength(7_000_000)
  dataUrl: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  mimeType: string;
}

type VisibleContactChannel = 'whatsapp' | 'telegram' | 'instagram';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message:
      'O nome de usuario deve conter apenas letras, numeros, ponto, hifen ou sublinhado.',
  })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message:
      'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
  })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  profileType?: string;

  @IsOptional()
  @IsString()
  interest?: string;

  @IsOptional()
  @IsString()
  lookingFor?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  telegram?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @IsIn(['whatsapp', 'telegram', 'instagram'], { each: true })
  visibleContactChannels?: VisibleContactChannel[];

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string;

  @IsOptional()
  @IsString()
  hairColor?: string;

  @IsOptional()
  @IsString()
  eyeColor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(120)
  @Max(230)
  heightCm?: number;

  @IsOptional()
  @IsString()
  smoke?: string;

  @IsOptional()
  @IsString()
  drink?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  children?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => RegisterPhotoDto)
  profilePhotos?: RegisterPhotoDto[];
}
