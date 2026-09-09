import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Search from "@mui/icons-material/Search";
import NotificationsNone from "@mui/icons-material/NotificationsNone";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import GamesOutlined from "@mui/icons-material/GamesOutlined";
import { navigation } from "./navigation";
import { useThemeMode } from "../../app/ThemeContext";
export default function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const desktop = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { mode, toggle } = useThemeMode();
  const width = collapsed ? 76 : 246;
  const current = navigation
    .flatMap((g) => g.items)
    .find((i) => pathname.startsWith(i.path));
  const title = current?.label || "Dashboard";
  const sidebar = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#123236",
        color: "#c4d3d4",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.3}
        sx={{ px: 2.5, height: 78, minHeight: 78 }}
      >
        <GamesOutlined sx={{ color: "#91d5c8", fontSize: 30 }} />
        {(!collapsed || !desktop) && (
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 750,
                letterSpacing: "-.5px",
                color: "#fff",
              }}
            >
              DroneXperience
            </Typography>
            <Typography
              sx={{ fontSize: 10, letterSpacing: 1.2, color: "#91acae" }}
            >
              CENTRO DE OPERACIONES
            </Typography>
          </Box>
        )}
      </Stack>
      <Divider sx={{ borderColor: "#29464a", mx: 2 }} />
      <Box
        component="nav"
        aria-label="Navegación principal"
        sx={{ flex: 1, overflowY: "auto", px: 1.3, py: 1 }}
      >
        {navigation.map((g) => (
          <Box key={g.label} sx={{ mb: 1 }}>
            {(!collapsed || !desktop) && (
              <Typography
                variant="overline"
                sx={{ display: "block", px: 1.6, pt: 1, color: "#8ba6a8" }}
              >
                {g.label}
              </Typography>
            )}
            <List disablePadding>
              {g.items.map((i) => (
                <Tooltip
                  key={i.path}
                  title={collapsed && desktop ? i.label : ""}
                  placement="right"
                >
                  <ListItemButton
                    component={Link}
                    to={i.path}
                    selected={pathname.startsWith(i.path)}
                    onClick={() => setOpen(false)}
                    sx={{
                      minHeight: 36,
                      py: 0.55,
                      px: 1.5,
                      my: 0.25,
                      borderRadius: 1,
                      color: "#c5d5d6",
                      "&.Mui-selected": {
                        bgcolor: "#2a5355",
                        color: "#fff",
                        "&:hover": { bgcolor: "#315f60" },
                      },
                      "&:hover": { bgcolor: "#203f42" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                      <i.icon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    {(!collapsed || !desktop) && (
                      <ListItemText
                        primary={i.label}
                        slotProps={{
                          primary: {
                            fontSize: 12,
                            fontWeight: pathname.startsWith(i.path) ? 650 : 450,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: "#29464a" }} />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5 }}
      >
        {(!collapsed || !desktop) && (
          <Typography variant="caption" sx={{ color: "#9eb7b9" }}>
            Workspace · Chile
          </Typography>
        )}
        {desktop && (
          <Tooltip title={collapsed ? "Expandir menú" : "Contraer menú"}>
            <IconButton
              size="small"
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              onClick={() => setCollapsed((v) => !v)}
              sx={{ color: "#c5d5d6" }}
            >
              {collapsed ? (
                <MenuIcon fontSize="small" />
              ) : (
                <ChevronLeft fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: -60,
          zIndex: 2000,
          p: 2,
          bgcolor: "background.paper",
          "&:focus": { top: 0 },
        }}
      >
        Saltar al contenido
      </Box>
      {desktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width, border: 0 },
          }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: 260 } }}
        >
          {sidebar}
        </Drawer>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: 70 }}>
            {!desktop && (
              <IconButton
                aria-label="Abrir navegación"
                onClick={() => setOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Breadcrumbs
              sx={{
                flex: 1,
                "& .MuiBreadcrumbs-separator": {
                  display: { xs: "none", sm: "flex" },
                },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Workspace
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Breadcrumbs>
            <Button
              color="inherit"
              startIcon={<Search />}
              onClick={() => setSearchOpen(true)}
              sx={{
                color: "text.secondary",
                display: { xs: "none", sm: "flex" },
              }}
            >
              Buscar en workspace
            </Button>
            <Tooltip title="Buscar">
              <IconButton
                aria-label="Buscar en workspace"
                onClick={() => setSearchOpen(true)}
                sx={{ display: { xs: "flex", sm: "none" } }}
              >
                <Search />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                mode === "light" ? "Activar modo oscuro" : "Activar modo claro"
              }
            >
              <IconButton aria-label="Cambiar tema" onClick={toggle}>
                {mode === "light" ? (
                  <DarkModeOutlined fontSize="small" />
                ) : (
                  <LightModeOutlined fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver alertas operacionales">
              <IconButton
                aria-label="Ver alertas operacionales"
                onClick={() => navigate("/dashboard#alertas")}
              >
                <NotificationsNone />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
            <Tooltip title="Perfil de workspace">
              <IconButton
                aria-label="Perfil de workspace"
                onClick={(e) => setProfile(e.currentTarget)}
              >
                <Avatar
                  sx={{
                    width: 31,
                    height: 31,
                    bgcolor: "primary.main",
                    fontSize: 12,
                  }}
                >
                  DX
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 4 },
            maxWidth: 1680,
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Menu
        anchorEl={profile}
        open={!!profile}
        onClose={() => setProfile(null)}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle2">Workspace local</Typography>
          <Typography variant="caption" color="text.secondary">
            Sin sesión autenticada
          </Typography>
        </Box>
        <MenuItem
          onClick={() => {
            setProfile(null);
            navigate("/configuracion");
          }}
        >
          Configuración
        </MenuItem>
      </Menu>
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)}>
        <DialogTitle>Buscar en workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            placeholder="Drones, clientes, arriendos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <List>
            {navigation
              .flatMap((g) => g.items)
              .filter((i) =>
                i.label
                  .toLocaleLowerCase("es")
                  .includes(search.toLocaleLowerCase("es")),
              )
              .map((i) => (
                <ListItemButton
                  key={i.path}
                  onClick={() => {
                    navigate(i.path);
                    setSearchOpen(false);
                  }}
                >
                  <ListItemIcon>
                    <i.icon />
                  </ListItemIcon>
                  <ListItemText primary={i.label} />
                </ListItemButton>
              ))}
          </List>
          <Typography variant="caption" color="text.secondary">
            Navega a un módulo y utiliza su buscador para encontrar registros.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
