import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { sanitizeContent } from '../blog/content.js';
import { DatabaseService } from '../database/database.service.js';
import { brands, cars } from '../database/schema.js';
import type { AdminCarsQueryDto, UpsertBrandDto, UpsertCarDto } from './dto.js';

const POPULAR_COUNT = 8;

const carColumns = {
  id: cars.id,
  slug: cars.slug,
  name: cars.name,
  year: cars.year,
  condition: cars.condition,
  mileage: cars.mileage,
  price: cars.price,
  minDownPercent: cars.minDownPercent,
  gearbox: cars.gearbox,
  fuel: cars.fuel,
  color: cars.color,
  imageUrl: cars.imageUrl,
  imageAlt: cars.imageAlt,
  tags: cars.tags,
  weeklyViews: cars.weeklyViews,
  brand: { id: brands.id, slug: brands.slug, name: brands.name },
};

// Shown on the site: the car and its brand are both active
const isPublicCar = () => and(eq(cars.isActive, true), eq(brands.isActive, true))!;

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
}

function isForeignKeyViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === '23503' || e?.cause?.code === '23503';
}

@Injectable()
export class CatalogService {
  constructor(private readonly database: DatabaseService) {}

  private get db() {
    return this.database.db;
  }

  // ------------------------------------------------------------ Public

  listBrands() {
    return this.db
      .select({
        id: brands.id,
        slug: brands.slug,
        name: brands.name,
        englishName: brands.englishName,
        intro: brands.intro,
        logoUrl: brands.logoUrl,
        color: brands.color,
        carCount: sql<number>`count(${cars.id})::int`,
      })
      .from(brands)
      .leftJoin(cars, and(eq(cars.brandId, brands.id), eq(cars.isActive, true)))
      .where(eq(brands.isActive, true))
      .groupBy(brands.id)
      .orderBy(asc(brands.position), asc(brands.name));
  }

  async getBrand(slug: string) {
    const [brand] = await this.db
      .select()
      .from(brands)
      .where(and(eq(brands.slug, slug), eq(brands.isActive, true)))
      .limit(1);
    if (!brand) throw new NotFoundException('برند پیدا نشد');

    const list = await this.db
      .select(carColumns)
      .from(cars)
      .innerJoin(brands, eq(brands.id, cars.brandId))
      .where(and(eq(cars.brandId, brand.id), eq(cars.isActive, true)))
      .orderBy(asc(cars.position), asc(cars.price));

    const { isActive: _active, position: _position, ...rest } = brand;
    return { ...rest, cars: list };
  }

  popularCars(limit = POPULAR_COUNT) {
    return this.db
      .select(carColumns)
      .from(cars)
      .innerJoin(brands, eq(brands.id, cars.brandId))
      .where(isPublicCar())
      .orderBy(desc(cars.weeklyViews), asc(cars.id))
      .limit(limit);
  }

  // Indexable brand pages for sitemap.xml
  sitemapBrands() {
    return this.db
      .select({ slug: brands.slug, updatedAt: brands.updatedAt })
      .from(brands)
      .where(and(eq(brands.isActive, true), eq(brands.robotsIndex, true)))
      .orderBy(asc(brands.position));
  }

  // ------------------------------------------------------------ Admin

  adminListBrands() {
    return this.db
      .select({
        id: brands.id,
        slug: brands.slug,
        name: brands.name,
        logoUrl: brands.logoUrl,
        color: brands.color,
        isActive: brands.isActive,
        robotsIndex: brands.robotsIndex,
        robotsFollow: brands.robotsFollow,
        position: brands.position,
        updatedAt: brands.updatedAt,
        carCount: sql<number>`count(${cars.id})::int`,
        activeCarCount: sql<number>`(count(${cars.id}) filter (where ${cars.isActive}))::int`,
      })
      .from(brands)
      .leftJoin(cars, eq(cars.brandId, brands.id))
      .groupBy(brands.id)
      .orderBy(asc(brands.position), asc(brands.name));
  }

  async adminGetBrand(id: number) {
    const [brand] = await this.db.select().from(brands).where(eq(brands.id, id)).limit(1);
    if (!brand) throw new NotFoundException('برند پیدا نشد');
    return brand;
  }

  async adminSaveBrand(id: number | null, dto: UpsertBrandDto) {
    const values = { ...dto, logoUrl: dto.logoUrl || null, content: sanitizeContent(dto.content) };
    try {
      if (id === null) {
        const [row] = await this.db.insert(brands).values(values).returning();
        return row;
      }
      const [row] = await this.db
        .update(brands)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(brands.id, id))
        .returning();
      if (!row) throw new NotFoundException('برند پیدا نشد');
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('این نامک قبلاً برای برند دیگری استفاده شده است');
      }
      throw error;
    }
  }

  async adminDeleteBrand(id: number) {
    const [{ total }] = await this.db.select({ total: count() }).from(cars).where(eq(cars.brandId, id));
    if (total > 0) {
      throw new ConflictException('این برند خودرو دارد؛ اول خودروهای آن را حذف یا به برند دیگری منتقل کنید');
    }
    const deleted = await this.db.delete(brands).where(eq(brands.id, id)).returning({ id: brands.id });
    if (!deleted.length) throw new NotFoundException('برند پیدا نشد');
    return { ok: true };
  }

  adminListCars(query: AdminCarsQueryDto) {
    const conditions: SQL[] = [];
    if (query.brandId) conditions.push(eq(cars.brandId, query.brandId));
    if (query.q) {
      const pattern = `%${query.q}%`;
      conditions.push(or(ilike(cars.name, pattern), ilike(cars.slug, pattern))!);
    }

    return this.db
      .select({ ...carColumns, isActive: cars.isActive, position: cars.position, updatedAt: cars.updatedAt })
      .from(cars)
      .innerJoin(brands, eq(brands.id, cars.brandId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(brands.position), asc(brands.name), asc(cars.position), asc(cars.price));
  }

  async adminGetCar(id: number) {
    const [car] = await this.db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) throw new NotFoundException('خودرو پیدا نشد');
    return car;
  }

  async adminSaveCar(id: number | null, dto: UpsertCarDto) {
    const values = {
      ...dto,
      imageUrl: dto.imageUrl || null,
      // Used cars always have a mileage; new ones never do
      mileage: dto.condition === 'new' ? 0 : dto.mileage,
      tags: [...new Set(dto.tags.map((t) => t.trim()).filter(Boolean))],
    };
    try {
      if (id === null) {
        const [row] = await this.db.insert(cars).values(values).returning();
        return row;
      }
      const [row] = await this.db
        .update(cars)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(cars.id, id))
        .returning();
      if (!row) throw new NotFoundException('خودرو پیدا نشد');
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('این نامک قبلاً برای خودروی دیگری استفاده شده است');
      }
      if (isForeignKeyViolation(error)) throw new NotFoundException('برند انتخاب‌شده پیدا نشد');
      throw error;
    }
  }

  async adminDeleteCar(id: number) {
    const deleted = await this.db.delete(cars).where(eq(cars.id, id)).returning({ id: cars.id });
    if (!deleted.length) throw new NotFoundException('خودرو پیدا نشد');
    return { ok: true };
  }
}
