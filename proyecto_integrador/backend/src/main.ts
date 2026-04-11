import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      permittedCrossDomainPolicies: true,
      crossOriginEmbedderPolicy: false, // requiere configuración adicional en recursos externos
    }),
  );
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Enable CORS para desarrollo (web + mobile)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Frontend web (Vite default)
      'http://localhost:5174', // Frontend web (Vite fallback)
      'http://localhost:5175', // Frontend web (Vite fallback 2)
      'http://localhost:5176', // Frontend web (Vite fallback 3)
      'http://localhost:3000', // iOS Simulator
      'http://10.0.2.2:3000', // Android Emulator
      'http://192.168.1.203:3000', //
      process.env.CORS_ORIGIN, // Desde .env
    ].filter(Boolean),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
