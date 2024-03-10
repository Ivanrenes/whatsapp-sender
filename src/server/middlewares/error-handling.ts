import { SessionsService } from '@/services/sessions';
import { NextFunction, Request, Response } from 'express';
import { ValidateError } from 'tsoa';

export interface ErrorType {
  statusCode: number;
  name: string;
  message: string;
  fields?: { [field: string]: { message: string } };
}

export class AuthError extends Error implements ErrorType {
  public statusCode: number = 500;
  public fields?: { [field: string]: { message: string } };

  constructor(errorType: ErrorType) {
    super(errorType.message);
    this.name = errorType.name;
    this.message = errorType.message;
    if (errorType.statusCode) this.statusCode = errorType.statusCode;
    this.fields = errorType.fields;
  }
}

export class SessionNotFoundError extends Error implements ErrorType {
  public statusCode: number = 401;
  public userId: string;

  constructor(userId: string, errorType: ErrorType) {
    super(errorType.message);
    this.name = errorType.name;
    this.message = errorType.message;
    if (errorType.statusCode) this.statusCode = errorType.statusCode;
    this.userId = userId;
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      message: err.message,
      name: err.name,
      statusCode: err.statusCode
    });
  }

  if (err instanceof SessionNotFoundError) {
    const sessionsService = new SessionsService();

    //In case that session still on db we need to delete it
    (async () => {
      try {
        await sessionsService.deleteSession(err.userId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    })();

    return res.status(err.statusCode).json({
      message: err.message,
      name: err.name,
      statusCode: err.statusCode
    });
  }

  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields
    });
  }

  if (err instanceof Error) {
    console.log(err.stack);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }

  next();
};
