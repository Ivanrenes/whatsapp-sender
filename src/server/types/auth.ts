import { AxiosError } from 'axios';

export type AuthenticatedUser = {
  idToken: string; // A Firebase Auth ID token for the authenticated user.
  email: string; // The email for the authenticated user.
  refreshToken: string; // A Firebase Auth refresh token for the authenticated user.
  expiresIn: string; // The number of seconds in which the ID token expires.
  localId: string; // The uid of the authenticated user.
  registered: boolean; // Whether the email is for an existing account.
};

export const isAxiosError = (err: unknown): err is AxiosError => {
  return (err as AxiosError) !== undefined;
};
