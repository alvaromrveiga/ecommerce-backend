/** What is returned to the application after Access JsonWebToken is validated */
export type AccessTokenContent = {
  /** User ID
   * @example "d6c24523-12df-4f33-9fd6-44dd5c499084"
   */
  userId: string;

  /** User role
   * @example "user"
   */
  userRole: string;
};
