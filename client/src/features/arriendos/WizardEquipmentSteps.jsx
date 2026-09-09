import {
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import RemoteSelect from "../../components/common/RemoteSelect";
import { DetailGrid } from "../../components/common/Display";
import { currency, date } from "../../utils/format";
export default function WizardEquipmentSteps({
  active,
  form,
  change,
  customer,
  drone,
  pilot,
  operator,
  selectedCustomer,
  initial,
}) {
  return (
    <>
      {active === 4 && (
        <>
          <Alert severity="info">
            Cada arriendo debe incluir al menos un seguro.
          </Alert>
          <RemoteSelect
            resource="seguros"
            label="Agregar seguro"
            pk="seguro_id"
            value=""
            onChange={(_, r) => {
              if (r && !form.seguros.some((s) => s.seguro_id === r.seguro_id))
                change("seguros", [...form.seguros, r]);
            }}
          />
          {form.seguros.map((s) => (
            <Stack
              key={s.seguro_id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2">{s.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {currency(s.costo)}
                </Typography>
              </Box>
              <IconButton
                aria-label={"Quitar seguro " + s.nombre}
                onClick={() =>
                  change(
                    "seguros",
                    form.seguros.filter((v) => v.seguro_id !== s.seguro_id),
                  )
                }
              >
                <DeleteOutline />
              </IconButton>
            </Stack>
          ))}
        </>
      )}
      {active === 5 && (
        <>
          <Alert severity="info">
            Agrega al menos un accesorio con su cantidad.
          </Alert>
          <RemoteSelect
            resource="accesorios"
            label="Agregar accesorio"
            pk="accesorio_id"
            value=""
            onChange={(_, r) => {
              if (
                r &&
                !form.accesorios.some((a) => a.accesorio_id === r.accesorio_id)
              )
                change("accesorios", [
                  ...form.accesorios,
                  { ...r, cantidad: 1 },
                ]);
            }}
          />
          {form.accesorios.map((a) => (
            <Stack
              key={a.accesorio_id}
              direction="row"
              gap={2}
              alignItems="center"
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">{a.nombre}</Typography>
                <Typography variant="caption">
                  {currency(a.costo)} por unidad
                </Typography>
              </Box>
              <TextField
                label="Cantidad"
                type="number"
                value={a.cantidad}
                sx={{ width: 110 }}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                onChange={(e) =>
                  change(
                    "accesorios",
                    form.accesorios.map((v) =>
                      v.accesorio_id === a.accesorio_id
                        ? { ...v, cantidad: e.target.value }
                        : v,
                    ),
                  )
                }
              />
              <IconButton
                aria-label={"Quitar accesorio " + a.nombre}
                onClick={() =>
                  change(
                    "accesorios",
                    form.accesorios.filter(
                      (v) => v.accesorio_id !== a.accesorio_id,
                    ),
                  )
                }
              >
                <DeleteOutline />
              </IconButton>
            </Stack>
          ))}
        </>
      )}
      {active === 6 && (
        <>
          <Alert severity="success">
            Revisa los recursos y las fechas. Se registrará como «En creación».
          </Alert>
          <DetailGrid
            items={[
              ["Cliente", customer?.nombre || initial.cliente],
              [
                "Operador",
                operator?.nombre_completo ||
                  selectedCustomer.data?.operadores?.find(
                    (o) => o.operador_id === form.operador_id,
                  )?.nombre_completo ||
                  "Sin operador",
              ],
              ["Dron", drone?.identificador || initial.dron],
              ["Piloto", pilot?.nombre || initial.piloto],
              ["Inicio", date(form.inicio, true)],
              ["Devolución", date(form.devolucion_programada, true)],
              [
                "Total acordado",
                currency(form.costo_total === "" ? null : form.costo_total),
              ],
            ]}
          />
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Seguros
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {form.seguros.map((s) => (
                <Chip key={s.seguro_id} label={s.nombre} />
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Accesorios
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {form.accesorios.map((a) => (
                <Chip
                  key={a.accesorio_id}
                  label={a.nombre + " × " + a.cantidad}
                />
              ))}
            </Stack>
          </Box>
        </>
      )}
    </>
  );
}
