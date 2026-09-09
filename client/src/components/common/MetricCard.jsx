import { Paper, Stack, Typography } from "@mui/material";
export default function MetricCard({ title, value, icon: Icon, note }) {
  return (
    <Paper variant="outlined" sx={{ px: 2.5, py: 2.2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Icon sx={{ fontSize: 19, color: "text.secondary" }} />
      </Stack>
      <Typography
        sx={{
          fontSize: 30,
          fontWeight: 650,
          letterSpacing: -1,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.1 }}
      >
        {note}
      </Typography>
    </Paper>
  );
}
