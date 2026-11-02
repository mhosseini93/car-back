import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminGuard } from '../auth/admin.guard.js';

export const UPLOADS_DIR = 'uploads';
const MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

mkdirSync(UPLOADS_DIR, { recursive: true });

// Image uploads for the article editor, served from /uploads
@Controller('admin/uploads')
@UseGuards(AdminGuard)
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SIZE, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (IMAGE_TYPES[file.mimetype]) cb(null, true);
        else cb(new BadRequestException('فقط تصویر JPG، PNG، WebP، GIF یا AVIF مجاز است'), false);
      },
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => {
          const ext = IMAGE_TYPES[file.mimetype] ?? extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
        },
      }),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('فایلی ارسال نشد');
    // Relative URL: the frontend proxies /uploads to this server
    return { url: `/${UPLOADS_DIR}/${file.filename}` };
  }
}
