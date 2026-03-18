import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
