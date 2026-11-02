import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { settings } from '../database/schema.js';
import type { FooterSettingsDto } from './footer-settings.dto.js';

export type FooterSettings = {
  columns: { title: string; links: { label: string; href: string }[] }[];
  updatedAt: string | null;
};

// Used until an admin saves the footer for the first time
const DEFAULT_FOOTER: FooterSettings['columns'] = [
  {
    title: 'برندها',
    links: [
      { label: 'خرید اقساطی ایران‌خودرو', href: '/brands/iran-khodro' },
      { label: 'خرید اقساطی سایپا', href: '/brands/saipa' },
      { label: 'خرید اقساطی مدیران‌خودرو', href: '/brands/modiran-khodro' },
      { label: 'خرید اقساطی کرمان موتور', href: '/brands/kerman-motor' },
      { label: 'خرید اقساطی فونیکس', href: '/brands/fownix' },
      { label: 'خرید اقساطی بهمن موتور', href: '/brands/bahman-motor' },
    ],
  },
  {
    title: 'دسترسی سریع',
    links: [
      { label: 'خودروهای پرمخاطب', href: '/#popular' },
      { label: 'مراحل خرید', href: '/#steps' },
      { label: 'سوالات متداول', href: '/#faq' },
    ],
  },
];

const FOOTER_KEY = 'footer';

@Injectable()
export class SettingsService {
  constructor(private readonly database: DatabaseService) {}

  async getFooter(): Promise<FooterSettings> {
    const [row] = await this.database.db
      .select()
      .from(settings)
      .where(eq(settings.key, FOOTER_KEY))
      .limit(1);

    if (!row) return { columns: DEFAULT_FOOTER, updatedAt: null };
    return {
      columns: (row.value as Pick<FooterSettings, 'columns'>).columns,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateFooter(dto: FooterSettingsDto): Promise<FooterSettings> {
    const value = {
      columns: dto.columns.map(({ title, links }) => ({
        title,
        links: links.map(({ label, href }) => ({ label, href })),
      })),
    };

    await this.database.db
      .insert(settings)
      .values({ key: FOOTER_KEY, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: sql`now()` } });

    return this.getFooter();
  }
}
