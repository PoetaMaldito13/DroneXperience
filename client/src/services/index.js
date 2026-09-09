import { http } from "../api/http";
export function service(resource) {
  return {
    list: (params) => http.get("/" + resource, { params }),
    get: (id) => http.get("/" + resource + "/" + id),
    create: (body) => http.post("/" + resource, body),
    update: (id, body) => http.put("/" + resource + "/" + id, body),
    remove: (id) => http.delete("/" + resource + "/" + id),
  };
}
export const dronesService = service("drones");
export const clientesService = service("clientes");
export const empleadosService = service("empleados");
export const arriendosService = {
  ...service("arriendos"),
  state: (id, body) => http.post("/arriendos/" + id + "/estados", body),
  inspection: (id, body) =>
    http.put("/arriendos/" + id + "/inspecciones", body),
};
export const dashboardService = {
  summary: () => http.get("/dashboard/summary"),
};
export const systemService = { health: () => http.get("/health") };
