import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions, ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '@/errors/exception-filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { urlencoded, json } from 'express';
import compression from 'compression';
import * as z from 'zod/mini';

async function bootstrap() {
  z.config(z.locales.en());

  const logger: NestApplicationOptions['logger'] =
    process.env.NODE_ENV === 'production'
      ? ['error', 'fatal', 'log', 'warn']
      : ['error', 'fatal', 'log', 'warn', 'debug'];

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '4',
  });

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());
  app.use(compression());

  app.setGlobalPrefix('api', { exclude: ['static/*path'] });

  app.enable('trust proxy');

  app.getHttpAdapter().getInstance().set('etag', false);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://mindustry-tool.com',
      /^https:\/\/.*\.mindustry-tool\.com$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    maxAge: 86400,
  });
  const config = new DocumentBuilder()
    .setTitle('MindustryToolApi')
    .setDescription('The MindustryTool API description')
    .setVersion('1.0')
    .addTag('mindustry-tool')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v4/api-docs', app, documentFactory);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  let lastCheck = process.hrtime.bigint();
  setInterval(() => {
    const now = process.hrtime.bigint();
    const lag = Number(now - lastCheck) / 1_000_000 - 1000;
    if (lag > 500) {
      console.warn(`[EventLoopMonitor] Event loop lag detected: ${Math.round(lag)}ms`);
    }
    lastCheck = now;
  }, 1000).unref();

  await app.listen(process.env.API_V4_PORT ?? 8080);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
