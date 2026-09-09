import { useState } from "react";
import {
  Alert,
  Autocomplete,
  CircularProgress,
  TextField,
} from "@mui/material";
import { service } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
export default function RemoteSelect({
  resource,
  label,
  value,
  onChange,
  pk,
  display = "nombre",
  params = {},
  error,
  helperText,
  disabled,
}) {
  const [input, setInput] = useState("");
  const q = useDebounce(input);
  const state = useResource(async () => {
    const api = service(resource);
    const list = await api.list({ ...params, q, limit: 30 });
    let selected = list.items.find((v) => v[pk] === value);
    if (value && !selected)
      selected = await service(
        resource === "empresas" ? "clientes" : resource,
      ).get(value);
    return { items: list.items, selected };
  }, [resource, q, value, params]);
  const options = state.data?.items || [];
  const selected = state.data?.selected || null;
  return (
    <>
      <Autocomplete
        disabled={disabled}
        options={options}
        value={selected}
        loading={state.loading}
        filterOptions={(x) => x}
        getOptionLabel={(v) => String(v[display] || v[pk])}
        isOptionEqualToValue={(a, b) => a[pk] === b[pk]}
        onInputChange={(_, v, reason) => {
          if (reason === "input" || reason === "clear") setInput(v);
        }}
        onChange={(_, v) => onChange(v?.[pk] || "", v)}
        renderInput={(p) => (
          <TextField
            {...p}
            label={label}
            error={!!error}
            helperText={error || helperText}
            slotProps={{
              input: {
                ...p.InputProps,
                endAdornment: (
                  <>
                    {state.loading ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : null}
                    {p.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        noOptionsText="No hay registros disponibles"
      />
      {state.error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {state.error.message}
        </Alert>
      )}
    </>
  );
}
