import { JwtSignOptions } from '@nestjs/jwt';

/** Configurations for the access jsonwebtoken used for authentication */
export const accessJwtConfig: JwtSignOptions = {
  secret: process.env.ACCESS_JWT_SECRET,
  expiresIn: '15m',
};

/** Configurations for the refresh jsonwebtoken used for authentication */
export const refreshJwtConfig: JwtSignOptions = {
  secret: process.env.REFRESH_JWT_SECRET,
  expiresIn: '90d',
};
