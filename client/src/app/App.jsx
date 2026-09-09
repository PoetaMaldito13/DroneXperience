import { lazy, Suspense } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { Button } from "@mui/material";
import ThemeRoot from "./ThemeContext";
import AppShell from "../components/layout/AppShell";
import { EmptyState, LoadingState } from "../components/common/Feedback";
import { configs } from "../features/catalogs/config";
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const DronesPage = lazy(() => import("../features/drones/DronesPage"));
const DroneForm = lazy(() => import("../features/drones/DroneForm"));
const DroneDetail = lazy(() => import("../features/drones/DroneDetail"));
const CustomersPage = lazy(() => import("../features/clientes/CustomersPage"));
const CatalogPage = lazy(() => import("../features/catalogs/CatalogPage"));
const RentalsPage = lazy(() => import("../features/arriendos/RentalsPage"));
const RentalWizard = lazy(() => import("../features/arriendos/RentalWizard"));
const RentalDetail = lazy(() => import("../features/arriendos/RentalDetail"));
const InspectionsPage = lazy(
  () => import("../features/arriendos/InspectionsPage"),
);
const Settings = lazy(() => import("../pages/Settings"));
export default function App() {
  return (
    <ThemeRoot>
      <BrowserRouter>
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="drones" element={<DronesPage />} />
              <Route path="drones/nuevo" element={<DroneForm />} />
              <Route path="drones/:id" element={<DroneDetail />} />
              <Route path="drones/:id/editar" element={<DroneForm />} />
              {["clientes", "empresas"].map((path) => (
                <Route key={path} path={path}>
                  <Route
                    index
                    element={<CustomersPage isCompany={path === "empresas"} />}
                  />
                  <Route
                    path=":id"
                    element={<CustomersPage isCompany={path === "empresas"} />}
                  />
                </Route>
              ))}
              {Object.keys(configs).map((resource) => (
                <Route key={resource} path={resource}>
                  <Route
                    index
                    element={<CatalogPage key={resource} resource={resource} />}
                  />
                  <Route
                    path=":id"
                    element={<CatalogPage key={resource} resource={resource} />}
                  />
                </Route>
              ))}
              <Route path="arriendos" element={<RentalsPage />} />
              <Route path="arriendos/nuevo" element={<RentalWizard />} />
              <Route path="arriendos/:id" element={<RentalDetail />} />
              <Route path="arriendos/:id/editar" element={<RentalWizard />} />
              <Route path="inspecciones" element={<InspectionsPage />} />
              <Route path="configuracion" element={<Settings />} />
              <Route
                path="*"
                element={
                  <EmptyState
                    title="Página no encontrada"
                    description="La dirección no corresponde a una sección del workspace."
                    action={
                      <Button component={Link} to="/dashboard">
                        Ir al dashboard
                      </Button>
                    }
                  />
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeRoot>
  );
}
