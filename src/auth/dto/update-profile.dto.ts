import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateProfilePhotoDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  dataUrl: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @Type(() => Number)
  @IsInt()
  sortOrder: number;
}

type VisibleContactChannel = 'whatsapp' | 'telegram' | 'instagram';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

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
  @ArrayMaxSize(3)
  @IsIn(['whatsapp', 'telegram', 'instagram'], { each: true })
  visibleContactChannels?: VisibleContactChannel[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  contactViewerUsernames?: string[];

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
  @ArrayMaxSize(3)
  @IsString({ each: true })
  customInterests?: string[];

  @IsOptional()
  @IsString()
  introductionPhrase?: string;

  @IsOptional()
  @IsString()
  aboutMe?: string;

  @IsOptional()
  @IsString()
  lookingForText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => UpdateProfilePhotoDto)
  profilePhotos?: UpdateProfilePhotoDto[];
}
