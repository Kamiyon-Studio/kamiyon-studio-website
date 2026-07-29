import { describe, expect, it, vi } from "vitest";

import type { SanityClient } from "@sanity/client";

import { applyMigrationPlan } from "./apply";
import { serviceDocId } from "./matrix";
import type { MigrationPlan } from "./types";

function mockClient(overrides: Partial<SanityClient> = {}): SanityClient {
  return {
    createOrReplace: vi.fn(async (doc: { _id: string }) => doc),
    delete: vi.fn(async (id: string) => ({ id })),
    getDocument: vi.fn(async () => null),
    patch: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      commit: vi.fn(async () => ({})),
    })),
    ...overrides,
  } as unknown as SanityClient;
}

describe("applyMigrationPlan", () => {
  it("creates merge targets then deletes merge sources", async () => {
    const client = mockClient();
    const plan: MigrationPlan = {
      alreadyMigrated: false,
      unknownSlugs: [],
      ops: [
        {
          kind: "create",
          summary: "create service product-development",
          newSlug: "product-development",
          newId: serviceDocId("product-development"),
        },
        {
          kind: "merge",
          summary: "merge service mvp-development → product-development",
          oldSlug: "mvp-development",
          newSlug: "product-development",
          oldId: serviceDocId("mvp-development"),
          newId: serviceDocId("product-development"),
        },
      ],
    };

    const { applied } = await applyMigrationPlan(plan, {
      client,
      log: () => undefined,
    });

    expect(applied).toBe(2);
    expect(client.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "service-product-development",
        _type: "service",
        title: "Product Development",
      }),
    );
    expect(client.delete).toHaveBeenCalledWith("service-mvp-development");
  });

  it("renames by upserting target and deleting source", async () => {
    const client = mockClient();
    const plan: MigrationPlan = {
      alreadyMigrated: false,
      unknownSlugs: [],
      ops: [
        {
          kind: "rename",
          summary: "rename service ui-ux-design → ui-design",
          oldSlug: "ui-ux-design",
          newSlug: "ui-design",
          oldId: serviceDocId("ui-ux-design"),
          newId: serviceDocId("ui-design"),
        },
      ],
    };

    await applyMigrationPlan(plan, { client, log: () => undefined });

    expect(client.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "service-ui-design" }),
    );
    expect(client.delete).toHaveBeenCalledWith("service-ui-ux-design");
  });

  it("deletes obsolete services and categories", async () => {
    const client = mockClient();
    const plan: MigrationPlan = {
      alreadyMigrated: false,
      unknownSlugs: [],
      ops: [
        {
          kind: "delete-service",
          summary: "delete service consultation",
          oldSlug: "consultation",
          oldId: serviceDocId("consultation"),
        },
        {
          kind: "delete-category",
          summary: "delete serviceCategory software-development",
          oldSlug: "software-development",
          oldId: "serviceCategory-software-development",
        },
      ],
    };

    await applyMigrationPlan(plan, { client, log: () => undefined });

    expect(client.delete).toHaveBeenCalledWith("service-consultation");
    expect(client.delete).toHaveBeenCalledWith(
      "serviceCategory-software-development",
    );
  });

  it("reassigns top-level service refs on documents", async () => {
    const commit = vi.fn(async () => ({}));
    const set = vi.fn().mockReturnValue({ commit });
    const patch = vi.fn().mockReturnValue({ set });

    const client = mockClient({
      getDocument: vi.fn(async () => ({
        _id: "caseStudy-acme",
        service: { _type: "reference", _ref: serviceDocId("web-development") },
      })),
      patch: patch as SanityClient["patch"],
    });

    const plan: MigrationPlan = {
      alreadyMigrated: false,
      unknownSlugs: [],
      ops: [
        {
          kind: "reassign-ref",
          summary: "reassign",
          fromId: "caseStudy-acme",
          path: "service",
          oldId: serviceDocId("web-development"),
          newId: serviceDocId("product-development"),
          oldSlug: "web-development",
          newSlug: "product-development",
        },
      ],
    };

    await applyMigrationPlan(plan, { client, log: () => undefined });

    expect(patch).toHaveBeenCalledWith("caseStudy-acme");
    expect(set).toHaveBeenCalledWith({
      service: {
        _type: "reference",
        _ref: "service-product-development",
      },
    });
    expect(commit).toHaveBeenCalled();
  });
});
