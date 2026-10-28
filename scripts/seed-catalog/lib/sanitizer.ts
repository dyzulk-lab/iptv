/** Category and text sanitizer for IPTV Seeder */

/**
 * Clean a single tag fragment into Title Case.
 * Returns null if the fragment is empty or a known "undefined" alias.
 */
function cleanFragment(raw: string): string | null {
  let cleaned = raw.trim();

  // Strip brackets: [ID], (FHD), [4K], [HEVC], etc.
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^\)]*\)/g, ' ');

  // Strip common prefix noise like "ID | ", "ID: ", "US - ", "---"
  cleaned = cleaned.replace(/^[a-zA-Z0-9]{2,4}\s*[:|\\•\/-]\s*/i, '');
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
    return null;
  }

  // Title Case
  return cleaned
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase();
      if (word === word.toUpperCase() && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Split a raw group-title string into an array of unique, atomic category names.
 * Multi-tag separators (`;`, `,`, `/`, `|`, `&`) are used to split.
 * Returns `['Undefined']` when no valid tags can be extracted.
 */
export function sanitizeCategories(rawGroup?: string | null): string[] {
  if (!rawGroup || typeof rawGroup !== 'string' || !rawGroup.trim()) {
    return ['Undefined'];
  }

  // Split on common multi-tag separators
  const fragments = rawGroup.split(/[;,/|&]+/);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const frag of fragments) {
    const cleaned = cleanFragment(frag);
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      result.push(cleaned);
    }
  }

  return result.length > 0 ? result : ['Undefined'];
}

/**
 * Legacy single-category helper – returns the first atomic category.
 * Kept for backward compatibility (feature disabled but not deleted).
 */
export function sanitizeCategory(rawGroup?: string | null): string {
  return sanitizeCategories(rawGroup)[0];
}
