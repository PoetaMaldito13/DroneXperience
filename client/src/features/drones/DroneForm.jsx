import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, MenuItem, Stack, TextField } from "@mui/material";
import { dronesService } from "../../services";
import { useResource } from "../../hooks/useResource";
import { PageHeader } from "../../components/common/Display";
import {
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import EntityForm from "../../components/common/EntityForm";
import { options } from "../catalogs/config";
import { droneTypes, droneStates } from "./DronesPage";
function Form({ initial = {}, id }) {
  const [tipo, setTipo] = useState(initial.tipo_dron || "RECREATIVO");
  const navigate = useNavigate();
  const fields = [
    { name: "identificador", label: "Identificador", max: 40 },
    { name: "marca", label: "Marca", max: 80 },
    { name: "modelo", label: "Modelo", max: 80 },
    { name: "color", label: "Color", max: 60 },
    {
      name: "anio_fabricacion",
      label: "Año de fabricación",
      type: "number",
      min: 1900,
      required: false,
    },
    {
      name: "estado_actual",
      label: "Estado",
      options: options(
        droneStates.filter(
          (s) => s !== "ARRENDADO" || initial.estado_actual === "ARRENDADO",
        ),
      ),
    },
    tipo === "RECREATIVO"
      ? {
          name: "autonomia_bateria_min",
          label: "Autonomía de batería (min)",
          type: "number",
          min: 1,
        }
      : {
          name: "resolucion_camara_mp",
          label: "Resolución de cámara (MP)",
          type: "number",
          min: 0.01,
        },
  ];
  return (
    <Section title="Ficha del dron">
      <Stack gap={3}>
        <TextField
          select
          label="Tipo de dron"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          sx={{ maxWidth: 340 }}
        >
          {options(droneTypes).map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Alert severity="info">
          La característica técnica se adapta al tipo de dron. El uso se
          actualiza al iniciar un vuelo.
        </Alert>
        <EntityForm
          fields={fields}
          initial={{ estado_actual: "DISPONIBLE", ...initial }}
          onCancel={() => navigate("/drones")}
          onSubmit={async (v) => {
            const data = { ...v, tipo_dron: tipo };
            delete data[
              tipo === "RECREATIVO"
                ? "resolucion_camara_mp"
                : "autonomia_bateria_min"
            ];
            const saved = id
              ? await dronesService.update(id, data)
              : await dronesService.create(data);
            navigate("/drones/" + saved.dron_id);
          }}
        />
      </Stack>
    </Section>
  );
}
export default function DroneForm() {
  const { id } = useParams();
  const state = useResource(
    () => (id ? dronesService.get(id) : Promise.resolve({})),
    [id],
  );
  return (
    <>
      <PageHeader
        eyebrow="Flota / Drones"
        title={id ? "Editar dron" : "Nuevo dron"}
        description="Registra la identidad y las características técnicas del equipo."
      />
      {state.loading ? (
        <LoadingState />
      ) : state.error ? (
        <ErrorState error={state.error} retry={state.reload} />
      ) : (
        <Form initial={state.data} id={id} />
      )}
    </>
  );
}
