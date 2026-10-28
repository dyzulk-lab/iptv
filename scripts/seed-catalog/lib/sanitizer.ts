/** Category and text sanitizer for IPTV Seeder */

/**
 * Clean, sanitize, and format category names.
 * Empty, unrecognized, or anomaly names become 'Undefined'.
 */
export function sanitizeCategory(rawGroup?: string | null): string {
  if (!rawGroup || typeof rawGroup !== 'string') {
    return 'Undefined';
  }

  let cleaned = rawGroup.trim();

  // Replace semicolons with ' & '
  cleaned = cleaned.replace(/;+/g, ' & ');

  // Strip brackets: [ID], (FHD), [4K], [HEVC], etc.
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^\)]*\)/g, ' ');

  // Strip common prefix noise like "ID | ", "ID: ", "US - ", "---"
  cleaned = cleaned.replace(/^[a-zA-Z0-9]{2,4}\s*[:|\-•/]\s*/i, '');
  cleaned = cleaned.replace(/^[\W_]+/g, '');
  cleaned = cleaned.replace(/[\W_]+$/g, '');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (
    !cleaned ||
    cleaned.toLowerCase() === 'uncategorized' ||
    cleaned.toLowerCase() === 'undefined' ||
    cleaned.toLowerCase() === 'none' ||
    cleaned.toLowerCase() === 'unknown'
  ) {
    return 'Undefined';
  }

  return cleaned
    .split(' ')
    .map((word) => {
      if (word === '&') return '&';
      if (word.length <= 1) return word.toUpperCase();
      if (word === word.toUpperCase() && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
