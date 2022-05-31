import { JwtSignOptions } from '@nestjs/jwt';

/** Configurations for the access jsonwebtoken used for authentication */
export const accessJwtConfig: JwtSignOptions = {
  secret: process.env.JWT_SECRET,
  expiresIn: '15m',
};
