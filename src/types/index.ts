export type EncodeStandard = 
  | 'rfc3986' // encodeURIComponent + ! ' ( ) *
  | 'encodeURIComponent' // Standard component
  | 'encodeURI' // Preserves full URL structure (: / ? # & =)
  | 'formUrlEncoded'; // application/x-www-form-urlencoded (spaces as +)

export type ToolTab = 'studio' | 'inspector' | 'batch' | 'cheatsheet';

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParsedUrl {
  isValid: boolean;
  rawUrl: string;
  protocol: string;
  username?: string;
  password?: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  queryParams: QueryParam[];
}

export interface ByteAnalysisItem {
  char: string;
  codePoint: string;
  utf8Hex: string[];
  encoded: string;
  isAscii: boolean;
  isEncoded: boolean;
  category: 'unreserved' | 'reserved' | 'multibyte' | 'whitespace' | 'control';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'encode' | 'decode';
  standard: EncodeStandard;
  input: string;
  output: string;
  isFavorite?: boolean;
}
