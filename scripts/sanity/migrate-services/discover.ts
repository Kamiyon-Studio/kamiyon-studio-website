/**
 * Read-only discovery of services / categories / case studies / inbound refs.
 */

import { createClient, type SanityClient } from "@sanity/client";

import { apiVersion, dataset, projectId } from "@/sanity/env";

import type { MigrationInventory, ServiceReferenceHit } from "./types";

const SERVICES_QUERY = `*[_type == "service"]{ _id, "slug": slug.current }`;
const CATEGORIES_QUERY = `*[_type == "serviceCategory"]{ _id, "slug": slug.current }`;
/** Gate 0: caseStudy has no service field — serviceRefIds always []. */
const CASE_STUDIES_QUERY = `*[_type == "caseStudy"]{
  _id,
  "slug": slug.current,
  "serviceRefIds": []
}`;

export type DiscoverDeps = {
  client?: SanityClient;
  fetchServices?: () => Promise<Array<{ _id: string; slug: string | null }>>;
  fetchCategories?: () => Promise<Array<{ _id: string; slug: string | null }>>;
  fetchCaseStudies?: () => Promise<
    Array<{ _id: string; slug: string | null; serviceRefIds?: string[] }>
  >;
  fetchServiceReferences?: (
    serviceIds: string[],
  ) => Promise<ServiceReferenceHit[]>;
};

export function createMigrateReadClient(options?: {
  projectId?: string;
  dataset?: string;
  token?: string;
}): SanityClient {
  return createClient({
    projectId: options?.projectId ?? projectId,
    dataset: options?.dataset ?? dataset,
    apiVersion,
    token: options?.token,
    useCdn: false,
    perspective: "raw",
  });
}

function requireSlug(
  row: { _id: string; slug: string | null },
  typeLabel: string,
): { _id: string; slug: string } {
  if (!row.slug || typeof row.slug !== "string") {
    throw new Error(
      `WS-C blocked: ${typeLabel} ${row._id} has missing slug.current — fix in Studio before migrating.`,
    );
  }
  return { _id: row._id, slug: row.slug };
}

async function defaultFetchServiceReferences(
  client: SanityClient,
  serviceIds: string[],
): Promise<ServiceReferenceHit[]> {
  if (serviceIds.length === 0) {
    return [];
  }

  const docs = await client.fetch<Array<{ fromId: string; fromType: string }>>(
    `*[references($ids) && !(_id in $ids)]{ "fromId": _id, "fromType": _type }`,
    { ids: serviceIds },
  );

  const hits: ServiceReferenceHit[] = [];
  for (const doc of docs) {
    for (const id of serviceIds) {
      const references = await client.fetch<boolean>(
        `count(*[_id == $fromId && references($id)]) > 0`,
        { fromId: doc.fromId, id },
      );
      if (references) {
        hits.push({
          fromId: doc.fromId,
          fromType: doc.fromType,
          path: "references",
          refId: id,
        });
      }
    }
  }
  return hits;
}

/**
 * Discover live inventory. Prefer injectable fetchers in unit tests.
 */
export async function discoverInventory(
  deps: DiscoverDeps = {},
): Promise<MigrationInventory> {
  const client = deps.client;

  const fetchServices =
    deps.fetchServices ??
    (async () => {
      if (!client) {
        throw new Error(
          "discoverInventory requires a Sanity client or fetchServices",
        );
      }
      return client.fetch<Array<{ _id: string; slug: string | null }>>(
        SERVICES_QUERY,
      );
    });

  const fetchCategories =
    deps.fetchCategories ??
    (async () => {
      if (!client) {
        throw new Error(
          "discoverInventory requires a Sanity client or fetchCategories",
        );
      }
      return client.fetch<Array<{ _id: string; slug: string | null }>>(
        CATEGORIES_QUERY,
      );
    });

  const fetchCaseStudies =
    deps.fetchCaseStudies ??
    (async () => {
      if (!client) {
        throw new Error(
          "discoverInventory requires a Sanity client or fetchCaseStudies",
        );
      }
      return client.fetch<
        Array<{ _id: string; slug: string | null; serviceRefIds?: string[] }>
      >(CASE_STUDIES_QUERY);
    });

  const servicesRaw = await fetchServices();
  const categoriesRaw = await fetchCategories();
  const caseStudiesRaw = await fetchCaseStudies();

  const services = servicesRaw.map((row) => requireSlug(row, "service"));
  const categories = categoriesRaw.map((row) =>
    requireSlug(row, "serviceCategory"),
  );
  const caseStudies = caseStudiesRaw.map((row) => {
    const base = requireSlug(row, "caseStudy");
    return {
      ...base,
      serviceRefIds: [...(row.serviceRefIds ?? [])],
    };
  });

  const serviceIds = services.map((s) => s._id);

  const fetchServiceReferences =
    deps.fetchServiceReferences ??
    (async (ids: string[]) => {
      if (!client) {
        return [];
      }
      return defaultFetchServiceReferences(client, ids);
    });

  const serviceReferences = await fetchServiceReferences(serviceIds);

  return {
    services,
    categories,
    caseStudies,
    serviceReferences,
  };
}
