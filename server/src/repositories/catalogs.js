import { pool } from "../config/database.js";
import { table, pageQuery } from "../utils/query.js";
import { found } from "../utils/errors.js";
import {
  employeeSchema,
  operatorSchema,
  certificationSchema,
  partnerSchema,
  insuranceSchema,
  accessorySchema,
  pilotSchema,
} from "../services/validation.js";
const employeeName =
  "concat_ws(' ',e.nombres,e.apellido_paterno,e.apellido_materno)";
export const catalogs = {
  empleados: {
    table: "empleado",
    pk: "empleado_id",
    validator: employeeSchema,
    select: `SELECT e.*, ${employeeName} AS nombre FROM ${table("empleado")} e`,
    search: ["nombre", "run", "cargo"],
  },
  pilotos: {
    table: "piloto_certificado",
    pk: "empleado_id",
    validator: pilotSchema,
    select: `SELECT e.*, ${employeeName} AS nombre, (SELECT count(*)::int FROM ${table("certificacion")} c WHERE c.piloto_id=p.empleado_id) AS certificaciones, (SELECT count(*)::int FROM ${table("certificacion")} c WHERE c.piloto_id=p.empleado_id AND c.fecha_obtencion<=CURRENT_DATE AND c.fecha_vencimiento>=CURRENT_DATE) AS vigentes, (SELECT count(*)::int FROM ${table("arriendo")} a WHERE a.piloto_id=p.empleado_id) AS arriendos FROM ${table("piloto_certificado")} p JOIN ${table("empleado")} e USING(empleado_id)`,
    search: ["nombre", "run", "cargo"],
  },
  operadores: {
    table: "operador_autorizado",
    pk: "operador_id",
    validator: operatorSchema,
    select: `SELECT o.*, e.razon_social AS empresa, CASE WHEN o.fecha_inicio>CURRENT_DATE THEN 'PENDIENTE' WHEN o.fecha_termino<CURRENT_DATE THEN 'EXPIRADO' ELSE 'ACTIVO' END AS estado FROM ${table("operador_autorizado")} o JOIN ${table("empresa")} e ON e.cliente_id=o.empresa_id`,
    search: ["nombre_completo", "run", "empresa"],
  },
  certificaciones: {
    table: "certificacion",
    pk: "certificacion_id",
    validator: certificationSchema,
    select: `SELECT c.*, ${employeeName} AS piloto, CASE WHEN c.fecha_obtencion>CURRENT_DATE THEN 'PENDIENTE' WHEN c.fecha_vencimiento<CURRENT_DATE THEN 'VENCIDA' WHEN c.fecha_vencimiento<=CURRENT_DATE+30 THEN 'POR_VENCER' ELSE 'VIGENTE' END AS estado FROM ${table("certificacion")} c JOIN ${table("empleado")} e ON e.empleado_id=c.piloto_id`,
    search: ["numero_certificado", "tipo", "piloto"],
  },
  aseguradoras: {
    table: "aseguradora",
    pk: "aseguradora_id",
    validator: partnerSchema,
    select: `SELECT a.*, (SELECT count(*)::int FROM ${table("seguro_vuelo")} s WHERE s.aseguradora_id=a.aseguradora_id) AS seguros FROM ${table("aseguradora")} a`,
    search: ["razon_social"],
  },
  proveedores: {
    table: "proveedor",
    pk: "proveedor_id",
    validator: partnerSchema,
    select: `SELECT * FROM ${table("proveedor")}`,
    search: ["razon_social"],
  },
  seguros: {
    table: "seguro_vuelo",
    pk: "seguro_id",
    validator: insuranceSchema,
    select: `SELECT s.*, a.razon_social AS aseguradora FROM ${table("seguro_vuelo")} s JOIN ${table("aseguradora")} a USING(aseguradora_id)`,
    search: ["nombre", "aseguradora"],
  },
  accesorios: {
    table: "accesorio",
    pk: "accesorio_id",
    validator: accessorySchema,
    select: `SELECT a.*, p.razon_social AS proveedor FROM ${table("accesorio")} a JOIN ${table("proveedor")} p USING(proveedor_id)`,
    search: ["nombre", "proveedor"],
  },
};
export function listCatalog(name, q) {
  const c = catalogs[name];
  const byCompany = name === "operadores" && q.empresa_id;
  return pageQuery(
    pool,
    `SELECT * FROM (${c.select}) c WHERE concat_ws(' ',${c.search.join(",")}) ILIKE $1${byCompany ? " AND empresa_id=$2" : ""}`,
    byCompany ? ["%" + q.q + "%", q.empresa_id] : ["%" + q.q + "%"],
    q,
    [c.pk, ...c.search],
    c.pk,
  );
}
export async function getCatalog(name, id) {
  const c = catalogs[name];
  const row = found(
    (await pool.query(`SELECT * FROM (${c.select}) c WHERE ${c.pk}=$1`, [id]))
      .rows[0],
  );
  if (name === "pilotos")
    row.detalle_certificaciones = (
      await pool.query(
        `SELECT * FROM (${catalogs.certificaciones.select}) c WHERE piloto_id=$1 ORDER BY fecha_vencimiento`,
        [id],
      )
    ).rows;
  if (name === "aseguradoras")
    row.detalle_seguros = (
      await pool.query(
        `SELECT * FROM ${table("seguro_vuelo")} WHERE aseguradora_id=$1`,
        [id],
      )
    ).rows;
  return row;
}
export async function saveCatalog(name, body, id) {
  const c = catalogs[name];
  const v = c.validator.parse(body);
  const fields = Object.keys(v);
  const values = Object.values(v);
  const sql = id
    ? `UPDATE ${table(c.table)} SET ${fields.map((k, i) => k + "=$" + (i + 1)).join(",")} WHERE ${c.pk}=$${fields.length + 1} RETURNING *`
    : `INSERT INTO ${table(c.table)} (${fields.join(",")}) VALUES (${fields.map((_, i) => "$" + (i + 1)).join(",")}) RETURNING *`;
  return found((await pool.query(sql, id ? [...values, id] : values)).rows[0]);
}
export async function deleteCatalog(name, id) {
  const c = catalogs[name];
  return found(
    (
      await pool.query(
        `DELETE FROM ${table(c.table)} WHERE ${c.pk}=$1 RETURNING ${c.pk}`,
        [id],
      )
    ).rows[0],
  );
}
