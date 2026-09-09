import { createTheme } from "@mui/material/styles";
import { esES } from "@mui/material/locale";
export function makeTheme(mode) {
  const dark = mode === "dark";
  return createTheme(
    {
      palette: {
        mode,
        primary: {
          main: dark ? "#68c5b9" : "#17675f",
          dark: "#104c46",
          contrastText: dark ? "#102a29" : "#fff",
        },
        secondary: { main: "#527b92" },
        background: {
          default: dark ? "#111b21" : "#f5f7f8",
          paper: dark ? "#19262d" : "#ffffff",
        },
        text: {
          primary: dark ? "#e7eff2" : "#1d3038",
          secondary: dark ? "#a3b6bf" : "#667982",
        },
        divider: dark ? "#2b3b44" : "#e4eaed",
        success: { main: dark ? "#67c49a" : "#28754f" },
        warning: { main: dark ? "#e8b357" : "#946216" },
        error: { main: dark ? "#f19595" : "#b54c4c" },
        info: { main: dark ? "#8bbadf" : "#427898" },
      },
      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 13,
        h4: { fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-.055rem" },
        h5: { fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.025rem" },
        h6: { fontSize: "1rem", fontWeight: 650 },
        subtitle2: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
        overline: {
          fontSize: ".65rem",
          fontWeight: 700,
          letterSpacing: ".09em",
        },
        body2: { fontSize: ".81rem", lineHeight: 1.6 },
      },
      shape: { borderRadius: 10 },
      spacing: 8,
      shadows: Array.from({ length: 25 }, (_, i) =>
        i === 0
          ? "none"
          : i < 5
            ? "0 3px 14px rgba(20,40,50,.05)"
            : "0 12px 42px rgba(20,40,50,.13)",
      ),
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true, size: "medium" },
          styleOverrides: {
            root: { borderRadius: 7, minHeight: 36, paddingInline: 16 },
          },
        },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
        MuiOutlinedInput: {
          styleOverrides: { root: { borderRadius: 7, fontSize: ".84rem" } },
        },
        MuiPaper: {
          defaultProps: { elevation: 0 },
          styleOverrides: { outlined: { backgroundImage: "none" } },
        },
        MuiCard: {
          defaultProps: { variant: "outlined" },
          styleOverrides: { root: { backgroundImage: "none" } },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: dark ? "#2b3b44" : "#e4eaed",
              padding: "13px 16px",
              fontSize: ".8rem",
            },
            head: {
              backgroundColor: dark ? "#1d2c34" : "#f8fafb",
              color: dark ? "#a3b6bf" : "#667982",
              fontWeight: 600,
              fontSize: ".73rem",
              whiteSpace: "nowrap",
            },
          },
        },
        MuiTableRow: {
          styleOverrides: { root: { "&:last-child td": { borderBottom: 0 } } },
        },
        MuiChip: {
          defaultProps: { size: "small" },
          styleOverrides: {
            root: {
              fontWeight: 600,
              fontSize: ".7rem",
              borderRadius: 6,
              height: 25,
            },
          },
        },
        MuiDialog: {
          defaultProps: { fullWidth: true, maxWidth: "sm" },
          styleOverrides: {
            paper: { borderRadius: 14, backgroundImage: "none" },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: { padding: "24px 24px 16px", fontWeight: 650 },
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: {
              padding: 24,
              borderTop: "1px solid " + (dark ? "#2b3b44" : "#e4eaed"),
            },
          },
        },
        MuiTooltip: { defaultProps: { arrow: true } },
        MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },
        MuiCssBaseline: {
          styleOverrides: {
            body: { margin: 0 },
            "*": { boxSizing: "border-box" },
            a: { color: "inherit" },
            ":focus-visible": {
              outline: "3px solid #60aaa1",
              outlineOffset: 3,
            },
          },
        },
      },
    },
    esES,
  );
}
