import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BggCollection } from "./components/BggCollection";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BggCollection />
  </QueryClientProvider>
);
