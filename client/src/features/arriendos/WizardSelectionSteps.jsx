import { Alert, Box, TextField, Typography } from "@mui/material";
import RemoteSelect from "../../components/common/RemoteSelect";
import { DetailGrid, StatusChip } from "../../components/common/Display";
export default function WizardSelectionSteps({
  active,
  form,
  change,
  company,
  drone,
  pilot,
  setCustomer,
  setDrone,
  setPilot,
  setOperator,
}) {
  return (
    <>
      {active === 0 && (
        <>
          <RemoteSelect
            resource="clientes"
            label="Cliente"
            value={form.cliente_id}
            pk="cliente_id"
            onChange={(value, row) => {
              change("cliente_id", value);
              change("operador_id", "");
              setCustomer(row);
            }}
          />
          {company && (
            <>
              <RemoteSelect
                resource="operadores"
                label="Operador autorizado (opcional)"
                pk="operador_id"
                display="nombre_completo"
                value={form.operador_id || ""}
                params={{ empresa_id: form.cliente_id }}
                onChange={(v, r) => {
                  change("operador_id", v);
                  setOperator(r);
                }}
              />
              <Alert severity="info">
                La autorización del operador debe cubrir todo el período del
                arriendo.
              </Alert>
            </>
          )}
        </>
      )}
      {active === 1 && (
        <>
          <RemoteSelect
            resource="drones"
            label="Dron disponible"
            pk="dron_id"
            display="identificador"
            params={{ estado: "DISPONIBLE" }}
            value={form.dron_id}
            onChange={(v, r) => {
              change("dron_id", v);
              setDrone(r);
            }}
          />
          {drone && (
            <Box
              sx={{
                p: 2.5,
                bgcolor: "background.default",
                borderRadius: 2,
              }}
            >
              <DetailGrid
                items={[
                  ["Equipo", drone.marca + " " + drone.modelo],
                  ["Tipo", <StatusChip key="type" value={drone.tipo_dron} />],
                  [
                    "Estado",
                    <StatusChip key="status" value={drone.estado_actual} />,
                  ],
                ]}
              />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            La disponibilidad horaria se vuelve a verificar al guardar.
          </Typography>
        </>
      )}
      {active === 2 && (
        <>
          <RemoteSelect
            resource="pilotos"
            label="Piloto certificado"
            pk="empleado_id"
            value={form.piloto_id}
            onChange={(v, r) => {
              change("piloto_id", v);
              setPilot(r);
            }}
          />
          {pilot && (
            <Alert severity={pilot.vigentes > 0 ? "success" : "warning"}>
              {pilot.vigentes} certificaciones vigentes actualmente. Se validará
              la cobertura de las fechas seleccionadas.
            </Alert>
          )}
        </>
      )}
      {active === 3 && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            <TextField
              type="datetime-local"
              label="Inicio"
              value={form.inicio}
              onChange={(e) => change("inicio", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="datetime-local"
              label="Devolución programada"
              value={form.devolucion_programada}
              onChange={(e) => change("devolucion_programada", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={
                !!form.devolucion_programada &&
                form.devolucion_programada <= form.inicio
              }
              helperText={
                form.devolucion_programada &&
                form.devolucion_programada <= form.inicio
                  ? "Debe ser posterior al inicio."
                  : "Hora local de Chile continental"
              }
            />
          </Box>
          <TextField
            type="number"
            label="Costo total acordado (CLP, opcional)"
            value={form.costo_total ?? ""}
            onChange={(e) => change("costo_total", e.target.value)}
            helperText="El modelo no define una tarifa de dron. Ingresa el total acordado o déjalo por definir."
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
        </>
      )}
    </>
  );
}
