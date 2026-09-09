import WizardSelectionSteps from "./WizardSelectionSteps";
import WizardEquipmentSteps from "./WizardEquipmentSteps";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { arriendosService, clientesService } from "../../services";
import { useResource } from "../../hooks/useResource";
import { PageHeader } from "../../components/common/Display";
import { ErrorState, LoadingState } from "../../components/common/Feedback";
const steps = [
  "Cliente",
  "Dron",
  "Piloto",
  "Fechas",
  "Seguros",
  "Accesorios",
  "Revisión",
];
function Wizard({ initial = {}, id }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    cliente_id: "",
    operador_id: "",
    dron_id: "",
    piloto_id: "",
    inicio: "",
    devolucion_programada: "",
    costo_total: "",
    ...initial,
    seguros: initial.seguros || [],
    accesorios: initial.accesorios || [],
  });
  const [customer, setCustomer] = useState(null),
    [drone, setDrone] = useState(null),
    [pilot, setPilot] = useState(null),
    [operator, setOperator] = useState(null);
  const change = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
    setError(null);
  };
  const selectedCustomer = useResource(
    () =>
      form.cliente_id
        ? clientesService.get(form.cliente_id)
        : Promise.resolve(null),
    [form.cliente_id],
  );
  const company =
    (customer || selectedCustomer.data)?.tipo_cliente === "EMPRESA";
  function validate() {
    if (active === 0 && !form.cliente_id) return "Selecciona un cliente.";
    if (active === 1 && !form.dron_id) return "Selecciona un dron disponible.";
    if (active === 2 && !form.piloto_id)
      return "Selecciona un piloto certificado.";
    if (
      active === 3 &&
      (!form.inicio ||
        !form.devolucion_programada ||
        form.devolucion_programada <= form.inicio)
    )
      return "La devolución programada debe ser posterior al inicio.";
    if (active === 4 && !form.seguros.length)
      return "Selecciona al menos un seguro para continuar.";
    if (
      active === 5 &&
      (!form.accesorios.length ||
        form.accesorios.some(
          (a) =>
            !Number.isInteger(Number(a.cantidad)) || Number(a.cantidad) < 1,
        ))
    )
      return "Selecciona al menos un accesorio e indica cantidades enteras mayores a cero.";
  }
  function next() {
    const message = validate();
    if (message) {
      setError(new Error(message));
      return;
    }
    setError(null);
    setActive((v) => v + 1);
  }
  async function save() {
    setBusy(true);
    setError(null);
    try {
      const body = {
        cliente_id: form.cliente_id,
        operador_id: form.operador_id || null,
        dron_id: form.dron_id,
        piloto_id: form.piloto_id,
        inicio: form.inicio,
        devolucion_programada: form.devolucion_programada,
        costo_total: form.costo_total,
        seguros: form.seguros.map((s) => s.seguro_id),
        accesorios: form.accesorios.map((a) => ({
          accesorio_id: a.accesorio_id,
          cantidad: Number(a.cantidad),
        })),
      };
      const saved = id
        ? await arriendosService.update(id, body)
        : await arriendosService.create(body);
      navigate("/arriendos/" + saved.arriendo_id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Operaciones / Arriendos"
        title={id ? "Editar arriendo" : "Planificar un arriendo"}
        description="Define los recursos y revisa la operación antes de registrarla."
      />
      <Box sx={{ overflowX: "auto", pb: 3 }}>
        <Stepper activeStep={active} alternativeLabel sx={{ minWidth: 640 }}>
          {steps.map((s) => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 1000, mx: "auto" }}
      >
        <Typography variant="overline" color="text.secondary">
          PASO {active + 1} DE 7
        </Typography>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {steps[active]}
        </Typography>
        <Stack gap={3} sx={{ minHeight: 210 }}>
          <WizardSelectionSteps
            {...{
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
            }}
          />
          <WizardEquipmentSteps
            {...{
              active,
              form,
              change,
              customer,
              drone,
              pilot,
              operator,
              selectedCustomer,
              initial,
            }}
          />
          {error && <ErrorState error={error} />}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}
        >
          <Button
            disabled={busy}
            onClick={() =>
              active === 0
                ? navigate("/arriendos")
                : (setError(null), setActive((v) => v - 1))
            }
          >
            {active === 0 ? "Cancelar" : "Anterior"}
          </Button>
          {active === 6 ? (
            <Button variant="contained" onClick={save} disabled={busy}>
              {busy ? "Guardando…" : "Guardar arriendo"}
            </Button>
          ) : (
            <Button variant="contained" onClick={next}>
              Continuar
            </Button>
          )}
        </Stack>
      </Paper>
    </>
  );
}
export default function RentalWizard() {
  const { id } = useParams();
  const state = useResource(
    () => (id ? arriendosService.get(id) : Promise.resolve({})),
    [id],
  );
  if (state.loading) return <LoadingState />;
  if (state.error)
    return <ErrorState error={state.error} retry={state.reload} />;
  if (id && state.data.estado !== "EN_CREACION")
    return (
      <Alert severity="warning">
        Solo es posible editar arriendos en creación.
      </Alert>
    );
  return <Wizard initial={state.data} id={id} />;
}
