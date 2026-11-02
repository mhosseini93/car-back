import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from './content.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Relative paths (uploads) or absolute http(s) URLs
const URL_PATTERN = /^(\/(?!\/)|https?:\/\/)/;

export class UpsertPostDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'عنوان مقاله را وارد کنید' })
  @MaxLength(200, { message: 'عنوان حداکثر ۲۰۰ کاراکتر است' })
  title!: string;

  @Transform(trim)
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(150, { message: 'نامک حداکثر ۱۵۰ کاراکتر است' })
  slug!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(500, { message: 'خلاصه حداکثر ۵۰۰ کاراکتر است' })
  excerpt!: string;

  @IsString()
  @MaxLength(500_000, { message: 'محتوای مقاله بیش از حد طولانی است' })
  content!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @Matches(URL_PATTERN, { message: 'آدرس تصویر شاخص معتبر نیست' })
  @MaxLength(500)
  coverImageUrl?: string | null;

  @Transform(trim)
  @IsString()
  @MaxLength(200, { message: 'متن جایگزین تصویر حداکثر ۲۰۰ کاراکتر است' })
  coverImageAlt!: string;

  @IsIn(['draft', 'published'], { message: 'وضعیت انتشار نامعتبر است' })
  status!: 'draft' | 'published';

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsISO8601({}, { message: 'تاریخ انتشار نامعتبر است' })
  publishedAt?: string | null;

  @Transform(trim)
  @IsString()
  @MaxLength(70, { message: 'عنوان سئو حداکثر ۷۰ کاراکتر است' })
  metaTitle!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(170, { message: 'توضیحات متا حداکثر ۱۷۰ کاراکتر است' })
  metaDescription!: string;

  @Transform(trim)
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @Matches(/^https?:\/\//, { message: 'آدرس canonical باید با http:// یا https:// شروع شود' })
  @MaxLength(500)
  canonicalUrl!: string;

  @IsBoolean()
  robotsIndex!: boolean;

  @IsBoolean()
  robotsFollow!: boolean;

  @IsBoolean()
  allowComments!: boolean;

  @IsArray()
  @ArrayMaxSize(20, { message: 'حداکثر ۲۰ دسته‌بندی' })
  @IsInt({ each: true })
  categoryIds!: number[];

  @IsArray()
  @ArrayMaxSize(12, { message: 'حداکثر ۱۲ مقاله مرتبط' })
  @IsInt({ each: true })
  relatedIds!: number[];
}

export class UpsertCategoryDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نام دسته‌بندی را وارد کنید' })
  @MaxLength(80, { message: 'نام دسته‌بندی حداکثر ۸۰ کاراکتر است' })
  name!: string;

  @Transform(trim)
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(100)
  slug!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(300, { message: 'توضیحات حداکثر ۳۰۰ کاراکتر است' })
  description!: string;
}

export class CreateCommentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نام خود را وارد کنید' })
  @MaxLength(60, { message: 'نام حداکثر ۶۰ کاراکتر است' })
  authorName!: string;

  @Transform(trim)
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @MaxLength(120)
  authorEmail!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'متن دیدگاه را بنویسید' })
  @MaxLength(2000, { message: 'دیدگاه حداکثر ۲۰۰۰ کاراکتر است' })
  content!: string;

  // Honeypot: hidden from people, bots tend to fill it
  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateCommentDto {
  @IsIn(['pending', 'approved', 'spam'], { message: 'وضعیت دیدگاه نامعتبر است' })
  status!: 'pending' | 'approved' | 'spam';
}

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  page?: number;
}

export class AdminPostsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class AdminCommentsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'spam'])
  status?: 'pending' | 'approved' | 'spam';
}
