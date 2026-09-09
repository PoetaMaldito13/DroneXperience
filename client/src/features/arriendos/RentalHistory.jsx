import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { arriendosService } from "../../services";
import { useResource } from "../../hooks/useResource";
import EntityTable from "../../components/common/EntityTable";
import { StatusChip } from "../../components/common/Display";
import { date, currency } from "../../utils/format";

export const rentalColumns = [
  { key: "arriendo_id", label: "ID", render: (r) => "AR-" + r.arriendo_id },
  { key: "cliente", label: "Cliente" },
  { key: "dron", label: "Dron" },
  { key: "piloto", label: "Piloto" },
  { key: "inicio", label: "Inicio", render: (r) => date(r.inicio, true) },
  {
    key: "devolucion_programada",
    label: "Devolución",
    render: (r) => date(r.devolucion_programada, true),
  },
  {
    key: "estado",
    label: "Estado",
    render: (r) => <StatusChip value={r.estado} />,
  },
  {
    key: "costo_total",
    label: "Total",
    render: (r) => currency(r.costo_total),
  },
];

export default function RentalHistory({ filter, emptyDescription }) {
  const [page, setPage] = useState(0),
    [limit, setLimit] = useState(10);
  const filterKey = JSON.stringify(filter || {});

  useEffect(() => {
    setPage(0);
  }, [filterKey]);

  const state = useResource(
    () => arriendosService.list({ ...filter, page, limit }),
    [filterKey, page, limit],
  );

  return (
    <EntityTable
      title="Historial de arriendos"
      columns={rentalColumns}
      rows={state.data?.items}
      total={state.data?.total}
      pk="arriendo_id"
      {...state}
      retry={state.reload}
      page={page}
      limit={limit}
      onPage={setPage}
      onLimit={(v) => {
        setLimit(v);
        setPage(0);
      }}
      emptyTitle="Sin arriendos asociados"
      emptyDescription={
        emptyDescription ||
        "No existen operaciones de arriendo registradas para esta ficha."
      }
      actions={(r) => (
        <Button component={Link} to={"/arriendos/" + r.arriendo_id}>
          Ver
        </Button>
      )}
    />
  );
}
