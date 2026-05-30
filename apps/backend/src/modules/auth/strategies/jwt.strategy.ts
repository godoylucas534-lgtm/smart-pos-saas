import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

function readCookieFromHeader(cookieHeader: string | undefined, key: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === key) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    const cookieName = configService.get<string>('AUTH_COOKIE_NAME', 'pos_at');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => readCookieFromHeader(request?.headers?.cookie, cookieName),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload?.typ === 'refresh') {
      throw new UnauthorizedException('Token de acceso inválido.');
    }
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario inactivo.');
    }
    return user;
  }
}
