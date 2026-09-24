
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, hashPassword, verifyPassword } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { nombre: string; email: string; password: string }) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await this.usersService.findOneByEmail(normalizedEmail);

    if (existingUser) {
      console.warn('[AuthService] Intento de registro con email ya existente', { email: normalizedEmail });
      throw new UnauthorizedException('El usuario ya existe');
    }

    const user = await this.usersService.create({
      nombre: data.nombre.trim(),
      email: normalizedEmail,
      password: hashPassword(data.password),
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    console.log('[AuthService] Usuario registrado correctamente', {
      id: user.id,
      email: user.email,
      tokenGenerated: Boolean(token),
    });

    return {
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }

  async signIn(email: string, pass: string): Promise<{ token: string; usuario: { id: number; nombre: string; email: string } }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findOneByEmail(normalizedEmail);

    if (!user) {
      console.warn('[AuthService] Login fallido: usuario no encontrado', { email: normalizedEmail });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!verifyPassword(pass, user.password)) {
      console.warn('[AuthService] Login fallido: contraseña incorrecta', { email: normalizedEmail });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    console.log('[AuthService] Login correcto', {
      id: user.id,
      email: user.email,
      tokenGenerated: Boolean(token),
    });

    return {
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }
}
