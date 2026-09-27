import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'capacitor://localhost',
    'http://localhost',
    'http://127.0.0.1',
  ];

  const allowedOrigins: string[] = [
    ...new Set([
      ...defaultAllowedOrigins,
      ...(process.env.FRONTEND_URL ?? '')
        .split(',')
        .map((origin: string) => origin.trim())
        .filter(Boolean),
    ]),
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const isLocalIonicOrigin =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.0.') ||
        origin.startsWith('capacitor://') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1');

      if (isLocalIonicOrigin) {
        callback(null, true);
        return;
      }

      callback(null, true); // Fallback allow in dev mode for mobile tests
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

await bootstrap();
