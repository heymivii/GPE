// 📍 EMPLACEMENT: backend/src/main.ts
// Configuration principale de l'application NestJS (CORS, Validation, Préfixe API)

// 🩵 Correction du bug "crypto is not defined" — compatible Node 18 & 20
import * as crypto from 'crypto';
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = crypto as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Activer cookie-parser pour lire les cookies HTTP-Only
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  // ✅ Configuration CORS pour autoriser ton frontend React (Vite)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // ⚠️ CRITIQUE : Permet l'envoi des cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  // ✅ Validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Lève une erreur si propriétés non autorisées
      transform: true, // Transforme automatiquement les types selon les DTOs
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3000;

  // ✅ Important : écouter sur 0.0.0.0 pour compatibilité WSL / Docker
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
}

bootstrap();
