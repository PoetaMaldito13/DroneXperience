import { z } from "zod";
import { schema } from "../config/database.js";
export const idSchema = z
  .string()
  .regex(/^[1-9]\d{0,18}$/, "Identificador inválido.")
  .refine(
    (v) => /^[1-9]\d{0,18}$/.test(v) && BigInt(v) <= 9223372036854775807n,
    "Identificador fuera de rango.",
  );
export const listSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(120).default(""),
  sort: z.string().max(50).optional(),
  direction: z.enum(["asc", "desc"]).default("desc"),
  tipo: z.string().max(30).optional(),
  estado: z.string().max(30).optional(),
  empresa_id: idSchema.optional(),
});
export const table = (name) => `${schema}.${name}`; // Names only come from internal allowlists.
export async function pageQuery(db, select, params, query, columns, fallback) {
  const sort = columns.includes(query.sort) ? query.sort : fallback;
  const count = await db.query(
    `SELECT count(*)::int AS total FROM (${select}) source`,
    params,
  );
  const rows = await db.query(
    `SELECT * FROM (${select}) source ORDER BY "${sort}" ${query.direction === "asc" ? "ASC" : "DESC"} NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, query.limit, query.page * query.limit],
  );
  return {
    items: rows.rows,
    total: count.rows[0].total,
    page: query.page,
    limit: query.limit,
  };
}
