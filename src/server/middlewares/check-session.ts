import { SessionsService } from '@/services/sessions';
import { NextFunction, Request, Response } from 'express';

export async function checkSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.body.user;
  const sessions = new SessionsService();
  const currentSession = await sessions.getSession(user!.uid);

  if (!currentSession) {
    return res.status(401).send({ message: 'No session active!' });
  }
  return next();
}
