export const currency = (value) =>
  value == null
    ? "Por definir"
    : new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(Number(value));
export function date(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? value + "T12:00:00" : value);
  return isNaN(d)
    ? "—"
    : new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(d);
}
export function localNow() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  return parts.replace(" ", "T");
}
export const labels = {
  DISPONIBLE: "Disponible",
  ARRENDADO: "Arrendado",
  MANTENIMIENTO: "Mantenimiento",
  REPARACION: "Reparación",
  RECREATIVO: "Recreativo",
  PROFESIONAL: "Profesional",
  INDIVIDUAL: "Persona",
  EMPRESA: "Empresa",
  EN_CREACION: "En creación",
  CONFIRMADO: "Confirmado",
  EN_VUELO: "En vuelo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  VIGENTE: "Vigente",
  POR_VENCER: "Por vencer",
  VENCIDA: "Vencida",
  ACTIVO: "Activo",
  EXPIRADO: "Expirado",
  PENDIENTE: "Pendiente",
  INICIAL: "Entrega",
  FINAL: "Devolución",
};
export const label = (value) => labels[value] || value || "Sin estado";
