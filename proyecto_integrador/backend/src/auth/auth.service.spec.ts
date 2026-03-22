import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mock de Supabase ────────────────────────────────────────────────────────
const mockSignInWithPassword = jest.fn();
const mockGetUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
  }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VALID_TOKEN = 'valid.token.here';
const VALID_USER = {
  id: 'user-uuid-1234',
  email: 'test@example.com',
};

const VALID_PASSWORDS = {
  current: 'ActualPass1!',
  new: 'NuevaContr@1',
};

// ─── Suite ───────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'SUPABASE_URL') return 'https://example.supabase.co';
              if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
              return undefined;
            },
          },
        },
        {
          provide: PrismaService,
          useValue: {
            usuarios: {
              findUnique: jest.fn().mockResolvedValue({
                id: VALID_USER.id,
                activo: true,
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Por defecto: token válido, usuario activo
    mockGetUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
  });

  // ── Sanity ─────────────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── changePassword — validaciones de campos vacíos ─────────────────────────
  describe('changePassword — validación de campos', () => {
    it('lanza BadRequestException si currentPassword está vacío', async () => {
      await expect(
        service.changePassword('', VALID_PASSWORDS.new, VALID_TOKEN),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si currentPassword es solo espacios', async () => {
      await expect(
        service.changePassword('   ', VALID_PASSWORDS.new, VALID_TOKEN),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si newPassword está vacío', async () => {
      await expect(
        service.changePassword(VALID_PASSWORDS.current, '', VALID_TOKEN),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza UnauthorizedException si no se proporciona token', async () => {
      await expect(
        service.changePassword(
          VALID_PASSWORDS.current,
          VALID_PASSWORDS.new,
          '',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── changePassword — validación de regex de contraseña ────────────────────
  describe('changePassword — regex de contraseña segura', () => {
    const cases = [
      {
        desc: 'demasiado corta (< 8 chars)',
        pwd: 'Ab1!',
      },
      {
        desc: 'sin mayúscula',
        pwd: 'contraseña1!',
      },
      {
        desc: 'sin minúscula',
        pwd: 'CONTRASEÑA1!',
      },
      {
        desc: 'sin número',
        pwd: 'Contraseña!',
      },
      {
        desc: 'sin carácter especial',
        pwd: 'Contraseña1',
      },
    ];

    cases.forEach(({ desc, pwd }) => {
      it(`lanza BadRequestException si newPassword está ${desc}`, async () => {
        await expect(
          service.changePassword(VALID_PASSWORDS.current, pwd, VALID_TOKEN),
        ).rejects.toThrow(BadRequestException);
      });
    });

    it('pasa la validación de regex con contraseña robusta', async () => {
      // Lanza por lógica de Supabase (mock), NO por validación de regex
      mockSignInWithPassword.mockResolvedValue({ error: null });
      mockUpdateUser.mockResolvedValue({ error: null });

      const result = await service.changePassword(
        VALID_PASSWORDS.current,
        VALID_PASSWORDS.new, // 'NuevaContr@1' — cumple todos los requisitos
        VALID_TOKEN,
      );

      expect(result).toEqual({ message: 'Contraseña cambiada exitosamente' });
    });
  });
});
