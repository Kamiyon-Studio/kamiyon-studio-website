export function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

