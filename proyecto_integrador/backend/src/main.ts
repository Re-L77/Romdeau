import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS para desarrollo (web + mobile)
  app.enableCors({
    origin: [
      'http://localhost:5173', // Frontend web
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
