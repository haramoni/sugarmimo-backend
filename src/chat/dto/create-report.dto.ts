import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const CHAT_REPORT_CATEGORIES = [
  'HARASSMENT',
  'THREAT',
  'FRAUD',
  'INAPPROPRIATE_SEXUAL_CONTENT',
  'EXTORTION',
  'SPAM',
  'FAKE_PROFILE',
  'OTHER',
] as const;

export class CreateReportDto {
  @IsString()
  @IsIn(CHAT_REPORT_CATEGORIES)
  category!: (typeof CHAT_REPORT_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  messageIds!: string[];

  @IsOptional()
  @IsBoolean()
  blockUser?: boolean;
}
