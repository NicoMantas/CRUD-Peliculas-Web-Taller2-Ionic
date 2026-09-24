import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins: string[] = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('No permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
