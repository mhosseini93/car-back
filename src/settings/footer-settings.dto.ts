import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Internal paths ("/x", "/#x"), in-page anchors, http(s), tel: and mailto: links
const HREF_PATTERN = /^(\/(?!\/)|#|https?:\/\/|tel:|mailto:)/;

export class FooterLinkDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'عنوان لینک خالی است' })
  @MaxLength(60, { message: 'عنوان لینک حداکثر ۶۰ کاراکتر است' })
  label!: string;

  @Transform(trim)
  @IsString()
  @Matches(HREF_PATTERN, {
    message: 'آدرس لینک باید با / یا # یا https:// یا tel: یا mailto: شروع شود',
  })
  @MaxLength(300)
  href!: string;
}

export class FooterColumnDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'عنوان ستون خالی است' })
  @MaxLength(40, { message: 'عنوان ستون حداکثر ۴۰ کاراکتر است' })
  title!: string;

  @IsArray()
  @ArrayMaxSize(12, { message: 'هر ستون حداکثر ۱۲ لینک دارد' })
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links!: FooterLinkDto[];
}

export class FooterSettingsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'حداقل یک ستون لازم است' })
  @ArrayMaxSize(3, { message: 'حداکثر ۳ ستون لینک مجاز است' })
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  columns!: FooterColumnDto[];
}
