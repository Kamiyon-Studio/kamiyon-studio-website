/** C0 controls, DEL, and Unicode line/paragraph separators. */
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F\u2028\u2029]/;

export function hasControlCharacters(value: string): boolean {
  return CONTROL_CHAR_RE.test(value);
}

/**
 * Defense-in-depth for email header fields (subject, reply-To).
 * Replaces control chars with spaces, collapses whitespace, trims.
 */
export function sanitizeHeaderValue(value: string): string {
  return value
    .replace(CONTROL_CHAR_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}
