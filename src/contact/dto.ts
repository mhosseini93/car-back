import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { trim } from '../blog/dto.js';

export const CONTACT_SUBJECTS = ['purchase', 'installment', 'support', 'other'] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

// Persian/Arabic digits to ASCII, then drop spaces and dashes
const normalizePhone = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value
        .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
        .replace(/[\s-]/g, '')
    : value;

export class CreateContactMessageDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'نام خود را وارد کنید' })
  @MaxLength(60, { message: 'نام حداکثر ۶۰ کاراکتر است' })
  name!: string;

  @Transform(normalizePhone)
  @IsString()
  @Matches(/^(\+98|0)9\d{9}$/, { message: 'شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹)' })
  phone!: string;

  @Transform(trim)
  @IsString()
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @MaxLength(120)
  email!: string;

  @IsIn(CONTACT_SUBJECTS, { message: 'موضوع پیام نامعتبر است' })
  subject!: ContactSubject;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'متن پیام را بنویسید' })
  @MaxLength(2000, { message: 'پیام حداکثر ۲۰۰۰ کاراکتر است' })
  message!: string;

  // Honeypot: hidden from people, bots tend to fill it
  @IsOptional()
  @IsString()
  website?: string;
}

export class AdminContactQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  page?: number;

  @IsOptional()
  @IsIn(['unread', 'read'])
  status?: 'unread' | 'read';
}

export class UpdateContactMessageDto {
  @IsBoolean()
  isRead!: boolean;
}
