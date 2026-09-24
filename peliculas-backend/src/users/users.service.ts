import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

export type User = {
  id: number;
  nombre: string;
  email: string;
  password: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  const separatorIndex = storedPassword.indexOf(':');
  if (separatorIndex === -1) {
    return false;
  }

  const salt = storedPassword.slice(0, separatorIndex);
  const storedHash = storedPassword.slice(separatorIndex + 1);
  const candidateHash = createHash('sha256').update(password + salt).digest('hex');

  return candidateHash === storedHash;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { nombre: string; email: string; password: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
