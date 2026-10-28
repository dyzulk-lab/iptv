/**
 * Utility to generate optimized image proxy URLs with automatic WebP conversion,
 * caching headers, and multi-tier fallbacks.
 */

const PRIMARY_PROXY = (import.meta.env.VITE_IMAGE_PROXY_URL as string | undefined)?.trim();
const FALLBACK_PROXY = 'https://wsrv.nl';

/**
 * Builds a query-param URL for wsrv/Coolify image proxy
 */
function formatProxyUrl(rawUrl: string, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/?url=${encodeURIComponent(rawUrl)}&w=80&h=80&fit=contain&output=webp`;
}

/**
 * Returns the primary proxy URL (e.g. Coolify or fallback to wsrv.nl if not configured)
 */
export function getChannelLogoUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;

  // Preserve local assets, SVG icons, or data URIs
  if (rawUrl.startsWith('/') || rawUrl.startsWith('data:') || rawUrl.endsWith('.svg')) {
    return rawUrl;
  }

  const base = PRIMARY_PROXY || FALLBACK_PROXY;
  return formatProxyUrl(rawUrl, base);
}

/**
 * Returns the fallback proxy URL (wsrv.nl) if the primary proxy is custom and fails
 */
export function getFallbackChannelLogoUrl(rawUrl?: string): string | undefined {
  if (!rawUrl || !PRIMARY_PROXY) return undefined;

  // Don't fallback to wsrv.nl if PRIMARY_PROXY is already wsrv.nl
  if (PRIMARY_PROXY.includes('wsrv.nl')) return undefined;

  return formatProxyUrl(rawUrl, FALLBACK_PROXY);
}
