# Modelo de datos verificado

Fuente: `database/DroneXperience.sql`, copia byte a byte del archivo de Downloads. Database y schema: `dronexperience_01_normalizada`.

Todos los campos son NOT NULL excepto los enumerados como opcionales. Las PK bigint de entidades base usan GENERATED ALWAYS AS IDENTITY. Los subtipos reutilizan la PK de su supertipo; no generan un ID adicional.

| Tabla | PK | FK / relaciones | Campos opcionales |
|---|---|---|---|
| cliente | cliente_id | Supertipo de persona y empresa | Ninguno |
| cliente_individual | cliente_id | cliente_id → cliente | Ninguno |
| empresa | cliente_id | cliente_id → cliente | Ninguno |
| telefono_cliente | cliente_id, telefono | cliente_id → cliente | Ninguno |
| operador_autorizado | operador_id | empresa_id → empresa.cliente_id | fecha_termino |
| empleado | empleado_id | Supertipo de piloto | area_trabajo |
| piloto_certificado | empleado_id | empleado_id → empleado | Ninguno |
| certificacion | certificacion_id | piloto_id → piloto_certificado.empleado_id | Ninguno |
| dron | dron_id | Supertipo recreativo/profesional | anio_fabricacion |
| dron_recreativo | dron_id | dron_id → dron | Ninguno |
| dron_profesional | dron_id | dron_id → dron | Ninguno |
| aseguradora | aseguradora_id | Un asegurador ofrece N seguros | Ninguno |
| seguro_vuelo | seguro_id | aseguradora_id → aseguradora | Ninguno |
| proveedor | proveedor_id | Un proveedor ofrece N accesorios | Ninguno |
| accesorio | accesorio_id | proveedor_id → proveedor | Ninguno |
| arriendo | arriendo_id | cliente_id → cliente; operador_id → operador_autorizado; dron_id → dron; piloto_id → piloto_certificado.empleado_id | operador_id, devolucion_real, costo_total |
| arriendo_seguro | arriendo_id, seguro_id | → arriendo; → seguro_vuelo | Ninguno |
| arriendo_accesorio | arriendo_id, accesorio_id | → arriendo; → accesorio | Ninguno |
| inspeccion_arriendo | arriendo_id, momento | arriendo_id → arriendo | Ninguno |
| historial_estado_arriendo | arriendo_id, secuencia | arriendo_id → arriendo | fecha_termino |

## Campos obligatorios de dominio

- cliente: tipo_cliente (INDIVIDUAL/EMPRESA).
- cliente_individual: run, nombres, apellido_paterno, apellido_materno, direccion, comuna, region.
- empresa: rut, razon_social, direccion, comuna, region.
- telefono_cliente: telefono.
- operador_autorizado: empresa_id, run, nombre_completo, fecha_inicio.
- empleado: run, nombres, apellido_paterno, apellido_materno, direccion, comuna, region, cargo, fecha_contratacion, renta_base, bono_por_vuelo, asignacion_movilizacion, asignacion_colacion.
- piloto_certificado: solo empleado_id.
- certificacion: piloto_id, tipo (VLOS/BVLOS/NOCTURNA), numero_certificado, entidad_emisora, fecha_obtencion, fecha_vencimiento.
- dron: identificador, marca, modelo, color, estado_actual, veces_arrendado, tipo_dron (RECREATIVO/PROFESIONAL).
- dron_recreativo: autonomia_bateria_min.
- dron_profesional: resolucion_camara_mp.
- aseguradora/proveedor: razon_social.
- seguro_vuelo: aseguradora_id, nombre, costo.
- accesorio: proveedor_id, nombre, costo.
- arriendo: cliente_id, dron_id, piloto_id, inicio, devolucion_programada.
- arriendo_seguro: las dos FK.
- arriendo_accesorio: las dos FK y cantidad.
- inspeccion_arriendo: momento (INICIAL/FINAL), estado_carcasa, estado_aspas.
- historial_estado_arriendo: secuencia, tipo_estado, fecha_inicio.

## Constraints y decisiones de aplicación

Identificadores únicos: cliente_individual.run, empresa.rut, empleado.run, dron.identificador y certificacion.numero_certificado.

El SQL impone renta_base >= 0 y fecha_termino de operador >= fecha_inicio cuando existe término. La aplicación valida además fechas de arriendo, cantidades, seguros/accesorios obligatorios, disponibilidad y transiciones. Esas reglas no se implementaron alterando el schema.

Los subtipos, teléfonos, certificaciones, seguros/accesorios asociados, inspecciones e historial tienen las cascadas exactamente definidas en el SQL. Se conservan las restricciones que impiden eliminar drones o catálogos referenciados.

No hay tabla de estados ni campo estado_actual en arriendo: se deriva de la fila con mayor secuencia del historial. El dump no define tarifas de dron, stock de accesorios, usuarios, roles ni snapshot de precios.

