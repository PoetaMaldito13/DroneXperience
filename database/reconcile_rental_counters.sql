-- DroneXperience
-- Reconciliacion del contador almacenado dron.veces_arrendado
-- con la historia operacional real.
--
-- Un vuelo se considera iniciado cuando el arriendo alcanzo EN_VUELO
-- o FINALIZADO al menos una vez.

BEGIN;

UPDATE dronexperience_01_normalizada.dron d
SET veces_arrendado = (
  SELECT count(*)::int
  FROM dronexperience_01_normalizada.arriendo a
  WHERE a.dron_id = d.dron_id
    AND EXISTS (
      SELECT 1
      FROM dronexperience_01_normalizada.historial_estado_arriendo h
      WHERE h.arriendo_id = a.arriendo_id
        AND h.tipo_estado IN ('EN_VUELO', 'FINALIZADO')
    )
);

COMMIT;

-- Debe devolver 0 filas si el contador almacenado es coherente.
SELECT
  d.dron_id,
  d.identificador,
  d.veces_arrendado AS contador_almacenado,
  (
    SELECT count(*)::int
    FROM dronexperience_01_normalizada.arriendo a
    WHERE a.dron_id = d.dron_id
      AND EXISTS (
        SELECT 1
        FROM dronexperience_01_normalizada.historial_estado_arriendo h
        WHERE h.arriendo_id = a.arriendo_id
          AND h.tipo_estado IN ('EN_VUELO', 'FINALIZADO')
      )
  ) AS vuelos_reales
FROM dronexperience_01_normalizada.dron d
WHERE d.veces_arrendado <> (
  SELECT count(*)::int
  FROM dronexperience_01_normalizada.arriendo a
  WHERE a.dron_id = d.dron_id
    AND EXISTS (
      SELECT 1
      FROM dronexperience_01_normalizada.historial_estado_arriendo h
      WHERE h.arriendo_id = a.arriendo_id
        AND h.tipo_estado IN ('EN_VUELO', 'FINALIZADO')
    )
)
ORDER BY d.dron_id;
