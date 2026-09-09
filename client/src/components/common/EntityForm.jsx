import { useForm, Controller } from "react-hook-form";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import RemoteSelect from "./RemoteSelect";
export default function EntityForm({
  fields,
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  children,
}) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initial });
  async function save(values) {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", { message: error.message });
      for (const [key, messages] of Object.entries(error.details || {}))
        setError(key, {
          message: Array.isArray(messages)
            ? messages.join(" ")
            : String(messages),
        });
    }
  }
  return (
    <Box component="form" noValidate onSubmit={handleSubmit(save)}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
        }}
      >
        {fields.map((f) => (
          <Box key={f.name} sx={f.wide ? { gridColumn: "1 / -1" } : {}}>
            {f.resource ? (
              <Controller
                name={f.name}
                control={control}
                rules={{
                  required: f.required === false ? false : "Campo obligatorio.",
                }}
                render={({ field }) => (
                  <RemoteSelect
                    {...f}
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={errors[f.name]?.message}
                  />
                )}
              />
            ) : f.options ? (
              <Controller
                name={f.name}
                control={control}
                rules={{
                  required: f.required === false ? false : "Campo obligatorio.",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    select
                    label={f.label}
                    error={!!errors[f.name]}
                    helperText={errors[f.name]?.message}
                  >
                    {f.options.map((o) => (
                      <MenuItem key={o.value ?? o} value={o.value ?? o}>
                        {o.label ?? o}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            ) : (
              <TextField
                label={f.label}
                type={f.type || "text"}
                multiline={f.multiline}
                rows={f.multiline ? 3 : undefined}
                {...register(f.name, {
                  required: f.required === false ? false : "Campo obligatorio.",
                  maxLength: f.max
                    ? {
                        value: f.max,
                        message: "Máximo " + f.max + " caracteres.",
                      }
                    : undefined,
                  min:
                    f.min !== undefined
                      ? { value: f.min, message: "Valor mínimo: " + f.min }
                      : undefined,
                })}
                error={!!errors[f.name]}
                helperText={errors[f.name]?.message || f.helperText}
                slotProps={{
                  inputLabel:
                    f.type === "date" || f.type === "datetime-local"
                      ? { shrink: true }
                      : undefined,
                  htmlInput: {
                    maxLength: f.max,
                    min: f.min,
                    step: f.type === "number" ? "any" : undefined,
                  },
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      {children}
      {errors.root && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errors.root.message}
        </Alert>
      )}
      <Stack
        direction="row"
        justifyContent="flex-end"
        gap={1}
        sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}
      >
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
