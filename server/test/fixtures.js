import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/config/database.js";
const table = (name) => "dronexperience_01_normalizada." + name;
export async function fixtures() {
  const api = request(app);
  const stamp = String(Date.now()).slice(-9);
  const ids = {};
  const customerIds = [],
    droneIds = [],
    rentalIds = [];
  async function create(resource, body) {
    const response = await api.post("/api/" + resource).send(body);
    if (response.status !== 201)
      throw new Error(resource + ": " + JSON.stringify(response.body));
    return response.body.data;
  }
  async function cleanup() {
    const conn = await pool.connect();
    try {
      await conn.query("BEGIN");
      for (const id of rentalIds)
        await conn.query(
          `DELETE FROM ${table("arriendo")} WHERE arriendo_id=$1`,
          [id],
        );
      // Only rentals belonging to these test-owned clients are eligible for cleanup.
      for (const id of customerIds)
        await conn.query(
          `DELETE FROM ${table("arriendo")} WHERE cliente_id=$1`,
          [id],
        );
      if (ids.operator)
        await conn.query(
          `DELETE FROM ${table("operador_autorizado")} WHERE operador_id=$1`,
          [ids.operator.operador_id],
        );
      for (const id of customerIds)
        await conn.query(
          `DELETE FROM ${table("cliente")} WHERE cliente_id=$1`,
          [id],
        );
      for (const id of droneIds)
        await conn.query(`DELETE FROM ${table("dron")} WHERE dron_id=$1`, [id]);
      if (ids.employee)
        await conn.query(
          `DELETE FROM ${table("empleado")} WHERE empleado_id=$1`,
          [ids.employee.empleado_id],
        );
      if (ids.insurance)
        await conn.query(
          `DELETE FROM ${table("seguro_vuelo")} WHERE seguro_id=$1`,
          [ids.insurance.seguro_id],
        );
      if (ids.accessory)
        await conn.query(
          `DELETE FROM ${table("accesorio")} WHERE accesorio_id=$1`,
          [ids.accessory.accesorio_id],
        );
      if (ids.insurer)
        await conn.query(
          `DELETE FROM ${table("aseguradora")} WHERE aseguradora_id=$1`,
          [ids.insurer.aseguradora_id],
        );
      if (ids.provider)
        await conn.query(
          `DELETE FROM ${table("proveedor")} WHERE proveedor_id=$1`,
          [ids.provider.proveedor_id],
        );
      await conn.query("COMMIT");
    } catch (e) {
      await conn.query("ROLLBACK");
      throw e;
    } finally {
      conn.release();
    }
  }
  try {
    const person = {
      run: "Q" + stamp,
      nombres: "QA Daniela",
      apellido_paterno: "Prueba",
      apellido_materno: "Temporal",
      direccion: "Dirección de prueba",
      comuna: "Santiago",
      region: "Metropolitana",
    };
    ids.customer = await create("clientes", {
      tipo_cliente: "INDIVIDUAL",
      ...person,
      telefonos: ["+56 QA " + stamp],
    });
    customerIds.push(ids.customer.cliente_id);
    ids.company = await create("clientes", {
      tipo_cliente: "EMPRESA",
      rut: "E" + stamp,
      razon_social: "QA Empresa " + stamp,
      direccion: "Dirección de prueba",
      comuna: "Santiago",
      region: "Metropolitana",
      telefonos: [],
    });
    customerIds.push(ids.company.cliente_id);
    ids.operator = await create("operadores", {
      empresa_id: ids.company.cliente_id,
      run: "O" + stamp,
      nombre_completo: "QA Operador",
      fecha_inicio: "2026-01-01",
      fecha_termino: "2031-12-31",
    });
    ids.employee = await create("empleados", {
      ...person,
      run: "P" + stamp,
      nombres: "QA Nicolás",
      cargo: "Piloto",
      fecha_contratacion: "2026-01-01",
      renta_base: 1100000,
      bono_por_vuelo: 50000,
      asignacion_colacion: 80000,
      asignacion_movilizacion: 50000,
    });
    await create("pilotos", { empleado_id: ids.employee.empleado_id });
    ids.cert = await create("certificaciones", {
      piloto_id: ids.employee.empleado_id,
      tipo: "VLOS",
      numero_certificado: "QA-" + stamp,
      entidad_emisora: "QA entidad",
      fecha_obtencion: "2026-01-01",
      fecha_vencimiento: "2031-12-31",
    });
    ids.droneBody = {
      identificador: "QA-REC-" + stamp,
      marca: "QA Aero",
      modelo: "Explorer",
      color: "Blanco",
      anio_fabricacion: 2026,
      estado_actual: "DISPONIBLE",
      tipo_dron: "RECREATIVO",
      autonomia_bateria_min: 32,
    };
    ids.drone = await create("drones", ids.droneBody);
    droneIds.push(ids.drone.dron_id);
    ids.professional = await create("drones", {
      ...ids.droneBody,
      identificador: "QA-PRO-" + stamp,
      tipo_dron: "PROFESIONAL",
      resolucion_camara_mp: 48,
      autonomia_bateria_min: undefined,
    });
    droneIds.push(ids.professional.dron_id);
    ids.insurer = await create("aseguradoras", {
      razon_social: "QA Aseguradora " + stamp,
    });
    ids.insurance = await create("seguros", {
      nombre: "QA Cobertura de vuelo",
      aseguradora_id: ids.insurer.aseguradora_id,
      costo: 15000,
    });
    ids.provider = await create("proveedores", {
      razon_social: "QA Proveedor " + stamp,
    });
    ids.accessory = await create("accesorios", {
      nombre: "QA Batería adicional",
      proveedor_id: ids.provider.proveedor_id,
      costo: 5000,
    });
    ids.rentalBody = {
      cliente_id: ids.customer.cliente_id,
      dron_id: ids.drone.dron_id,
      piloto_id: ids.employee.empleado_id,
      inicio: "2030-05-10T10:00",
      devolucion_programada: "2030-05-10T18:00",
      costo_total: 120000,
      seguros: [ids.insurance.seguro_id],
      accesorios: [{ accesorio_id: ids.accessory.accesorio_id, cantidad: 2 }],
    };
    return {
      api,
      ids,
      create,
      cleanup,
      droneIds,
      customerIds,
      rentalIds,
      stamp,
    };
  } catch (e) {
    await cleanup();
    throw e;
  }
}
