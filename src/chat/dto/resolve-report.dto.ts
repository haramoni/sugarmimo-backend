import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const CHAT_REPORT_ACTIONS = [
  'DISMISSED',
  'WARNED',
  'SUSPENDED',
  'BANNED',
] as const;

export class ResolveReportDto {
  @IsString()
  @IsIn(CHAT_REPORT_ACTIONS)
  action!: (typeof CHAT_REPORT_ACTIONS)[number];

  @IsString()
  @MaxLength(1000)
  resolution!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  suspensionDays?: number;
}
