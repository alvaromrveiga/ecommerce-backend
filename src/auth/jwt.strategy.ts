import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/config/jwt.config';

/** Decrypted JsonWebToken content */
interface Payload {
  /** Token subject, user ID used
   * @example "d6c24523-12df-4f33-9fd6-44dd5c499084"
   */
  sub: string;

  /** User role
   * @example "user"
   */
  role: string;
}

/** What is returned to the application after JsonWebToken is validated */
interface ValidateReturn {
  /** User ID
   * @example "d6c24523-12df-4f33-9fd6-44dd5c499084"
   */
  userId: string;

  /** User role
   * @example "user"
   */
  userRole: string;
}

/** Passport library JsonWebToken configuration */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /** Passport library JsonWebToken configuration */
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /** Validates and returns data after JsonWebToken is decrypted */
  async validate(payload: Payload): Promise<ValidateReturn> {
    return {
      userId: payload.sub,
      userRole: payload.role,
    };
  }
}
