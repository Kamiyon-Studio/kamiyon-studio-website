/**
 * One-shot inventory dump for WS-C conflict diagnosis (read-only).
 * Run: pnpm tsx scripts/sanity/migrate-services/inspect-inventory.ts
 */
import { loadEnvFiles } from "../seed/load-env";
import { resolveWriteToken } from "../seed/client";
import { createMigrateReadClient, discoverInventory } from "./discover";
import { KNOWN_SERVICE_SLUGS } from "./matrix";

async function main(): Promise<void> {
  loadEnvFiles();
  const client = createMigrateReadClient({
    token: resolveWriteToken(),
  });
  const inv = await discoverInventory({ client });

  const unknown = inv.services
    .filter((s) => !KNOWN_SERVICE_SLUGS.has(s.slug))
    .map((s) => s.slug)
    .sort();

  console.log(
    JSON.stringify(
      {
        services: inv.services
          .map((s) => ({ slug: s.slug, _id: s._id }))
          .sort((a, b) => a.slug.localeCompare(b.slug)),
        categories: inv.categories
          .map((c) => ({ slug: c.slug, _id: c._id }))
          .sort((a, b) => a.slug.localeCompare(b.slug)),
        caseStudies: inv.caseStudies.map((cs) => ({
          slug: cs.slug,
          _id: cs._id,
          serviceRefIds: cs.serviceRefIds,
        })),
        serviceReferenceCount: inv.serviceReferences.length,
        serviceReferences: inv.serviceReferences,
        unknownSlugs: unknown,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
