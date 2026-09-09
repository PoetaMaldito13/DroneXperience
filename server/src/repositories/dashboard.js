import { transaction } from "../config/database.js";
import { table } from "../utils/query.js";
import { rentalSelect } from "./rentals.js";

const droneUsage = `SELECT d.*,
  (SELECT count(*)::int
     FROM ${table("arriendo")} a
    WHERE a.dron_id=d.dron_id
      AND EXISTS (
        SELECT 1
          FROM ${table("historial_estado_arriendo")} h
         WHERE h.arriendo_id=a.arriendo_id
           AND h.tipo_estado IN ('EN_VUELO','FINALIZADO')
      )) AS vuelos_iniciados
 FROM ${table("dron")} d`;

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
        `SELECT * FROM (${droneUsage}) d WHERE vuelos_iniciados>0 ORDER BY vuelos_iniciados DESC,dron_id LIMIT 5`,
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
        `SELECT * FROM (${droneUsage}) d WHERE estado_actual='REPARACION' OR vuelos_iniciados>=100 ORDER BY vuelos_iniciados DESC,dron_id LIMIT 10`,
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
