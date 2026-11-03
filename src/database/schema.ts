import {
  bigint,
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

// ---------------------------------------------------------------- Catalog

export const carCondition = pgEnum('car_condition', ['new', 'used']);

export type BrandFaq = { q: string; a: string };
export type CarImage = { src: string; alt: string };
// group: section title such as «سیستم ترمز»; null for ungrouped specs
export type CarSpec = { group: string | null; label: string; value: string };
// amount: monthly installment in toman
export type CarInstallment = { months: number; amount: number };

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  englishName: text('english_name').notNull().default(''),
  // Short text under the page heading and in listings
  intro: text('intro').notNull().default(''),
  // Sanitized HTML from the admin editor, shown below the car list
  content: text('content').notNull().default(''),
  logoUrl: text('logo_url'),
  color: text('color').notNull().default('#1d4ed8'),
  faqs: jsonb('faqs').$type<BrandFaq[]>().notNull().default([]),
  // SEO
  metaTitle: text('meta_title').notNull().default(''),
  metaDescription: text('meta_description').notNull().default(''),
  robotsIndex: boolean('robots_index').notNull().default(true),
  robotsFollow: boolean('robots_follow').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  position: integer('position').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cars = pgTable(
  'cars',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    // A brand with cars can't be deleted
    brandId: integer('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    year: integer('year').notNull(),
    condition: carCondition('condition').notNull().default('new'),
    mileage: integer('mileage').notNull().default(0),
    // Cash price in toman
    price: bigint('price', { mode: 'number' }).notNull(),
    minDownPercent: integer('min_down_percent').notNull().default(30),
    gearbox: text('gearbox').notNull().default('اتوماتیک'),
    fuel: text('fuel').notNull().default('بنزین'),
    // Body color for the illustration shown when there is no photo
    color: text('color').notNull().default('#e5e7eb'),
    imageUrl: text('image_url'),
    imageAlt: text('image_alt').notNull().default(''),
    gallery: jsonb('gallery').$type<CarImage[]>().notNull().default([]),
    // Sanitized HTML description for the car page
    content: text('content').notNull().default(''),
    specs: jsonb('specs').$type<CarSpec[]>().notNull().default([]),
    installments: jsonb('installments').$type<CarInstallment[]>().notNull().default([]),
    // Page the car was imported from (scripts/import-catalog.mjs); matches rows on re-import
    sourceUrl: text('source_url').unique(),
    // SEO; empty meta fields fall back to text built from the car's data
    metaTitle: text('meta_title').notNull().default(''),
    metaDescription: text('meta_description').notNull().default(''),
    robotsIndex: boolean('robots_index').notNull().default(true),
    robotsFollow: boolean('robots_follow').notNull().default(true),
    tags: text('tags').array().notNull().default([]),
    // Page views in the last 7 days, used to rank popular cars
    weeklyViews: integer('weekly_views').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('cars_brand_idx').on(t.brandId)],
);
