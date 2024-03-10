/* eslint-disable @typescript-eslint/no-explicit-any */
import { Auth } from '../../firebase/app';
import { AuthError } from '@/middlewares/error-handling';
import { Request } from 'express';

export const expressAuthentication = async (
  request: Request,
  securityName: string,
  scopes?: string[]
) => {
  if (securityName === 'fb-token') {
    let token;
    if (request.query && request.query.access_token)
      if (request.query && request.query.access_token) {
        token = request.query.access_token;
      }
    if (token) {
      try {
        const decodedToken = await Auth.verifyIdToken(token as string);
        const user = await Auth.getUser(decodedToken.uid);
        request.body['user'] = user;
        return await Promise.resolve();
      } catch (error) {
        console.log(error);
        return await Promise.reject(
          new AuthError({
            message: 'Unauthorized',
            statusCode: 401,
            name: 'Unauthorized'
          })
        );
      }
    } else {
      return await Promise.reject(
        new AuthError({
          message: 'Unauthorized',
          statusCode: 401,
          name: 'Unauthorized'
        })
      );
    }
  }
};
