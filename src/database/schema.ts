import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

// Site-wide settings stored as one JSON document per key (e.g. "footer")
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------- Blog

export const postStatus = pgEnum('post_status', ['draft', 'published']);
export const commentStatus = pgEnum('comment_status', ['pending', 'approved', 'spam']);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt: createdAt(),
});

export const posts = pgTable(
  'posts',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    // Sanitized HTML from the admin editor
    content: text('content').notNull().default(''),
    coverImageUrl: text('cover_image_url'),
    coverImageAlt: text('cover_image_alt').notNull().default(''),
    status: postStatus('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    readingMinutes: integer('reading_minutes').notNull().default(1),
    // SEO
    metaTitle: text('meta_title').notNull().default(''),
    metaDescription: text('meta_description').notNull().default(''),
    canonicalUrl: text('canonical_url').notNull().default(''),
    robotsIndex: boolean('robots_index').notNull().default(true),
    robotsFollow: boolean('robots_follow').notNull().default(true),
    allowComments: boolean('allow_comments').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('posts_status_published_at_idx').on(t.status, t.publishedAt)],
);

export const postCategories = pgTable(
  'post_categories',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })],
);

// Hand-picked related posts, in display order
export const postRelated = pgTable(
  'post_related',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    relatedId: integer('related_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.relatedId] })],
);

export const comments = pgTable(
  'comments',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email').notNull().default(''),
    content: text('content').notNull(),
    status: commentStatus('status').notNull().default('pending'),
    createdAt: createdAt(),
  },
  (t) => [index('comments_post_status_idx').on(t.postId, t.status)],
);
