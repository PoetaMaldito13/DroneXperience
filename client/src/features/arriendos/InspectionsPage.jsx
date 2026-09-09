import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Pagination,
} from "@mui/material";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import { arriendosService } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
import { PageHeader, StatusChip } from "../../components/common/Display";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/common/Feedback";
export default function InspectionsPage() {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(0);
  const q = useDebounce(search);
  const state = useResource(
    () => arriendosService.list({ q, page, limit: 12 }),
    [q, page],
  );
  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Inspecciones"
        description="Revisa el equipo en la entrega y documenta su condición al regresar."
      />
      <TextField
        label="Buscar arriendo, cliente o dron"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        sx={{ mb: 3, maxWidth: 440 }}
      />
      {state.loading ? (
        <LoadingState />
      ) : state.error ? (
        <ErrorState error={state.error} retry={state.reload} />
      ) : state.data.items.length ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                xl: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {state.data.items.map((a) => (
              <Paper key={a.arriendo_id} variant="outlined" sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <FactCheckOutlined color="primary" />
                  <Typography variant="h6">AR-{a.arriendo_id}</Typography>
                </Stack>
                <Typography variant="subtitle2">{a.dron}</Typography>
                <Typography color="text.secondary" variant="body2" mb={2}>
                  {a.cliente}
                </Typography>
                <StatusChip value={a.estado} />
                <Button
                  fullWidth
                  component={Link}
                  to={"/arriendos/" + a.arriendo_id}
                  sx={{ mt: 2 }}
                >
                  Abrir entrega y devolución
                </Button>
              </Paper>
            ))}
          </Box>
          <Pagination
            sx={{ mt: 3 }}
            page={page + 1}
            count={Math.ceil(state.data.total / 12)}
            onChange={(_, p) => setPage(p - 1)}
          />
        </>
      ) : (
        <Paper variant="outlined">
          <EmptyState
            title="Sin operaciones para inspeccionar"
            description="Las inspecciones se registran dentro de cada arriendo."
            action={
              <Button component={Link} to="/arriendos/nuevo">
                Crear arriendo
              </Button>
            }
          />
        </Paper>
      )}
    </>
  );
}
