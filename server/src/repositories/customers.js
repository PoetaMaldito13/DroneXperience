import { pool, transaction } from "../config/database.js";
import { table, pageQuery } from "../utils/query.js";
import { found, ensure } from "../utils/errors.js";
export const customerSelect = `SELECT c.cliente_id,c.tipo_cliente,i.run,i.nombres,i.apellido_paterno,i.apellido_materno,e.rut,e.razon_social,
 COALESCE(e.razon_social,concat_ws(' ',i.nombres,i.apellido_paterno,i.apellido_materno)) AS nombre,
 COALESCE(i.direccion,e.direccion) AS direccion,COALESCE(i.comuna,e.comuna) AS comuna,COALESCE(i.region,e.region) AS region,
 COALESCE((SELECT json_agg(t.telefono ORDER BY t.telefono) FROM ${table("telefono_cliente")} t WHERE t.cliente_id=c.cliente_id),'[]') AS telefonos
 FROM ${table("cliente")} c LEFT JOIN ${table("cliente_individual")} i USING(cliente_id) LEFT JOIN ${table("empresa")} e USING(cliente_id)`;
export function listCustomers(q, type) {
  return pageQuery(
    pool,
    `SELECT * FROM (${customerSelect}) c WHERE concat_ws(' ',nombre,run,rut,comuna) ILIKE $1 AND ($2::text IS NULL OR tipo_cliente=$2)`,
    ["%" + q.q + "%", type || q.tipo || null],
    q,
    ["cliente_id", "nombre", "tipo_cliente", "comuna"],
    "cliente_id",
  );
}
export async function getCustomer(id) {
  const row = found(
    (await pool.query(`${customerSelect} WHERE c.cliente_id=$1`, [id])).rows[0],
  );
  row.operadores = (
    await pool.query(
      `SELECT * FROM ${table("operador_autorizado")} WHERE empresa_id=$1 ORDER BY nombre_completo`,
      [id],
    )
  ).rows;
  return row;
}
export function saveCustomer(v, id) {
  return transaction(async (db) => {
    let customer;
    if (id) {
      customer = found(
        (
          await db.query(
            `SELECT * FROM ${table("cliente")} WHERE cliente_id=$1 FOR UPDATE`,
            [id],
          )
        ).rows[0],
      );
      ensure(
        customer.tipo_cliente === v.tipo_cliente,
        "No es posible cambiar el tipo de un cliente existente.",
      );
    } else
      customer = (
        await db.query(
          `INSERT INTO ${table("cliente")} (tipo_cliente) VALUES ($1) RETURNING *`,
          [v.tipo_cliente],
        )
      ).rows[0];
    const entity =
      v.tipo_cliente === "INDIVIDUAL" ? "cliente_individual" : "empresa";
    const fields =
      v.tipo_cliente === "INDIVIDUAL"
        ? [
            "run",
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "direccion",
            "comuna",
            "region",
          ]
        : ["rut", "razon_social", "direccion", "comuna", "region"];
    await db.query(
      `INSERT INTO ${table(entity)} (cliente_id,${fields.join(",")}) VALUES ($1,${fields.map((_, i) => "$" + (i + 2)).join(",")}) ON CONFLICT (cliente_id) DO UPDATE SET ${fields.map((k) => k + "=EXCLUDED." + k).join(",")}`,
      [customer.cliente_id, ...fields.map((k) => v[k])],
    );
    await db.query(
      `DELETE FROM ${table("telefono_cliente")} WHERE cliente_id=$1`,
      [customer.cliente_id],
    );
    for (const phone of v.telefonos)
      await db.query(
        `INSERT INTO ${table("telefono_cliente")} VALUES ($1,$2)`,
        [customer.cliente_id, phone],
      );
    return customer;
  });
}
