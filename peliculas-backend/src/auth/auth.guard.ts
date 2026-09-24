import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/public.decorators.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = this.extractTokenFromHeader(request);

    console.log('[AuthGuard] Validando acceso', {
      method: request.method,
      url: request.originalUrl,
      hasAuthorizationHeader: Boolean(authHeader),
      hasToken: Boolean(token),
      tokenPreview: token ? `${token.slice(0, 12)}...` : null,
      isPublic,
    });

    if (isPublic) {
      return true;
    }

    if (!token) {
      console.error('[AuthGuard] Acceso denegado: falta token en Authorization header', {
        method: request.method,
        url: request.originalUrl,
        headers: request.headers,
      });
      throw new UnauthorizedException('Falta token de autenticación');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      console.log('[AuthGuard] Token válido', {
        method: request.method,
        url: request.originalUrl,
        user: payload,
      });
    } catch (error) {
      console.error('[AuthGuard] Acceso denegado: token inválido o expirado', {
        method: request.method,
        url: request.originalUrl,
        tokenPreview: token ? `${token.slice(0, 12)}...` : null,
        error: error instanceof Error ? error.message : error,
      });
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}