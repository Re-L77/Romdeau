import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ActivosModule } from './activos/activos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { SupabaseAuthGuard } from './auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from './auth/roles/roles.guard';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module';

function validateEnv(config: Record<string, unknown>) {
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missingVars.join(', ')}`,
    );
  }

  const port = config.PORT;
  if (
    typeof port === 'string' &&
    port.trim().length > 0 &&
    Number.isNaN(Number(port))
  ) {
    throw new Error('La variable PORT debe ser numérica.');
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AuthModule,
    PrismaModule,
    ActivosModule,
    UsuariosModule,
    DepartamentosModule,
    UbicacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
