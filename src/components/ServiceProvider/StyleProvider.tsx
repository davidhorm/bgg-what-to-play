import CssBaseline from "@mui/material/CssBaseline";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import type { OnlyChildrenProps } from "./ServiceProvider";

const theme = createTheme();

export const StyleProvider = ({ children }: OnlyChildrenProps) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  </StyledEngineProvider>
);
