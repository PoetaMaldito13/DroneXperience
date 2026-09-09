import test from "node:test";
import assert from "node:assert/strict";
import {
  droneSchema,
  rentalSchema,
  operatorSchema,
  customerSchema,
} from "../src/services/validation.js";
import { transaction } from "../src/config/database.js";
const rental = {
  cliente_id: "1",
  dron_id: "1",
  piloto_id: "1",
  inicio: "2030-01-01T10:00",
  devolucion_programada: "2030-01-01T18:00",
  seguros: ["1"],
  accesorios: [{ accesorio_id: "1", cantidad: 1 }],
};
test("seguros y accesorios son obligatorios y no pueden repetirse", () => {
  for (const patch of [
    { seguros: [] },
    { accesorios: [] },
    { seguros: ["1", "1"] },
    { accesorios: [{ accesorio_id: "1", cantidad: 0 }] },
  ])
    assert.equal(
      rentalSchema.safeParse({ ...rental, ...patch }).success,
      false,
    );
  assert.equal(rentalSchema.safeParse(rental).success, true);
});
test("rechaza intervalos invertidos e IDs fuera de bigint", () => {
  assert.equal(
    rentalSchema.safeParse({ ...rental, devolucion_programada: rental.inicio })
      .success,
    false,
  );
  assert.equal(
    rentalSchema.safeParse({ ...rental, cliente_id: "9999999999999999999" })
      .success,
    false,
  );
  assert.equal(
    operatorSchema.safeParse({
      empresa_id: "1",
      run: "1-9",
      nombre_completo: "Persona",
      fecha_inicio: "2030-02-02",
      fecha_termino: "2030-02-01",
    }).success,
    false,
  );
});
test("subtipos de drones requieren la característica correspondiente", () => {
  const drone = {
    identificador: "X",
    marca: "A",
    modelo: "B",
    color: "C",
    estado_actual: "DISPONIBLE",
    tipo_dron: "PROFESIONAL",
  };
  assert.equal(droneSchema.safeParse(drone).success, false);
  assert.equal(
    droneSchema.safeParse({ ...drone, resolucion_camara_mp: 48 }).success,
    true,
  );
});
test("RUN/RUT y teléfonos conservan su formato", () => {
  const v = {
    tipo_cliente: "EMPRESA",
    rut: "01.234.567-K",
    razon_social: "Empresa",
    direccion: "Calle",
    comuna: "Santiago",
    region: "RM",
    telefonos: ["+56 9 1234 5678"],
  };
  assert.deepEqual(customerSchema.parse(v), v);
});
test("una transacción fallida ejecuta ROLLBACK y libera la conexión", async () => {
  const calls = [];
  const connection = {
    query: async (sql) => calls.push(sql),
    release: () => calls.push("release"),
  };
  await assert.rejects(
    transaction(
      async () => {
        throw new Error("fallo");
      },
      { connect: async () => connection },
    ),
  );
  assert.deepEqual(calls, ["BEGIN", "ROLLBACK", "release"]);
});
