// Usage: npm run catalog:import -- <scraped.json> [--dry-run]
// Imports brands and cars from a JSON file made by the site scraper
// (tools/scraper in the frontend repo) into the catalog tables. Safe to re-run:
// cars are matched by source_url (then by name), brands by name.
//  - New brands/cars are inserted with all their data; cars without a price stay inactive.
//  - Existing rows keep their name, slug, text and SEO; only price, down payment,
//    specs and installments are updated, and empty fields (image, gallery, content, logo) are filled.
// --dry-run runs everything inside a transaction and rolls it back.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import pg from 'pg';
import { sanitizeContent, SLUG_PATTERN } from '../src/blog/content.ts';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment
}

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: { 'dry-run': { type: 'boolean' } },
});
if (positionals.length !== 1) {
  console.error('Usage: npm run catalog:import -- <scraped.json> [--dry-run]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set (see .env.example)');
  process.exit(1);
}

const data = JSON.parse(readFileSync(positionals[0], 'utf8'));
const sourceHost = new URL(data.source.site).hostname.replace(/^www\./, '');

// Product category links under this path are brand tags (WordPress taxonomy on the source site)
const BRAND_TAG_PATH = '/brands/';
// Tags that group cars but aren't brands
const IGNORED_TAGS = ['لیست خودروهای وارداتی'];
// Our brands are the Iranian assemblers/importers; prefer them over the car's make
const ASSEMBLERS = [
  'ایران خودرو', 'سایپا', 'مدیران خودرو', 'کرمان موتور', 'گروه بهمن', 'پارس خودرو', 'راسا موتور',
  'فردا موتورز', 'آرین موتور', 'ماموت خودرو', 'نامی خودرو', 'ایلیا موتور', 'تیگارد موتور',
  'جهان نوین آریا', 'مکث موتور',
];
// Source tag name → name of the same brand in our catalog
const BRAND_ALIASES = { 'گروه بهمن': 'بهمن موتور' };
const FALLBACK_BRAND = { name: 'سایر برندها', slug: 'سایر-برندها' };
// Text about the source company itself (name, phone, registration number); blocks and
// sentences containing it are dropped so their contact details don't appear on our site
const SOURCE_MARKERS = /سپند|sepand|41713|446306/i;
const DEFAULT_YEAR = 1405;
const DEFAULT_DOWN_PERCENT = 50;
const MIN_PRICE = 1_000_000;
// Imported cars go after hand-ordered ones
const IMPORTED_CAR_POSITION = 1000;

// ---------- helpers ----------

const toLatinDigits = (s) =>
  s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const stripPrefix = (s) => s.replace(/^فروش\s+اقساطی\s+/, '').trim();
// Comparable form of a name: no spaces/ZWNJ/dashes, unified Arabic letters and digits
const normalizeName = (s) =>
  toLatinDigits(stripPrefix(s))
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\s‌\-_]+/g, '')
    .toLowerCase();

function truncate(s, max) {
  const text = (s ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > max / 2 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

function slugify(s, max) {
  const slug = toLatinDigits(decodeURIComponent(s))
    .toLowerCase()
    .replace(/^فروش-اقساطی-/, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
  return SLUG_PATTERN.test(slug) ? slug : null;
}

function uniqueSlug(base, taken) {
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}

// Links back to the source site would send visitors there; keep only their text
function cleanHtml(html) {
  const unlinked = (html ?? '').replace(
    new RegExp(`<a\\b[^>]*href="https?://(?:www\\.)?${sourceHost.replace(/\./g, '\\.')}[^"]*"[^>]*>([\\s\\S]*?)</a>`, 'gi'),
    '$1',
  );
  // Only visible text counts: images hosted on the source site are kept
  const mentionsSource = (html) => SOURCE_MARKERS.test(html.replace(/<[^>]+>/g, ''));
  return (
    sanitizeContent(unlinked)
      .replace(/<(p|li|h[2-4]|blockquote|figcaption|tr)\b[^>]*>[\s\S]*?<\/\1>/g, (block) =>
        mentionsSource(block) ? '' : block,
      )
      // Text outside those blocks (the source wraps some of it in divs, which sanitizing removes)
      .replace(/(^|>)([^<]+)(?=<|$)/g, (match, start, text) =>
        SOURCE_MARKERS.test(text) ? `${start}${withoutSourceSentences(text)}` : match,
      )
      .replace(/<(ul|ol|table|thead|tbody|strong|span|b|em)\b[^>]*>\s*<\/\1>/g, '')
      .trim()
  );
}

function withoutSourceSentences(text) {
  return (text ?? '')
    .split(/(?<=[.!؟?])\s+/)
    .filter((sentence) => !SOURCE_MARKERS.test(sentence))
    .join(' ');
}

function yearOf(p) {
  const text = toLatinDigits(`${p.pricing?.title ?? ''} ${p.title ?? ''}`);
  const jalali = text.match(/\b(1[34]\d{2})\b/);
  if (jalali) return Number(jalali[1]);
  const gregorian = text.match(/\b(20\d{2})\b/);
  return gregorian ? Number(gregorian[1]) - 621 : DEFAULT_YEAR;
}

function gearboxOf(p) {
  const spec = p.specs.find((s) => /گیربکس|جعبه\s*دنده/.test(s.label))?.value ?? '';
  const text = `${spec} ${p.title}`;
  const auto = /اتومات|خودکار|cvt|dct|dsg/i.test(text);
  const manual = /دستی|دنده\s*ای|دنده‌ای/.test(text);
  if (auto && manual) return 'دستی / اتوماتیک';
  if (manual) return 'دستی';
  return 'اتوماتیک';
}

function fuelOf(p) {
  const text = `${p.title} ${p.specs.map((s) => `${s.label} ${s.value}`).join(' ')}`;
  if (/هیبرید|hybrid/i.test(text)) return 'هیبرید';
  if (/تمام\s*برقی|الکتریکی|\bev\b/i.test(text)) return 'برقی';
  if (/دوگانه/.test(text)) return 'دوگانه‌سوز';
  if (/دیزل|گازوئیل/.test(text)) return 'دیزل';
  return 'بنزین';
}

function pricingOf(p) {
  const fields = p.pricing?.fields ?? [];
  const toToman = (f) => (f?.amount ? (/ریال/.test(f.value) ? Math.round(f.amount / 10) : f.amount) : null);
  const price = toToman(fields.find((f) => /نقد/.test(f.label)));
  const down = toToman(fields.find((f) => /پیش/.test(f.label)));
  const hasPrice = price != null && price >= MIN_PRICE;
  return {
    price: hasPrice ? price : 0,
    minDownPercent:
      hasPrice && down ? Math.min(90, Math.max(0, Math.round((down / price) * 100))) : DEFAULT_DOWN_PERCENT,
    installments: (p.pricing?.installments ?? [])
      .filter((i) => i.months && i.amount)
      .map((i) => ({ months: i.months, amount: i.amount })),
  };
}

function brandTagOf(p) {
  const tags = p.categories.filter((c) => c.url.includes(BRAND_TAG_PATH) && !IGNORED_TAGS.includes(c.name));
  return ASSEMBLERS.map((name) => tags.find((t) => t.name === name)).find(Boolean) ?? tags[0] ?? null;
}

// Brand landing page on the source site, e.g. /فروش-اقساطی-پژو/
function brandPageOf(tag) {
  const pages = data.categories.filter(
    (c) => c.slug === `فروش-اقساطی-${tag.slug}` || c.title?.startsWith(`فروش اقساطی ${tag.name}`),
  );
  return pages.find((c) => !c.slug.startsWith('کپی-از')) ?? pages[0] ?? null;
}

function brandValues(tag, page) {
  const faqs = (page?.questions ?? [])
    .filter((q) => q.question && q.answers?.[0] && !SOURCE_MARKERS.test(`${q.question} ${q.answers[0]}`))
    .slice(0, 20)
    .map((q) => ({ q: truncate(q.question, 200), a: truncate(q.answers[0], 1000) }));
  const description = withoutSourceSentences(page?.meta.description);
  return {
    name: truncate(tag.name, 80),
    intro: truncate(description || withoutSourceSentences(page?.content?.text), 400),
    content: cleanHtml(page?.content?.html),
    logoUrl: page?.meta.og?.image || null,
    faqs,
    metaTitle: SOURCE_MARKERS.test(page?.meta.title ?? '') ? '' : truncate(page?.meta.title ?? '', 70),
    metaDescription: truncate(description, 170),
  };
}

// ---------- import ----------

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const stats = { brandsCreated: 0, brandsUpdated: 0, carsCreated: 0, carsUpdated: 0, carsSkipped: [] };

try {
  await client.query('BEGIN');

  const { rows: brandRows } = await client.query('SELECT id, slug, name, position FROM brands');
  const brandByName = new Map(brandRows.map((b) => [normalizeName(b.name), b]));
  const brandSlugs = new Set(brandRows.map((b) => b.slug));
  let brandPosition = Math.max(0, ...brandRows.map((b) => b.position));

  async function resolveBrand(tag) {
    const key = normalizeName(BRAND_ALIASES[tag.name] ?? tag.name);
    const existing = brandByName.get(key);
    const values = brandValues(tag, tag === FALLBACK_BRAND ? null : brandPageOf(tag));
    if (existing) {
      if (!existing.filled) {
        // Keep the editor's text and SEO; only fill what is still empty
        const { rowCount } = await client.query(
          `UPDATE brands SET
             logo_url = COALESCE(logo_url, $2),
             intro = CASE WHEN intro = '' THEN $3 ELSE intro END,
             content = CASE WHEN content = '' THEN $4 ELSE content END,
             faqs = CASE WHEN faqs = '[]'::jsonb THEN $5::jsonb ELSE faqs END,
             updated_at = now()
           WHERE id = $1 AND (logo_url IS NULL OR intro = '' OR content = '' OR faqs = '[]'::jsonb)`,
          [existing.id, values.logoUrl, values.intro, values.content, JSON.stringify(values.faqs)],
        );
        if (rowCount) stats.brandsUpdated++;
        existing.filled = true;
      }
      return existing.id;
    }
    const slug = uniqueSlug(slugify(tag.slug, 100) ?? slugify(tag.name, 100) ?? 'brand', brandSlugs);
    const { rows } = await client.query(
      `INSERT INTO brands (slug, name, intro, content, logo_url, faqs, meta_title, meta_description, position)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9) RETURNING id`,
      [slug, values.name, values.intro, values.content, values.logoUrl, JSON.stringify(values.faqs),
        values.metaTitle, values.metaDescription, ++brandPosition],
    );
    const brand = { id: rows[0].id, slug, name: values.name, filled: true };
    brandByName.set(key, brand);
    stats.brandsCreated++;
    return brand.id;
  }

  const { rows: carRows } = await client.query('SELECT id, slug, name, source_url FROM cars');
  const carBySource = new Map(carRows.filter((c) => c.source_url).map((c) => [c.source_url, c]));
  const carByName = new Map(carRows.map((c) => [normalizeName(c.name), c]));
  const carSlugs = new Set(carRows.map((c) => c.slug));
  const matchedIds = new Set();
  // Pages listed as cars that are really listings (same title as a category page)
  const listingTitles = new Set(data.categories.map((c) => c.title));

  for (const p of data.products) {
    if (listingTitles.has(p.title)) {
      stats.carsSkipped.push({ url: p.url, reason: 'listing page' });
      continue;
    }
    const name = truncate(stripPrefix(p.title ?? p.name), 100);
    const { price, minDownPercent, installments } = pricingOf(p);
    const gallery = p.images.map((i) => ({ src: i.src, alt: i.alt ?? name }));
    const content = cleanHtml(p.content?.html);

    let existing = carBySource.get(p.url) ?? carByName.get(normalizeName(name));
    if (existing && matchedIds.has(existing.id)) existing = null;

    if (existing) {
      matchedIds.add(existing.id);
      await client.query(
        `UPDATE cars SET
           is_active = CASE WHEN price < $8 AND $2 >= $8 THEN true ELSE is_active END,
           price = CASE WHEN $2 >= $8 THEN $2 ELSE price END,
           min_down_percent = CASE WHEN $2 >= $8 THEN $3 ELSE min_down_percent END,
           installments = CASE WHEN jsonb_array_length($4::jsonb) > 0 THEN $4::jsonb ELSE installments END,
           specs = CASE WHEN jsonb_array_length($5::jsonb) > 0 THEN $5::jsonb ELSE specs END,
           image_alt = CASE WHEN image_url IS NULL AND $9::text IS NOT NULL THEN $10 ELSE image_alt END,
           image_url = COALESCE(image_url, $9),
           gallery = CASE WHEN gallery = '[]'::jsonb THEN $6::jsonb ELSE gallery END,
           content = CASE WHEN content = '' THEN $7 ELSE content END,
           source_url = $11,
           updated_at = now()
         WHERE id = $1`,
        [existing.id, price, minDownPercent, JSON.stringify(installments), JSON.stringify(p.specs),
          JSON.stringify(gallery), content, MIN_PRICE, gallery[0]?.src ?? null, gallery[0]?.alt ?? name, p.url],
      );
      stats.carsUpdated++;
      continue;
    }

    const brandId = await resolveBrand(brandTagOf(p) ?? FALLBACK_BRAND);
    const slug = uniqueSlug(slugify(p.slug, 120) ?? slugify(name, 120) ?? 'car', carSlugs);
    const { rows } = await client.query(
      `INSERT INTO cars (slug, brand_id, name, year, condition, price, min_down_percent, gearbox, fuel,
         image_url, image_alt, gallery, content, specs, installments, source_url, is_active, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14::jsonb, $15::jsonb, $16, $17, $18)
       RETURNING id`,
      [slug, brandId, name, yearOf(p), /کارکرده/.test(p.title) ? 'used' : 'new', price, minDownPercent,
        gearboxOf(p), fuelOf(p), gallery[0]?.src ?? null, gallery[0]?.alt ?? name, JSON.stringify(gallery),
        content, JSON.stringify(p.specs), JSON.stringify(installments), p.url, price >= MIN_PRICE,
        IMPORTED_CAR_POSITION],
    );
    matchedIds.add(rows[0].id);
    carBySource.set(p.url, { id: rows[0].id });
    stats.carsCreated++;
  }

  await client.query(args['dry-run'] ? 'ROLLBACK' : 'COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  await client.end();
}

const { rows: summary } = await (async () => {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    return await c.query(
      `SELECT count(*)::int AS cars, count(*) FILTER (WHERE is_active)::int AS active,
              (SELECT count(*)::int FROM brands) AS brands FROM cars`,
    );
  } finally {
    await c.end();
  }
})();

console.log(args['dry-run'] ? 'Dry run (rolled back):' : 'Imported:');
console.log(`  brands: ${stats.brandsCreated} created, ${stats.brandsUpdated} filled`);
console.log(`  cars:   ${stats.carsCreated} created, ${stats.carsUpdated} updated, ${stats.carsSkipped.length} skipped`);
for (const s of stats.carsSkipped) console.log(`    skipped ${s.url} (${s.reason})`);
console.log(`  database now: ${summary[0].brands} brands, ${summary[0].cars} cars (${summary[0].active} active)`);
