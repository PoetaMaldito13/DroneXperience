import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
export function LoadingState() {
  return (
    <Stack spacing={2} aria-label="Cargando información">
      <Skeleton height={60} />
      {[1, 2, 3, 4].map((n) => (
        <Skeleton key={n} variant="rounded" height={54} />
      ))}
    </Stack>
  );
}
export function ErrorState({ error, retry }) {
  return (
    <Alert
      severity="error"
      action={
        retry && (
          <Button color="inherit" onClick={retry}>
            Reintentar
          </Button>
        )
      }
    >
      {error?.message || "No se pudo cargar la información."}
    </Alert>
  );
}
export function EmptyState({
  title = "Todavía no hay registros",
  description = "Los registros aparecerán aquí cuando comiences a operar.",
  action,
}) {
  return (
    <Box sx={{ py: 7, px: 3, textAlign: "center" }}>
      <InboxOutlined sx={{ fontSize: 34, color: "text.disabled", mb: 1.5 }} />
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1, mb: 2 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
export function ConfirmDialog({
  open,
  title,
  description,
  busy,
  onClose,
  onConfirm,
  children,
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Procesando…" : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export function Section({ title, action, children }) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Typography variant="h6">{title}</Typography>
        {action}
      </Stack>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}
