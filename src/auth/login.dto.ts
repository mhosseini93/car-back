import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'نام کاربری را وارد کنید' })
  @MaxLength(100)
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز عبور را وارد کنید' })
  @MaxLength(200)
  password!: string;
}
