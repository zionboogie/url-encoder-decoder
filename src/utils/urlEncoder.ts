import { EncodeStandard, ParsedUrl, QueryParam, ByteAnalysisItem } from '../types';

/**
 * Strict RFC 3986 percent-encoding
 * Encodes !'()* in addition to standard encodeURIComponent
 */
export function encodeRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Encode string with selected standard
 */
export function encodeUrlString(
  text: string,
  standard: EncodeStandard = 'rfc3986',
  spaceAsPlus = false
): string {
  if (!text) return '';

  let encoded = '';

  switch (standard) {
    case 'rfc3986':
      encoded = encodeRFC3986(text);
      break;
    case 'encodeURIComponent':
      encoded = encodeURIComponent(text);
      break;
    case 'encodeURI':
      encoded = encodeURI(text);
      break;
    case 'formUrlEncoded':
      encoded = encodeRFC3986(text).replace(/%20/g, '+');
      return encoded;
    default:
      encoded = encodeURIComponent(text);
  }

  if (spaceAsPlus) {
    encoded = encoded.replace(/%20/g, '+');
  }

  return encoded;
}

/**
 * Robust decode URL handling plus as space and invalid percent sequences
 */
export function safeDecodeURIComponent(str: string, plusAsSpace = true): string {
  let workStr = str;
  if (plusAsSpace) {
    workStr = workStr.replace(/\+/g, ' ');
  }

  try {
    return decodeURIComponent(workStr);
  } catch {
    // Fallback for malformed URI sequences: decode byte by byte or valid chunks
    return workStr.replace(/(%[0-9a-fA-F]{2})+/g, (match) => {
      try {
        return decodeURIComponent(match);
      } catch {
        return match;
      }
    });
  }
}

/**
 * Decode with optional recursive decoding
 */
export function decodeUrlString(
  text: string,
  plusAsSpace = true,
  recursive = false
): { result: string; rounds: number; hasError: boolean; errorMessage?: string } {
  if (!text) {
    return { result: '', rounds: 0, hasError: false };
  }

  let current = text;
  let rounds = 0;
  const maxRounds = recursive ? 5 : 1;
  let hasError = false;
  let errorMessage: string | undefined;

  while (rounds < maxRounds) {
    try {
      const decoded = safeDecodeURIComponent(current, plusAsSpace);
      if (decoded === current) {
        break;
      }
      current = decoded;
      rounds++;
    } catch (e) {
      hasError = true;
      errorMessage = (e as Error).message || '不正なエンコードシーケンスです';
      break;
    }
  }

  return {
    result: current,
    rounds: Math.max(1, rounds),
    hasError,
    errorMessage,
  };
}

/**
 * Calculate string length and UTF-8 byte length
 */
export function getByteInfo(text: string): { charCount: number; byteCount: number } {
  const charCount = Array.from(text).length;
  const byteCount = new TextEncoder().encode(text).length;
  return { charCount, byteCount };
}

/**
 * Analyze characters and their UTF-8 byte representation
 */
export function analyzeCharacterBytes(text: string): ByteAnalysisItem[] {
  if (!text) return [];

  // Limit analysis to first 300 characters for optimal UI performance
  const chars = Array.from(text).slice(0, 300);
  const encoder = new TextEncoder();

  return chars.map((char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    const codePointHex = 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');
    const utf8Bytes = Array.from(encoder.encode(char));
    const utf8Hex = utf8Bytes.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'));
    const encoded = encodeRFC3986(char);
    const isAscii = codePoint <= 0x7f;
    const isEncoded = encoded !== char;

    let category: ByteAnalysisItem['category'] = 'unreserved';
    if (codePoint <= 0x1f || codePoint === 0x7f) {
      category = 'control';
    } else if (/\s/.test(char)) {
      category = 'whitespace';
    } else if (!isAscii) {
      category = 'multibyte';
    } else if (/[!*'();:@&=+$,/?#\[\]]/.test(char)) {
      category = 'reserved';
    } else {
      category = 'unreserved';
    }

    return {
      char,
      codePoint: codePointHex,
      utf8Hex,
      encoded,
      isAscii,
      isEncoded,
      category,
    };
  });
}

/**
 * Parse a full URL into components and query parameters
 */
export function parseUrlString(inputUrl: string): ParsedUrl {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawUrl: '',
      protocol: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      queryParams: [],
    };
  }

  let urlObj: URL | null = null;
  let isDummyBase = false;

  try {
    urlObj = new URL(trimmed);
  } catch {
    try {
      urlObj = new URL(trimmed, 'https://example.com');
      isDummyBase = true;
    } catch {
      urlObj = null;
    }
  }

  if (!urlObj) {
    return {
      isValid: false,
      rawUrl: trimmed,
      protocol: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      queryParams: [],
    };
  }

  const queryParams: QueryParam[] = [];
  try {
    urlObj.searchParams.forEach((value, key) => {
      queryParams.push({
        id: Math.random().toString(36).substring(2, 9),
        key,
        value,
        enabled: true,
      });
    });
  } catch {
    // Ignore params parse error
  }

  return {
    isValid: !isDummyBase || /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]*)*(\?.*)?$/.test(trimmed),
    rawUrl: trimmed,
    protocol: isDummyBase ? '' : urlObj.protocol,
    username: isDummyBase ? '' : urlObj.username,
    password: isDummyBase ? '' : urlObj.password,
    hostname: isDummyBase ? '' : urlObj.hostname,
    port: isDummyBase ? '' : urlObj.port,
    pathname: urlObj.pathname,
    search: urlObj.search,
    hash: urlObj.hash,
    queryParams,
  };
}

/**
 * Rebuild URL from ParsedUrl state
 */
export function reconstructUrl(parsed: ParsedUrl, encodeParams = true): string {
  const activeParams = parsed.queryParams.filter((p) => p.enabled && p.key.trim() !== '');

  const searchParts: string[] = [];
  activeParams.forEach((param) => {
    const k = encodeParams ? encodeRFC3986(param.key) : param.key;
    const v = encodeParams ? encodeRFC3986(param.value) : param.value;
    searchParts.push(`${k}=${v}`);
  });

  const queryString = searchParts.length > 0 ? '?' + searchParts.join('&') : '';
  const hashString = parsed.hash ? (parsed.hash.startsWith('#') ? parsed.hash : '#' + parsed.hash) : '';

  if (parsed.protocol && parsed.hostname) {
    let auth = '';
    if (parsed.username) {
      auth = parsed.username + (parsed.password ? `:${parsed.password}` : '') + '@';
    }
    const port = parsed.port ? `:${parsed.port}` : '';
    const cleanPath = parsed.pathname.startsWith('/') ? parsed.pathname : '/' + parsed.pathname;
    return `${parsed.protocol}//${auth}${parsed.hostname}${port}${cleanPath}${queryString}${hashString}`;
  }

  const path = parsed.pathname || '';
  return `${path}${queryString}${hashString}`;
}
