import { Box, Chip, Stack, Typography } from "@mui/material";
import { label, currency, date } from "../../utils/format";
const colors = {
  DISPONIBLE: "success",
  ARRENDADO: "info",
  MANTENIMIENTO: "warning",
  REPARACION: "error",
  EN_CREACION: "default",
  CONFIRMADO: "info",
  EN_VUELO: "primary",
  FINALIZADO: "success",
  CANCELADO: "default",
  VIGENTE: "success",
  POR_VENCER: "warning",
  VENCIDA: "error",
  ACTIVO: "success",
  EXPIRADO: "error",
  PENDIENTE: "warning",
};
export function StatusChip({ value }) {
  return (
    <Chip
      label={label(value)}
      color={colors[value] || "default"}
      variant="outlined"
    />
  );
}
export function CurrencyDisplay({ value }) {
  return <>{currency(value)}</>;
}
export function DateDisplay({ value, time }) {
  return <>{date(value, time)}</>;
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={2}
      sx={{ mb: 3.5 }}
    >
      <Box>
        {eyebrow && (
          <Typography variant="overline" color="text.secondary">
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" sx={{ mb: 0.8 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}
export function DetailGrid({ items }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 3,
      }}
    >
      {items.map(([title, value]) => (
        <Box key={title}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: 550, mt: 0.5, overflowWrap: "anywhere" }}
          >
            {value ?? "—"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
