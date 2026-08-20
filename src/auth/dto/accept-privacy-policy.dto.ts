import { IsString, MaxLength } from 'class-validator';

export class AcceptPrivacyPolicyDto {
  @IsString()
  @MaxLength(20)
  version: string;
}
