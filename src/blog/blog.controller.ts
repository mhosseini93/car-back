import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BlogService } from './blog.service.js';
import { CreateCommentDto, PageQueryDto } from './dto.js';

// Public blog API used by the site
@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('posts')
  listPosts(@Query() query: PageQueryDto) {
    return this.blog.listPublished(query.page);
  }

  @Get('posts/:slug')
  getPost(@Param('slug') slug: string) {
    return this.blog.getPublished(slug);
  }

  // 3 comments per minute per visitor IP
  @Post('posts/:slug/comments')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  createComment(@Param('slug') slug: string, @Body() dto: CreateCommentDto) {
    return this.blog.createComment(slug, dto);
  }

  @Get('categories')
  listCategories() {
    return this.blog.listPublicCategories();
  }

  @Get('categories/:slug')
  getCategory(@Param('slug') slug: string, @Query() query: PageQueryDto) {
    return this.blog.listPublished(query.page, slug);
  }

  @Get('sitemap')
  sitemap() {
    return this.blog.sitemapEntries();
  }
}
