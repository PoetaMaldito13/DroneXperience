import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { arriendosService } from "../../services";
import { useResource } from "../../hooks/useResource";
import {
  PageHeader,
  DetailGrid,
  StatusChip,
} from "../../components/common/Display";
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import EntityForm from "../../components/common/EntityForm";
import { currency, date, label, localNow } from "../../utils/format";
const transitions = {
  EN_CREACION: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_VUELO", "CANCELADO"],
  EN_VUELO: ["FINALIZADO"],
};
export default function RentalDetail() {
  const { id } = useParams();
  const state = useResource(() => arriendosService.get(id), [id]);
  const [target, setTarget] = useState(null),
    [inspection, setInspection] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null),
    [returned, setReturned] = useState(localNow()),
    [message, setMessage] = useState("");
  async function transition() {
    setBusy(true);
    setError(null);
    try {
      await arriendosService.state(id, {
        estado: target,
        ...(target === "FINALIZADO" ? { devolucion_real: returned } : {}),
      });
      setTarget(null);
      state.reload();
      setMessage("Estado actualizado");
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  if (state.loading) return <LoadingState />;
  if (state.error)
    return <ErrorState error={state.error} retry={state.reload} />;
  const d = state.data;
  return (
    <>
      <PageHeader
        eyebrow="Operaciones / Arriendos"
        title={"Arriendo AR-" + id}
        description={d.cliente + " · " + d.dron}
        action={
          <Stack direction="row" gap={1}>
            <Button component={Link} to="/arriendos">
              Volver
            </Button>
            {d.estado === "EN_CREACION" && (
              <Button component={Link} to={"/arriendos/" + id + "/editar"}>
                Editar
              </Button>
            )}
          </Stack>
        }
      />
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
        <StatusChip value={d.estado} />
        {(transitions[d.estado] || []).map((s) => (
          <Button
            key={s}
            size="small"
            variant={s === "CANCELADO" ? "text" : "contained"}
            color={s === "CANCELADO" ? "error" : "primary"}
            onClick={() => {
              setError(null);
              setTarget(s);
            }}
          >
            {s === "CONFIRMADO"
              ? "Confirmar arriendo"
              : s === "EN_VUELO"
                ? "Iniciar vuelo"
                : s === "FINALIZADO"
                  ? "Finalizar arriendo"
                  : "Cancelar arriendo"}
          </Button>
        ))}
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0,1fr) 330px" },
          gap: 3,
        }}
      >
        <Stack gap={3}>
          <Section title="Resumen de la operación">
            <DetailGrid
              items={[
                ["Cliente", d.cliente],
                ["Dron", d.dron],
                ["Piloto", d.piloto],
                ["Inicio", date(d.inicio, true)],
                ["Devolución programada", date(d.devolucion_programada, true)],
                ["Devolución real", date(d.devolucion_real, true)],
                ["Total acordado", currency(d.costo_total)],
                [
                  "Operador",
                  d.operador || "Sin operador",
                ],
              ]}
            />
          </Section>
          <Section title="Cobertura y equipamiento">
            <Typography variant="subtitle2" mb={1}>
              Seguros
            </Typography>
            {d.seguros.map((s) => (
              <Stack
                key={s.seguro_id}
                direction="row"
                justifyContent="space-between"
                py={0.7}
              >
                <span>{s.nombre}</span>
                <span>{currency(s.costo)}</span>
              </Stack>
            ))}
            <Typography variant="subtitle2" mt={2} mb={1}>
              Accesorios
            </Typography>
            {d.accesorios.map((a) => (
              <Stack
                key={a.accesorio_id}
                direction="row"
                justifyContent="space-between"
                py={0.7}
              >
                <span>
                  {a.nombre} × {a.cantidad}
                </span>
                <span>{currency(Number(a.costo) * a.cantidad)}</span>
              </Stack>
            ))}
          </Section>
          <Section title="Inspección del dron">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {["INICIAL", "FINAL"].map((moment) => {
                const row = d.inspecciones.find((i) => i.momento === moment);
                const canEdit =
                  moment === "INICIAL"
                    ? ["EN_CREACION", "CONFIRMADO"].includes(d.estado)
                    : d.estado === "EN_VUELO";
                return (
                  <Box
                    key={moment}
                    sx={{
                      p: 2.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" gap={1} alignItems="center" mb={2}>
                      <CheckCircleOutline
                        color={row ? "success" : "disabled"}
                        fontSize="small"
                      />
                      <Typography variant="h6">
                        {moment === "INICIAL" ? "Entrega" : "Devolución"}
                      </Typography>
                    </Stack>
                    {row ? (
                      <DetailGrid
                        items={[
                          ["Carcasa", row.estado_carcasa],
                          ["Aspas", row.estado_aspas],
                        ]}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Inspección pendiente de registrar.
                      </Typography>
                    )}
                    {canEdit && (
                      <Button
                        sx={{ mt: 2 }}
                        onClick={() =>
                          setInspection({ momento: moment, ...row })
                        }
                      >
                        {row ? "Editar inspección" : "Registrar inspección"}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Section>
        </Stack>
        <Section title="Historial de estados">
          {d.historial.length ? (
            d.historial.map((h, index) => (
              <Box
                key={h.secuencia}
                sx={{
                  position: "relative",
                  pl: 3,
                  pb: 3,
                  borderLeft: index === d.historial.length - 1 ? 0 : 2,
                  borderColor: "divider",
                  ml: 1,
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: -6,
                    top: 5,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor:
                      index === d.historial.length - 1
                        ? "primary.main"
                        : "text.disabled",
                  },
                }}
              >
                <Typography variant="subtitle2">
                  {label(h.tipo_estado)}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Inicio: {date(h.fecha_inicio, true)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {h.fecha_termino
                    ? "Término: " + date(h.fecha_termino, true)
                    : "Estado actual"}
                </Typography>
              </Box>
            ))
          ) : (
            <Alert severity="warning">No hay historial registrado.</Alert>
          )}
        </Section>
      </Box>
      <ConfirmDialog
        open={!!target}
        title={label(target)}
        description="Se registrará el cambio en el historial de la operación."
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={transition}
      >
        {target === "FINALIZADO" && (
          <TextField
            type="datetime-local"
            label="Devolución real"
            value={returned}
            onChange={(e) => setReturned(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}{" "}
        {error && (
          <Box mt={2}>
            <ErrorState error={error} />
          </Box>
        )}
      </ConfirmDialog>
      <Dialog open={!!inspection} onClose={() => setInspection(null)}>
        <DialogTitle>
          Inspección de{" "}
          {inspection?.momento === "INICIAL" ? "entrega" : "devolución"}
        </DialogTitle>
        <DialogContent>
          {inspection && (
            <EntityForm
              initial={inspection}
              fields={[
                {
                  name: "estado_carcasa",
                  label: "Estado de la carcasa",
                  max: 500,
                  multiline: true,
                  wide: true,
                },
                {
                  name: "estado_aspas",
                  label: "Estado de las aspas",
                  max: 500,
                  multiline: true,
                  wide: true,
                },
              ]}
              onCancel={() => setInspection(null)}
              onSubmit={async (v) => {
                await arriendosService.inspection(id, {
                  ...v,
                  momento: inspection.momento,
                });
                setInspection(null);
                state.reload();
                setMessage("Inspección guardada");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={!!message}
        message={message}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
      />
    </>
  );
}
