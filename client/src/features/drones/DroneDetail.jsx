import { Link, useParams } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import { dronesService } from "../../services";
import { useResource } from "../../hooks/useResource";
import {
  PageHeader,
  DetailGrid,
  StatusChip,
} from "../../components/common/Display";
import {
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import { label } from "../../utils/format";
import RentalHistory from "../arriendos/RentalHistory";

export default function DroneDetail() {
  const { id } = useParams();
  const state = useResource(() => dronesService.get(id), [id]);
  if (state.loading) return <LoadingState />;
  if (state.error)
    return <ErrorState error={state.error} retry={state.reload} />;
  const d = state.data;
  return (
    <>
      <PageHeader
        eyebrow="Flota / Drones"
        title={d.identificador}
        description={d.marca + " · " + d.modelo}
        action={
          <Stack direction="row" gap={1}>
            <Button component={Link} to="/drones">
              Volver
            </Button>
            <Button
              variant="contained"
              component={Link}
              to={"/drones/" + id + "/editar"}
            >
              Editar dron
            </Button>
          </Stack>
        }
      />
      <Stack gap={3}>
        <Section
          title="Información del equipo"
          action={<StatusChip value={d.estado_actual} />}
        >
          <DetailGrid
            items={[
              ["Marca", d.marca],
              ["Modelo", d.modelo],
              ["Tipo", label(d.tipo_dron)],
              ["Color", d.color],
              ["Año de fabricación", d.anio_fabricacion],
              ["Arriendos registrados", d.arriendos_registrados],
              ["Vuelos iniciados", d.vuelos_iniciados],
              d.tipo_dron === "RECREATIVO"
                ? ["Autonomía de batería", d.autonomia_bateria_min + " min"]
                : ["Resolución de cámara", d.resolucion_camara_mp + " MP"],
            ]}
          />
        </Section>
        <RentalHistory
          filter={{ dron_id: id }}
          emptyDescription="Este dron todavía no tiene operaciones de arriendo registradas."
        />
      </Stack>
    </>
  );
}
