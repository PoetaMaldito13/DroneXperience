import { Router } from "express";
import { pool, schema } from "../config/database.js";
import { idSchema, listSchema } from "../utils/query.js";
import {
  droneSchema,
  customerSchema,
  rentalSchema,
  stateSchema,
  inspectionSchema,
} from "../services/validation.js";
import * as drones from "../repositories/drones.js";
import * as customers from "../repositories/customers.js";
import * as rentals from "../repositories/rentals.js";
import * as catalogs from "../repositories/catalogs.js";
import { dashboardSummary } from "../repositories/dashboard.js";
const router = Router();
const send = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
const id = (req) => idSchema.parse(req.params.id);
const query = (req) => listSchema.parse(req.query);
router.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  const result = await pool.query(
    "SELECT current_database() AS database, to_regclass($1) IS NOT NULL AS schema_ready",
    [schema + ".dron"],
  );
  send(res, { status: "ok", ...result.rows[0], schema });
});
router.get("/dashboard/summary", async (_req, res) =>
  send(res, await dashboardSummary()),
);
router.get("/drones", async (req, res) =>
  send(res, await drones.listDrones(query(req))),
);
router.get("/drones/:id", async (req, res) =>
  send(res, await drones.getDrone(id(req))),
);
router.post("/drones", async (req, res) =>
  send(res, await drones.saveDrone(droneSchema.parse(req.body)), 201),
);
router.put("/drones/:id", async (req, res) =>
  send(res, await drones.saveDrone(droneSchema.parse(req.body), id(req))),
);
router.delete("/drones/:id", async (req, res) =>
  send(res, await drones.deleteDrone(id(req))),
);
router.get("/clientes", async (req, res) =>
  send(res, await customers.listCustomers(query(req))),
);
router.get("/empresas", async (req, res) =>
  send(res, await customers.listCustomers(query(req), "EMPRESA")),
);
router.get("/clientes/:id", async (req, res) =>
  send(res, await customers.getCustomer(id(req))),
);
router.post("/clientes", async (req, res) =>
  send(res, await customers.saveCustomer(customerSchema.parse(req.body)), 201),
);
router.put("/clientes/:id", async (req, res) =>
  send(
    res,
    await customers.saveCustomer(customerSchema.parse(req.body), id(req)),
  ),
);
for (const name of Object.keys(catalogs.catalogs)) {
  router.get("/" + name, async (req, res) =>
    send(res, await catalogs.listCatalog(name, query(req))),
  );
  router.get("/" + name + "/:id", async (req, res) =>
    send(res, await catalogs.getCatalog(name, id(req))),
  );
  router.post("/" + name, async (req, res) =>
    send(res, await catalogs.saveCatalog(name, req.body), 201),
  );
  if (name !== "pilotos")
    router.put("/" + name + "/:id", async (req, res) =>
      send(res, await catalogs.saveCatalog(name, req.body, id(req))),
    );
  router.delete("/" + name + "/:id", async (req, res) =>
    send(res, await catalogs.deleteCatalog(name, id(req))),
  );
}
router.get("/arriendos", async (req, res) => {
  const filters = {};
  for (const k of ["dron_id", "cliente_id", "piloto_id"])
    if (req.query[k]) filters[k] = idSchema.parse(req.query[k]);
  send(res, await rentals.listRentals(query(req), filters));
});
router.get("/arriendos/:id", async (req, res) =>
  send(res, await rentals.getRental(id(req))),
);
router.post("/arriendos", async (req, res) =>
  send(res, await rentals.saveRental(rentalSchema.parse(req.body)), 201),
);
router.put("/arriendos/:id", async (req, res) =>
  send(res, await rentals.saveRental(rentalSchema.parse(req.body), id(req))),
);
router.post("/arriendos/:id/estados", async (req, res) =>
  send(res, await rentals.changeState(id(req), stateSchema.parse(req.body))),
);
router.put("/arriendos/:id/inspecciones", async (req, res) =>
  send(
    res,
    await rentals.saveInspection(id(req), inspectionSchema.parse(req.body)),
  ),
);
export default router;
