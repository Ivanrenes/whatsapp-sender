import { Body, Post, Route } from 'tsoa';
import { AuthService } from '../services/auth';
import { Inject } from 'typescript-ioc';
import { isAxiosError } from 'axios';
import { AuthenticatedUser } from '@/types/auth';
import { AuthError } from '@/middlewares/error-handling';

@Route('user/auth')
export class AuthController {
  @Inject
  private authService!: AuthService;

  @Post('/login')
  public async signIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    try {
      const res = await this.authService.signIn(email, password);
      return res.data as AuthenticatedUser;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status && error.response?.status >= 400) {
          throw new AuthError({
            message: 'Invalid email or password / Check credentials',
            statusCode: 401,
            name: 'Unauthorized'
          });
        }
        throw error;
      }
      throw error;
    }
  }
}
