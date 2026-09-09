import { transaction } from "../config/database.js";
import { table } from "../utils/query.js";
import { rentalSelect } from "./rentals.js";
export function dashboardSummary() {
  return transaction(async (db) => {
    await db.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const fleet = (
      await db.query(
        `SELECT estado_actual AS estado,count(*)::int AS total FROM ${table("dron")} GROUP BY estado_actual`,
      )
    ).rows;
    const rentals = (
      await db.query(
        `SELECT estado,count(*)::int AS total FROM (${rentalSelect}) a GROUP BY estado`,
      )
    ).rows;
    const counts = (
      await db.query(
        `SELECT (SELECT count(*)::int FROM ${table("cliente")}) AS clientes,(SELECT count(*)::int FROM ${table("piloto_certificado")}) AS pilotos`,
      )
    ).rows[0];
    const recent = (
      await db.query(`${rentalSelect} ORDER BY a.arriendo_id DESC LIMIT 6`)
    ).rows;
    const top = (
      await db.query(
        `SELECT * FROM ${table("dron")} WHERE veces_arrendado>0 ORDER BY veces_arrendado DESC,dron_id LIMIT 5`,
      )
    ).rows;
    const expiring = (
      await db.query(
        `SELECT c.*,concat_ws(' ',e.nombres,e.apellido_paterno) AS piloto FROM ${table("certificacion")} c JOIN ${table("empleado")} e ON e.empleado_id=c.piloto_id WHERE c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE+30 ORDER BY c.fecha_vencimiento LIMIT 10`,
      )
    ).rows;
    const overdue = (
      await db.query(
        `SELECT * FROM (${rentalSelect}) a WHERE devolucion_programada<LOCALTIMESTAMP AND devolucion_real IS NULL AND estado IN ('CONFIRMADO','EN_VUELO') ORDER BY devolucion_programada LIMIT 10`,
      )
    ).rows;
    const repairs = (
      await db.query(
        `SELECT * FROM ${table("dron")} WHERE estado_actual='REPARACION' OR veces_arrendado>=100 ORDER BY veces_arrendado DESC LIMIT 10`,
      )
    ).rows;
    return {
      fleet,
      rentals,
      counts,
      recent,
      top,
      alerts: { expiring, overdue, repairs },
      generatedAt: new Date().toISOString(),
    };
  });
}
