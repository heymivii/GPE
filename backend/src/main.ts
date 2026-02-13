import * as crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto as any;
}

import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
      ];
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SkyWalk API')
    .setDescription(
      "API REST de la plateforme SkyWalk — aide à l'expatriation.\n\n" +
        '**Modules** : Auth, User, Forum, Destinations, Cost of Living, Job Offers, ' +
        'Expatriation Projects, Global Search, OECD Migration, et plus.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag(
      'Auth',
      'Inscription, connexion, refresh token, mot de passe oublié',
    )
    .addTag('User', 'Profil utilisateur (CRUD)')
    .addTag('Forum Topic', 'Topics du forum communautaire')
    .addTag('Forum Message', 'Messages du forum + modération + signalements')
    .addTag('Country', 'Gestion des pays')
    .addTag('Continent', 'Gestion des continents')
    .addTag(
      'Destinations',
      'Destinations enrichies (emploi, coût de la vie, migration)',
    )
    .addTag('Cost of Living', 'Coût de la vie par ville (RapidAPI / Numbeo)')
    .addTag('Expatriation Project', "Projets d'expatriation + checklist")
    .addTag('Job Offer', "Offres d'emploi (CRUD local + Adzuna API)")
    .addTag('Global Search', 'Recherche multi-catégories')
    .addTag('OECD Migration', 'Données migratoires OECD')
    .addTag('City', 'Villes')
    .addTag('City Comparison', 'Comparaison de villes')
    .addTag('Checklist', 'Items de checklist')
    .addTag('Resource', 'Ressources')
    .addTag('Guide', 'Guides')
    .addTag('Experience', "Retours d'expérience")
    .addTag('Notification', 'Notifications')
    .addTag('Admin Procedure', 'Procédures administratives')
    .addTag('Procedure Tracking', 'Suivi de procédures')
    .addTag('Business Sector', "Secteurs d'activité")
    .addTag('Housing', 'Logements')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'SkyWalk API — Swagger',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
  console.log(`Swagger UI at http://localhost:${port}/swagger`);
}

bootstrap();
