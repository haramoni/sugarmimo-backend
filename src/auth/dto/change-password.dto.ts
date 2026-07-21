import { IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message:
      'A nova senha deve ter pelo menos 8 caracteres, incluindo letra maiuscula, minuscula, numero e caractere especial.',
  })
  newPassword: string;
}
