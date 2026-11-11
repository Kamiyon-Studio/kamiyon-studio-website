import { createClient } from "@sanity/client";
import { apiVersion, projectId } from "@/sanity/env";

export async function authorizeMediaUpload(token: string): Promise<"allowed" | "denied" | "unavailable"> {
  try {
    const client = createClient({ projectId, apiVersion, token, useCdn: false, timeout: 10_000 });
    const project = await client.projects.getById(projectId);
    return project.members.some((member) => member.isCurrentUser && !member.isRobot &&
      ["administrator", "editor", "developer"].includes(member.role)) ? "allowed" : "denied";
  } catch (error) {
    const status = error && typeof error === "object" && "statusCode" in error ? error.statusCode : undefined;
    return status === 401 || status === 403 || status === 404 ? "denied" : "unavailable";
  }
}
