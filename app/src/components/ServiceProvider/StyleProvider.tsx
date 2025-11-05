'use client';

import { PropsWithChildren, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  // StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export const StyleProvider = ({ children }: PropsWithChildren<object>) => {
  const theme = useMemo(() => {
    const rootElement = typeof document !== "undefined" ? document.body : undefined;

    return createTheme({
      cssVariables: true,
      typography: {
        fontFamily: 'var(--font-roboto)',
      },
      components: {
        MuiPopover: {
          defaultProps: {
            container: rootElement,
          },
        },
        MuiPopper: {
          defaultProps: {
            container: rootElement,
          },
        },
      },
    });
  }, []);

  return (
    <AppRouterCacheProvider>
      {/* <StyledEngineProvider injectFirst> */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      {/* </StyledEngineProvider> */}
    </AppRouterCacheProvider>
  );
};