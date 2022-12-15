import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BggCollection } from "./components/BggCollection";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <CssBaseline />
    <BggCollection />
  </QueryClientProvider>
);
