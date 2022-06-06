/** Decrypted Refresh JsonWebToken content */
export type RefreshTokenPayload = {
  /** Token subject, user ID used
   * @example "d6c24523-12df-4f33-9fd6-44dd5c499084"
   */
  sub: string;

  /** User role
   * @example "user"
   */
  userRole: string;

  /** Token family for refresh token rotation
   *
   * Check https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
   * @example "f0e25bbd-ea56-4c0f-9341-30c0270a1d78"
   */
  tokenFamily: string;
};
