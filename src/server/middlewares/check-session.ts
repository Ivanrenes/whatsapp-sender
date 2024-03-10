import { NextFunction, Request, Response } from 'express';
import { Sessions } from '../sessions';

export async function checkSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessions = Sessions.getInstance();
  const currentSession = sessions.get('sessionUnique');

  if (currentSession === undefined) {
    return res.status(401).send({ message: 'No active session' });
  }
  return next();
}
