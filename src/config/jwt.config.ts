/** Configurations for the jsonwebtoken library used for authentication */
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '15m' },
};
