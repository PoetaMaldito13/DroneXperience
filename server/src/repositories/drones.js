import { pool, transaction } from "../config/database.js";
import { table, pageQuery } from "../utils/query.js";
import { ensure, found } from "../utils/errors.js";

const select = `SELECT d.*, r.autonomia_bateria_min, p.resolucion_camara_mp,
  (SELECT count(*)::int FROM ${table("arriendo")} a WHERE a.dron_id=d.dron_id) AS arriendos_registrados,
  (SELECT count(*)::int
     FROM ${table("arriendo")} a
    WHERE a.dron_id=d.dron_id
      AND EXISTS (
        SELECT 1
          FROM ${table("historial_estado_arriendo")} h
         WHERE h.arriendo_id=a.arriendo_id
           AND h.tipo_estado IN ('EN_VUELO','FINALIZADO')
      )) AS vuelos_iniciados
 FROM ${table("dron")} d
 LEFT JOIN ${table("dron_recreativo")} r USING (dron_id)
 LEFT JOIN ${table("dron_profesional")} p USING (dron_id)`;

export function listDrones(q) {
  return pageQuery(
    pool,
    `${select} WHERE concat_ws(' ',d.identificador,d.marca,d.modelo) ILIKE $1 AND ($2::text IS NULL OR d.tipo_dron=$2) AND ($3::text IS NULL OR d.estado_actual=$3)`,
    ["%" + q.q + "%", q.tipo || null, q.estado || null],
    q,
    [
      "dron_id",
      "identificador",
      "marca",
      "modelo",
      "tipo_dron",
      "estado_actual",
      "anio_fabricacion",
      "arriendos_registrados",
      "vuelos_iniciados",
    ],
    "dron_id",
  );
}

export async function getDrone(id) {
  return found(
    (await pool.query(select + " WHERE d.dron_id=$1", [id])).rows[0],
  );
}

export async function saveDrone(v, id) {
  return transaction(async (db) => {
    if (id) {
      const current = found(
        (
          await db.query(
            `SELECT * FROM ${table("dron")} WHERE dron_id=$1 FOR UPDATE`,
            [id],
          )
        ).rows[0],
      );
      ensure(
        current.estado_actual === v.estado_actual ||
          (current.estado_actual !== "ARRENDADO" &&
            v.estado_actual !== "ARRENDADO"),
        "El estado Arrendado se administra desde los arriendos.",
      );
    } else
      ensure(
        v.estado_actual !== "ARRENDADO",
        "Un dron nuevo debe estar disponible, en mantenimiento o en reparación.",
      );
    const fields = [
      "identificador",
      "marca",
      "modelo",
      "anio_fabricacion",
      "color",
      "estado_actual",
      "tipo_dron",
    ];
    const values = fields.map((k) => v[k] ?? null);
    const result = id
      ? await db.query(
          `UPDATE ${table("dron")} SET ${fields.map((k, i) => k + "=$" + (i + 1)).join(",")} WHERE dron_id=$8 RETURNING *`,
          [...values, id],
        )
      : await db.query(
          `INSERT INTO ${table("dron")} (${fields.join(",")}) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          values,
        );
    const row = found(result.rows[0]);
    await db.query(`DELETE FROM ${table("dron_recreativo")} WHERE dron_id=$1`, [
      row.dron_id,
    ]);
    await db.query(
      `DELETE FROM ${table("dron_profesional")} WHERE dron_id=$1`,
      [row.dron_id],
    );
    if (v.tipo_dron === "RECREATIVO")
      await db.query(`INSERT INTO ${table("dron_recreativo")} VALUES ($1,$2)`, [
        row.dron_id,
        v.autonomia_bateria_min,
      ]);
    else
      await db.query(
        `INSERT INTO ${table("dron_profesional")} VALUES ($1,$2)`,
        [row.dron_id, v.resolucion_camara_mp],
      );
    return row;
  });
}

export async function deleteDrone(id) {
  return transaction(async (db) =>
    found(
      (
        await db.query(
          `DELETE FROM ${table("dron")} WHERE dron_id=$1 RETURNING dron_id`,
          [id],
        )
      ).rows[0],
    ),
  );
}
