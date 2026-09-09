import test from "node:test";
import assert from "node:assert/strict";
import { fixtures } from "./fixtures.js";
import { pool } from "../src/config/database.js";
const enabled = process.env.DX_INTEGRATION === "1";
test(
  "API + PostgreSQL: flujo completo y rollback",
  { skip: !enabled },
  async (t) => {
    const f = await fixtures();
    const { api, ids } = f;
    try {
      await t.test(
        "health y todos los listados responden con datos reales",
        async () => {
          for (const path of [
            "health",
            "dashboard/summary",
            "drones",
            "clientes",
            "empresas",
            "empleados",
            "pilotos",
            "certificaciones",
            "operadores",
            "aseguradoras",
            "seguros",
            "proveedores",
            "accesorios",
            "arriendos",
          ]) {
            const r = await api.get("/api/" + path);
            assert.equal(r.status, 200, path + JSON.stringify(r.body));
            assert.equal(r.body.success, true);
          }
        },
      );
      await t.test("crear y editar drones preserva el subtipo", async () => {
        const rec = await api.get("/api/drones/" + ids.drone.dron_id);
        assert.equal(rec.body.data.autonomia_bateria_min, 32);
        assert.equal(rec.body.data.resolucion_camara_mp, null);
        const pro = await api.get("/api/drones/" + ids.professional.dron_id);
        assert.equal(Number(pro.body.data.resolucion_camara_mp), 48);
        const edit = await api
          .put("/api/drones/" + ids.drone.dron_id)
          .send({ ...ids.droneBody, modelo: "Explorer Plus" });
        assert.equal(edit.status, 200);
        const duplicate = await api.post("/api/drones").send(ids.droneBody);
        assert.equal(duplicate.status, 409);
      });
      await t.test(
        "clientes, empresa y piloto exponen sus relaciones",
        async () => {
          const customer = (
            await api.get("/api/clientes/" + ids.customer.cliente_id)
          ).body.data;
          assert.equal(customer.telefonos.length, 1);
          const company = (
            await api.get("/api/clientes/" + ids.company.cliente_id)
          ).body.data;
          assert.equal(
            company.operadores[0].operador_id,
            ids.operator.operador_id,
          );
          const pilot = (
            await api.get("/api/pilotos/" + ids.employee.empleado_id)
          ).body.data;
          assert.equal(pilot.detalle_certificaciones[0].tipo, "VLOS");
          const filtered = (
            await api
              .get("/api/operadores")
              .query({ empresa_id: ids.company.cliente_id })
          ).body.data;
          assert.equal(filtered.items.length, 1);
        },
      );
      await t.test("arriendo inválido no deja filas parciales", async () => {
        for (const patch of [
          { seguros: [] },
          { accesorios: [] },
          { devolucion_programada: ids.rentalBody.inicio },
          { operador_id: ids.operator.operador_id },
        ]) {
          const r = await api
            .post("/api/arriendos")
            .send({ ...ids.rentalBody, ...patch });
          assert.equal(r.status, 422, JSON.stringify(r.body));
        }
        const before = await pool.query(
          "SELECT count(*) FROM dronexperience_01_normalizada.arriendo",
        );
        const invalidFK = await api
          .post("/api/arriendos")
          .send({ ...ids.rentalBody, seguros: ["9223372036854775807"] });
        assert.equal(invalidFK.status, 409);
        assert.equal(
          (
            await pool.query(
              "SELECT count(*) FROM dronexperience_01_normalizada.arriendo",
            )
          ).rows[0].count,
          before.rows[0].count,
        );
      });
      let rental;
      await t.test(
        "creación concurrente bloquea la doble reserva",
        async () => {
          const responses = await Promise.all([
            api.post("/api/arriendos").send(ids.rentalBody),
            api.post("/api/arriendos").send(ids.rentalBody),
          ]);
          assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
          rental = responses.find((r) => r.status === 201).body.data;
          f.rentalIds.push(rental.arriendo_id);
        },
      );
      await t.test(
        "estados, inspecciones, contador y devolución son coherentes",
        async () => {
          const path = "/api/arriendos/" + rental.arriendo_id;
          assert.equal(
            (await api.post(path + "/estados").send({ estado: "FINALIZADO" }))
              .status,
            409,
          );
          assert.equal(
            (await api.post(path + "/estados").send({ estado: "CONFIRMADO" }))
              .status,
            200,
          );
          assert.equal(
            (await api.post(path + "/estados").send({ estado: "EN_VUELO" }))
              .status,
            422,
          );
          assert.equal(
            (
              await api
                .put(path + "/inspecciones")
                .send({
                  momento: "INICIAL",
                  estado_carcasa: "Sin daños",
                  estado_aspas: "Completas",
                })
            ).status,
            200,
          );
          const start = await api
            .post(path + "/estados")
            .send({ estado: "EN_VUELO" });
          assert.equal(start.status, 200, JSON.stringify(start.body));
          const drone = (await api.get("/api/drones/" + ids.drone.dron_id)).body
            .data;
          assert.equal(drone.estado_actual, "ARRENDADO");
          assert.equal(drone.veces_arrendado, 1);
          assert.equal(
            (
              await api
                .post(path + "/estados")
                .send({
                  estado: "FINALIZADO",
                  devolucion_real: "2030-05-10T17:00",
                })
            ).status,
            422,
          );
          await api
            .put(path + "/inspecciones")
            .send({
              momento: "FINAL",
              estado_carcasa: "Sin daños",
              estado_aspas: "Completas",
            });
          const final = await api
            .post(path + "/estados")
            .send({
              estado: "FINALIZADO",
              devolucion_real: "2030-05-10T17:00",
            });
          assert.equal(final.status, 200, JSON.stringify(final.body));
          const detail = (await api.get(path)).body.data;
          assert.equal(detail.historial.length, 4);
          assert.equal(detail.inspecciones.length, 2);
          assert.equal(
            detail.historial.filter((h) => !h.fecha_termino).length,
            1,
          );
          assert.equal(
            (await api.get("/api/drones/" + ids.drone.dron_id)).body.data
              .estado_actual,
            "DISPONIBLE",
          );
          assert.equal(
            (
              await api
                .put(path + "/inspecciones")
                .send({
                  momento: "FINAL",
                  estado_carcasa: "Cambio",
                  estado_aspas: "Cambio",
                })
            ).status,
            409,
          );
        },
      );
      await t.test(
        "eliminación protegida y entradas no confiables",
        async () => {
          assert.equal(
            (await api.delete("/api/drones/" + ids.drone.dron_id)).status,
            409,
          );
          assert.equal((await api.get("/api/drones/1 OR 1=1")).status, 422);
          assert.equal(
            (await api.get("/api/drones").query({ limit: 1000 })).status,
            422,
          );
          const injection = await api
            .get("/api/drones")
            .query({
              q: "'; DROP TABLE dron;--",
              sort: "marca;DROP TABLE dron;",
            });
          assert.equal(injection.status, 200);
          assert.equal(injection.body.data.total, 0);
        },
      );
    } finally {
      await f.cleanup();
      await pool.end();
    }
  },
);
