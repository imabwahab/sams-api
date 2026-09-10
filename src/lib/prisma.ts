import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

type ConnectionConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
};

const TRUTHY = new Set(["true", "1", "yes", "on"]);

/**
 * Lenient on purpose. A strict `=== "true"` check silently disables TLS for
 * TRUE/True/"true", and a hosted provider then refuses the connection in a way
 * that surfaces only as a pool timeout minutes later.
 */
function isTruthy(value: string) {
  return TRUTHY.has(value.trim().toLowerCase().replace(/^["']|["']$/g, ""));
}

/** Only a local server accepts plaintext; every hosted provider needs TLS. */
function requiresTls(host: string) {
  return !["localhost", "127.0.0.1", "::1", ""].includes(host);
}

function fromDatabaseUrl(raw: string): ConnectionConfig {
  const url = new URL(raw.trim());
  const sslParam = url.searchParams.get("sslaccept") ?? url.searchParams.get("ssl");

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: sslParam
      ? !["disabled", "false", "0"].includes(sslParam.toLowerCase())
      : requiresTls(url.hostname),
  };
}

function fromIndividualVars(): ConnectionConfig {
  const host = process.env.DATABASE_HOST ?? "";

  return {
    host,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
    user: process.env.DATABASE_USER ?? "",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? "",
    // An explicit setting always wins; otherwise infer from the host so a
    // hosted database is never contacted in plaintext by accident.
    ssl:
      process.env.DATABASE_SSL !== undefined
        ? isTruthy(process.env.DATABASE_SSL)
        : requiresTls(host),
  };
}

function resolveConfig(): ConnectionConfig {
  // DATABASE_URL first: it is the single value the Prisma CLI already uses for
  // migrations, so preferring it keeps runtime and migrations on one database
  // instead of letting six separate vars drift apart.
  if (process.env.DATABASE_URL) {
    return fromDatabaseUrl(process.env.DATABASE_URL);
  }

  if (process.env.DATABASE_HOST) {
    return fromIndividualVars();
  }

  throw new Error(
    "Database is not configured. Set DATABASE_URL, or all of " +
      "DATABASE_HOST / DATABASE_PORT / DATABASE_USER / DATABASE_PASSWORD / DATABASE_NAME. " +
      "Without these every request fails with a connection pool timeout."
  );
}

const config = resolveConfig();

// Logged without credentials so a misconfigured deployment is obvious in the
// boot logs rather than only as timeouts on the first database request.
console.log(
  `[db] ${config.host}:${config.port}/${config.database} tls=${config.ssl ? "on" : "off"}`
);

// mariadb defaults acquireTimeout and connectTimeout to 10s. That is not enough
// when the app and the database sit in different regions: establishing a TLS
// connection costs several round trips, and every request that overruns fails
// with "pool timeout ... active=0 idle=0" rather than simply being slow.
const ACQUIRE_TIMEOUT_MS = Number(process.env.DATABASE_ACQUIRE_TIMEOUT_MS ?? 30000);
const CONNECT_TIMEOUT_MS = Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 20000);

const adapter = new PrismaMariaDb({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 5,
  acquireTimeout: ACQUIRE_TIMEOUT_MS,
  connectTimeout: CONNECT_TIMEOUT_MS,
  // Hold one connection open so requests after an idle period do not each pay
  // the full handshake cost.
  minimumIdle: 1,
  ssl: config.ssl ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
