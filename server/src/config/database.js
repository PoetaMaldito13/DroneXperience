import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
// Preserve civil Chilean dates: the source schema uses timestamp WITHOUT time zone.
pg.types.setTypeParser(1114, (value) => value.replace(" ", "T"));
pg.types.setTypeParser(1082, (value) => value);
export const schema = "dronexperience_01_normalizada";
export const pool = new pg.Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || schema,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || undefined,
  max: 10,
  connectionTimeoutMillis: 4000,
  idleTimeoutMillis: 30000,
  options: "-c timezone=America/Santiago -c statement_timeout=15000",
});
pool.on("error", () => {
  process.stderr.write("Conexión PostgreSQL interrumpida.\n");
});
export async function transaction(work, db = pool) {
  const connection = await db.connect();
  try {
    await connection.query("BEGIN");
    const result = await work(connection);
    await connection.query("COMMIT");
    return result;
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }
}
