import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminGuard } from '../auth/admin.guard.js';
import { ContactService } from './contact.service.js';
import { AdminContactQueryDto, CreateContactMessageDto, UpdateContactMessageDto } from './dto.js';

// Public: the site's contact form
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  // 3 messages per minute per visitor IP
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contact.create(dto);
  }
}

@Controller('admin/contact')
@UseGuards(AdminGuard)
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list(@Query() query: AdminContactQueryDto) {
    return this.contact.adminList(query);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactMessageDto) {
    return this.contact.adminUpdate(id, dto.isRead);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contact.adminDelete(id);
  }
}
