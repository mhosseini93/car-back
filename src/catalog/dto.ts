import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../blog/content.js';
import { trim, URL_PATTERN } from '../blog/dto.js';

const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export class BrandFaqDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'متن سؤال را وارد کنید' })
  @MaxLength(200, { message: 'سؤال حداکثر ۲۰۰ کاراکتر است' })
  q!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'پاسخ سؤال را وارد کنید' })
  @MaxLength(1000, { message: 'پاسخ حداکثر ۱۰۰۰ کاراکتر است' })
  a!: string;
}

export class UpsertBrandDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نام برند را وارد کنید' })
  @MaxLength(80, { message: 'نام برند حداکثر ۸۰ کاراکتر است' })
  name!: string;

  @Transform(trim)
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(100, { message: 'نامک حداکثر ۱۰۰ کاراکتر است' })
  slug!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(80, { message: 'نام انگلیسی حداکثر ۸۰ کاراکتر است' })
  englishName!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(400, { message: 'معرفی کوتاه حداکثر ۴۰۰ کاراکتر است' })
  intro!: string;

  @IsString()
  @MaxLength(200_000, { message: 'محتوای برند بیش از حد طولانی است' })
  content!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(URL_PATTERN, { message: 'آدرس لوگو معتبر نیست' })
  @MaxLength(500)
  logoUrl?: string | null;

  @Matches(COLOR_PATTERN, { message: 'رنگ برند باید کد هگز مثل #1d4ed8 باشد' })
  color!: string;

  @IsArray()
  @ArrayMaxSize(20, { message: 'حداکثر ۲۰ سؤال متداول' })
  @ValidateNested({ each: true })
  @Type(() => BrandFaqDto)
  faqs!: BrandFaqDto[];

  @Transform(trim)
  @IsString()
  @MaxLength(70, { message: 'عنوان سئو حداکثر ۷۰ کاراکتر است' })
  metaTitle!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(170, { message: 'توضیحات متا حداکثر ۱۷۰ کاراکتر است' })
  metaDescription!: string;

  @IsBoolean()
  robotsIndex!: boolean;

  @IsBoolean()
  robotsFollow!: boolean;

  @IsBoolean()
  isActive!: boolean;

  @IsInt({ message: 'ترتیب نمایش باید عدد صحیح باشد' })
  @Min(0)
  @Max(10_000)
  position!: number;
}

export class CarImageDto {
  @Transform(trim)
  @IsString()
  @Matches(URL_PATTERN, { message: 'آدرس تصویر گالری معتبر نیست' })
  @MaxLength(500)
  src!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(200, { message: 'متن جایگزین تصویر حداکثر ۲۰۰ کاراکتر است' })
  alt!: string;
}

export class CarSpecDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60, { message: 'عنوان گروه مشخصات حداکثر ۶۰ کاراکتر است' })
  group!: string | null;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'عنوان هر مشخصه را وارد کنید' })
  @MaxLength(80, { message: 'عنوان مشخصه حداکثر ۸۰ کاراکتر است' })
  label!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'مقدار هر مشخصه را وارد کنید' })
  @MaxLength(200, { message: 'مقدار مشخصه حداکثر ۲۰۰ کاراکتر است' })
  value!: string;
}

export class CarInstallmentDto {
  @IsInt({ message: 'تعداد ماه‌های قسط باید عدد صحیح باشد' })
  @Min(1, { message: 'تعداد ماه‌های قسط بین ۱ تا ۱۲۰ است' })
  @Max(120, { message: 'تعداد ماه‌های قسط بین ۱ تا ۱۲۰ است' })
  months!: number;

  @IsInt({ message: 'مبلغ قسط باید عدد صحیح (تومان) باشد' })
  @Min(1, { message: 'مبلغ قسط را وارد کنید' })
  @Max(100_000_000_000)
  amount!: number;
}

export class UpsertCarDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نام خودرو را وارد کنید' })
  @MaxLength(100, { message: 'نام خودرو حداکثر ۱۰۰ کاراکتر است' })
  name!: string;

  @Transform(trim)
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(120, { message: 'نامک حداکثر ۱۲۰ کاراکتر است' })
  slug!: string;

  @IsInt({ message: 'برند را انتخاب کنید' })
  @Min(1, { message: 'برند را انتخاب کنید' })
  brandId!: number;

  @IsInt({ message: 'سال ساخت باید عدد باشد' })
  @Min(1300, { message: 'سال ساخت معتبر نیست' })
  @Max(2100, { message: 'سال ساخت معتبر نیست' })
  year!: number;

  @IsIn(['new', 'used'], { message: 'وضعیت خودرو نامعتبر است' })
  condition!: 'new' | 'used';

  @IsInt({ message: 'کارکرد باید عدد باشد' })
  @Min(0, { message: 'کارکرد نمی‌تواند منفی باشد' })
  @Max(2_000_000)
  mileage!: number;

  @IsInt({ message: 'قیمت باید عدد صحیح (تومان) باشد' })
  @Min(1_000_000, { message: 'قیمت حداقل ۱ میلیون تومان است' })
  @Max(1_000_000_000_000, { message: 'قیمت بیش از حد بزرگ است' })
  price!: number;

  @IsInt({ message: 'درصد پیش‌پرداخت باید عدد باشد' })
  @Min(0, { message: 'درصد پیش‌پرداخت بین ۰ تا ۹۰ است' })
  @Max(90, { message: 'درصد پیش‌پرداخت بین ۰ تا ۹۰ است' })
  minDownPercent!: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نوع گیربکس را وارد کنید' })
  @MaxLength(30)
  gearbox!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نوع سوخت را وارد کنید' })
  @MaxLength(30)
  fuel!: string;

  @Matches(COLOR_PATTERN, { message: 'رنگ باید کد هگز مثل #e5e7eb باشد' })
  color!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(URL_PATTERN, { message: 'آدرس تصویر معتبر نیست' })
  @MaxLength(500)
  imageUrl?: string | null;

  @Transform(trim)
  @IsString()
  @MaxLength(200, { message: 'متن جایگزین تصویر حداکثر ۲۰۰ کاراکتر است' })
  imageAlt!: string;

  @IsArray()
  @ArrayMaxSize(20, { message: 'حداکثر ۲۰ تصویر در گالری' })
  @ValidateNested({ each: true })
  @Type(() => CarImageDto)
  gallery!: CarImageDto[];

  @IsString()
  @MaxLength(200_000, { message: 'توضیحات خودرو بیش از حد طولانی است' })
  content!: string;

  @IsArray()
  @ArrayMaxSize(150, { message: 'حداکثر ۱۵۰ مشخصه فنی' })
  @ValidateNested({ each: true })
  @Type(() => CarSpecDto)
  specs!: CarSpecDto[];

  @IsArray()
  @ArrayMaxSize(24, { message: 'حداکثر ۲۴ طرح اقساط' })
  @ValidateNested({ each: true })
  @Type(() => CarInstallmentDto)
  installments!: CarInstallmentDto[];

  @Transform(trim)
  @IsString()
  @MaxLength(70, { message: 'عنوان سئو حداکثر ۷۰ کاراکتر است' })
  metaTitle!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(170, { message: 'توضیحات متا حداکثر ۱۷۰ کاراکتر است' })
  metaDescription!: string;

  @IsBoolean()
  robotsIndex!: boolean;

  @IsBoolean()
  robotsFollow!: boolean;

  @IsArray()
  @ArrayMaxSize(5, { message: 'حداکثر ۵ برچسب' })
  @IsString({ each: true })
  @MaxLength(30, { each: true, message: 'هر برچسب حداکثر ۳۰ کاراکتر است' })
  tags!: string[];

  @IsInt({ message: 'تعداد بازدید باید عدد باشد' })
  @Min(0)
  @Max(100_000_000)
  weeklyViews!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsInt({ message: 'ترتیب نمایش باید عدد صحیح باشد' })
  @Min(0)
  @Max(10_000)
  position!: number;
}

export class AdminCarsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class PopularQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  limit?: number;
}
