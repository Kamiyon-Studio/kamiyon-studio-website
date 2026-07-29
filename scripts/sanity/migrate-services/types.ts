/**
 * Types for the five-service CMS migration (WS-C).
 */

export type ServiceInventoryItem = {
  _id: string;
  slug: string;
};

export type CategoryInventoryItem = {
  _id: string;
  slug: string;
};

export type CaseStudyInventoryItem = {
  _id: string;
  slug: string;
  /** Document IDs referenced as services (empty today per Gate 0). */
  serviceRefIds: string[];
};

export type ServiceReferenceHit = {
  fromId: string;
  fromType: string;
  path: string;
  refId: string;
};

export type MigrationInventory = {
  services: ServiceInventoryItem[];
  categories: CategoryInventoryItem[];
  caseStudies: CaseStudyInventoryItem[];
  /** Incoming refs to service documents (any type). */
  serviceReferences: ServiceReferenceHit[];
};

export type PlanOpKind =
  | "keep"
  | "create"
  | "rename"
  | "merge"
  | "delete-service"
  | "delete-category"
  | "reassign-ref"
  | "preserve-case-study";

export type MigrationPlanOp = {
  kind: PlanOpKind;
  /** Human-readable summary for dry-run report */
  summary: string;
  oldSlug?: string;
  newSlug?: string;
  oldId?: string;
  newId?: string;
  fromId?: string;
  path?: string;
};

export type MigrationPlan = {
  ops: MigrationPlanOp[];
  /** True when inventory already matches the five-service end state. */
  alreadyMigrated: boolean;
  unknownSlugs: string[];
};

export type MigrateCliOptions = {
  /** Default true — never mutate unless `--apply`. */
  dryRun: boolean;
  /** Explicit mutation flag. */
  apply: boolean;
  /** Required to `--apply` against a protected / prod-like dataset. */
  allowProd: boolean;
  dataset?: string;
  projectId?: string;
};
