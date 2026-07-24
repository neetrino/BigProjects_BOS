import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import {
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  LOGIN_RATE_LIMIT_TTL_MS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '../common/constants/auth.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../common/types/authenticated-request.type';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AuthService } from './auth.service';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: LOGIN_RATE_LIMIT_MAX_ATTEMPTS, ttl: LOGIN_RATE_LIMIT_TTL_MS } })
  @Post('login')
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponseDto> {
    const { token, user } = await this.authService.login(dto.email, dto.password);
    this.setSessionCookie(response, token);
    return user;
  }

  @ApiCookieAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (request.sessionId) {
      await this.authService.logout(request.sessionId);
    }
    response.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  }

  /** Session probe used on every Next.js page render — must not share the global quota. */
  @SkipThrottle()
  @ApiCookieAuth()
  @Get('me')
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @ApiUnauthorizedResponse()
  me(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): CurrentUserResponseDto {
    // Sliding browser cookie: keep maxAge refreshed while the user is actively using the app,
    // so a short idle gap cannot drop a still-valid server session.
    const token = request.cookies?.[SESSION_COOKIE_NAME];
    if (typeof token === 'string' && token.length > 0) {
      this.setSessionCookie(response, token);
    }
    return user;
  }

  private setSessionCookie(response: Response, token: string): void {
    response.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_MS,
    });
  }
}
