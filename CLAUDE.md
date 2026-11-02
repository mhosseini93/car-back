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
