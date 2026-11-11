import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./serialize-jsonld";

describe("serializeJsonLd", () => {
  it("keeps hostile CMS text inside the structured-data script", () => {
    const value = { name: '</script><img src=x onerror="alert(1)">', text: "A < B" };
    const host = document.createElement("div");
    host.innerHTML = `<script type="application/ld+json">${serializeJsonLd(value)}</script>`;
    expect(host.children).toHaveLength(1);
    expect(host.querySelector("img")).toBeNull();
    expect(JSON.parse(host.firstElementChild!.textContent!)).toEqual(value);
  });
});
