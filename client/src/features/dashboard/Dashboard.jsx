import MetricCard from "../../components/common/MetricCard";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import GamesOutlined from "@mui/icons-material/GamesOutlined";
import FlightTakeoffOutlined from "@mui/icons-material/FlightTakeoffOutlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import { dashboardService } from "../../services";
import { useResource } from "../../hooks/useResource";
import { PageHeader, StatusChip } from "../../components/common/Display";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import { date, label } from "../../utils/format";
import { droneStates } from "../drones/DronesPage";
export default function Dashboard() {
  const state = useResource(() => dashboardService.summary(), []);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash && !state.loading)
      document
        .getElementById("alertas")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, state.loading]);
  if (state.loading)
    return (
      <>
        <PageHeader
          title="Resumen operacional"
          description="Consultando el estado de tus operaciones…"
        />
        <LoadingState />
      </>
    );
  if (state.error)
    return (
      <>
        <PageHeader title="Resumen operacional" />
        <ErrorState error={state.error} retry={state.reload} />
      </>
    );
  const d = state.data;
  const fleet = (s) => d.fleet.find((f) => f.estado === s)?.total || 0;
  const rentals = (s) => d.rentals.find((f) => f.estado === s)?.total || 0;
  const total = d.fleet.reduce((a, b) => a + b.total, 0);
  const alerts = [
    ...d.alerts.overdue.map((a) => ({
      key: "a" + a.arriendo_id,
      title: "Devolución atrasada · AR-" + a.arriendo_id,
      description: a.cliente + " · " + date(a.devolucion_programada, true),
      path: "/arriendos/" + a.arriendo_id,
      color: "error",
    })),
    ...d.alerts.expiring.map((c) => ({
      key: "c" + c.certificacion_id,
      title: "Certificación por vencer · " + c.tipo,
      description: c.piloto + " · " + date(c.fecha_vencimiento),
      path: "/certificaciones/" + c.certificacion_id,
      color: "warning",
    })),
    ...d.alerts.repairs.map((r) => ({
      key: "d" + r.dron_id,
      title:
        r.estado_actual === "REPARACION"
          ? "Dron en reparación"
          : "Dron con alto uso",
      description: r.identificador + " · " + r.veces_arrendado + " arriendos",
      path: "/drones/" + r.dron_id,
      color: "warning",
    })),
  ];
  return (
    <>
      <PageHeader
        eyebrow="Vista general"
        title="Resumen operacional"
        description="Tu flota, tu equipo y cada operación. Todo bajo control."
        action={
          <Stack direction="row" gap={1}>
            <Button onClick={state.reload}>Actualizar</Button>
            <Button
              variant="contained"
              component={Link}
              to="/arriendos/nuevo"
              startIcon={<Add />}
            >
              Nuevo arriendo
            </Button>
          </Stack>
        }
      />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "success.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Datos de PostgreSQL · Workspace Chile
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Actualizado {date(d.generatedAt, true)}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4,1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricCard
          title="Drones totales"
          value={total}
          icon={GamesOutlined}
          note="Equipos registrados"
        />
        <MetricCard
          title="Disponibles"
          value={fleet("DISPONIBLE")}
          icon={GamesOutlined}
          note="Listos para una operación"
        />
        <MetricCard
          title="Arrendados"
          value={fleet("ARRENDADO")}
          icon={FlightTakeoffOutlined}
          note="Equipos en uso"
        />
        <MetricCard
          title="Servicio técnico"
          value={fleet("MANTENIMIENTO") + fleet("REPARACION")}
          icon={GamesOutlined}
          note="Mantenimiento y reparación"
        />
        <MetricCard
          title="Arriendos activos"
          value={rentals("CONFIRMADO") + rentals("EN_VUELO")}
          icon={FlightTakeoffOutlined}
          note="Confirmados y en vuelo"
        />
        <MetricCard
          title="Finalizados"
          value={rentals("FINALIZADO")}
          icon={FlightTakeoffOutlined}
          note="Operaciones completadas"
        />
        <MetricCard
          title="Clientes"
          value={d.counts.clientes}
          icon={PeopleOutline}
          note="Personas y empresas"
        />
        <MetricCard
          title="Pilotos certificados"
          value={d.counts.pilotos}
          icon={WorkspacePremiumOutlined}
          note="Miembros del equipo de vuelo"
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0,1.25fr) minmax(0,1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <Section
          title="Estado de la flota"
          action={
            <Button
              component={Link}
              to="/drones"
              size="small"
              endIcon={<ArrowForward />}
            >
              Ver flota
            </Button>
          }
        >
          <Stack gap={2.4}>
            {droneStates.map((s) => (
              <Box key={s}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">{label(s)}</Typography>
                  <Typography variant="body2" fontWeight={650}>
                    {fleet(s)}{" "}
                    <Box
                      component="span"
                      color="text.secondary"
                      fontWeight={400}
                    >
                      / {total}
                    </Box>
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={total ? (fleet(s) / total) * 100 : 0}
                  color={
                    s === "DISPONIBLE"
                      ? "primary"
                      : s === "REPARACION"
                        ? "error"
                        : s === "MANTENIMIENTO"
                          ? "warning"
                          : "info"
                  }
                  sx={{ height: 6, borderRadius: 4, bgcolor: "action.hover" }}
                />
              </Box>
            ))}
          </Stack>
          {total === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={3}
            >
              Registra tu primer dron para comenzar a gestionar la flota.
            </Typography>
          )}
        </Section>
        <Section
          title="Drones más utilizados"
          action={<Chip label="Uso acumulado" variant="outlined" />}
        >
          {d.top.length ? (
            <Stack gap={2.5}>
              {d.top.map((r, i) => (
                <Stack
                  direction="row"
                  gap={2}
                  key={r.dron_id}
                  alignItems="center"
                >
                  <Typography color="text.secondary" variant="caption">
                    0{i + 1}
                  </Typography>
                  <Box flex={1}>
                    <Button
                      component={Link}
                      to={"/drones/" + r.dron_id}
                      sx={{ p: 0, justifyContent: "flex-start" }}
                    >
                      {r.identificador}
                    </Button>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {r.marca} {r.modelo}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2">
                    {r.veces_arrendado}{" "}
                    <Box
                      component="span"
                      fontWeight={400}
                      color="text.secondary"
                    >
                      arriendos
                    </Box>
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="El uso de la flota comienza aquí"
              description="Cada vuelo iniciado actualiza el contador de arriendos."
              action={
                <Button component={Link} to="/drones/nuevo">
                  Registrar un dron
                </Button>
              }
            />
          )}
        </Section>
      </Box>
      <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          p={2.5}
        >
          <Box>
            <Typography variant="h6">Actividad reciente</Typography>
            <Typography variant="caption" color="text.secondary">
              Últimas operaciones registradas
            </Typography>
          </Box>
          <Button component={Link} to="/arriendos" endIcon={<ArrowForward />}>
            Ver arriendos
          </Button>
        </Stack>
        {d.recent.length ? (
          <TableContainer>
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Arriendo",
                    "Cliente",
                    "Dron",
                    "Piloto",
                    "Inicio",
                    "Devolución",
                    "Estado",
                  ].map((t) => (
                    <TableCell key={t}>{t}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {d.recent.map((a) => (
                  <TableRow key={a.arriendo_id} hover>
                    <TableCell>
                      <Button
                        component={Link}
                        to={"/arriendos/" + a.arriendo_id}
                      >
                        AR-{a.arriendo_id}
                      </Button>
                    </TableCell>
                    <TableCell>{a.cliente}</TableCell>
                    <TableCell>{a.dron}</TableCell>
                    <TableCell>{a.piloto}</TableCell>
                    <TableCell>{date(a.inicio, true)}</TableCell>
                    <TableCell>{date(a.devolucion_programada, true)}</TableCell>
                    <TableCell>
                      <StatusChip value={a.estado} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState
            title="Tu primera operación está por despegar"
            description="Crea un arriendo cuando tengas cliente, dron, piloto, seguro y accesorio registrados."
            action={
              <Button variant="outlined" component={Link} to="/arriendos/nuevo">
                Planificar arriendo
              </Button>
            }
          />
        )}
      </Paper>
      <Box id="alertas" sx={{ scrollMarginTop: 90 }}>
        <Section
          title="Alertas operacionales"
          action={
            <Chip
              label={alerts.length + " alertas"}
              color={alerts.length ? "warning" : "default"}
            />
          }
        >
          {alerts.length ? (
            <Stack
              divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />}
            >
              {alerts.map((a) => (
                <Stack
                  key={a.key}
                  direction="row"
                  gap={2}
                  alignItems="center"
                  py={1.5}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: a.color + ".main",
                      flexShrink: 0,
                    }}
                  />
                  <Box flex={1}>
                    <Typography variant="subtitle2">{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.description}
                    </Typography>
                  </Box>
                  <Button component={Link} to={a.path}>
                    Revisar
                  </Button>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                }}
              />
              <Box>
                <Typography variant="subtitle2">
                  Sin alertas operacionales
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aquí aparecerán vencimientos próximos, atrasos, reparaciones y
                  equipos con 100 o más arriendos.
                </Typography>
              </Box>
            </Stack>
          )}
        </Section>
      </Box>
    </>
  );
}
