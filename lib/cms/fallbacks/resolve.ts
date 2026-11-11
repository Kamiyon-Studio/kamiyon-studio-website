export function canUseDemoContent(): boolean {
  if (process.env.APP_ENV === "production" || process.env.APP_ENV === "staging") {
    return false;
  }
  if (process.env.NODE_ENV === "production" && process.env.APP_ENV !== "local") return false;
  return process.env.NODE_ENV === "test" || process.env.CMS_DEMO_CONTENT === "true";
}

export function resolveWithFallback<T>(content: T | null | undefined, fallback: T): T {
  if (content != null) return content;
  if (canUseDemoContent()) return fallback;
  if (Array.isArray(fallback)) return [] as T;
  throw new Error("Required website content is not published.");
}
