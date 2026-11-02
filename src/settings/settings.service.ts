import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
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

  getFooter(): FooterSettings {
    const row = this.database.connection
      .prepare('SELECT value, updated_at FROM settings WHERE key = ?')
      .get(FOOTER_KEY) as { value: string; updated_at: string } | undefined;

    if (!row) return { columns: DEFAULT_FOOTER, updatedAt: null };
    return {
      columns: (JSON.parse(row.value) as Pick<FooterSettings, 'columns'>).columns,
      updatedAt: row.updated_at,
    };
  }

  updateFooter(dto: FooterSettingsDto): FooterSettings {
    const value = JSON.stringify({
      columns: dto.columns.map(({ title, links }) => ({
        title,
        links: links.map(({ label, href }) => ({ label, href })),
      })),
    });

    this.database.connection
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .run(FOOTER_KEY, value);

    return this.getFooter();
  }
}
