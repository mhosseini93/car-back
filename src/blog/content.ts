import sanitizeHtml from 'sanitize-html';

// URL slugs: lowercase latin, digits and Persian letters separated by single hyphens
export const SLUG_PATTERN = /^[a-z0-9؀-ۿ]+(?:-[a-z0-9؀-ۿ]+)*$/;
export const SLUG_MESSAGE =
  'نامک فقط می‌تواند حروف انگلیسی کوچک، حروف فارسی، عدد و خط تیره (بدون فاصله) داشته باشد';

const ALLOWED_REL = new Set(['nofollow', 'noopener', 'noreferrer', 'ugc', 'sponsored']);

// Whitelist matching what the admin rich-text editor can produce
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'code', 'pre',
    'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'hr', 'figure', 'figcaption',
    'table', 'colgroup', 'col', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'sub', 'sup',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'colwidth'],
    td: ['colspan', 'rowspan', 'colwidth'],
    col: ['style'],
    '*': ['style'],
  },
  allowedStyles: {
    '*': { 'text-align': [/^(left|right|center|justify)$/] },
    col: { width: [/^\d+(px|%)$/], 'min-width': [/^\d+px$/] },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // Drop images whose src was stripped as unsafe
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  transformTags: {
    a: (tagName, attribs) => {
      const rel = new Set(
        (attribs.rel ?? '').split(/\s+/).filter((value) => ALLOWED_REL.has(value)),
      );
      if (attribs.target === '_blank') {
        rel.add('noopener');
        rel.add('noreferrer');
      } else {
        delete attribs.target;
      }
      if (rel.size) attribs.rel = [...rel].join(' ');
      else delete attribs.rel;
      return { tagName, attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
  },
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function plainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

// ~200 words per minute for Persian text
export function readingMinutes(html: string): number {
  const words = plainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
