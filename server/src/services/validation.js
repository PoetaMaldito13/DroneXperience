import { z } from "zod";
import { idSchema } from "../utils/query.js";
const text = (max) =>
  z
    .string()
    .min(1, "Campo obligatorio.")
    .max(max)
    .refine((value) => value.trim().length > 0, "Campo obligatorio.");
const money = z.coerce
  .number()
  .finite()
  .min(0)
  .max(9999999999.99)
  .multipleOf(0.01);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida.")
  .refine(
    (v) =>
      !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    "Fecha inválida.",
  );
const datetime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/,
    "Fecha y hora inválidas.",
  )
  .refine(
    (v) =>
      date.safeParse(v.slice(0, 10)).success &&
      Number(v.slice(11, 13)) < 24 &&
      Number(v.slice(14, 16)) < 60 &&
      (!v.slice(17, 19) || Number(v.slice(17, 19)) < 60),
    "Fecha y hora inválidas.",
  );
export const droneSchema = z
  .object({
    identificador: text(40),
    marca: text(80),
    modelo: text(80),
    anio_fabricacion: z.preprocess(
      (v) => (v === "" ? null : v),
      z.coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .nullable()
        .optional(),
    ),
    color: text(60),
    estado_actual: z.enum([
      "DISPONIBLE",
      "ARRENDADO",
      "MANTENIMIENTO",
      "REPARACION",
    ]),
    tipo_dron: z.enum(["RECREATIVO", "PROFESIONAL"]),
    autonomia_bateria_min: z.coerce.number().int().min(1).max(32767).optional(),
    resolucion_camara_mp: z.coerce
      .number()
      .positive()
      .max(9999.99)
      .multipleOf(0.01)
      .optional(),
  })
  .superRefine((v, c) => {
    const key =
      v.tipo_dron === "RECREATIVO"
        ? "autonomia_bateria_min"
        : "resolucion_camara_mp";
    if (!v[key])
      c.addIssue({
        code: "custom",
        path: [key],
        message: "Completa la característica del tipo de dron.",
      });
  });
const address = { direccion: text(200), comuna: text(100), region: text(100) };
const person = {
  run: text(12),
  nombres: text(100),
  apellido_paterno: text(80),
  apellido_materno: text(80),
};
const phones = z
  .array(text(30))
  .max(20)
  .default([])
  .refine((v) => new Set(v).size === v.length, "No repitas teléfonos.");
export const customerSchema = z.discriminatedUnion("tipo_cliente", [
  z.object({
    tipo_cliente: z.literal("INDIVIDUAL"),
    ...person,
    ...address,
    telefonos: phones,
  }),
  z.object({
    tipo_cliente: z.literal("EMPRESA"),
    rut: text(12),
    razon_social: text(160),
    ...address,
    telefonos: phones,
  }),
]);
export const employeeSchema = z.object({
  ...person,
  ...address,
  cargo: text(120),
  area_trabajo: z.string().max(120).nullable().optional(),
  fecha_contratacion: date,
  renta_base: money,
  bono_por_vuelo: money.default(0),
  asignacion_movilizacion: money.default(0),
  asignacion_colacion: money.default(0),
});
export const operatorSchema = z
  .object({
    empresa_id: idSchema,
    run: text(12),
    nombre_completo: text(180),
    fecha_inicio: date,
    fecha_termino: z.preprocess(
      (v) => (v === "" ? null : v),
      date.nullable().optional(),
    ),
  })
  .refine((v) => !v.fecha_termino || v.fecha_termino >= v.fecha_inicio, {
    path: ["fecha_termino"],
    message: "El término debe ser posterior o igual al inicio.",
  });
export const certificationSchema = z
  .object({
    piloto_id: idSchema,
    tipo: z.enum(["VLOS", "BVLOS", "NOCTURNA"]),
    numero_certificado: text(60),
    entidad_emisora: text(120),
    fecha_obtencion: date,
    fecha_vencimiento: date,
  })
  .refine((v) => v.fecha_vencimiento >= v.fecha_obtencion, {
    path: ["fecha_vencimiento"],
    message: "El vencimiento debe ser posterior o igual a la obtención.",
  });
export const partnerSchema = z.object({ razon_social: text(160) });
export const insuranceSchema = z.object({
  aseguradora_id: idSchema,
  nombre: text(120),
  costo: money,
});
export const accessorySchema = z.object({
  proveedor_id: idSchema,
  nombre: text(120),
  costo: money,
});
export const pilotSchema = z.object({ empleado_id: idSchema });
export const rentalSchema = z
  .object({
    cliente_id: idSchema,
    operador_id: z.preprocess(
      (v) => (v === "" ? null : v),
      idSchema.nullable().optional(),
    ),
    dron_id: idSchema,
    piloto_id: idSchema,
    inicio: datetime,
    devolucion_programada: datetime,
    costo_total: z.preprocess(
      (v) => (v === "" ? null : v),
      money.nullable().optional(),
    ),
    seguros: z
      .array(idSchema)
      .min(1, "Selecciona al menos un seguro.")
      .max(100),
    accesorios: z
      .array(
        z.object({
          accesorio_id: idSchema,
          cantidad: z.coerce.number().int().min(1).max(2147483647),
        }),
      )
      .min(1, "Selecciona al menos un accesorio.")
      .max(100),
  })
  .refine((v) => Date.parse(v.devolucion_programada) > Date.parse(v.inicio), {
    path: ["devolucion_programada"],
    message: "La devolución debe ser posterior al inicio.",
  })
  .refine((v) => new Set(v.seguros).size === v.seguros.length, {
    path: ["seguros"],
    message: "No repitas seguros.",
  })
  .refine(
    (v) =>
      new Set(v.accesorios.map((a) => a.accesorio_id)).size ===
      v.accesorios.length,
    { path: ["accesorios"], message: "No repitas accesorios." },
  );
export const stateSchema = z.object({
  estado: z.enum(["CONFIRMADO", "EN_VUELO", "FINALIZADO", "CANCELADO"]),
  devolucion_real: datetime.optional(),
});
export const inspectionSchema = z.object({
  momento: z.enum(["INICIAL", "FINAL"]),
  estado_carcasa: text(500),
  estado_aspas: text(500),
});
