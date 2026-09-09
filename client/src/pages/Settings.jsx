import { Alert, Button, Stack, Typography } from "@mui/material";
import { useThemeMode } from "../app/ThemeContext";
import { systemService } from "../services";
import { useResource } from "../hooks/useResource";
import { PageHeader, DetailGrid } from "../components/common/Display";
import {
  Section,
  ErrorState,
  LoadingState,
} from "../components/common/Feedback";
export default function Settings() {
  const { mode, toggle } = useThemeMode();
  const state = useResource(() => systemService.health(), []);
  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Configuración"
        description="Preferencias del workspace y estado de la conexión."
      />
      <Stack gap={3}>
        <Section title="Apariencia">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2">
              Tema actual: {mode === "light" ? "Claro" : "Oscuro"}
            </Typography>
            <Button variant="outlined" onClick={toggle}>
              Cambiar tema
            </Button>
          </Stack>
        </Section>
        <Section
          title="Conexión de datos"
          action={<Button onClick={state.reload}>Comprobar conexión</Button>}
        >
          {state.loading ? (
            <LoadingState />
          ) : state.error ? (
            <ErrorState error={state.error} retry={state.reload} />
          ) : (
            <DetailGrid
              items={[
                [
                  "API",
                  state.data.status === "ok" ? "Conectada" : "No disponible",
                ],
                ["Base PostgreSQL", state.data.database],
                ["Schema", state.data.schema],
                ["Idioma y moneda", "Español (Chile) · CLP"],
              ]}
            />
          )}
        </Section>
        <Alert severity="info">
          Workspace local de administración. El proyecto no incluye
          autenticación; la API se inicia en la interfaz local del equipo.
        </Alert>
      </Stack>
    </>
  );
}
