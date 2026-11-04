import { Injectable, NotFoundException } from '@nestjs/common';
import { count, desc, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { contactMessages } from '../database/schema.js';
import type { AdminContactQueryDto, CreateContactMessageDto } from './dto.js';

const ADMIN_PAGE_SIZE = 20;

@Injectable()
export class ContactService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  async create(dto: CreateContactMessageDto) {
    // Silently drop honeypot submissions so bots don't learn to adapt
    if (!dto.website) {
      await this.db.insert(contactMessages).values({
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      });
    }
    return { ok: true };
  }

  async adminList(query: AdminContactQueryDto) {
    const page = query.page ?? 1;
    const where = query.status ? eq(contactMessages.isRead, query.status === 'read') : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(contactMessages).where(where);
    const items = await this.db
      .select()
      .from(contactMessages)
      .where(where)
      .orderBy(desc(contactMessages.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE);

    const [counts] = await this.db
      .select({
        all: count(),
        unread: sql<number>`count(*) filter (where not ${contactMessages.isRead})::int`,
        read: sql<number>`count(*) filter (where ${contactMessages.isRead})::int`,
      })
      .from(contactMessages);

    return { items, counts, page, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)), total };
  }

  async adminUpdate(id: number, isRead: boolean) {
    const [row] = await this.db
      .update(contactMessages)
      .set({ isRead })
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id, isRead: contactMessages.isRead });
    if (!row) throw new NotFoundException('پیام پیدا نشد');
    return row;
  }

  async adminDelete(id: number) {
    const deleted = await this.db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    if (!deleted.length) throw new NotFoundException('پیام پیدا نشد');
    return { ok: true };
  }
}
