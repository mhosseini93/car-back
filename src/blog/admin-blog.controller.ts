import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { BlogService } from './blog.service.js';
import {
  AdminCommentsQueryDto,
  AdminPostsQueryDto,
  UpdateCommentDto,
  UpsertCategoryDto,
  UpsertPostDto,
} from './dto.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get('posts')
  listPosts(@Query() query: AdminPostsQueryDto) {
    return this.blog.adminListPosts(query);
  }

  @Get('posts/options')
  postOptions() {
    return this.blog.adminPostOptions();
  }

  @Get('posts/:id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.blog.adminGetPost(id);
  }

  @Post('posts')
  createPost(@Body() dto: UpsertPostDto) {
    return this.blog.adminSavePost(null, dto);
  }

  @Put('posts/:id')
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertPostDto) {
    return this.blog.adminSavePost(id, dto);
  }

  @Delete('posts/:id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.blog.adminDeletePost(id);
  }

  @Get('categories')
  listCategories() {
    return this.blog.adminListCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: UpsertCategoryDto) {
    return this.blog.adminSaveCategory(null, dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertCategoryDto) {
    return this.blog.adminSaveCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.blog.adminDeleteCategory(id);
  }

  @Get('comments')
  listComments(@Query() query: AdminCommentsQueryDto) {
    return this.blog.adminListComments(query);
  }

  @Patch('comments/:id')
  updateComment(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto) {
    return this.blog.adminUpdateComment(id, dto.status);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.blog.adminDeleteComment(id);
  }
}
