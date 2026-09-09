import { createContext, useContext, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { makeTheme } from "../theme/theme";
const Context = createContext(null);
export const useThemeMode = () => useContext(Context);
export default function ThemeRoot({ children }) {
  const [mode, setMode] = useState(() =>
    localStorage.getItem("dx-theme") === "dark" ? "dark" : "light",
  );
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const value = {
    mode,
    toggle: () =>
      setMode((old) => {
        const next = old === "light" ? "dark" : "light";
        localStorage.setItem("dx-theme", next);
        return next;
      }),
  };
  return (
    <Context.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Context.Provider>
  );
}
