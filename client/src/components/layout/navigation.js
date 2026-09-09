import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import FlightTakeoffOutlined from "@mui/icons-material/FlightTakeoffOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import GamesOutlined from "@mui/icons-material/GamesOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
export const navigation = [
  {
    label: "Vista general",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: DashboardOutlined },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Arriendos", path: "/arriendos", icon: FlightTakeoffOutlined },
      { label: "Inspecciones", path: "/inspecciones", icon: FactCheckOutlined },
    ],
  },
  {
    label: "Flota",
    items: [
      { label: "Drones", path: "/drones", icon: GamesOutlined },
      { label: "Accesorios", path: "/accesorios", icon: Inventory2Outlined },
    ],
  },
  {
    label: "Clientes",
    items: [
      { label: "Clientes", path: "/clientes", icon: PeopleOutline },
      { label: "Empresas", path: "/empresas", icon: BusinessOutlined },
      { label: "Operadores", path: "/operadores", icon: BadgeOutlined },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Empleados", path: "/empleados", icon: GroupsOutlined },
      { label: "Pilotos", path: "/pilotos", icon: PersonOutline },
      {
        label: "Certificaciones",
        path: "/certificaciones",
        icon: WorkspacePremiumOutlined,
      },
    ],
  },
  {
    label: "Partners",
    items: [
      {
        label: "Aseguradoras",
        path: "/aseguradoras",
        icon: VerifiedUserOutlined,
      },
      { label: "Seguros", path: "/seguros", icon: ShieldOutlined },
      {
        label: "Proveedores",
        path: "/proveedores",
        icon: LocalShippingOutlined,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Configuración",
        path: "/configuracion",
        icon: SettingsOutlined,
      },
    ],
  },
];
