import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  // TiDB Cloud (and most hosted MySQL) require TLS. Enable it by setting
  // DATABASE_SSL=true in the environment. Local MySQL can leave it unset.
  ssl: process.env.DATABASE_SSL === "true"
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
});
const prisma = new PrismaClient({ adapter });

export default prisma;