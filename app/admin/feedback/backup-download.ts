export const REQUIRED_BACKUP_TABLES = [
  "profiles",
  "game_sessions",
  "round_attempts",
  "feedback",
  "rate_limits",
  "operational_metrics",
] as const;

type BackupCollection = {
  id: string;
  version: string;
  label: string;
};

export type VerifiedPrivateBackup = {
  format: "paper-picture-private-backup";
  formatVersion: 1;
  generatedAt: string;
  collections: BackupCollection[];
  tables: Record<string, unknown[]>;
};

export function verifyPrivateBackup(value: unknown): VerifiedPrivateBackup {
  if (!isRecord(value) || value.format !== "paper-picture-private-backup" || value.formatVersion !== 1) {
    throw new Error("The server returned an unrecognized backup format.");
  }
  if (typeof value.generatedAt !== "string" || Number.isNaN(Date.parse(value.generatedAt))) {
    throw new Error("The backup does not contain a valid generation time.");
  }
  if (!Array.isArray(value.collections) || value.collections.length === 0 || !value.collections.every(isCollection)) {
    throw new Error("The backup is missing its collection manifest.");
  }
  if (!isRecord(value.tables)) {
    throw new Error("The backup is missing its table data.");
  }
  const tables = value.tables;
  const missing = REQUIRED_BACKUP_TABLES.filter((table) => !Array.isArray(tables[table]));
  if (missing.length) {
    throw new Error(`The backup is incomplete. Missing tables: ${missing.join(", ")}.`);
  }
  return value as VerifiedPrivateBackup;
}

export function privateBackupFilename(generatedAt: string) {
  const timestamp = generatedAt.replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
  return `paper-picture-private-backup-${timestamp}.json`;
}

function isCollection(value: unknown): value is BackupCollection {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.version === "string"
    && typeof value.label === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
