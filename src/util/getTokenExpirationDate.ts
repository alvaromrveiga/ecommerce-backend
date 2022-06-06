import ms from 'ms';
import { refreshJwtConfig } from 'src/config/jwt.config';

/** Returns the token expiration date */
export function getTokenExpirationDate(): Date {
  const expiresInDays =
    ms(refreshJwtConfig.expiresIn as string) / 1000 / 60 / 60 / 24;

  const expiresAt = addDaysFromNow(expiresInDays);

  return expiresAt;
}

/** Add amount of days from today's date */
function addDaysFromNow(days: number): Date {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}
