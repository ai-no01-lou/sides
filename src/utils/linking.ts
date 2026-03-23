/**
 * Linking utilities for the sideprojects:// URL scheme.
 *
 * Supported format:
 *   sideprojects://open?url=<encoded-url>
 *
 * Example:
 *   sideprojects://open?url=https%3A%2F%2Fsteamgem.sideprojects.thislou.com
 */

export const SCHEME = 'sideprojects';
export const OPEN_HOST = 'open';

export interface ParsedDeepLink {
  /** The URL to open in the WebView, or null if the deep link is unrecognised. */
  url: string | null;
}

/**
 * Parse a deep-link URL string and return its payload.
 *
 * @param deepLink - A full deep-link string, e.g. "sideprojects://open?url=https%3A%2F%2F..."
 * @returns ParsedDeepLink with url set to the decoded target URL, or null if not recognised.
 */
export function parseDeepLink(deepLink: string | null | undefined): ParsedDeepLink {
  if (!deepLink) {
    return { url: null };
  }

  try {
    const schemePrefix = `${SCHEME}://`;
    if (!deepLink.startsWith(schemePrefix)) {
      return { url: null };
    }

    // Strip scheme and split into path + query
    const rest = deepLink.slice(schemePrefix.length);
    const queryIndex = rest.indexOf('?');
    const host = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
    const queryString = queryIndex === -1 ? '' : rest.slice(queryIndex + 1);

    if (host !== OPEN_HOST) {
      return { url: null };
    }

    // Parse query params manually
    const params: Record<string, string> = {};
    queryString.split('&').forEach((pair) => {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) { return; }
      const key = decodeURIComponent(pair.slice(0, eqIdx));
      const value = decodeURIComponent(pair.slice(eqIdx + 1));
      params[key] = value;
    });

    const targetUrl = params['url'] ?? null;
    return { url: targetUrl };
  } catch {
    return { url: null };
  }
}

/**
 * Build a sideprojects:// deep link for a given URL.
 */
export function buildDeepLink(url: string): string {
  return `${SCHEME}://${OPEN_HOST}?url=${encodeURIComponent(url)}`;
}
