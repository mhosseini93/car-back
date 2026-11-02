import { Module } from '@nestjs/common';
import { AdminBlogController } from './admin-blog.controller.js';
import { BlogController } from './blog.controller.js';
import { BlogService } from './blog.service.js';
import { UploadsController } from './uploads.controller.js';

@Module({
  controllers: [BlogController, AdminBlogController, UploadsController],
  providers: [BlogService],
})
export class BlogModule {}
