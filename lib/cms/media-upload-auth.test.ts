import { beforeEach, expect, it, vi } from "vitest";
const { getById } = vi.hoisted(() => ({ getById: vi.fn() }));
vi.mock("@sanity/client", () => ({ createClient: () => ({ projects: { getById } }) }));
import { authorizeMediaUpload } from "./media-upload-auth";
beforeEach(() => { getById.mockReset(); });
it.each(["administrator", "editor", "developer"])("permits current human %s", async (role) => {
  getById.mockResolvedValue({ members: [{ isCurrentUser: true, isRobot: false, role }] });
  expect(await authorizeMediaUpload("session")).toBe("allowed");
});
it.each([
  { isCurrentUser: true, isRobot: false, role: "viewer" },
  { isCurrentUser: false, isRobot: false, role: "administrator" },
  { isCurrentUser: true, isRobot: true, role: "administrator" },
])("rejects unauthorized project member %#", async (member) => {
  getById.mockResolvedValue({ members: [member] });
  expect(await authorizeMediaUpload("session")).toBe("denied");
});
it("rejects expired credentials", async () => {
  getById.mockRejectedValue({ statusCode: 401 });
  expect(await authorizeMediaUpload("expired")).toBe("denied");
});
it("distinguishes provider outages from denied access", async () => {
  getById.mockRejectedValue(new Error("offline"));
  expect(await authorizeMediaUpload("session")).toBe("unavailable");
});


it("rejects nonmembers and checks only the configured project", async () => {
  getById.mockResolvedValue({ members: [] });
  expect(await authorizeMediaUpload("session")).toBe("denied");
  const { projectId } = await import("@/sanity/env");
  expect(getById).toHaveBeenCalledWith(projectId);
});
it("handles unknown provider rejection values", async () => {
  getById.mockRejectedValue(null);
  expect(await authorizeMediaUpload("session")).toBe("unavailable");
});
