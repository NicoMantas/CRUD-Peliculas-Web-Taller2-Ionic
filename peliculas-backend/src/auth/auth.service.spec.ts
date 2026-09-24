import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersService, hashPassword } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    create: vi.fn(),
    findOneByEmail: vi.fn(),
    findOne: vi.fn(),
  };

  const jwtService = {
    signAsync: vi.fn().mockResolvedValue('signed-token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should hash the password when registering a user', async () => {
    usersService.create.mockImplementation(async (payload) => ({
      id: 1,
      nombre: payload.nombre,
      email: payload.email,
      password: payload.password,
    }));

    const user = await service.register({
      nombre: 'Ana',
      email: 'ana@test.com',
      password: '123456',
    });

    expect(user.usuario.email).toBe('ana@test.com');
    expect(user.token).toBe('signed-token');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@test.com',
        password: expect.stringMatching(/.+:.+/),
      }),
    );
  });

  it('should sign a JWT when login succeeds', async () => {
    const hashed = hashPassword('123456');
    usersService.findOneByEmail.mockResolvedValue({
      id: 1,
      nombre: 'Ana',
      email: 'ana@test.com',
      password: hashed,
    });

    const result = await service.signIn('ana@test.com', '123456');

    expect(jwtService.signAsync).toHaveBeenCalled();
    expect(result.token).toBe('signed-token');
    expect(result.usuario.email).toBe('ana@test.com');
  });
});
