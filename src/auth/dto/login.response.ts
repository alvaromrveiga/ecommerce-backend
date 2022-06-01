/** Describes the response received when the Login route is successfully called */
export class LoginResponse {
  /**
   * Access JWT Authentication token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NWFkMzNhNS0wYjk4LTQ2ODYtYjFmMS1hMTkwNzM0NWJmYzciLCJpYXQiOjE2NDg0NzU3MzEsImV4cCI6MTY0ODQ3NjYzMX0.h3z3JDvHOi6y5C_N0Kt6tdP2nWK_dHBZxioQn7VANNo"
   */
  accessToken: string;

  /**
   * Refresh JWT Authentication token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
   */
  refreshToken: string;
}
