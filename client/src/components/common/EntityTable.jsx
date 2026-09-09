import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import Search from "@mui/icons-material/Search";
import Refresh from "@mui/icons-material/Refresh";
import { EmptyState, ErrorState, LoadingState } from "./Feedback";
export default function EntityTable({
  title,
  columns,
  rows = [],
  total = 0,
  loading,
  error,
  retry,
  page = 0,
  limit = 20,
  onPage,
  onLimit,
  search = "",
  onSearch,
  filters,
  sort,
  direction,
  onSort,
  actions,
  pk = "id",
  emptyTitle,
  emptyDescription,
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        sx={{ p: 2.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip label={loading ? "…" : total} />
        </Stack>
        {onSearch && (
          <TextField
            aria-label="Buscar registros"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            sx={{ width: { xs: "100%", sm: 230 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        <Button startIcon={<Refresh />} onClick={retry} disabled={loading}>
          Actualizar
        </Button>
      </Stack>
      {filters?.length > 0 && (
        <Stack
          direction="row"
          gap={1.5}
          sx={{ px: 2.5, pb: 2, flexWrap: "wrap" }}
        >
          {filters.map((f) => (
            <TextField
              key={f.key}
              select
              label={f.label}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              sx={{ width: 180 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {f.options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Stack>
      )}
      {error ? (
        <Box p={3}>
          <ErrorState error={error} retry={retry} />
        </Box>
      ) : loading ? (
        <Box px={3} pb={3}>
          <LoadingState />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          title={emptyTitle || "No hay resultados"}
          description={
            emptyDescription ||
            "Crea un registro o ajusta los filtros de búsqueda."
          }
        />
      ) : (
        <TableContainer>
          <Table aria-label={title} sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align}>
                    {onSort && c.sortable !== false ? (
                      <TableSortLabel
                        active={sort === c.key}
                        direction={sort === c.key ? direction : "asc"}
                        onClick={() => onSort(c.key)}
                      >
                        {c.label}
                      </TableSortLabel>
                    ) : (
                      c.label
                    )}
                  </TableCell>
                ))}
                {actions && <TableCell align="right">Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r[pk]} hover>
                  {columns.map((c) => (
                    <TableCell key={c.key} align={c.align}>
                      {c.render ? c.render(r) : (r[c.key] ?? "—")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {actions(r)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={limit}
        onPageChange={(_, p) => onPage?.(p)}
        onRowsPerPageChange={(e) => onLimit?.(Number(e.target.value))}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Filas:"
        labelDisplayedRows={({ from, to, count }) =>
          from + "–" + to + " de " + count
        }
      />
    </Paper>
  );
}
