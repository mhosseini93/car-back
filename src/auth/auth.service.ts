import { timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from './password.js';

export type AdminTokenPayload = { sub: string; role: 'admin' };

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const expectedUser = this.config.getOrThrow<string>('ADMIN_USERNAME');
    const passwordHash = this.config.getOrThrow<string>('ADMIN_PASSWORD_HASH');

    // Always verify the password so timing doesn't reveal whether the username matched
    const userOk = safeEqual(username, expectedUser);
    const passwordOk = await verifyPassword(password, passwordHash);
    if (!userOk || !passwordOk) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const payload: AdminTokenPayload = { sub: expectedUser, role: 'admin' };
    return { accessToken: await this.jwt.signAsync(payload) };
  }
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
