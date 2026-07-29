/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Minimal 1×1 PNG (valid IHDR). */
const PNG_1X1 = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
);

describe("POST /api/media/upload", () => {
  const originalSecret = process.env.MEDIA_UPLOAD_SECRET;
  const originalBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  const putMock = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    putMock.mockReset();
    putMock.mockResolvedValue(undefined);
    process.env.MEDIA_UPLOAD_SECRET = "test-media-upload-secret";
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = "https://media.example.com";

    const { setMediaBucketForTests } = await import("@/lib/cms/media-bucket");
    setMediaBucketForTests({
      put: (...args: unknown[]) => putMock(...args),
    });
  });

  afterEach(async () => {
    const { setMediaBucketForTests } = await import("@/lib/cms/media-bucket");
    setMediaBucketForTests(null);

    if (originalSecret === undefined) {
      delete process.env.MEDIA_UPLOAD_SECRET;
    } else {
      process.env.MEDIA_UPLOAD_SECRET = originalSecret;
    }
    if (originalBase === undefined) {
      delete process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = originalBase;
    }
    delete process.env.NEXT_PUBLIC_SANITY_STUDIO_URL;
  });

  async function post(init: { headers?: HeadersInit; body?: BodyInit } = {}) {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/media/upload", {
      method: "POST",
      headers: init.headers,
      body: init.body,
    });
    return POST(request);
  }

  function formWithFile(file: File, fieldName = "file"): FormData {
    const form = new FormData();
    form.append(fieldName, file);
    return form;
  }

  it("returns 401 when unauthorized", async () => {
    const response = await post({
      headers: { Authorization: "Bearer wrong-secret" },
      body: formWithFile(new File([PNG_1X1], "pixel.png", { type: "image/png" })),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Unauthorized",
    });
    expect(putMock).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const response = await post({
      body: formWithFile(new File([PNG_1X1], "pixel.png", { type: "image/png" })),
    });

    expect(response.status).toBe(401);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("returns 400 when file is missing", async () => {
    const empty = new FormData();
    empty.append("note", "no-file");

    const response = await post({
      headers: { Authorization: "Bearer test-media-upload-secret" },
      body: empty,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Missing file",
    });
    expect(putMock).not.toHaveBeenCalled();
  });

  it("puts to R2 and returns mapped success payload", async () => {
    const file = new File([PNG_1X1], "Hero Shot.PNG", { type: "image/png" });

    const response = await post({
      headers: { Authorization: "Bearer test-media-upload-secret" },
      body: formWithFile(file),
    });

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      success: true,
      error: null,
      data: {
        mimeType: "image/png",
        width: 1,
        height: 1,
      },
    });
    expect(typeof json.data.key).toBe("string");
    expect(json.data.key).toMatch(/^uploads\/\d{4}\/\d{2}\/[0-9a-f-]+-hero-shot\.png$/i);
    expect(json.data.url).toBe(`https://media.example.com/${json.data.key}`);

    expect(putMock).toHaveBeenCalledTimes(1);
    const [key, body, options] = putMock.mock.calls[0]!;
    expect(key).toBe(json.data.key);
    expect(body).toBeInstanceOf(Uint8Array);
    expect(options).toEqual({
      httpMetadata: { contentType: "image/png" },
    });
  });

  it("adds CORS headers for hosted Studio origin", async () => {
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL = "https://kamiyon.sanity.studio";
    const file = new File([PNG_1X1], "pixel.png", { type: "image/png" });

    const response = await post({
      headers: {
        Authorization: "Bearer test-media-upload-secret",
        Origin: "https://kamiyon.sanity.studio",
      },
      body: formWithFile(file),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://kamiyon.sanity.studio",
    );
  });

  it("answers OPTIONS preflight for Studio origin", async () => {
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL = "https://kamiyon.sanity.studio";
    const { OPTIONS } = await import("./route");
    const response = await OPTIONS(
      new Request("http://localhost/api/media/upload", {
        method: "OPTIONS",
        headers: { Origin: "https://kamiyon.sanity.studio" },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://kamiyon.sanity.studio",
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
      "POST",
    );
  });

  it("rejects OPTIONS from unknown origins", async () => {
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL = "https://kamiyon.sanity.studio";
    const { OPTIONS } = await import("./route");
    const response = await OPTIONS(
      new Request("http://localhost/api/media/upload", {
        method: "OPTIONS",
        headers: { Origin: "https://evil.example" },
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 415 for SVG uploads", async () => {
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL = "https://kamiyon.sanity.studio";
    const svg = new File(["<svg></svg>"], "evil.svg", {
      type: "image/svg+xml",
    });

    const response = await post({
      headers: {
        Authorization: "Bearer test-media-upload-secret",
        Origin: "https://kamiyon.sanity.studio",
      },
      body: formWithFile(svg),
    });

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Unsupported media type",
    });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://kamiyon.sanity.studio",
    );
    expect(putMock).not.toHaveBeenCalled();
  });

  it("returns 415 for HTML uploads", async () => {
    const html = new File(["<html></html>"], "page.html", {
      type: "text/html",
    });

    const response = await post({
      headers: { Authorization: "Bearer test-media-upload-secret" },
      body: formWithFile(html),
    });

    expect(response.status).toBe(415);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("returns 413 when Content-Length exceeds the size cap before formData", async () => {
    const { MAX_UPLOAD_BYTES } = await import(
      "@/lib/cms/media-upload-policy"
    );
    const formDataSpy = vi.spyOn(Request.prototype, "formData");

    const response = await post({
      headers: {
        Authorization: "Bearer test-media-upload-secret",
        "Content-Length": String(MAX_UPLOAD_BYTES + 1),
        "Content-Type": "multipart/form-data; boundary=----x",
      },
      body: formWithFile(
        new File([PNG_1X1], "pixel.png", { type: "image/png" }),
      ),
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "File too large",
    });
    expect(formDataSpy).not.toHaveBeenCalled();
    expect(putMock).not.toHaveBeenCalled();
    formDataSpy.mockRestore();
  });

  it("returns 413 when file.size exceeds the size cap before arrayBuffer", async () => {
    const { MAX_UPLOAD_BYTES } = await import(
      "@/lib/cms/media-upload-policy"
    );
    const fakeFile = new File([PNG_1X1], "huge.png", { type: "image/png" });
    Object.defineProperty(fakeFile, "size", { value: MAX_UPLOAD_BYTES + 1 });
    const form = new FormData();
    form.append("file", fakeFile);

    const formDataSpy = vi
      .spyOn(Request.prototype, "formData")
      .mockResolvedValue(form);
    const arrayBufferSpy = vi.spyOn(File.prototype, "arrayBuffer");

    const response = await post({
      headers: {
        Authorization: "Bearer test-media-upload-secret",
        "Content-Type": "multipart/form-data; boundary=----test",
      },
      body: "ignored-because-formData-is-mocked",
    });

    expect(response.status).toBe(413);
    expect(arrayBufferSpy).not.toHaveBeenCalled();
    expect(putMock).not.toHaveBeenCalled();
    formDataSpy.mockRestore();
    arrayBufferSpy.mockRestore();
  });

  it("returns 401 before size/MIME checks when unauthorized", async () => {
    const { MAX_UPLOAD_BYTES } = await import(
      "@/lib/cms/media-upload-policy"
    );

    const response = await post({
      headers: {
        Authorization: "Bearer wrong-secret",
        "Content-Length": String(MAX_UPLOAD_BYTES + 1),
      },
      body: formWithFile(
        new File(["<svg></svg>"], "evil.svg", { type: "image/svg+xml" }),
      ),
    });

    expect(response.status).toBe(401);
    expect(putMock).not.toHaveBeenCalled();
  });
});
