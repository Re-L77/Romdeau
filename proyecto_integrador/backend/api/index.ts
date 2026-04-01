import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

let app: INestApplication;

async function getApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'http://10.0.2.2:3000',
        'https://romdeau.vercel.app',
        process.env.CORS_ORIGIN,
      ].filter(Boolean),
      credentials: true,
    });
    await app.init();
  }
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const nestApp = await getApp();
  const instance = nestApp.getHttpAdapter().getInstance() as (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void;
  instance(req, res);
}
