import { expect, it } from "vitest";
import { BodyTooLargeError, readBoundedBody } from "./read-bounded-body";

it("reads a body within its byte budget", async () => {
  const bytes = await readBoundedBody(new Request("https://example.test", { method: "POST", body: "hello" }), 5);
  expect(new TextDecoder().decode(bytes)).toBe("hello");
});
it("rejects actual oversized bytes without a Content-Length", async () => {
  await expect(readBoundedBody(new Request("https://example.test", { method: "POST", body: "hello" }), 4)).rejects.toBeInstanceOf(BodyTooLargeError);
});
it("rejects an oversized declared length", async () => {
  await expect(readBoundedBody(new Request("https://example.test", { method: "POST", body: "a", headers: { "content-length": "500" } }), 4)).rejects.toBeInstanceOf(BodyTooLargeError);
});
