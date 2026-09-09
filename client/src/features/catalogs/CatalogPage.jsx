import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { configs } from "./config";
import { service } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
import EntityTable from "../../components/common/EntityTable";
import EntityForm from "../../components/common/EntityForm";
import {
  PageHeader,
  StatusChip,
  DetailGrid,
} from "../../components/common/Display";
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  Section,
} from "../../components/common/Feedback";
import { currency, date } from "../../utils/format";
import RentalHistory from "../arriendos/RentalHistory";
export default function CatalogPage({ resource }) {
  const config = configs[resource];
  const api = service(resource);
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(0),
    [limit, setLimit] = useState(20),
    [search, setSearch] = useState(""),
    [editing, setEditing] = useState(null),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failure, setFailure] = useState(null);
  const q = useDebounce(search);
  const state = useResource(
    () => (id ? api.get(id) : api.list({ page, limit, q })),
    [resource, id, page, limit, q],
  );
  const columns = config.columns.map(([key, label, type]) => ({
    key,
    label,
    sortable: false,
    render:
      type === "date"
        ? (r) => date(r[key])
        : type === "money"
          ? (r) => currency(r[key])
          : type === "status"
            ? (r) => <StatusChip value={r[key]} />
            : undefined,
  }));
  async function remove() {
    setBusy(true);
    try {
      await api.remove(deleting[config.pk]);
      setDeleting(null);
      setMessage("Registro eliminado");
      state.reload();
      if (id) navigate("/" + resource);
    } catch (e) {
      setFailure(e);
    } finally {
      setBusy(false);
    }
  }
  const create = () => setEditing({});
  return (
    <>
      <PageHeader
        eyebrow={config.section}
        title={id ? state.data?.[config.display] || config.title : config.title}
        description={config.description}
        action={
          id ? (
            <Button component={Link} to={"/" + resource}>
              Volver al listado
            </Button>
          ) : (
            <Button startIcon={<Add />} variant="contained" onClick={create}>
              Agregar {config.singular}
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
              title="Información"
              action={
                resource !== "pilotos" && (
                  <Button onClick={() => setEditing(state.data)}>Editar</Button>
                )
              }
            >
              <DetailGrid
                items={config.fields
                  .filter((f) => !f.resource)
                  .map((f) => [
                    f.label,
                    f.type === "date"
                      ? date(state.data[f.name])
                      : f.type === "number"
                        ? currency(state.data[f.name])
                        : state.data[f.name],
                  ])}
              />
            </Section>
            {resource === "pilotos" && (
              <>
                <Section title="Identidad del piloto">
                  <DetailGrid
                    items={[
                      ["Nombre", state.data.nombre],
                      ["RUN", state.data.run],
                      ["Cargo", state.data.cargo],
                      ["Certificaciones vigentes", state.data.vigentes],
                    ]}
                  />
                </Section>
                <Section
                  title="Certificaciones"
                  action={
                    <Button component={Link} to="/certificaciones">
                      Gestionar
                    </Button>
                  }
                >
                  {state.data.detalle_certificaciones.length
                    ? state.data.detalle_certificaciones.map((c) => (
                        <Stack
                          key={c.certificacion_id}
                          direction="row"
                          gap={2}
                          sx={{ py: 1 }}
                        >
                          <span>
                            {c.tipo} · {c.numero_certificado} ·{" "}
                            {date(c.fecha_vencimiento)}
                          </span>
                          <StatusChip value={c.estado} />
                        </Stack>
                      ))
                    : "No hay certificaciones registradas."}
                </Section>
                <RentalHistory filter={{ piloto_id: id }} />
              </>
            )}
            {resource === "aseguradoras" && (
              <Section title="Seguros ofrecidos">
                {state.data.detalle_seguros.map((s) => (
                  <Stack
                    key={s.seguro_id}
                    direction="row"
                    justifyContent="space-between"
                    py={1}
                  >
                    <span>{s.nombre}</span>
                    <span>{currency(s.costo)}</span>
                  </Stack>
                ))}
              </Section>
            )}
          </Stack>
        )
      ) : (
        <EntityTable
          title={config.title}
          columns={columns}
          rows={state.data?.items}
          total={state.data?.total}
          pk={config.pk}
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
          actions={(r) => (
            <>
              <Tooltip title="Ver detalle">
                <IconButton
                  size="small"
                  aria-label="Ver detalle"
                  component={Link}
                  to={"/" + resource + "/" + r[config.pk]}
                >
                  <OpenInNew fontSize="small" />
                </IconButton>
              </Tooltip>
              {resource !== "pilotos" && (
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    aria-label="Editar"
                    onClick={() => setEditing(r)}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  aria-label="Eliminar"
                  onClick={() => {
                    setFailure(null);
                    setDeleting(r);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      )}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="md">
        <DialogTitle>
          {editing?.[config.pk] ? "Editar" : "Agregar"} {config.singular}
        </DialogTitle>
        <DialogContent>
          {editing && (
            <EntityForm
              key={editing[config.pk] || "new"}
              fields={config.fields}
              initial={{
                bono_por_vuelo: 0,
                asignacion_movilizacion: 0,
                asignacion_colacion: 0,
                ...editing,
              }}
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                editing[config.pk]
                  ? await api.update(editing[config.pk], v)
                  : await api.create(v);
                setEditing(null);
                setMessage("Registro guardado");
                state.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        title={"Eliminar " + config.singular}
        description="Esta acción elimina el registro. Si existen relaciones que lo impiden, se conservará la información."
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        busy={busy}
      >
        {failure && <ErrorState error={failure} />}
      </ConfirmDialog>
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        message={message}
        onClose={() => setMessage("")}
      />
    </>
  );
}
