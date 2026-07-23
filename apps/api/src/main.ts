import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SESSION_COOKIE_NAME } from './common/constants/auth.constants';

const DEFAULT_API_PORT = 4000;
const DEFAULT_WEB_URL = 'http://localhost:3000';
const SWAGGER_DOCS_PATH = 'api/docs';

loadEnv({ path: resolve(__dirname, '../../../.env') });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Strict CSP for the API origin: it serves JSON plus the Swagger UI page, whose scripts,
  // styles and generated init file are all same-origin ('unsafe-inline' styles are required
  // by swagger-ui). The browser-facing app CSP lives in apps/web/next.config.ts.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.WEB_URL ?? DEFAULT_WEB_URL,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (isSwaggerEnabled()) {
    setupSwagger(app);
  }

  const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
  await app.listen(port);
}

function isSwaggerEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true';
}

/** Runtime-only OpenAPI docs (no generated client). Cookie auth scheme matches the session cookie. */
function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('BigProjects BOS API')
    .setDescription('Internal backend API for BigProjects BOS')
    .setVersion('1.0')
    .addCookieAuth(SESSION_COOKIE_NAME, { type: 'apiKey', in: 'cookie', name: SESSION_COOKIE_NAME })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, document);
}

void bootstrap();
