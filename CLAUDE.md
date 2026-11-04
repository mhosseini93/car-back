# car-backend

بک‌اند NestJS سایت فروش اقساطی خودرو «خودرو قسطی».

## پروژه‌های مرتبط
- **فرانت‌اند (Next.js):** `C:\Users\m.hosseini\Desktop\111` — گیت‌هاب: https://github.com/mhosseini93/car
- **بک‌اند (همین پروژه):** `C:\Users\m.hosseini\Desktop\car-backend` — گیت‌هاب: https://github.com/mhosseini93/car-back

## قراردادها
- NestJS 12 با ESM: importهای داخلی پسوند `.js` دارند (`./app.service.js`).
- همه مسیرها زیر پیشوند `/api` هستند؛ پورت پیش‌فرض `4000` (فرانت‌اند روی `3000`).
- تنظیمات با `@nestjs/config` از `.env` خوانده می‌شود؛ هر متغیر جدید را به `.env.example` هم اضافه کن.
- تنظیمات اپ (prefix، CORS، ValidationPipe) در `src/setup.ts` است.
- ورودی‌ها با DTO و `class-validator` اعتبارسنجی شوند (`whitelist` و `forbidNonWhitelisted` فعال است).
- **تست ننویس.** هیچ فایل تست یا ابزار تست به این پروژه اضافه نکن (قانون مشترک با فرانت‌اند). درستی کار را با `npm run build`، `npm run lint` (oxlint) و اجرای واقعی API بررسی کن.

## اجرا
- `npm run start:dev` → http://localhost:4000/api/health

## ساختار
- `src/database/` — دیتابیس **PostgreSQL** (نسخه ۱۸، لوکال روی پورت 5432) با **Drizzle ORM** و درایور `pg`. اتصال از `DATABASE_URL`؛ دیتابیس `car` با کاربر `car_app`.
  - جدول‌ها فقط در `src/database/schema.ts` تعریف می‌شوند. بعد از هر تغییر schema، `npm run db:generate -- --name <توضیح>` بزن تا مایگریشن در `drizzle/` ساخته شود و آن را کامیت کن. هیچ‌وقت جدول را دستی در دیتابیس تغییر نده.
  - مایگریشن‌ها موقع روشن شدن سرور خودکار اجرا می‌شوند (`npm run db:migrate` هم هست). برای دیدن داده‌ها: `npm run db:studio`.
  - ستون‌های `jsonb` ترتیب کلیدهای آبجکت را حفظ نمی‌کنند؛ مقایسه یا خروجی را به ترتیب کلید وابسته نکن.
- `src/auth/` — ورود ادمین (`POST /api/auth/login`، محدود به ۵ تلاش در دقیقه) و `AdminGuard` برای مسیرهای مدیریتی. کاربر ادمین از `.env` خوانده می‌شود: `ADMIN_USERNAME` و `ADMIN_PASSWORD_HASH` (هش scrypt). توکن JWT با `JWT_SECRET` امضا می‌شود و ۸ ساعت اعتبار دارد.
- `src/settings/` — تنظیمات عمومی سایت در جدول `settings` (key/value JSON). فعلاً: `GET /api/settings/footer` (عمومی) و `PUT /api/settings/footer` (فقط ادمین).
- هر endpoint مدیریتی جدید باید `@UseGuards(AdminGuard)` داشته باشد. پیام‌های خطای اعتبارسنجی فارسی باشند چون مستقیم در پنل نمایش داده می‌شوند.

## تغییر رمز ادمین
`npm run admin:hash -- "<رمز جدید>"` را اجرا کن و خروجی را در `ADMIN_PASSWORD_HASH` فایل `.env` بگذار، سپس سرور را ری‌استارت کن.

## بکاپ دیتابیس
- بکاپ کامل دیتابیس (ساختار + داده) در `backups/car.sql` است و در گیت نگه داشته می‌شود تا از سیستم‌های دیگر هم قابل استفاده باشد.
- گرفتن بکاپ: `npm run db:backup` (فایل قبلی جایگزین می‌شود؛ بعدش کامیت و push کن).
- بازگردانی: `npm run db:restore` — محتوای فعلی دیتابیس `DATABASE_URL` را کامل با بکاپ جایگزین می‌کند (در یک تراکنش؛ اگر خطا بدهد چیزی تغییر نمی‌کند).
- اسکریپت‌ها از `pg_dump`/`psql` در `C:\Program Files\PostgreSQL\18\bin` استفاده می‌کنند؛ اگر جای دیگری نصب است، `PG_BIN` را در `.env` تنظیم کن.
- رمزها و اطلاعات محرمانه (مثل اطلاعات شخصی مشتری‌ها) نباید در بکاپ گیت بروند؛ اگر چنین داده‌ای به دیتابیس اضافه شد، قبل از کامیت بکاپ با کاربر هماهنگ کن.

## راه‌اندازی روی سیستم جدید
1. PostgreSQL 18 را نصب کن، ریپو را clone کن و `npm install` بزن.
2. `.env.example` را به `.env` کپی کن و `JWT_SECRET`، `ADMIN_PASSWORD_HASH` (با `npm run admin:hash`) و رمز `car_app` در `DATABASE_URL` را پر کن.
3. دیتابیس و کاربر را بساز (همان رمز `car_app`):
   `psql -U postgres -h localhost -v app_password=<رمز> -f scripts/create-db.sql`
4. `npm run db:restore` تا داده‌ها از بکاپ برگردند.
5. `npm run start:dev`

## بلاگ
- `src/blog/`: مقالات، دسته‌بندی‌ها (چند به چند)، مقالات مرتبط (دستی + تکمیل خودکار از همان دسته)، دیدگاه‌ها (نیاز به تأیید، honeypot، ۳ دیدگاه در دقیقه) و آپلود تصویر (`POST /api/admin/uploads`، در پوشه `uploads/` که در گیت است).
- HTML مقاله هنگام ذخیره با `sanitize-html` پاک‌سازی می‌شود (`src/blog/content.ts`).
- مسیرهای عمومی: `/api/blog/...`؛ مدیریتی: `/api/admin/...` (همه با `AdminGuard`).

## کاتالوگ (برندها و خودروها)
- `src/catalog/`: جدول‌های `brands` و `cars` (هر خودرو یک برند دارد؛ برندی که خودرو دارد حذف نمی‌شود). قیمت‌ها به تومان در ستون bigint.
- مسیرهای عمومی: `/api/catalog/brands`، `/api/catalog/brands/:slug` (با خودروهای فعال)، `/api/catalog/cars/popular` (خودروهایی با `show_on_home` روشن، به ترتیب `position`)، `/api/catalog/cars/:slug` (صفحه خودرو + ۴ خودروی مشابه: اول هم‌برند، بعد نزدیک‌ترین قیمت)، `/api/catalog/sitemap` (`{ brands, cars }`؛ فقط صفحات index). فقط برند و خودروی فعال (`isActive`) نمایش داده می‌شود.
- مدیریتی: `/api/admin/brands` و `/api/admin/cars` (همه با `AdminGuard`). متن معرفی برند هم با `sanitize-html` پاک‌سازی می‌شود.
- داده‌های اولیه برندها و خودروها در مایگریشن `drizzle/0003_catalog_seed.sql` است.
- خودروها علاوه بر فیلدهای پایه، ستون‌های `content` (HTML پاک‌سازی‌شده)، `gallery`، `specs`، `installments` (jsonb) و `source_url` دارند.
- سئوی صفحه خودرو: `meta_title`، `meta_description`، `robots_index`، `robots_follow` (مایگریشن `0005_car_seo`). `content` در ذخیره از پنل با `sanitizeContent` پاک‌سازی می‌شود. لیست‌ها (`carColumns`) هم `installments` را برمی‌گردانند تا کارت‌ها کمترین قسط واقعی را نشان دهند.
- ورود/سینک داده از خروجی اسکرپر (`tools/scraper` در پروژه فرانت‌اند): `npm run catalog:import -- <file.json> [--dry-run]` (`scripts/import-catalog.mjs`). خودروها با `source_url` (و بعد نام) تطبیق داده می‌شوند و اجرای دوباره فقط قیمت، پیش‌پرداخت، مشخصات و اقساط را به‌روز می‌کند؛ متن، نام و سئوی ردیف‌های موجود دست نمی‌خورد. جمله‌ها و بلوک‌هایی که نام یا تلفن سایت مبدأ را دارند حذف می‌شوند (`SOURCE_MARKERS`).

## پیام‌های تماس
- `src/contact/`: جدول `contact_messages` (نام، موبایل، ایمیل اختیاری، موضوع از enum `contact_subject`، متن، `is_read`). شماره موبایل با ارقام فارسی/عربی هم پذیرفته و به ارقام لاتین تبدیل می‌شود.
- عمومی: `POST /api/contact` (honeypot `website` + `ThrottlerGuard` با ۳ پیام در دقیقه). مدیریتی: `GET/PATCH/DELETE /api/admin/contact` (با `AdminGuard`).
