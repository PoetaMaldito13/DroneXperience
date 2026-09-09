import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import { clientesService, service } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
import {
  PageHeader,
  DetailGrid,
  StatusChip,
} from "../../components/common/Display";
import {
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import EntityTable from "../../components/common/EntityTable";
import EntityForm from "../../components/common/EntityForm";
import { addressFields, personFields, options } from "../catalogs/config";
import RentalHistory from "../arriendos/RentalHistory";
import { date } from "../../utils/format";
function CustomerForm({ initial, onDone, onCancel, isCompany }) {
  const [tipo, setTipo] = useState(
    initial?.tipo_cliente || (isCompany ? "EMPRESA" : "INDIVIDUAL"),
  );
  const fields = [
    ...(tipo === "INDIVIDUAL"
      ? personFields
      : [
          { name: "rut", label: "RUT", max: 12 },
          { name: "razon_social", label: "Razón social", max: 160 },
        ]),
    ...addressFields,
    {
      name: "telefonosTexto",
      label: "Teléfonos",
      wide: true,
      required: false,
      multiline: true,
      helperText: "Un teléfono por línea. Se conserva el formato ingresado.",
    },
  ];
  return (
    <Stack gap={3}>
      <TextField
        select
        label="Tipo de cliente"
        value={tipo}
        disabled={!!initial?.cliente_id}
        onChange={(e) => setTipo(e.target.value)}
      >
        {options(["INDIVIDUAL", "EMPRESA"]).map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <EntityForm
        fields={fields}
        initial={{
          ...initial,
          telefonosTexto: initial?.telefonos?.join("\n") || "",
        }}
        onCancel={onCancel}
        onSubmit={async (v) => {
          const body = {
            ...v,
            tipo_cliente: tipo,
            telefonos: (v.telefonosTexto || "")
              .split("\n")
              .filter((v) => v.length > 0),
          };
          const row = initial?.cliente_id
            ? await clientesService.update(initial.cliente_id, body)
            : await clientesService.create(body);
          onDone(row);
        }}
      />
    </Stack>
  );
}
export default function CustomersPage({ isCompany = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = isCompany ? "/empresas" : "/clientes";
  const [search, setSearch] = useState(""),
    [tipo, setTipo] = useState(""),
    [page, setPage] = useState(0),
    [limit, setLimit] = useState(20),
    [editing, setEditing] = useState(null);
  const q = useDebounce(search);
  const state = useResource(
    () =>
      id
        ? clientesService.get(id)
        : service(isCompany ? "empresas" : "clientes").list({
            q,
            tipo,
            page,
            limit,
          }),
    [id, isCompany, q, tipo, page, limit],
  );
  const d = state.data;
  return (
    <>
      <PageHeader
        eyebrow="Clientes"
        title={
          id
            ? d?.nombre || "Detalle de cliente"
            : isCompany
              ? "Empresas"
              : "Clientes"
        }
        description="Una relación clara entre personas, empresas y operaciones."
        action={
          id ? (
            <Button component={Link} to={base}>
              Volver al listado
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setEditing({})}
            >
              {isCompany ? "Nueva empresa" : "Nuevo cliente"}
            </Button>
          )
        }
      />
      {id ? (
        state.loading ? (
          <LoadingState />
        ) : state.error ? (
          <ErrorState error={state.error} retry={state.reload} />
        ) : (
          <Stack gap={3}>
            <Section
              title="Información del cliente"
              action={<Button onClick={() => setEditing(d)}>Editar</Button>}
            >
              <DetailGrid
                items={[
                  [
                    d.tipo_cliente === "EMPRESA" ? "RUT" : "RUN",
                    d.rut || d.run,
                  ],
                  ["Tipo", <StatusChip key="type" value={d.tipo_cliente} />],
                  ...(d.tipo_cliente === "INDIVIDUAL"
                    ? [
                        ["Nombres", d.nombres],
                        ["Apellido paterno", d.apellido_paterno],
                        ["Apellido materno", d.apellido_materno],
                      ]
                    : [["Razón social", d.razon_social]]),
                  ["Dirección", d.direccion],
                  ["Comuna", d.comuna],
                  ["Región", d.region],
                  [
                    "Teléfonos",
                    d.telefonos.join(" · ") || "Sin teléfonos registrados",
                  ],
                ]}
              />
            </Section>
            {d.tipo_cliente === "EMPRESA" && (
              <Section
                title="Operadores autorizados"
                action={
                  <Button component={Link} to="/operadores">
                    Gestionar operadores
                  </Button>
                }
              >
                {d.operadores.length
                  ? d.operadores.map((o) => (
                      <Stack
                        key={o.operador_id}
                        direction={{ xs: "column", sm: "row" }}
                        gap={2}
                        sx={{ py: 1 }}
                      >
                        <strong>{o.nombre_completo}</strong>
                        <span>{o.run}</span>
                        <span>
                          {date(o.fecha_inicio)} —{" "}
                          {o.fecha_termino
                            ? date(o.fecha_termino)
                            : "Sin término"}
                        </span>
                      </Stack>
                    ))
                  : "Esta empresa aún no tiene operadores autorizados."}
              </Section>
            )}
            <RentalHistory filter={{ cliente_id: id }} />
          </Stack>
        )
      ) : (
        <EntityTable
          title={
            isCompany ? "Directorio de empresas" : "Directorio de clientes"
          }
          columns={[
            {
              key: "nombre",
              label: "Cliente",
              render: (r) => (
                <Button
                  component={Link}
                  to={base + "/" + r.cliente_id}
                  sx={{ p: 0 }}
                >
                  {r.nombre}
                </Button>
              ),
            },
            {
              key: "tipo_cliente",
              label: "Tipo",
              render: (r) => <StatusChip value={r.tipo_cliente} />,
            },
            { key: "run", label: "RUN / RUT", render: (r) => r.run || r.rut },
            { key: "comuna", label: "Comuna" },
            {
              key: "telefonos",
              label: "Teléfonos",
              render: (r) => r.telefonos.join(" · ") || "—",
            },
          ]}
          rows={d?.items}
          total={d?.total}
          pk="cliente_id"
          {...state}
          retry={state.reload}
          page={page}
          limit={limit}
          onPage={setPage}
          onLimit={(v) => {
            setLimit(v);
            setPage(0);
          }}
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(0);
          }}
          filters={
            isCompany
              ? []
              : [
                  {
                    key: "tipo",
                    label: "Tipo de cliente",
                    value: tipo,
                    onChange: (v) => {
                      setTipo(v);
                      setPage(0);
                    },
                    options: options(["INDIVIDUAL", "EMPRESA"]),
                  },
                ]
          }
          actions={(r) => (
            <Button component={Link} to={base + "/" + r.cliente_id}>
              Ver ficha
            </Button>
          )}
        />
      )}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="md">
        <DialogTitle>
          {editing?.cliente_id
            ? "Editar cliente"
            : isCompany
              ? "Nueva empresa"
              : "Nuevo cliente"}
        </DialogTitle>
        <DialogContent>
          {editing && (
            <CustomerForm
              initial={editing}
              isCompany={isCompany}
              onCancel={() => setEditing(null)}
              onDone={(row) => {
                setEditing(null);
                state.reload();
                navigate(base + "/" + row.cliente_id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
