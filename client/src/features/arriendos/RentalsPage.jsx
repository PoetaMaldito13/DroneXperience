import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import Add from "@mui/icons-material/Add";
import { arriendosService } from "../../services";
import { useDebounce, useResource } from "../../hooks/useResource";
import { PageHeader } from "../../components/common/Display";
import EntityTable from "../../components/common/EntityTable";
import { rentalColumns } from "./RentalHistory";
import { options } from "../catalogs/config";
export default function RentalsPage() {
  const [search, setSearch] = useState(""),
    [estado, setEstado] = useState(""),
    [page, setPage] = useState(0),
    [limit, setLimit] = useState(20);
  const q = useDebounce(search);
  const state = useResource(
    () => arriendosService.list({ q, estado, page, limit }),
    [q, estado, page, limit],
  );
  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Arriendos"
        description="Planifica cada operación y acompaña su ciclo completo."
        action={
          <Button
            component={Link}
            to="/arriendos/nuevo"
            startIcon={<Add />}
            variant="contained"
          >
            Nuevo arriendo
          </Button>
        }
      />
      <EntityTable
        title="Registro de operaciones"
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
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filters={[
          {
            key: "estado",
            label: "Estado",
            value: estado,
            onChange: (v) => {
              setEstado(v);
              setPage(0);
            },
            options: options([
              "EN_CREACION",
              "CONFIRMADO",
              "EN_VUELO",
              "FINALIZADO",
              "CANCELADO",
            ]),
          },
        ]}
        actions={(r) => (
          <Button component={Link} to={"/arriendos/" + r.arriendo_id}>
            Ver detalle
          </Button>
        )}
      />
    </>
  );
}
