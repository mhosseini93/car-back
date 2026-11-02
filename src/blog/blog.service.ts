import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, inArray, lte, notInArray, or, sql, type SQL } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { categories, comments, postCategories, postRelated, posts } from '../database/schema.js';
import { readingMinutes, sanitizeContent } from './content.js';
import type { CreateCommentDto, UpsertCategoryDto, UpsertPostDto } from './dto.js';

const PAGE_SIZE = 9;
const ADMIN_PAGE_SIZE = 20;
const RELATED_COUNT = 3;

type CategoryRef = { id: number; slug: string; name: string };

const summaryColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImageUrl: posts.coverImageUrl,
  coverImageAlt: posts.coverImageAlt,
  publishedAt: posts.publishedAt,
  readingMinutes: posts.readingMinutes,
};

// Published and not scheduled for the future
const isPublic = () => and(eq(posts.status, 'published'), lte(posts.publishedAt, sql`now()`))!;

const pageInfo = (page: number, pageSize: number, total: number) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

@Injectable()
export class BlogService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  private async categoriesByPost(postIds: number[]): Promise<Map<number, CategoryRef[]>> {
    const map = new Map<number, CategoryRef[]>();
    if (!postIds.length) return map;

    const rows = await this.db
      .select({ postId: postCategories.postId, id: categories.id, slug: categories.slug, name: categories.name })
      .from(postCategories)
      .innerJoin(categories, eq(categories.id, postCategories.categoryId))
      .where(inArray(postCategories.postId, postIds))
      .orderBy(asc(categories.name));

    for (const { postId, ...category } of rows) {
      map.set(postId, [...(map.get(postId) ?? []), category]);
    }
    return map;
  }

  private async withCategories<T extends { id: number }>(items: T[]) {
    const byPost = await this.categoriesByPost(items.map((p) => p.id));
    return items.map((p) => ({ ...p, categories: byPost.get(p.id) ?? [] }));
  }

  // ------------------------------------------------------------ Public

  async listPublished(page = 1, categorySlug?: string) {
    const conditions: SQL[] = [isPublic()];
    let category: { id: number; slug: string; name: string; description: string } | undefined;

    if (categorySlug) {
      [category] = await this.db
        .select({ id: categories.id, slug: categories.slug, name: categories.name, description: categories.description })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (!category) throw new NotFoundException('دسته‌بندی پیدا نشد');
      conditions.push(
        inArray(
          posts.id,
          this.db.select({ id: postCategories.postId }).from(postCategories).where(eq(postCategories.categoryId, category.id)),
        ),
      );
    }

    const where = and(...conditions);
    const [{ total }] = await this.db.select({ total: count() }).from(posts).where(where);
    const items = await this.db
      .select(summaryColumns)
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    return {
      category: category ?? null,
      items: await this.withCategories(items),
      ...pageInfo(page, PAGE_SIZE, total),
    };
  }

  async getPublished(slug: string) {
    const [post] = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), isPublic()))
      .limit(1);
    if (!post) throw new NotFoundException('مقاله پیدا نشد');

    const [withCats] = await this.withCategories([post]);

    const approved = await this.db
      .select({ id: comments.id, authorName: comments.authorName, content: comments.content, createdAt: comments.createdAt })
      .from(comments)
      .where(and(eq(comments.postId, post.id), eq(comments.status, 'approved')))
      .orderBy(asc(comments.createdAt));

    return { ...withCats, related: await this.relatedFor(post.id, withCats.categories), comments: approved };
  }

  // Hand-picked related posts first, then fill from shared categories, then latest
  private async relatedFor(postId: number, cats: CategoryRef[]) {
    const picked = await this.db
      .select(summaryColumns)
      .from(postRelated)
      .innerJoin(posts, eq(posts.id, postRelated.relatedId))
      .where(and(eq(postRelated.postId, postId), isPublic()))
      .orderBy(asc(postRelated.position));

    const result = [...picked];
    const exclude = () => [postId, ...result.map((p) => p.id)];

    if (result.length < RELATED_COUNT && cats.length) {
      const sameCategory = await this.db
        .selectDistinct(summaryColumns)
        .from(posts)
        .innerJoin(postCategories, eq(postCategories.postId, posts.id))
        .where(
          and(
            isPublic(),
            inArray(postCategories.categoryId, cats.map((c) => c.id)),
            notInArray(posts.id, exclude()),
          ),
        )
        .orderBy(desc(posts.publishedAt))
        .limit(RELATED_COUNT - result.length);
      result.push(...sameCategory);
    }

    if (result.length < RELATED_COUNT) {
      const latest = await this.db
        .select(summaryColumns)
        .from(posts)
        .where(and(isPublic(), notInArray(posts.id, exclude())))
        .orderBy(desc(posts.publishedAt))
        .limit(RELATED_COUNT - result.length);
      result.push(...latest);
    }

    // Keep every hand-picked post, even beyond the default count
    return this.withCategories(result);
  }

  async createComment(slug: string, dto: CreateCommentDto) {
    const [post] = await this.db
      .select({ id: posts.id, allowComments: posts.allowComments })
      .from(posts)
      .where(and(eq(posts.slug, slug), isPublic()))
      .limit(1);
    if (!post) throw new NotFoundException('مقاله پیدا نشد');
    if (!post.allowComments) throw new ForbiddenException('ارسال دیدگاه برای این مقاله بسته است');

    // Silently drop honeypot submissions so bots don't learn to adapt
    if (!dto.website) {
      await this.db.insert(comments).values({
        postId: post.id,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        content: dto.content,
      });
    }
    return { status: 'pending' as const };
  }

  async listPublicCategories() {
    return this.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        postCount: sql<number>`count(${posts.id})::int`,
      })
      .from(categories)
      .leftJoin(postCategories, eq(postCategories.categoryId, categories.id))
      .leftJoin(posts, and(eq(posts.id, postCategories.postId), isPublic()))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
  }

  // Indexable public URLs for the sitemap
  async sitemapEntries() {
    const postRows = await this.db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(and(isPublic(), eq(posts.robotsIndex, true), eq(posts.canonicalUrl, '')))
      .orderBy(desc(posts.publishedAt));

    const categoryRows = (await this.listPublicCategories())
      .filter((c) => c.postCount > 0)
      .map((c) => ({ slug: c.slug }));

    return { posts: postRows, categories: categoryRows };
  }

  // ------------------------------------------------------------- Admin

  async adminListPosts(opts: { page?: number; status?: 'draft' | 'published'; q?: string }) {
    const page = opts.page ?? 1;
    const conditions: SQL[] = [];
    if (opts.status) conditions.push(eq(posts.status, opts.status));
    if (opts.q) conditions.push(or(ilike(posts.title, `%${opts.q}%`), ilike(posts.slug, `%${opts.q}%`))!);
    const where = conditions.length ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(posts).where(where);
    const items = await this.db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        status: posts.status,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
        robotsIndex: posts.robotsIndex,
        robotsFollow: posts.robotsFollow,
        // Table-qualified: Drizzle drops table names in single-table selects
        commentCount: sql<number>`(select count(*)::int from "comments" c where c."post_id" = "posts"."id")`,
        pendingComments: sql<number>`(select count(*)::int from "comments" c where c."post_id" = "posts"."id" and c."status" = 'pending')`,
      })
      .from(posts)
      .where(where)
      .orderBy(desc(posts.updatedAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE);

    const [counts] = await this.db
      .select({
        all: count(),
        published: sql<number>`count(*) filter (where ${posts.status} = 'published')::int`,
        draft: sql<number>`count(*) filter (where ${posts.status} = 'draft')::int`,
      })
      .from(posts);

    return { items: await this.withCategories(items), counts, ...pageInfo(page, ADMIN_PAGE_SIZE, total) };
  }

  // Lightweight list for the related-posts picker
  async adminPostOptions() {
    return this.db
      .select({ id: posts.id, title: posts.title, slug: posts.slug, status: posts.status })
      .from(posts)
      .orderBy(desc(posts.updatedAt));
  }

  async adminGetPost(id: number) {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post) throw new NotFoundException('مقاله پیدا نشد');

    const categoryRows = await this.db
      .select({ id: postCategories.categoryId })
      .from(postCategories)
      .where(eq(postCategories.postId, id));
    const relatedRows = await this.db
      .select({ id: postRelated.relatedId })
      .from(postRelated)
      .where(eq(postRelated.postId, id))
      .orderBy(asc(postRelated.position));

    return { ...post, categoryIds: categoryRows.map((r) => r.id), relatedIds: relatedRows.map((r) => r.id) };
  }

  async adminSavePost(id: number | null, dto: UpsertPostDto) {
    const values = {
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      content: sanitizeContent(dto.content),
      coverImageUrl: dto.coverImageUrl || null,
      coverImageAlt: dto.coverImageAlt,
      status: dto.status,
      // Publishing without a date means "now"
      publishedAt: dto.publishedAt
        ? new Date(dto.publishedAt)
        : dto.status === 'published'
          ? new Date()
          : null,
      readingMinutes: readingMinutes(dto.content),
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      canonicalUrl: dto.canonicalUrl,
      robotsIndex: dto.robotsIndex,
      robotsFollow: dto.robotsFollow,
      allowComments: dto.allowComments,
      updatedAt: new Date(),
    };

    try {
      const postId = await this.db.transaction(async (tx) => {
        let postId = id;
        if (postId === null) {
          const [row] = await tx.insert(posts).values(values).returning({ id: posts.id });
          postId = row.id;
        } else {
          const updated = await tx.update(posts).set(values).where(eq(posts.id, postId)).returning({ id: posts.id });
          if (!updated.length) throw new NotFoundException('مقاله پیدا نشد');
        }

        const categoryIds = [...new Set(dto.categoryIds)];
        await tx.delete(postCategories).where(eq(postCategories.postId, postId));
        if (categoryIds.length) {
          const existing = await tx
            .select({ id: categories.id })
            .from(categories)
            .where(inArray(categories.id, categoryIds));
          if (existing.length) {
            await tx.insert(postCategories).values(existing.map((c) => ({ postId: postId!, categoryId: c.id })));
          }
        }

        const relatedIds = [...new Set(dto.relatedIds)].filter((rid) => rid !== postId);
        await tx.delete(postRelated).where(eq(postRelated.postId, postId));
        if (relatedIds.length) {
          const existing = new Set(
            (await tx.select({ id: posts.id }).from(posts).where(inArray(posts.id, relatedIds))).map((p) => p.id),
          );
          const rows = relatedIds
            .filter((rid) => existing.has(rid))
            .map((relatedId, position) => ({ postId: postId!, relatedId, position }));
          if (rows.length) await tx.insert(postRelated).values(rows);
        }

        return postId;
      });

      return this.adminGetPost(postId);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('این نامک قبلاً برای مقاله دیگری استفاده شده است');
      }
      throw error;
    }
  }

  async adminDeletePost(id: number) {
    const deleted = await this.db.delete(posts).where(eq(posts.id, id)).returning({ slug: posts.slug });
    if (!deleted.length) throw new NotFoundException('مقاله پیدا نشد');
    return { ok: true };
  }

  async adminListCategories() {
    return this.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        postCount: sql<number>`count(${postCategories.postId})::int`,
      })
      .from(categories)
      .leftJoin(postCategories, eq(postCategories.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.name));
  }

  async adminSaveCategory(id: number | null, dto: UpsertCategoryDto) {
    try {
      if (id === null) {
        const [row] = await this.db.insert(categories).values(dto).returning();
        return row;
      }
      const [row] = await this.db.update(categories).set(dto).where(eq(categories.id, id)).returning();
      if (!row) throw new NotFoundException('دسته‌بندی پیدا نشد');
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('این نامک قبلاً برای دسته‌بندی دیگری استفاده شده است');
      }
      throw error;
    }
  }

  async adminDeleteCategory(id: number) {
    const deleted = await this.db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    if (!deleted.length) throw new NotFoundException('دسته‌بندی پیدا نشد');
    return { ok: true };
  }

  async adminListComments(opts: { page?: number; status?: 'pending' | 'approved' | 'spam' }) {
    const page = opts.page ?? 1;
    const where = opts.status ? eq(comments.status, opts.status) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(comments).where(where);
    const items = await this.db
      .select({
        id: comments.id,
        authorName: comments.authorName,
        authorEmail: comments.authorEmail,
        content: comments.content,
        status: comments.status,
        createdAt: comments.createdAt,
        post: { id: posts.id, title: posts.title, slug: posts.slug },
      })
      .from(comments)
      .innerJoin(posts, eq(posts.id, comments.postId))
      .where(where)
      .orderBy(desc(comments.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE);

    const [counts] = await this.db
      .select({
        all: count(),
        pending: sql<number>`count(*) filter (where ${comments.status} = 'pending')::int`,
        approved: sql<number>`count(*) filter (where ${comments.status} = 'approved')::int`,
        spam: sql<number>`count(*) filter (where ${comments.status} = 'spam')::int`,
      })
      .from(comments);

    return { items, counts, ...pageInfo(page, ADMIN_PAGE_SIZE, total) };
  }

  async adminUpdateComment(id: number, status: 'pending' | 'approved' | 'spam') {
    const [row] = await this.db
      .update(comments)
      .set({ status })
      .where(eq(comments.id, id))
      .returning({ id: comments.id, status: comments.status });
    if (!row) throw new NotFoundException('دیدگاه پیدا نشد');
    return row;
  }

  async adminDeleteComment(id: number) {
    const deleted = await this.db.delete(comments).where(eq(comments.id, id)).returning({ id: comments.id });
    if (!deleted.length) throw new NotFoundException('دیدگاه پیدا نشد');
    return { ok: true };
  }
}
