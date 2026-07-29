import type { StructureResolver } from "sanity/structure";

import {
  CANONICAL_SERVICES,
  SANITY_ARCHIVED_TYPES,
  SANITY_SINGLETON_TYPES,
} from "./schemaTypes/constants";

const SINGLETON_TITLES: Record<(typeof SANITY_SINGLETON_TYPES)[number], string> = {
  siteSettings: "Site Settings",
  homePage: "Home Page",
  aboutPage: "About Page",
  contactPage: "Contact Page",
};

/** Active collection types at the root of the desk (services use a fixed list). */
const COLLECTION_TYPES = ["teamMember", "portfolio", "partner", "post"] as const;

const hiddenTypeIds = new Set<string>([
  ...SANITY_SINGLETON_TYPES,
  ...COLLECTION_TYPES,
  ...SANITY_ARCHIVED_TYPES,
  "service",
]);

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SANITY_SINGLETON_TYPES.map((type) =>
        S.listItem()
          .title(SINGLETON_TITLES[type])
          .id(type)
          .child(S.document().schemaType(type).documentId(type)),
      ),
      S.divider(),
      S.listItem()
        .title("Services")
        .id("services")
        .child(
          S.list()
            .title("Services")
            .items(
              CANONICAL_SERVICES.map((service) =>
                S.listItem()
                  .title(`${service.order}. ${service.title}`)
                  .id(service.documentId)
                  .child(
                    S.document()
                      .schemaType("service")
                      .documentId(service.documentId)
                      .title(service.title),
                  ),
              ),
            ),
        ),
      ...COLLECTION_TYPES.map((type) => S.documentTypeListItem(type)),
      S.listItem()
        .title("Archive")
        .id("archive")
        .child(
          S.list()
            .title("Archive")
            .items(SANITY_ARCHIVED_TYPES.map((type) => S.documentTypeListItem(type))),
        ),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !hiddenTypeIds.has(item.getId()!),
      ),
    ]);
