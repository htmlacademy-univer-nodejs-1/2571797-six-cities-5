import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  public email!: string;

  @IsString({ message: 'Password must be a string' })
  public password!: string;
}
