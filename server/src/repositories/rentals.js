import { pool, transaction } from "../config/database.js";
import { table, pageQuery } from "../utils/query.js";
import { ensure, found } from "../utils/errors.js";
export const rentalSelect = `SELECT a.*, COALESCE(e.razon_social,concat_ws(' ',i.nombres,i.apellido_paterno,i.apellido_materno)) AS cliente,
 d.identificador AS dron, concat_ws(' ',p.nombres,p.apellido_paterno,p.apellido_materno) AS piloto, h.tipo_estado AS estado, o.nombre_completo AS operador
 FROM ${table("arriendo")} a JOIN ${table("cliente")} c USING(cliente_id)
 LEFT JOIN ${table("cliente_individual")} i USING(cliente_id) LEFT JOIN ${table("empresa")} e USING(cliente_id)
 JOIN ${table("dron")} d USING(dron_id) JOIN ${table("empleado")} p ON p.empleado_id=a.piloto_id
 LEFT JOIN ${table("operador_autorizado")} o ON o.operador_id=a.operador_id
 LEFT JOIN LATERAL (SELECT tipo_estado FROM ${table("historial_estado_arriendo")} WHERE arriendo_id=a.arriendo_id ORDER BY secuencia DESC LIMIT 1) h ON true`;
export function listRentals(q, filter = {}) {
  return pageQuery(
    pool,
    `SELECT * FROM (${rentalSelect}) a WHERE concat_ws(' ',arriendo_id,cliente,dron,piloto) ILIKE $1 AND ($2::text IS NULL OR estado=$2) AND ($3::bigint IS NULL OR dron_id=$3) AND ($4::bigint IS NULL OR cliente_id=$4) AND ($5::bigint IS NULL OR piloto_id=$5)`,
    [
      "%" + q.q + "%",
      q.estado || null,
      filter.dron_id || null,
      filter.cliente_id || null,
      filter.piloto_id || null,
    ],
    q,
    [
      "arriendo_id",
      "inicio",
      "devolucion_programada",
      "costo_total",
      "estado",
      "cliente",
      "dron",
      "piloto",
    ],
    "arriendo_id",
  );
}
export async function getRental(id) {
  const row = found(
    (await pool.query(`${rentalSelect} WHERE a.arriendo_id=$1`, [id])).rows[0],
  );
  const results = await Promise.all([
    pool.query(
      `SELECT s.* FROM ${table("arriendo_seguro")} a JOIN ${table("seguro_vuelo")} s USING(seguro_id) WHERE a.arriendo_id=$1`,
      [id],
    ),
    pool.query(
      `SELECT s.*,a.cantidad FROM ${table("arriendo_accesorio")} a JOIN ${table("accesorio")} s USING(accesorio_id) WHERE a.arriendo_id=$1`,
      [id],
    ),
    pool.query(
      `SELECT * FROM ${table("inspeccion_arriendo")} WHERE arriendo_id=$1 ORDER BY momento`,
      [id],
    ),
    pool.query(
      `SELECT * FROM ${table("historial_estado_arriendo")} WHERE arriendo_id=$1 ORDER BY secuencia`,
      [id],
    ),
  ]);
  [row.seguros, row.accesorios, row.inspecciones, row.historial] = results.map(
    (r) => r.rows,
  );
  return row;
}
async function validateAssignment(db, v, id = null) {
  const customer = found(
    (
      await db.query(
        `SELECT * FROM ${table("cliente")} WHERE cliente_id=$1 FOR SHARE`,
        [v.cliente_id],
      )
    ).rows[0],
  );
  const drone = found(
    (
      await db.query(
        `SELECT * FROM ${table("dron")} WHERE dron_id=$1 FOR UPDATE`,
        [v.dron_id],
      )
    ).rows[0],
  );
  ensure(
    drone.estado_actual === "DISPONIBLE",
    "El dron no está disponible. Actualiza la selección.",
    409,
  );
  if (v.operador_id) {
    ensure(
      customer.tipo_cliente === "EMPRESA",
      "Solo las empresas pueden seleccionar un operador autorizado.",
    );
    const operator = (
      await db.query(
        `SELECT * FROM ${table("operador_autorizado")} WHERE operador_id=$1 AND empresa_id=$2 AND fecha_inicio<=$3::date AND (fecha_termino IS NULL OR fecha_termino>=$4::date) FOR SHARE`,
        [v.operador_id, v.cliente_id, v.inicio, v.devolucion_programada],
      )
    ).rows[0];
    ensure(
      operator,
      "El operador no pertenece a la empresa o no está vigente durante el arriendo.",
    );
  }
  found(
    (
      await db.query(
        `SELECT empleado_id FROM ${table("piloto_certificado")} WHERE empleado_id=$1 FOR UPDATE`,
        [v.piloto_id],
      )
    ).rows[0],
  );
  const cert = await db.query(
    `SELECT certificacion_id FROM ${table("certificacion")} WHERE piloto_id=$1 AND fecha_obtencion<=$2::date AND fecha_vencimiento>=$3::date FOR SHARE`,
    [v.piloto_id, v.inicio, v.devolucion_programada],
  );
  ensure(
    cert.rowCount > 0,
    "El piloto necesita una certificación vigente durante todo el arriendo.",
  );
  const overlap = await db.query(
    `SELECT a.arriendo_id FROM ${table("arriendo")} a LEFT JOIN LATERAL (SELECT tipo_estado FROM ${table("historial_estado_arriendo")} h WHERE h.arriendo_id=a.arriendo_id ORDER BY secuencia DESC LIMIT 1) h ON true WHERE (a.dron_id=$1 OR a.piloto_id=$2) AND ($5::bigint IS NULL OR a.arriendo_id<>$5) AND COALESCE(h.tipo_estado,'EN_CREACION') NOT IN ('CANCELADO','FINALIZADO') AND a.inicio<$4::timestamp AND a.devolucion_programada>$3::timestamp`,
    [v.dron_id, v.piloto_id, v.inicio, v.devolucion_programada, id],
  );
  ensure(
    !overlap.rowCount,
    "El dron o el piloto ya tiene un arriendo en ese horario.",
    409,
  );
}
async function saveLinks(db, id, v) {
  await db.query(
    `DELETE FROM ${table("arriendo_seguro")} WHERE arriendo_id=$1`,
    [id],
  );
  await db.query(
    `DELETE FROM ${table("arriendo_accesorio")} WHERE arriendo_id=$1`,
    [id],
  );
  for (const s of v.seguros)
    await db.query(`INSERT INTO ${table("arriendo_seguro")} VALUES ($1,$2)`, [
      id,
      s,
    ]);
  for (const a of v.accesorios)
    await db.query(
      `INSERT INTO ${table("arriendo_accesorio")} VALUES ($1,$2,$3)`,
      [id, a.accesorio_id, a.cantidad],
    );
}
export function saveRental(v, id) {
  return transaction(async (db) => {
    if (id) {
      found(
        (
          await db.query(
            `SELECT arriendo_id FROM ${table("arriendo")} WHERE arriendo_id=$1 FOR UPDATE`,
            [id],
          )
        ).rows[0],
      );
      const state = (
        await db.query(
          `SELECT tipo_estado FROM ${table("historial_estado_arriendo")} WHERE arriendo_id=$1 ORDER BY secuencia DESC LIMIT 1`,
          [id],
        )
      ).rows[0];
      ensure(
        state?.tipo_estado === "EN_CREACION",
        "Solo puedes editar arriendos en creación.",
        409,
      );
    }
    await validateAssignment(db, v, id);
    const fields = [
      "cliente_id",
      "operador_id",
      "dron_id",
      "piloto_id",
      "inicio",
      "devolucion_programada",
      "costo_total",
    ];
    const values = fields.map((k) => v[k] ?? null);
    const row = (
      await db.query(
        id
          ? `UPDATE ${table("arriendo")} SET ${fields.map((k, i) => k + "=$" + (i + 1)).join(",")} WHERE arriendo_id=$8 RETURNING *`
          : `INSERT INTO ${table("arriendo")} (${fields.join(",")}) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        id ? [...values, id] : values,
      )
    ).rows[0];
    await saveLinks(db, row.arriendo_id, v);
    if (!id)
      await db.query(
        `INSERT INTO ${table("historial_estado_arriendo")} (arriendo_id,secuencia,tipo_estado,fecha_inicio) VALUES ($1,1,'EN_CREACION',LOCALTIMESTAMP)`,
        [row.arriendo_id],
      );
    return row;
  });
}
export const transitions = {
  EN_CREACION: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_VUELO", "CANCELADO"],
  EN_VUELO: ["FINALIZADO"],
  FINALIZADO: [],
  CANCELADO: [],
};
export function changeState(id, v) {
  return transaction(async (db) => {
    const rental = found(
      (
        await db.query(
          `SELECT * FROM ${table("arriendo")} WHERE arriendo_id=$1 FOR UPDATE`,
          [id],
        )
      ).rows[0],
    );
    const current = found(
      (
        await db.query(
          `SELECT * FROM ${table("historial_estado_arriendo")} WHERE arriendo_id=$1 ORDER BY secuencia DESC LIMIT 1`,
          [id],
        )
      ).rows[0],
    );
    ensure(
      transitions[current.tipo_estado]?.includes(v.estado),
      "La transición de estado no está permitida.",
      409,
    );
    const drone = found(
      (
        await db.query(
          `SELECT * FROM ${table("dron")} WHERE dron_id=$1 FOR UPDATE`,
          [rental.dron_id],
        )
      ).rows[0],
    );
    if (v.estado === "CONFIRMADO" || v.estado === "EN_VUELO") {
      const links = (
        await db.query(
          `SELECT (SELECT count(*) FROM ${table("arriendo_seguro")} WHERE arriendo_id=$1) AS seguros,(SELECT count(*) FROM ${table("arriendo_accesorio")} WHERE arriendo_id=$1) AS accesorios`,
          [id],
        )
      ).rows[0];
      ensure(
        Number(links.seguros) > 0 && Number(links.accesorios) > 0,
        "El arriendo requiere seguros y accesorios.",
      );
      await validateAssignment(db, rental, id);
    }
    if (v.estado === "EN_VUELO") {
      ensure(
        drone.estado_actual === "DISPONIBLE",
        "El dron no está disponible.",
        409,
      );
      ensure(
        (
          await db.query(
            `SELECT 1 FROM ${table("inspeccion_arriendo")} WHERE arriendo_id=$1 AND momento='INICIAL'`,
            [id],
          )
        ).rowCount,
        "Registra la inspección de entrega antes del vuelo.",
      );
      await db.query(
        `UPDATE ${table("dron")} SET estado_actual='ARRENDADO',veces_arrendado=veces_arrendado+1 WHERE dron_id=$1`,
        [rental.dron_id],
      );
    }
    if (v.estado === "FINALIZADO") {
      ensure(
        v.devolucion_real && Date.parse(v.devolucion_real) >= Date.parse(rental.inicio),
        "Indica una devolución real posterior al inicio.",
      );
      ensure(
        (
          await db.query(
            `SELECT 1 FROM ${table("inspeccion_arriendo")} WHERE arriendo_id=$1 AND momento='FINAL'`,
            [id],
          )
        ).rowCount,
        "Registra la inspección de devolución antes de finalizar.",
      );
      await db.query(
        `UPDATE ${table("arriendo")} SET devolucion_real=$2 WHERE arriendo_id=$1`,
        [id, v.devolucion_real],
      );
      await db.query(
        `UPDATE ${table("dron")} SET estado_actual='DISPONIBLE' WHERE dron_id=$1`,
        [rental.dron_id],
      );
    }
    await db.query(
      `UPDATE ${table("historial_estado_arriendo")} SET fecha_termino=LOCALTIMESTAMP WHERE arriendo_id=$1 AND secuencia=$2`,
      [id, current.secuencia],
    );
    await db.query(
      `INSERT INTO ${table("historial_estado_arriendo")} VALUES ($1,$2,$3,LOCALTIMESTAMP,NULL)`,
      [id, current.secuencia + 1, v.estado],
    );
    return { arriendo_id: id, estado: v.estado };
  });
}
export function saveInspection(id, v) {
  return transaction(async (db) => {
    found(
      (
        await db.query(
          `SELECT arriendo_id FROM ${table("arriendo")} WHERE arriendo_id=$1 FOR UPDATE`,
          [id],
        )
      ).rows[0],
    );
    const state = (
      await db.query(
        `SELECT tipo_estado FROM ${table("historial_estado_arriendo")} WHERE arriendo_id=$1 ORDER BY secuencia DESC LIMIT 1`,
        [id],
      )
    ).rows[0]?.tipo_estado;
    ensure(
      v.momento === "INICIAL"
        ? ["EN_CREACION", "CONFIRMADO"].includes(state)
        : state === "EN_VUELO",
      "La inspección no se puede modificar en el estado actual.",
      409,
    );
    return (
      await db.query(
        `INSERT INTO ${table("inspeccion_arriendo")} VALUES ($1,$2,$3,$4) ON CONFLICT (arriendo_id,momento) DO UPDATE SET estado_carcasa=EXCLUDED.estado_carcasa,estado_aspas=EXCLUDED.estado_aspas RETURNING *`,
        [id, v.momento, v.estado_carcasa, v.estado_aspas],
      )
    ).rows[0];
  });
}
