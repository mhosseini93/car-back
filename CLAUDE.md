# car-backend

بک‌اند NestJS سایت فروش اقساطی خودرو «خودرو قسطی».

## پروژه‌های مرتبط
- **فرانت‌اند (Next.js):** `C:\Users\m.hosseini\Desktop\111` — گیت‌هاب: https://github.com/mhosseini93/car
- **بک‌اند (همین پروژه):** `C:\Users\m.hosseini\Desktop\car-backend`

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
