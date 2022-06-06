/** Decrypted Access JsonWebToken content */
export type AccessTokenPayload = {
  /** Token subject, user ID used
   * @example "d6c24523-12df-4f33-9fd6-44dd5c499084"
   */
  sub: string;

  /** User role
   * @example "user"
   */
  userRole: string;
};
