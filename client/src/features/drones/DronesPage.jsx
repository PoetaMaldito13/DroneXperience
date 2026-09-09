import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, IconButton, Snackbar, Tooltip } from "@mui/material";
import Add from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { dronesService } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
import { PageHeader, StatusChip } from "../../components/common/Display";
import { ConfirmDialog, ErrorState } from "../../components/common/Feedback";
import EntityTable from "../../components/common/EntityTable";
import { options } from "../catalogs/config";
export const droneTypes = ["RECREATIVO", "PROFESIONAL"];
export const droneStates = [
  "DISPONIBLE",
  "ARRENDADO",
  "MANTENIMIENTO",
  "REPARACION",
];
export default function DronesPage() {
  const [search, setSearch] = useState(""),
    [tipo, setTipo] = useState(""),
    [estado, setEstado] = useState(""),
    [page, setPage] = useState(0),
    [limit, setLimit] = useState(20),
    [sort, setSort] = useState("dron_id"),
    [direction, setDirection] = useState("desc"),
    [target, setTarget] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const q = useDebounce(search);
  const state = useResource(
    () => dronesService.list({ q, tipo, estado, page, limit, sort, direction }),
    [q, tipo, estado, page, limit, sort, direction],
  );
  const columns = [
    {
      key: "identificador",
      label: "Identificador",
      render: (r) => (
        <Button
          component={Link}
          to={"/drones/" + r.dron_id}
          sx={{ px: 0, minWidth: 0 }}
        >
          {r.identificador}
        </Button>
      ),
    },
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    {
      key: "tipo_dron",
      label: "Tipo",
      render: (r) => <StatusChip value={r.tipo_dron} />,
    },
    {
      key: "estado_actual",
      label: "Estado",
      render: (r) => <StatusChip value={r.estado_actual} />,
    },
    { key: "anio_fabricacion", label: "Año" },
    { key: "veces_arrendado", label: "Arriendos", align: "right" },
  ];
  async function remove() {
    setBusy(true);
    try {
      await dronesService.remove(target.dron_id);
      setTarget(null);
      setMessage("Dron eliminado");
      state.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Flota"
        title="Drones"
        description="Disponibilidad, características y uso de tu flota en un solo lugar."
        action={
          <Button
            component={Link}
            to="/drones/nuevo"
            variant="contained"
            startIcon={<Add />}
          >
            Nuevo dron
          </Button>
        }
      />
      <EntityTable
        title="Inventario de flota"
        columns={columns}
        rows={state.data?.items}
        total={state.data?.total}
        pk="dron_id"
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
        filters={[
          {
            key: "tipo",
            label: "Tipo de dron",
            value: tipo,
            onChange: (v) => {
              setTipo(v);
              setPage(0);
            },
            options: options(droneTypes),
          },
          {
            key: "estado",
            label: "Estado",
            value: estado,
            onChange: (v) => {
              setEstado(v);
              setPage(0);
            },
            options: options(droneStates),
          },
        ]}
        sort={sort}
        direction={direction}
        onSort={(key) => {
          setSort(key);
          setDirection(sort === key && direction === "asc" ? "desc" : "asc");
        }}
        actions={(r) => (
          <>
            <Tooltip title="Ver detalle">
              <IconButton
                component={Link}
                to={"/drones/" + r.dron_id}
                aria-label="Ver dron"
                size="small"
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                component={Link}
                to={"/drones/" + r.dron_id + "/editar"}
                aria-label="Editar dron"
                size="small"
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                onClick={() => {
                  setError(null);
                  setTarget(r);
                }}
                aria-label="Eliminar dron"
                size="small"
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      />
      <ConfirmDialog
        open={!!target}
        title="Eliminar dron"
        description={
          "Se eliminará " +
          (target?.identificador || "el dron") +
          ". Los drones con historial de arriendos no se pueden eliminar."
        }
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={remove}
      >
        {error && <ErrorState error={error} />}
      </ConfirmDialog>
      <Snackbar
        open={!!message}
        message={message}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
      />
    </>
  );
}
