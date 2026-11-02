import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { UPLOADS_DIR } from './blog/uploads.controller.js';
import { configureApp } from './setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  // The Next.js server calls this API from localhost and forwards the visitor IP
  // in X-Forwarded-For, which the rate limiter needs
  app.set('trust proxy', 'loopback');
  app.useStaticAssets(join(process.cwd(), UPLOADS_DIR), {
    prefix: `/${UPLOADS_DIR}/`,
    maxAge: '30d',
    immutable: true,
  });

  const port = app.get(ConfigService).get<number>('PORT', 4000);
  await app.listen(port);
}
await bootstrap();
